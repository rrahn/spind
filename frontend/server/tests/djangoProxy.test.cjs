const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { mountDjangoProxy } = require('../djangoProxy');

function listen(server) {
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

test('forwards auth and versioned API calls with body, host and cookies intact', async () => {
    const seen = [];
    const django = http.createServer((req, res) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            seen.push({ method: req.method, url: req.url, host: req.headers.host, csrf: req.headers['x-csrftoken'], body });
            res.writeHead(401, { 'content-type': 'application/json', 'set-cookie': 'sessionid=abc; HttpOnly; SameSite=Lax' });
            res.end('{"status":401}');
        });
    });
    const app = express();
    mountDjangoProxy(app, `http://127.0.0.1:${await listen(django)}`);
    app.use(express.json());
    app.get('/api/getFloorMaps', (req, res) => res.json(['legacy']));
    const frontend = http.createServer(app);
    const port = await listen(frontend);
    try {
        const signup = await fetch(`http://127.0.0.1:${port}/_allauth/browser/v1/auth/signup`, {
            method: 'POST', headers: { 'content-type': 'application/json', 'x-csrftoken': 't0ken' }, body: '{"email":"a@example.invalid"}',
        });
        assert.equal(signup.status, 401);
        assert.equal(signup.headers.get('set-cookie'), 'sessionid=abc; HttpOnly; SameSite=Lax');
        await fetch(`http://127.0.0.1:${port}/api/v1/pupils?limit=5`);
        const legacy = await fetch(`http://127.0.0.1:${port}/api/getFloorMaps`);
        assert.deepEqual(await legacy.json(), ['legacy']);
        assert.deepEqual(seen, [
            { method: 'POST', url: '/_allauth/browser/v1/auth/signup', host: `127.0.0.1:${port}`, csrf: 't0ken', body: '{"email":"a@example.invalid"}' },
            { method: 'GET', url: '/api/pupils?limit=5', host: `127.0.0.1:${port}`, csrf: undefined, body: '' },
        ]);
    } finally {
        frontend.close();
        django.close();
    }
});

test('answers 502 when Django is unreachable', async () => {
    const app = express();
    mountDjangoProxy(app, 'http://127.0.0.1:9');
    const frontend = http.createServer(app);
    const port = await listen(frontend);
    try {
        const response = await fetch(`http://127.0.0.1:${port}/_allauth/browser/v1/config`);
        assert.equal(response.status, 502);
    } finally {
        frontend.close();
    }
});
