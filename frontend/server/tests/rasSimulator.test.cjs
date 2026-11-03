const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const { configuration, RasSimulatorStore, simulatorRouter, validateInput } = require('../rasSimulator');

const key = Buffer.alloc(32, 7);
const token = 'simulator-test-token-with-at-least-32-characters';

test('simulator defaults off and rejects incomplete explicit configuration', () => {
    assert.equal(configuration({}), null);
    assert.throws(() => configuration({ RAS_SIMULATOR_ENABLED: 'true' }), /TOKEN/);
    assert.throws(() => configuration({ RAS_SIMULATOR_ENABLED: 'true', RAS_SIMULATOR_TOKEN: token }), /KEY/);
    assert.deepEqual(configuration({
        RAS_SIMULATOR_ENABLED: 'true', RAS_SIMULATOR_TOKEN: token, RAS_SIMULATOR_KEY: key.toString('hex'),
    }), { token, key });
});

test('strict input validation rejects malformed dates and identity-bearing references', () => {
    for (const body of [null, [], {}, {
        bookingReference: 'a pupil name', validFrom: '2027-01-01T00:00:00Z', validUntil: '2028-01-01T00:00:00Z',
    }, {
        bookingReference: 'opaque', validFrom: '2027-02-30T00:00:00Z', validUntil: '2028-01-01T00:00:00Z',
    }, {
        bookingReference: 'opaque', validFrom: '2027-01-01T00:00:00Z', validUntil: '2026-01-01T00:00:00Z',
    }]) assert.throws(() => validateInput('allocate', body), /Supply|JSON/);
    assert.throws(() => validateInput('rotate', {}), /allocationId/);
});

test('HTTP authentication, validation and explicit error mapping', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/ras-simulator', simulatorRouter({
        read() { throw new Error('test storage failure'); },
    }, token));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/ras-simulator/locks/`;
    try {
        assert.equal((await fetch(`${base}demo`)).status, 401);
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        assert.equal((await fetch(`${base}bad.id`, { headers })).status, 422);
        assert.equal((await fetch(`${base}demo/allocations`, { method: 'POST', headers, body: '{}' })).status, 422);
        const response = await fetch(`${base}demo`, { headers });
        assert.equal(response.status, 500);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal((await response.json()).code, 'SIMULATOR_FAILED');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('MySQL persistence, encryption, concurrency and HTTP contract', {
    skip: !process.env.RAS_TEST_MYSQL_PORT && 'Set RAS_TEST_MYSQL_PORT for an isolated MySQL test database.',
}, async t => {
    const pool = mysql.createPool({
        host: '127.0.0.1',
        port: Number(process.env.RAS_TEST_MYSQL_PORT),
        user: 'root',
        password: process.env.RAS_TEST_MYSQL_PASSWORD,
        database: 'ras_test',
        timezone: 'Z',
        connectionLimit: 10,
    });
    const store = new RasSimulatorStore(pool, key);
    const prefix = randomUUID();
    let server;
    try {
        await store.init();
        const app = express();
        app.use(express.json());
        app.use('/sim', simulatorRouter(store, token));
        server = app.listen(0, '127.0.0.1');
        await new Promise(resolve => server.once('listening', resolve));
        const base = `http://127.0.0.1:${server.address().port}/sim/locks/`;
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        const period = {
            bookingReference: 'opaque-booking',
            validFrom: new Date(Date.now() - 60000).toISOString(),
            validUntil: new Date(Date.now() + 3600000).toISOString(),
        };
        const lock = `${prefix}-a`;
        await t.test('missing lock is explicit', async () => {
            assert.equal((await fetch(`${base}${lock}`, { headers })).status, 404);
        });
        const allocate = (requestId, body = period) => fetch(`${base}${lock}/allocations`, {
            method: 'POST', headers: { ...headers, 'Idempotency-Key': requestId }, body: JSON.stringify(body),
        });
        let allocation;
        let firstCode;
        await t.test('concurrent clients have one allocation winner', async () => {
            const results = await Promise.all(Array.from({ length: 10 }, (_, index) => allocate(`claim-${index}`)));
            assert.equal(results.filter(result => result.status === 200).length, 1);
            assert.equal(results.filter(result => result.status === 409).length, 9);
            allocation = await results.find(result => result.status === 200).json();
            assert.equal(allocation.version, 1);
            assert.equal(allocation.status, 'active');
            assert.equal('code' in allocation, false);
        });
        await t.test('code requires explicit reveal and is encrypted in storage', async () => {
            const result = await fetch(`${base}${lock}/reveal`, { method: 'POST', headers });
            assert.equal(result.headers.get('cache-control'), 'no-store');
            firstCode = (await result.json()).code;
            assert.match(firstCode, /^\d{6}$/);
            const [rows] = await pool.execute('SELECT encrypted_code FROM ras_simulator_lock WHERE lock_id = ?', [lock]);
            assert.notEqual(rows[0].encrypted_code, firstCode);
            assert.equal(Buffer.from(rows[0].encrypted_code, 'base64').includes(Buffer.from(firstCode)), false);
            const freshStore = new RasSimulatorStore(pool, key);
            assert.equal((await freshStore.read(lock, true)).code, firstCode);
        });
        await t.test('rotation requires current allocation and retries only rotate once', async () => {
            const body = { allocationId: allocation.allocationId };
            const rotate = (value = body) => fetch(`${base}${lock}/rotate`, {
                method: 'POST', headers: { ...headers, 'Idempotency-Key': 'rotation-1' }, body: JSON.stringify(value),
            });
            const results = await Promise.all([rotate(), rotate(), rotate()]);
            for (const result of results) {
                assert.equal(result.status, 200);
                assert.equal((await result.json()).version, 2);
            }
            assert.notEqual((await store.read(lock, true)).code, firstCode);
            assert.equal((await rotate({ allocationId: randomUUID() })).status, 409);
            assert.equal((await store.read(lock)).version, 2);
        });
        await t.test('scheduled and expired metadata; expiry permits new allocation', async () => {
            const future = `${prefix}-future`;
            const next = new Date(Date.now() + 3600000).toISOString();
            const end = new Date(Date.now() + 7200000).toISOString();
            const scheduled = await store.mutate(future, 'future-1', 'allocate', {
                ...period, validFrom: next, validUntil: end,
            });
            assert.equal(scheduled.status, 'scheduled');
            await pool.execute("UPDATE ras_simulator_lock SET valid_until = UTC_TIMESTAMP(3) - INTERVAL 1 SECOND WHERE lock_id = ?", [lock]);
            await assert.rejects(() => store.read(lock, true), /no current/);
            const renewed = await store.mutate(lock, 'renewal', 'allocate', period);
            assert.notEqual(renewed.allocationId, allocation.allocationId);
            assert.equal(renewed.version, 3);
            await assert.rejects(
                () => store.mutate(lock, 'stale-rotation', 'rotate', { allocationId: allocation.allocationId }),
                /changed/,
            );
        });
        await t.test('same allocation request is repeat-safe; different body conflicts', async () => {
            const id = `${prefix}-replay`;
            const first = await store.mutate(id, 'same-request', 'allocate', period);
            assert.deepEqual(await store.mutate(id, 'same-request', 'allocate', period), first);
            await assert.rejects(() => store.mutate(id, 'same-request', 'allocate', {
                ...period, bookingReference: 'different',
            }), /new request key/);
        });
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        await pool.execute('DELETE FROM ras_simulator_operation WHERE lock_id LIKE ?', [`${prefix}%`]);
        await pool.execute('DELETE FROM ras_simulator_lock WHERE lock_id LIKE ?', [`${prefix}%`]);
        await pool.end();
    }
});
