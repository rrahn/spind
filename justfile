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

# Start the local stack via docker compose.
up: env
    env -u DJANGO_SECRET_KEY docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml up --build --wait --wait-timeout 600
    @echo "Locker app: http://localhost:3000"
    @echo "Python API: http://localhost:8000/api/docs"
    @echo "Local email inbox: http://localhost:8025"

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

api-test:
    just test-pg

migrate:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec -T backend uv run --no-sync locker-web migrate --noinput

createsuperuser:
    docker compose --env-file .env -f {{frontend_dir}}/docker-compose.yml exec backend uv run --no-sync locker-web createsuperuser

deploy:
    @echo "not yet - production deployment (E13, #36)"
