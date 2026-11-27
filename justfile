# Spind monorepo task runner.
# Wraps the existing backend (uv) and frontend (yarn) commands so every
# workflow runs via `just`.

set shell := ["bash", "-cu"]

# Load variables from .env (git-ignored) when present.
set dotenv-load := true

backend_dir := "backend"
frontend_dir := "frontend"

# List available recipes.
default:
    @just --list

# Create a local .env from the template if it does not exist.
env:
    python3 {{backend_dir}}/locker_tools/local_env.py

# Install backend and frontend dependencies.
install:
    cd {{backend_dir}} && uv sync
    cd {{frontend_dir}} && yarn install

# Run the frontend dev server (and Storybook).
dev:
    cd {{frontend_dir}} && yarn dev

# Build the frontend for production.
build:
    cd {{frontend_dir}} && yarn build

# Run the full Python suite against the Compose PostgreSQL database.
test:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec -T backend uv run --no-sync pytest

# Run the existing importer/assignment tests without a database.
test-tools:
    cd {{backend_dir}} && uv run pytest --ignore=tests/web

# Lint the backend (ruff) and the frontend (eslint).
lint:
    cd {{backend_dir}} && uvx ruff check .
    cd {{frontend_dir}} && yarn eslint .

# Start the local stack via docker compose (see .env.example for side-by-side worktree ports).
up: env
    env -u DJANGO_SECRET_KEY docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml up --build --wait --wait-timeout 600
    @echo "Locker app: http://localhost:${APP_PORT:-3000} (parent signup: /registrieren)"
    @echo "Python API: http://localhost:${BACKEND_PORT:-8000}/api/docs"
    @echo "Local email inbox: http://localhost:${MAIL_PORT:-8025}"

# Stop the local stack.
down:
    docker compose -f {{frontend_dir}}/docker-compose.yml down

# Follow application and database logs.
logs:
    docker compose -f {{frontend_dir}}/docker-compose.yml logs --follow

# Show container health and published ports.
status:
    docker compose -f {{frontend_dir}}/docker-compose.yml ps

test-pg:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec -T backend uv run --no-sync pytest tests/web

# Throwaway PostgreSQL for tests: RAM-backed (tmpfs), separate port, no compose stack needed.
test_db_container := "spind-test-db"
test_db_port := env_var_or_default("TEST_DB_PORT", "55432")
test_db_env := "POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=" + test_db_port + " POSTGRES_USER=locker POSTGRES_DB=lockerdb POSTGRES_PASSWORD=test-only"
# Production settings (real Argon2id hashing) with a throwaway secret, debug-only.
test_db_django := "DJANGO_SETTINGS_MODULE=locker_tools.web.settings DJANGO_SECRET_KEY=test-db-only DJANGO_DEBUG=true"

# Start the throwaway test database (idempotent).
test-db-up:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! docker container inspect {{test_db_container}} >/dev/null 2>&1; then
        docker run -d --rm --name {{test_db_container}} --tmpfs /var/lib/postgresql/data \
            -e POSTGRES_USER=locker -e POSTGRES_PASSWORD=test-only -e POSTGRES_DB=lockerdb \
            -p 127.0.0.1:{{test_db_port}}:5432 postgres:17-alpine >/dev/null
    fi
    # TCP readiness: the image's init server listens on the unix socket only.
    until docker exec {{test_db_container}} pg_isready -h 127.0.0.1 -U locker -d lockerdb >/dev/null 2>&1; do sleep 0.5; done
    echo "Test database ready on 127.0.0.1:{{test_db_port}}"

# Stop and discard the throwaway test database.
test-db-down:
    docker stop {{test_db_container}} >/dev/null 2>&1 || true

# Run the PostgreSQL-backed tests on a fresh throwaway database; extra args go to pytest.
test-db *args: test-db-down test-db-up
    #!/usr/bin/env bash
    set -euo pipefail
    trap 'just test-db-down' EXIT
    cd {{backend_dir}} && env {{test_db_env}} uv run pytest tests/web {{args}}

# Migrate the running test database and seed synthetic login scenarios for manual exploration.
test-db-seed: test-db-up
    cd {{backend_dir}} && env {{test_db_env}} {{test_db_django}} uv run locker-web migrate --noinput
    cd {{backend_dir}} && env {{test_db_env}} {{test_db_django}} uv run locker-web seed_auth_scenarios

api-test:
    just test-pg

migrate:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec -T backend uv run --no-sync locker-web migrate --noinput

createsuperuser:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec backend uv run --no-sync locker-web createsuperuser

deploy:
    @echo "not yet - production deployment (E13, #36)"
