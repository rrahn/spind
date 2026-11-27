# The React app calls Django same-origin through a proxy

Django renders no UI (`HEADLESS_ONLY`). The React SPA is the only user interface
and talks to Django over HTTP JSON: allauth under `/_allauth/browser/v1/*` and the
Django Ninja domain API. The browser only ever talks to one origin. In
development the Express server on port 3000 forwards `/_allauth/*` and
`/api/v1/*` (rewritten to Django's `/api/*`) to Django; in production a reverse
proxy serves the SPA and routes the same prefixes.

The user chose this over cross-origin CORS calls to port 8000 because it keeps
session and CSRF cookies first-party (`SameSite=Lax`, unaffected by third-party
cookie blocking), needs no credentialed-CORS allow-list that could be
misconfigured, avoids preflight requests and matches production. Revisit only if
the API must serve other origins. A native app would use allauth's `app` client
with tokens instead.

The `/api/v1` prefix exists because legacy Express routes own `/api/*`. When the
legacy routes are retired, the rewrite can be dropped.
