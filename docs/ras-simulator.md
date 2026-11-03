# RAS-inspired development simulator

This is an additive extension of the existing React / Express / MySQL prototype.
It does not replace the booking wizard, Python CLI, existing database tables, or
assignment optimiser. PostgreSQL/Django migration remains a separate task.

## What is simulated

Remote allocation and replacement of a numeric code, an explicit code reveal,
and allocation metadata for a synthetic lock identifier and validity period.
The [Euro-Locks RAS product page](https://www.euro-locks.com/en/products/smart-locks/remote-allocation-system/)
is the product inspiration. Direct page retrieval returned HTTP 403 during this
work; prior official product material describes remote allocation/third-party
integration, but no actual vendor API specification was obtained.

**These are our own endpoints and semantics, not an emulation of a documented
Euro-Locks wire protocol. Codes cannot open real locks.** Six digits, immediate
replacement in simulator state, scheduled/expired statuses and idempotency are
our development choices, not verified claims about RAS. There is no physical
door status, master code, clock synchronisation, real revocation, vendor
authentication, payment or booking entitlement in this simulator.

## Enable locally

Copy `.env.example` to `.env` if needed; do not overwrite existing configuration.
Set `RAS_SIMULATOR_ENABLED=true`. Generate **two independent** values:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use one for `RAS_SIMULATOR_TOKEN` and one for `RAS_SIMULATOR_KEY`. Keep the key
stable across restarts. Losing it makes existing simulated codes undecryptable.
The token must be at least 32 characters; the key must be 64 hexadecimal digits.

With the existing Compose setup, from the project root:

```sh
docker compose --env-file .env -f frontend/docker-compose.yml up --build
```

Open `http://localhost:3000/ras-simulator`. The workbench uses the existing React
bundle and Express app. Enter the simulator token in its password field; it stays
in page memory only. Use synthetic lock IDs such as `locker-1-1` and opaque
references such as `demo-booking`, not pupil data.

If running Express directly, export the simulator variables alongside its
existing `MYSQL_*` configuration; the Node server does not load `.env` itself.
`MYSQL_PORT` is optional and defaults to 3306.
Normal app startup is unchanged when the simulator flag is absent or false;
no simulator tables or endpoints are enabled.

The workbench is a development tool, not a parent account dashboard. Its single
development token is not a replacement for guardian/staff authentication. Keep
the app bound to localhost as the current Compose configuration does. Do not
enable this against production data or distribute the token to parents.

## HTTP contract

Base: `/api/ras-simulator`. Every endpoint requires
`Authorization: Bearer <RAS_SIMULATOR_TOKEN>` and returns `Cache-Control: no-store`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/locks/{lockId}` | Current metadata only; unknown lock is 404. |
| POST | `/locks/{lockId}/allocations` | Allocate a code, provided no current/scheduled allocation exists. |
| POST | `/locks/{lockId}/reveal` | Explicitly retrieve a current/scheduled simulated code. |
| POST | `/locks/{lockId}/rotate` | Replace the code for the specified current allocation. |

Allocation/rotation require `Idempotency-Key`: 1-80 letters, digits, underscores
or hyphens. Reusing the key with the same operation returns its original metadata
without generating another code. A different operation/body with the same key
is a 409 conflict. Retain the same key and payload across ambiguous network
failures; the workbench offers that retry rather than silently creating a new
operation. Replay results are historical; refresh status for the current version.

Allocate body:

```json
{
  "bookingReference": "demo-booking",
  "validFrom": "2027-08-01T00:00:00.000Z",
  "validUntil": "2028-07-31T23:59:59.000Z"
}
```

Dates must be UTC ISO timestamps; end must follow start and be in the future.
The status changes at these dates in simulator metadata, not on physical locks.
Lock IDs allow 1-80 letters, digits, underscores or hyphens. Booking references
allow the same alphabet, up to 100 characters. Rotations use:

```json
{ "allocationId": "the-uuid-returned-by-allocation" }
```

Successful requests return `simulator: true`, lock/allocation/reference IDs,
`version`, validity dates and `status` (`active`, `scheduled`, `expired`, or
`unallocated`). Only explicit reveal adds `code`. A new allocation after expiry
gets a new allocation ID. A stale allocation ID cannot rotate the new allocation.
Allocation never reserves or changes a real inventory row or paid booking.

Errors are JSON `{ "code": "...", "error": "..." }`: 401 unauthenticated,
404 unknown/disabled, 409 allocation/idempotency conflict, 422 invalid input, or
500 storage failure. Never interpret a failure as successful code issuance.

## Persistence and tests

Two additional InnoDB tables keep simulated state and operation receipts:
`ras_simulator_lock` and `ras_simulator_operation`. Row locking serialises
allocation/rotation; receipts are committed in the same transaction. Codes use
AES-256-GCM with per-write random nonces and lock-ID authentication, with the key
outside MySQL. Operation receipts contain metadata, not plaintext codes.
No destructive reset, real-lock write, or master-code endpoint is exposed.

From `frontend/`, run `yarn test:ras`. Pure HTTP/configuration validation runs
without MySQL; integration tests explicitly report a skip unless configured.
To run those tests, supply an **isolated disposable** MySQL database named
`ras_test`, root credentials, and a localhost port:

```sh
RAS_TEST_MYSQL_PORT=3307 RAS_TEST_MYSQL_PASSWORD=... yarn test:ras
```

Integration tests cover concurrent claims, encrypted storage, persistence,
scheduled/expired access, explicit reveal, repeat-safe rotation, stale allocation
protection and idempotency conflicts. Test-created rows are cleaned up.
