# Spind monorepo task runner.
# Wraps the existing backend (uv) and frontend (yarn) commands so every
# workflow runs via `just`. Placeholder recipes are filled in by later epics.

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
    test -f .env || cp .env.example .env

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

# Run the backend test suite.
test:
    cd {{backend_dir}} && uv run pytest

# Lint the backend (ruff) and the frontend (eslint).
lint:
    cd {{backend_dir}} && uvx ruff check .
    cd {{frontend_dir}} && yarn eslint .

# Start the local stack via docker compose.
up: env
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml up --build --wait --wait-timeout 600
    @echo "Locker app: http://localhost:3000"

# Stop the local stack.
down:
    docker compose -f {{frontend_dir}}/docker-compose.yml down

# Follow application and database logs.
logs:
    docker compose -f {{frontend_dir}}/docker-compose.yml logs --follow

# Show container health and published ports.
status:
    docker compose -f {{frontend_dir}}/docker-compose.yml ps

# --- placeholders, implemented by the epic noted in each message ---

test-pg:
    @echo "not yet - Postgres concurrency test suite (E8, #31)"

api-test:
    @echo "not yet - API tests (E4, #27)"

migrate:
    @echo "not yet - Alembic migrations (E1, #24)"

deploy:
    @echo "not yet - production deployment (E13, #36)"
