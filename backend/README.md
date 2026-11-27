# locker-tools

Locker assignment tooling for the spind backend. Computes an optimal
student-to-locker assignment via minimum-weight bipartite matching, weighting
lockers by physical distance from each student's classroom. The same package
now also contains an additive Django/PostgreSQL booking API.

For the schema, REST endpoints, authentication, Compose startup and limitations,
see [the Python backend guide](../docs/design/python-backend.md).

## Requirements

- Python >= 3.11
- [uv](https://docs.astral.sh/uv/)

## Setup

```sh
uv sync
```

## Run

```sh
uv run locker-tools -o orders.csv -l lockers.csv -w orders_assigned.csv
```

## Test

```sh
uv run pytest
```

The complete suite requires PostgreSQL. To run only the original CLI tests
without a database:

```sh
uv run pytest --ignore=tests/web
```

Use `just test` from the repository root for the full suite inside the running
Compose backend, or `just test-pg` for the web/API/concurrency tests.

## Build

```sh
uv build
```
