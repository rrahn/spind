const { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } = require('node:crypto');
const express = require('express');

class SimulatorError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function configuration(env = process.env) {
    if (env.RAS_SIMULATOR_ENABLED !== 'true') return null;
    if (!env.RAS_SIMULATOR_TOKEN || env.RAS_SIMULATOR_TOKEN.length < 32) {
        throw new Error('RAS_SIMULATOR_TOKEN must contain at least 32 characters');
    }
    if (!/^[a-fA-F0-9]{64}$/.test(env.RAS_SIMULATOR_KEY || '')) {
        throw new Error('RAS_SIMULATOR_KEY must be a 32-byte hexadecimal encryption key');
    }
    return { token: env.RAS_SIMULATOR_TOKEN, key: Buffer.from(env.RAS_SIMULATOR_KEY, 'hex') };
}

function encrypt(code, key, lockId) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(lockId));
    const ciphertext = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}

function decrypt(value, key, lockId) {
    const payload = Buffer.from(value, 'base64');
    const cipher = createDecipheriv('aes-256-gcm', key, payload.subarray(0, 12));
    cipher.setAAD(Buffer.from(lockId));
    cipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([cipher.update(payload.subarray(28)), cipher.final()]).toString('utf8');
}

function metadata(row, now) {
    const status = !row.allocation_id ? 'unallocated'
        : now < new Date(row.valid_from) ? 'scheduled'
        : now >= new Date(row.valid_until) ? 'expired' : 'active';
    return {
        simulator: true,
        lockId: row.lock_id,
        allocationId: row.allocation_id,
        bookingReference: row.booking_reference,
        version: row.version,
        validFrom: row.valid_from ? new Date(row.valid_from).toISOString() : null,
        validUntil: row.valid_until ? new Date(row.valid_until).toISOString() : null,
        status,
    };
}

class RasSimulatorStore {
    constructor(pool, key) {
        this.pool = pool;
        this.key = key;
    }

    async init() {
        await this.pool.query(`CREATE TABLE IF NOT EXISTS ras_simulator_lock (
            lock_id VARCHAR(80) PRIMARY KEY,
            allocation_id CHAR(36) NULL,
            booking_reference VARCHAR(100) NULL,
            encrypted_code TEXT NULL,
            version INT NOT NULL DEFAULT 0,
            valid_from DATETIME(3) NULL,
            valid_until DATETIME(3) NULL
        ) ENGINE=InnoDB`);
        await this.pool.query(`CREATE TABLE IF NOT EXISTS ras_simulator_operation (
            lock_id VARCHAR(80) NOT NULL,
            request_id VARCHAR(80) NOT NULL,
            request_hash CHAR(64) NOT NULL,
            response JSON NOT NULL,
            PRIMARY KEY(lock_id, request_id),
            FOREIGN KEY(lock_id) REFERENCES ras_simulator_lock(lock_id)
        ) ENGINE=InnoDB`);
    }

    async read(lockId, reveal = false) {
        const [rows] = await this.pool.execute(
            'SELECT * FROM ras_simulator_lock WHERE lock_id = ?', [lockId],
        );
        if (!rows.length) throw new SimulatorError(404, 'LOCK_NOT_FOUND', 'No simulated lock with this identifier.');
        const [clock] = await this.pool.query('SELECT UTC_TIMESTAMP(3) AS now');
        const result = metadata(rows[0], clock[0].now);
        if (reveal) {
            if (!['active', 'scheduled'].includes(result.status)) {
                throw new SimulatorError(409, 'NO_CURRENT_ALLOCATION', 'This lock has no current simulated allocation.');
            }
            return { ...result, code: decrypt(rows[0].encrypted_code, this.key, lockId) };
        }
        return result;
    }

    async mutate(lockId, requestId, action, input) {
        const hash = createHash('sha256').update(JSON.stringify({ action, input })).digest('hex');
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                'INSERT INTO ras_simulator_lock (lock_id) VALUES (?) ON DUPLICATE KEY UPDATE lock_id = lock_id',
                [lockId],
            );
            const [rows] = await connection.execute(
                'SELECT * FROM ras_simulator_lock WHERE lock_id = ? FOR UPDATE', [lockId],
            );
            const [operations] = await connection.execute(
                'SELECT request_hash, response FROM ras_simulator_operation WHERE lock_id = ? AND request_id = ?',
                [lockId, requestId],
            );
            if (operations.length) {
                if (operations[0].request_hash !== hash) {
                    throw new SimulatorError(409, 'IDEMPOTENCY_CONFLICT', 'Use a new request key for a different operation.');
                }
                await connection.commit();
                return typeof operations[0].response === 'string'
                    ? JSON.parse(operations[0].response) : operations[0].response;
            }
            const [clock] = await connection.query('SELECT UTC_TIMESTAMP(3) AS now');
            const now = new Date(clock[0].now);
            const row = rows[0];
            const current = metadata(row, now);
            if (action === 'allocate') {
                if (['active', 'scheduled'].includes(current.status)) {
                    throw new SimulatorError(409, 'LOCK_ALLOCATED', 'This simulated lock already has an allocation.');
                }
                if (new Date(input.validUntil) <= now) {
                    throw new SimulatorError(422, 'INVALID_PERIOD', 'The allocation must end in the future.');
                }
                row.allocation_id = randomUUID();
                row.booking_reference = input.bookingReference;
                row.valid_from = new Date(input.validFrom);
                row.valid_until = new Date(input.validUntil);
            } else {
                if (!['active', 'scheduled'].includes(current.status) || row.allocation_id !== input.allocationId) {
                    throw new SimulatorError(409, 'ALLOCATION_CHANGED', 'The allocation is missing, expired, or has changed. Refresh first.');
                }
            }
            const oldCode = row.encrypted_code ? decrypt(row.encrypted_code, this.key, lockId) : null;
            let code;
            do { code = String(randomInt(0, 1000000)).padStart(6, '0'); } while (code === oldCode);
            row.encrypted_code = encrypt(code, this.key, lockId);
            row.version += 1;
            await connection.execute(`UPDATE ras_simulator_lock SET allocation_id = ?, booking_reference = ?,
                encrypted_code = ?, version = ?, valid_from = ?, valid_until = ? WHERE lock_id = ?`,
            [row.allocation_id, row.booking_reference, row.encrypted_code, row.version, row.valid_from, row.valid_until, lockId]);
            const response = metadata(row, now);
            await connection.execute(
                'INSERT INTO ras_simulator_operation (lock_id, request_id, request_hash, response) VALUES (?, ?, ?, ?)',
                [lockId, requestId, hash, JSON.stringify(response)],
            );
            await connection.commit();
            return response;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

function validateInput(action, body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new SimulatorError(422, 'INVALID_INPUT', 'A JSON object is required.');
    }
    if (action === 'rotate') {
        if (typeof body.allocationId !== 'string' || !/^[a-f0-9-]{36}$/.test(body.allocationId)) {
            throw new SimulatorError(422, 'INVALID_INPUT', 'A valid allocationId is required.');
        }
        return { allocationId: body.allocationId };
    }
    const isoDate = value => typeof value === 'string'
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)
        && Number.isFinite(Date.parse(value))
        && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
    if (typeof body.bookingReference !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(body.bookingReference)
        || !isoDate(body.validFrom) || !isoDate(body.validUntil)
        || Date.parse(body.validUntil) <= Date.parse(body.validFrom)) {
        throw new SimulatorError(422, 'INVALID_INPUT', 'Supply an opaque bookingReference and increasing UTC ISO validFrom/validUntil dates.');
    }
    return {
        bookingReference: body.bookingReference,
        validFrom: new Date(body.validFrom).toISOString(),
        validUntil: new Date(body.validUntil).toISOString(),
    };
}

function simulatorRouter(store, token) {
    const router = express.Router();
    const tokenHash = createHash('sha256').update(`Bearer ${token}`).digest();
    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        res.set('X-RAS-Simulator', 'true');
        const supplied = createHash('sha256').update(req.get('Authorization') || '').digest();
        if (!timingSafeEqual(supplied, tokenHash)) {
            return res.status(401).json({ code: 'UNAUTHORISED', error: 'Simulator credentials required.' });
        }
        next();
    });
    router.param('lockId', (req, res, next, lockId) => {
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(lockId)) {
            return res.status(422).json({ code: 'INVALID_LOCK_ID', error: 'Use 1-80 letters, digits, hyphens or underscores.' });
        }
        next();
    });
    const handle = operation => async (req, res) => {
        try {
            res.json(await operation(req));
        } catch (error) {
            if (error instanceof SimulatorError) {
                return res.status(error.status).json({ code: error.code, error: error.message });
            }
            console.error('RAS simulator operation failed:', error.code || error.name);
            res.status(500).json({ code: 'SIMULATOR_FAILED', error: 'Simulator storage operation failed. Retry with the same request key.' });
        }
    };
    router.get('/locks/:lockId', handle(req => store.read(req.params.lockId)));
    router.post('/locks/:lockId/reveal', handle(req => store.read(req.params.lockId, true)));
    for (const [path, action] of [['allocations', 'allocate'], ['rotate', 'rotate']]) {
        router.post(`/locks/:lockId/${path}`, handle(req => {
            const requestId = req.get('Idempotency-Key') || '';
            if (!/^[A-Za-z0-9_-]{1,80}$/.test(requestId)) {
                throw new SimulatorError(422, 'INVALID_REQUEST_KEY', 'Supply an Idempotency-Key of 1-80 letters, digits, hyphens or underscores.');
            }
            return store.mutate(req.params.lockId, requestId, action, validateInput(action, req.body));
        }));
    }
    return router;
}

module.exports = { configuration, RasSimulatorStore, simulatorRouter, validateInput };
