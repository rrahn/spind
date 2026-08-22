# locker-tools

Locker assignment tooling for the spind backend. Computes an optimal
student-to-locker assignment via minimum-weight bipartite matching, weighting
lockers by physical distance from each student's classroom.

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

## Build

```sh
uv build
```
