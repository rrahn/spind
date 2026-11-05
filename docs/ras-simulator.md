# API-only RAS-inspired simulator

The simulator has **no web UI**. A caller supplies a locker UID and receives a
new six-digit simulated code. It extends the existing Express/MySQL application;
it does not replace the React booking flow or migrate the application database.

## Contract

```http
POST /api/ras-simulator/locks/{lockerUid}/code
Authorization: Bearer <simulator-token>
```

No request body, booking reference, dates or allocation ID is required.

```json
{
  "lockerUid": "f70e2490-794c-478e-a82d-9908a120fe37",
  "code": "001234"
}
```

Codes are strings to preserve leading zeroes. Each successful request generates
a code different from the immediately preceding code for that UID and stores
the replacement encrypted. Codes are not globally unique across lockers.
Concurrent requests are serialised; only the last committed code is current.
The response has `Cache-Control: no-store` and `X-RAS-Simulator: true`.

UIDs accept 1-80 letters, digits, underscores or hyphens, including UUIDs.
The simulator accepts caller-supplied UIDs; it does not register inventory or
verify that a locker exists. Automatic UUID assignment and inventory integration
are deferred to [issue #46](https://github.com/rrahn/spind/issues/46).

Errors: 401 missing/incorrect token, 422 invalid UID, 500 storage failure.
The old allocation/status/reveal/rotation endpoints and React workbench have been
removed. This endpoint intentionally generates a new code on every request:
it is **not idempotent**. Retrying after a lost response generates another code.
The caller should serialise requests per UID and retain the most recent result.
Booking/payment authorisation and reliable provider retries belong in the future
integration, not this minimal simulator.

## Enable locally

In the project-root `.env` (ignored by Git), set:

```dotenv
RAS_SIMULATOR_ENABLED=true
RAS_SIMULATOR_TOKEN=<at-least-32-characters>
RAS_SIMULATOR_KEY=<64-hexadecimal-characters>
```

Generate two independent values, one for each secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start the existing local stack from the project root:

```sh
docker compose --env-file .env -f frontend/docker-compose.yml up --build
```

Example request (export the token in your shell first):

```sh
curl --fail-with-body --request POST \
  --header "Authorization: Bearer $RAS_SIMULATOR_TOKEN" \
  http://localhost:3000/api/ras-simulator/locks/f70e2490-794c-478e-a82d-9908a120fe37/code
```

The simulator is disabled by default. Direct Node startup needs the simulator
variables and existing `MYSQL_*` variables exported; Node does not load `.env`.
`MYSQL_PORT` defaults to 3306. Keep the encryption key stable across restarts.
Keep this development service on localhost; its shared token is not parent/staff
authentication. Never enable it against production data.

## Persistence and compatibility

`ras_simulator_lock` stores the UID, AES-256-GCM encrypted current code and a
generation counter. The key stays outside MySQL; random nonces and UID-associated
authentication protect stored values. Row locking and transactions prevent lost
updates. No plaintext codes are logged or stored.

Existing simulator tables remain compatible: unused nullable allocation columns
and the old operation-receipt table are left untouched rather than destructively
dropped. No new receipts or allocations are written. No inventory migration is
performed.

## Tests

From `frontend/`, run `yarn test:ras`. For database tests, supply an isolated,
disposable MySQL database named `ras_test`:

```sh
RAS_TEST_MYSQL_PORT=3307 RAS_TEST_MYSQL_PASSWORD=... yarn test:ras
```

Database tests otherwise report an explicit skip. Tests cover token/UID
validation, exact response shape, removed endpoints, explicit failures, rollback,
encrypted persistence, code replacement and concurrent requests. Test-owned rows
are cleaned up.

## Limits

The [Euro-Locks RAS page](https://www.euro-locks.com/en/products/smart-locks/remote-allocation-system/)
is product inspiration, not a verified API contract. **These codes cannot open
real locks.** Six digits and replacement semantics are simulation choices,
not claims about real RAS behaviour. This does not emulate offline-lock
revocation, door telemetry, master codes, payment, or booking entitlement.
