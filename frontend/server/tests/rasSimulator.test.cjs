const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDecipheriv, randomUUID } = require('node:crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const { configuration, RasSimulatorStore, simulatorRouter } = require('../rasSimulator');

const key = Buffer.alloc(32, 7);
const token = 'simulator-test-token-with-at-least-32-characters';

async function serve(store) {
    const app = express();
    app.use('/api/ras-simulator', simulatorRouter(store, token));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    return {
        url: `http://127.0.0.1:${server.address().port}/api/ras-simulator/locks/`,
        close: () => new Promise(resolve => server.close(resolve)),
    };
}

const headers = { Authorization: `Bearer ${token}` };

test('simulator defaults off and rejects incomplete explicit configuration', () => {
    assert.equal(configuration({}), null);
    assert.throws(() => configuration({ RAS_SIMULATOR_ENABLED: 'true' }), /TOKEN/);
    assert.throws(() => configuration({ RAS_SIMULATOR_ENABLED: 'true', RAS_SIMULATOR_TOKEN: token }), /KEY/);
    assert.deepEqual(configuration({
        RAS_SIMULATOR_ENABLED: 'true', RAS_SIMULATOR_TOKEN: token, RAS_SIMULATOR_KEY: key.toString('hex'),
    }), { token, key });
});

test('endpoint accepts only authenticated POST requests with a valid locker UID', async () => {
    const calls = [];
    const server = await serve({
        async generateCode(lockerUid) {
            calls.push(lockerUid);
            return { lockerUid, code: '001234' };
        },
    });
    try {
        const request = (uid, options = {}) => fetch(`${server.url}${uid}/code`, { method: 'POST', headers, ...options });
        assert.equal((await request('locker-1', { headers: {} })).status, 401);
        assert.equal((await request('locker-1', { headers: { Authorization: 'Bearer wrong-token' } })).status, 401);
        assert.equal((await request('bad.id')).status, 422);
        assert.equal((await request('a'.repeat(81))).status, 422);
        assert.equal((await request('locker-1', { method: 'GET' })).status, 404);
        const uid = randomUUID();
        const response = await request(uid);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('x-ras-simulator'), 'true');
        assert.deepEqual(await response.json(), { lockerUid: uid, code: '001234' });
        assert.deepEqual(calls, [uid]);
        for (const path of ['allocations', 'rotate', 'reveal']) {
            assert.equal((await fetch(`${server.url}${uid}/${path}`, { method: 'POST', headers })).status, 404);
        }
    } finally {
        await server.close();
    }
});

test('storage failure returns explicit error without disclosing internal details', async () => {
    const server = await serve({ generateCode() { throw new Error('private storage details'); } });
    try {
        const response = await fetch(`${server.url}locker-1/code`, { method: 'POST', headers });
        assert.equal(response.status, 500);
        const result = await response.json();
        assert.equal(result.code, 'SIMULATOR_FAILED');
        assert.doesNotMatch(JSON.stringify(result), /private storage details/);
    } finally {
        await server.close();
    }
});

test('transaction failure rolls back and releases its connection', async () => {
    const events = [];
    const store = new RasSimulatorStore({
        async getConnection() {
            return {
                async beginTransaction() { events.push('begin'); },
                async execute() { throw new Error('database unavailable'); },
                async rollback() { events.push('rollback'); },
                release() { events.push('release'); },
            };
        },
    }, key);
    await assert.rejects(() => store.generateCode('locker-1'), /database unavailable/);
    assert.deepEqual(events, ['begin', 'rollback', 'release']);
});

test('MySQL code generation, replacement, persistence and concurrent requests', {
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
    const uid = randomUUID();
    const otherUid = randomUUID();
    let server;
    try {
        await store.init();
        server = await serve(store);
        const request = () => fetch(`${server.url}${uid}/code`, { method: 'POST', headers });
        await t.test('UID alone generates code and another request replaces it', async () => {
            const first = await request();
            assert.equal(first.status, 200);
            const result = await first.json();
            assert.deepEqual(Object.keys(result).sort(), ['code', 'lockerUid']);
            assert.equal(result.lockerUid, uid);
            assert.match(result.code, /^\d{6}$/);
            const next = await (await request()).json();
            assert.notEqual(next.code, result.code);
            const [rows] = await pool.execute('SELECT * FROM ras_simulator_lock WHERE lock_id = ?', [uid]);
            assert.equal(rows[0].version, 2);
            assert.notEqual(rows[0].encrypted_code, next.code);
            const payload = Buffer.from(rows[0].encrypted_code, 'base64');
            const decipher = createDecipheriv('aes-256-gcm', key, payload.subarray(0, 12));
            decipher.setAAD(Buffer.from(uid));
            decipher.setAuthTag(payload.subarray(12, 28));
            assert.equal(Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString(), next.code);
        });
        await t.test('new store instance preserves state and different UIDs remain independent', async () => {
            await new RasSimulatorStore(pool, key).generateCode(uid);
            await store.generateCode(otherUid);
            const [rows] = await pool.execute('SELECT lock_id, version FROM ras_simulator_lock WHERE lock_id IN (?, ?)', [uid, otherUid]);
            assert.equal(rows.find(row => row.lock_id === uid).version, 3);
            assert.equal(rows.find(row => row.lock_id === otherUid).version, 1);
        });
        await t.test('concurrent requests are serialised without losing updates', async () => {
            const responses = await Promise.all(Array.from({ length: 10 }, request));
            for (const response of responses) {
                assert.equal(response.status, 200);
                assert.match((await response.json()).code, /^\d{6}$/);
            }
            const [rows] = await pool.execute('SELECT version FROM ras_simulator_lock WHERE lock_id = ?', [uid]);
            assert.equal(rows[0].version, 13);
        });
    } finally {
        if (server) await server.close();
        await pool.execute('DELETE FROM ras_simulator_lock WHERE lock_id IN (?, ?)', [uid, otherUid]);
        await pool.end();
    }
});
