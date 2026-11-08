# spind
Spind management application for schools

## Run locally

Install [just](https://github.com/casey/just) and Docker with Compose, and start
Docker. From this directory or the parent Locker workspace, run:

```sh
just up
```

This builds and starts the existing React/Express app and MySQL database in
the background, waits for readiness, and serves the app at
http://localhost:3000. The first run installs container dependencies and can
take several minutes. A missing project `.env` is copied from `.env.example`;
edit it to configure the optional simulator, then run `just up` again.

```sh
just status  # Show container health
just logs    # Follow logs (Ctrl-C stops following, not the containers)
just down    # Stop containers; database and dependency volumes are retained
```

Database storage is persistent. The database has no published host port, and
the app is bound to localhost. This is the existing development stack, not a
production deployment or a PostgreSQL migration. If startup fails, inspect
`just logs`; do not delete volumes to resolve routine startup errors.

The parent-workspace `justfile` delegates to this project's tracked task runner.

The existing React/Express/MySQL prototype includes an opt-in
[RAS-inspired development simulator](docs/ras-simulator.md). It generates
synthetic codes only and is not compatible with real locks.
