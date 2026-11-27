const http = require('http');

// Same-origin bridge to Django: the browser only talks to this server, so session
// and CSRF cookies stay first-party and no CORS is needed. The Host header is kept
// so Django's CSRF origin check sees the browser-facing origin.
// `/api/v1/*` maps to Django's `/api/*` because legacy Express routes own `/api/*`.
function djangoProxy(target) {
    const upstream = new URL(target);
    return (req, res) => {
        const path = req.originalUrl.replace(/^\/api\/v1(?=\/|\?|$)/, '/api');
        const forwarded = http.request({
            hostname: upstream.hostname,
            port: upstream.port,
            method: req.method,
            path,
            headers: { ...req.headers, 'x-forwarded-proto': req.protocol },
        }, upstreamRes => {
            res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
            upstreamRes.pipe(res);
        });
        forwarded.on('error', () => {
            if (!res.headersSent) {
                res.status(502).json({ status: 502, errors: [{ message: 'Backend unavailable' }] });
            }
        });
        req.pipe(forwarded);
    };
}

function mountDjangoProxy(app, target) {
    const proxy = djangoProxy(target);
    app.use('/_allauth', proxy);
    app.use('/api/v1', proxy);
}

module.exports = { djangoProxy, mountDjangoProxy };
