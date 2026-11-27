## System shape

React SPA (`frontend/client`) is the only UI. Django (`backend/locker_tools/web`) is a headless JSON API: Django Ninja for the domain, django-allauth headless for accounts, PostgreSQL for storage. The browser calls Django **same-origin** through the Express server: `/_allauth/*` and `/api/v1/*` (→ Django `/api/*`). Legacy Express/MySQL routes still own `/api/*`. Decisions: `docs/adr/`; API, auth flow and commands: `docs/design/python-backend.md`.

## Delivery workflow

Work in **vertical slices**: each issue delivers one CRUD operation (create, read, update or delete) of one resource end-to-end: PostgreSQL model/migration → Django API with authz → React screen → tests at each layer. A slice is done when a guardian can perform it in the running app (`just up`) and the data is verifiably in PostgreSQL. Keep slices small enough for one focused PR; split by CRUD verb before splitting by layer.

Security-relevant slices follow `docs/adr/0002-parent-account-security.md`. Use synthetic `@example.invalid` data in tests and seeds.

## Testing

- `just test-db [pytest args]`: backend web tests on a throwaway PostgreSQL; needs only Docker and uv. Use real PostgreSQL for anything touching storage or concurrency.
- `just test-db-seed`: keeps that DB running with synthetic verified/unverified guardians for manual login checks.
- Run a second worktree's stack beside another with `COMPOSE_PROJECT_NAME`, `APP_PORT`, `BACKEND_PORT`, `MAIL_PORT` (see `.env.example`); email lands in Mailpit.

## Agent skills

### Issue tracker

Issues and specs for this repo live in GitHub Issues (`rrahn/spind`); use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

This is a single-context repo: use a root `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.
