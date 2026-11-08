const { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } = require('node:crypto');
const express = require('express');

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

function encrypt(code, key, lockerUid) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(lockerUid));
    const ciphertext = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}

function decrypt(value, key, lockerUid) {
    const payload = Buffer.from(value, 'base64');
    const cipher = createDecipheriv('aes-256-gcm', key, payload.subarray(0, 12));
    cipher.setAAD(Buffer.from(lockerUid));
    cipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([cipher.update(payload.subarray(28)), cipher.final()]).toString('utf8');
}

class RasSimulatorStore {
    constructor(pool, key) {
        this.pool = pool;
        this.key = key;
    }

    async init() {
        await this.pool.query(`CREATE TABLE IF NOT EXISTS ras_simulator_lock (
            lock_id VARCHAR(80) PRIMARY KEY,
            encrypted_code TEXT NULL,
            version INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB`);
    }

    async generateCode(lockerUid) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                'INSERT INTO ras_simulator_lock (lock_id) VALUES (?) ON DUPLICATE KEY UPDATE lock_id = lock_id',
                [lockerUid],
            );
            const [rows] = await connection.execute(
                'SELECT encrypted_code FROM ras_simulator_lock WHERE lock_id = ? FOR UPDATE', [lockerUid],
            );
            const previous = rows[0].encrypted_code ? decrypt(rows[0].encrypted_code, this.key, lockerUid) : null;
            let code;
            do { code = String(randomInt(0, 1000000)).padStart(6, '0'); } while (code === previous);
            await connection.execute(
                'UPDATE ras_simulator_lock SET encrypted_code = ?, version = version + 1 WHERE lock_id = ?',
                [encrypt(code, this.key, lockerUid), lockerUid],
            );
            await connection.commit();
            return { lockerUid, code };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
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
    router.post('/locks/:lockerUid/code', async (req, res) => {
        const { lockerUid } = req.params;
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(lockerUid)) {
            return res.status(422).json({ code: 'INVALID_LOCKER_UID', error: 'Use 1-80 letters, digits, hyphens or underscores.' });
        }
        try {
            res.json(await store.generateCode(lockerUid));
        } catch (error) {
            console.error('RAS simulator code generation failed:', error.code || error.name);
            res.status(500).json({ code: 'SIMULATOR_FAILED', error: 'Code generation could not be confirmed. A new request generates another code.' });
        }
    });
    return router;
}

module.exports = { configuration, RasSimulatorStore, simulatorRouter };
