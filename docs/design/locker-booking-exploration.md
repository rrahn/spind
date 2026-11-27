# Locker booking: product model, stack exploration, and delivery plan

Date: 2026-11-03.
Original status: exploration only. Subsequently, the user approved an additive
Django/PostgreSQL backend while retaining React/Express/MySQL. The current
implementation scope and limitations are in [the Python backend guide](python-backend.md).

This document combines the requested product, a read of the current application,
all 31 open/closed issue descriptions, primary-source provider research, and the
design interview. Confirmed product decisions are distinguished from proposals.
The historical proposals below are not all implementation commitments.
The backend stack is now approved; payment, hardware and production approval
remain separate work.

Related documents:
[glossary](../../GLOSSARY.md),
[provider/privacy research](../research/providers-and-privacy.md),
[agent conventions](../../AGENTS.md).

## 1. Decisions confirmed in the interview

| Topic | Confirmed direction |
|---|---|
| Operator | The Förderverein, rather than assuming the school is the contracting operator. Controller and data-sharing roles still need confirmation. |
| Booking method | Parents choose immediately. Keep the existing assignment optimiser only as an administrative tool, not a mandatory cutoff phase. |
| Rental period | One child, one locker, one specific school year. Renewal is a separate booking. |
| Hold deadline | **30 minutes from locker selection, with no automatic extension.** This supersedes the original 15-minute requirement. |
| Late payment | Recovery/refund handling, never taking a locker from another booking. |
| Python backend | Subsequently approved: Django + Django Ninja + Django ORM + django-allauth; retain React and add PostgreSQL alongside the existing prototype. |
| Class placement | Parents normally know the upcoming class, such as 7N or Q1. Collect the school-year-specific class, not merely a numeric grade. |
| Pupil ownership | One owning guardian account per child in the first release. Shared access/invitations/transfer are later scope; never link children automatically by matching names. |
| Security posture | Standard, proportionate protection for a relatively low threat model. Passwords must never be plaintext. The earlier wording does not constitute a settled requirement to field-encrypt every identity attribute. |
| Legal scope | State-specific school-law analysis is outside this exploration at the user's request. This does not constitute DSGVO approval or remove a production review gate. |

## 2. What the repository actually contains

### Application

- [Frontend manifest](../../frontend/package.json): React 18, TypeScript,
  React Router, Webpack, Storybook, Express, Socket.IO, and MySQL drivers.
- [Express entry point](../../frontend/server/index.js): inventory read routes,
  reservation route, Socket.IO updates, and periodic release of old reservations.
- [Database implementation](../../frontend/server/models/database.js) and
  [existing Compose](../../frontend/docker-compose.yml): **MySQL 8**, not an
  implemented PostgreSQL backend. PostgreSQL is the planned destination in the
  newer issues.
- The reservation code already uses transactions and `FOR UPDATE`; it is not just
  an entirely client-side selection. This is useful prior art, not proof that the
  complete authenticated booking/payment lifecycle exists.
- [React floor plan](../../frontend/client/components/FloorPlan.tsx): responsive
  image-map selection and a compartment dialog. Treat it as a reusable UX
  prototype, not a UI design to preserve unchanged.
- [Payment page](../../frontend/client/pages/FormPagePayment.tsx): placeholder
  text mentioning Stripe, not a completed SumUp integration.
- [Status bar](../../frontend/client/pages/FormPageStatusBar.tsx): a stepper, not
  the requested persistent child/room/locker/price/countdown summary.
- [Python manifest](../../backend/pyproject.toml): existing Python CLI/tooling with
  Pydantic, NetworkX, Excel import, and pytest. No installed Django, FastAPI,
  SQLAlchemy, or PostgreSQL driver.
- [Assignment optimiser](../../backend/locker_tools/assigner.py): existing
  minimum-weight matching with hard-coded class/room and locker-position maps.
  Preserve the algorithm where useful; move reference data into managed records.
- Layered Python package directories exist, but that is not an implemented
  authenticated Python web application.

No runtime, database, or credential inspection was performed. Closed issues
indicate historical intent/completion claims, not production acceptance evidence.
The existing untracked roster HTML was not read or modified.

### Backlog reconciliation

17 open and 14 closed issues were inspected. No issues were changed.

| Existing issue(s) | Relationship to this plan |
|---|---|
| [#23](https://github.com/rrahn/spind/issues/23), [#38](https://github.com/rrahn/spind/issues/38), [#39](https://github.com/rrahn/spind/issues/39), [#40](https://github.com/rrahn/spind/issues/40), [#41](https://github.com/rrahn/spind/issues/41) (closed restructure/tooling) | Retain monorepo, task runner, environment convention, and existing tests. |
| [#24](https://github.com/rrahn/spind/issues/24) (schema: PostgreSQL/SQLModel/Alembic) | Preserve PostgreSQL intent; reconsider SQLModel/Alembic if Django ORM/migrations is selected. Add guardian identity, pupil/year placement, annual inventory slots, fulfillment and support. |
| [#25](https://github.com/rrahn/spind/issues/25), [#26](https://github.com/rrahn/spind/issues/26) (ports/adapters, Excel import) | Preserve pure decision logic and tested import/CLI behaviour. Do not duplicate every Django ORM method behind generic CRUD wrappers. |
| [#27](https://github.com/rrahn/spind/issues/27) (FastAPI) | Prioritised alternative is now Django Ninja. Pydantic/OpenAPI remain. Do not rely on SQLite for PostgreSQL concurrency acceptance tests. |
| [#28](https://github.com/rrahn/spind/issues/28), [#30](https://github.com/rrahn/spind/issues/30) (register first; optimise at cutoff) | Product direction conflicts: replace this critical path with immediate parent selection. Optimisation becomes optional staff tooling. |
| [#29](https://github.com/rrahn/spind/issues/29) (local Compose) | Keep the goal. Authentication and conflict-safe claims now belong before a real parent-facing MVP, not after it. |
| [#31](https://github.com/rrahn/spind/issues/31) (safe self-service selection) | Move into the core booking flow. Retain atomic claims, HTTP 409, polling, and real PostgreSQL concurrency tests. |
| [#32](https://github.com/rrahn/spind/issues/32), [#4](https://github.com/rrahn/spind/issues/4) (payment) | Add verified provider reconciliation, repeat-safe fulfillment, refunds, and late payments. Hosted checkout is an alternative to the older embedded-widget decision. |
| [#33](https://github.com/rrahn/spind/issues/33) (admin login; accountless registrants) | Explicit conflict: parents now need verified-email accounts, password recovery, and a private dashboard. Authentication is foundational. |
| [#34](https://github.com/rrahn/spind/issues/34) (management) | Expand to maintenance/support, class-room placement, booking controls, sensitive credential operations, and payment/fulfillment exceptions. |
| [#35](https://github.com/rrahn/spind/issues/35) (multi-tenancy) | Multi-school product is not yet a requirement. Keep site identity explicit; do not claim isolation from an unused tenant column. Revisit before a second operator/site. |
| [#36](https://github.com/rrahn/spind/issues/36) (production) | Retain HTTPS proxy, private database, backups, CI. An authenticated HTTPS API must be reachable by authorised agents; that is different from exposing its container port directly. |
| [#37](https://github.com/rrahn/spind/issues/37) (future portal/terminal/RFID) | Parent portal and support are now core. Terminal payments, bank reconciliation and RFID remain separate future options. RAS code allocation is not the same as live RFID control. |
| [#18](https://github.com/rrahn/spind/issues/18) (closed 15-minute timeout), [#2](https://github.com/rrahn/spind/issues/2), [#3](https://github.com/rrahn/spind/issues/3) | Keep previous flow intent but supersede timeout with 30 minutes and test server deadlines, not just UI timers. |
| [#1](https://github.com/rrahn/spind/issues/1) and closed UI fixes #6/#9/#10/#12/#15/#16/#17 | Preserve contact validation, keyboard interaction, responsive behaviour, and error clarity when redesigning. Verified identity and persistent child profiles are new scope. |

## 3. Proposed abstraction model

Use a **modular monolith**, not independent microservices. Browser, staff UI,
authorised agents, and CLI cross the same application interfaces. Background work
uses the same policies. PostgreSQL is the authoritative booking store.

```text
React parent portal / staff portal / authorised agent / CLI
                              |
                authenticated application interfaces
                              |
  Identity | School inventory | Booking | Payments | Lock access | Support
                              |
           PostgreSQL + durable work/outbox records
                              |
       SumUp adapter | RAS adapter | email/notification adapters
```

### Modules and interfaces

| Module | Owns | Small interface and important guarantees |
|---|---|---|
| Identity and access | Verified guardian identities, sessions, pupil access links, staff roles | Register/verify/reset; authorise a principal against a particular pupil/booking. Never infer ownership from a caller-supplied guardian ID. |
| School inventory | School years, classes, rooms, floor-plan geometry, locker units/compartments, maintenance | Resolve a selected class to its room for a school year; return bookable inventory without pupil identities. |
| Booking | Eligibility, annual availability, holds, booking entitlement and cancellation policy | Acquire/release hold, begin checkout, finalise paid entitlement. This module owns exclusivity, deadline checks, and conflict results. |
| Payments | Price snapshots, payment attempts, reconciliation, refund records | Create checkout; reconcile an attempt; request/reconcile refund. A browser redirect cannot mark an attempt paid. |
| Lock access | RAS mapping, credential generations, reveal/rotate authorisation, restricted master access | Provision/reconcile access, reveal current credential, request rotation. Hide vendor sequencing/retry uncertainty behind this interface; expose pending/failed/unknown states honestly. |
| Support and operations | Tickets, assignments, maintenance actions, notification deliveries, audit trail | Report/triage/resolve ticket. A report and a decision to disable a locker are distinct actions. |

The seams earn their place where behaviour genuinely differs: Excel versus
PostgreSQL import/storage, simulated versus real payment/lock providers, and
notification destinations. Avoid a repository interface per table and avoid
exposing raw ORM rows as public response schemas.

### Proposed relationships

- Guardian account -> owned pupil profiles (one owning guardian per pupil in the
  first release; explicit authorised sharing is later scope).
- Pupil -> placement for a school year -> class -> assigned classroom.
- School -> floors -> rooms and locker units -> locker compartments.
- School year -> booking window and eligibility policy.
- Locker + school year -> allocation slot -> current hold or committed booking.
- Booking -> pupil + school year + locker + agreed price/terms snapshot.
- Booking -> payment attempts; confirmed payment -> fulfillment work.
- Booking -> access entitlement/credential generations, activated for its term.
- Booking/locker -> support tickets; staff actions -> audit events.

Class labels are opaque reference-data values, for example `6N`, `7N`, `10A`,
`Q1`. Do not implement year advancement as numeric addition. The same class label
can map to a different room in another school year. Store effective placement,
not a forever-mutated grade field on the child.

Use stable internal identifiers; do not match or merge children by name alone.
One guardian account owns a pupil profile in the first release. This prevents
cross-account access but does not detect two independently entered records for
the same real child; an eligibility/duplicate-resolution policy remains open.
A guardian adding a child is not verified school enrolment.

### Keep independent states independent

- Physical condition: serviceable / out of service.
- Annual inventory claim: available / held / committed.
- Hold: active / consumed / released / expired.
- Payment: created / pending / succeeded / failed / unknown.
- Refund: requested / pending / succeeded / failed / unknown.
- Booking: awaiting payment / confirmed / cancelled / ended.
- Access fulfillment: pending / provisioning / ready / failed / unknown.
- Support: open / assigned / resolved.

A locker can be booked and damaged at the same time. A booking can be paid while
access provisioning is pending. A confirmed booking for next school year is not
permission to replace the current occupant's code today. Avoid one giant
`locker.status` enum attempting to express all these concepts.

## 4. Correctness-critical flows

### A. Reserve a locker

1. Authenticate a verified guardian; authorise their pupil; check booking-window
   eligibility and server-side class/year/price inputs.
2. In a short transaction, lock the relevant allocation slot, evaluate its claim
   and expiry using the database clock, and check maintenance/term eligibility.
3. If available, persist one hold with an unguessable identifier, owner, pupil,
   target school year, and deadline = selection time + 30 minutes.
4. Otherwise return HTTP 409 with a stable conflict code and a clear instruction
   to choose another locker. Do not expose another family's identity.
5. Return the authoritative deadline and summary for the sidebar.

All claim-changing paths must follow the same locking protocol, including
expiry, payment completion, staff reassignment, closure, and importing occupied
inventory. Give multi-locker operations a consistent lock order.

Use database uniqueness for locker/year slots and referential constraints;
enforce claim transitions transactionally. Do not build a partial uniqueness
constraint around a moving expression such as `expires_at > now()`.
If real access periods can overlap across named years, either validate
non-overlapping term dates or enforce the physical access interval constraint.

Poll inventory on entry and periodically while visible; refresh after a conflict.
WebSockets/SSE may later reduce staleness but **cannot replace atomic claims**.
The UI may show a stale free locker; it must never commit a duplicate booking.
Expiry is enforced on every relevant operation even if the cleanup worker stops.

### B. Pay and provision

1. Revalidate hold ownership, expiry and immutable server-priced order.
2. Record a payment attempt and create the SumUp checkout without holding a
   database transaction open over the network. Record/reconcile ambiguous create
   results before permitting another charge.
3. Receive untrusted notifications, durably record work, acknowledge promptly,
   and retrieve provider state using server credentials.
4. Compare merchant, reference, amount and currency. In a transaction, consume
   the still-valid hold, commit the booking, and record fulfillment work once.
5. If the hold has expired, do not resurrect it or appropriate another claim:
   persist the payment and route to late-payment recovery/refund handling.
   The exact grace/exception policy is deliberately not silently invented.
6. A worker calls RAS after payment is confirmed, persists the credential result
   securely, and marks access ready only after the outcome is established.
7. Failures remain visible to the parent and staff. Retry known-safe actions;
   investigate/reconcile unknown outcomes instead of blindly rotating again.

Process external effects with durable outbox/jobs, retry limits, backoff, and
manual exception queues. Start with PostgreSQL-backed work if volume permits;
Redis/Celery is not mandatory just to deliver a small-school monolith. Do not
use in-request background callbacks for financially important durable work.

SumUp checkout expiry is measured from checkout creation; the hold deadline is
measured from selection. Both being 30 minutes does not make them identical.
Payment initiation does not extend the agreed hold. Agree the parent-facing late
payment/refund explanation and operational refund workflow before launch.

### C. View and change a code

- Ordinary dashboard responses exclude codes. Explicit reveal requires an
  authorised request and returns `Cache-Control: no-store`; do not prefetch it.
- Require confirmation and appropriate recent authentication before a rotation.
  Staff master-code operations require stronger controls than ordinary booking
  views. Audit access without recording the credential value.
- Serialise rotation per lock/booking and use repeat-safe operation identifiers.
  Distinguish pending/unknown from a genuinely issued new code.
- The exact relationship between RAS allocation, physical lock activation,
  old-code validity and emergency master access is a vendor validation gate.
- Do not issue next-year access prematurely or assume a portal action can
  immediately invalidate an offline lock's current credential.

### D. Parent and management experience

- Verified email signup/login, reset/resend, and account settings.
- Multiple child cards with upcoming class/year and the corresponding room.
- Accessible floor selector with responsive SVG overlays, room highlight,
  bookable compartments and a keyboard/list alternative. Colour is not the only
  indication of availability. Straight-line proximity is guidance, not a promise
  of an accessible walking route.
- Desktop right-hand booking summary; equivalent mobile summary without hiding
  the deadline or primary action. Show pupil, class/year, room, floor, locker,
  price, remaining hold time, payment and access status.
- Parent dashboard for bookings, explicit credential reveal/rotation and support.
- Staff dashboard for occupancy by year, defects, outstanding support,
  payment/access exceptions, room mappings and emergency operations.
- Booking open/closed state is enforced server-side for every caller.
  Subgroup eligibility is future scope; include it in the policy interface but do
  not invent a rule engine or build it before cohort rules are defined.

## 5. Stack exploration

### Recommended direction for further design

| Layer | Proposed choice | Reason / caveat |
|---|---|---|
| Parent and polished staff UI | React + TypeScript; move Webpack to Vite in a separate, tested step | Reuses the existing investment; a Python backend does not require a Python-rendered UI. |
| Python application | A supported Django release; 5.2 LTS is a candidate, exact versions checked at implementation | Accounts, admin tooling, permissions, sessions, migrations and ORM integration reduce assembly for this feature set. |
| Typed HTTP interface | Django Ninja + Pydantic schemas | OpenAPI/JSON Schema and typed validation without maintaining a separate FastAPI deployment. |
| Persistence | PostgreSQL + Django ORM/migrations + psycopg | Transactional inventory, constraints, relational reporting. Do not add SQLAlchemy/SQLModel/Alembic alongside Django for the same database. |
| Identity | django-allauth headless + Django sessions | Evaluate mandatory verified email, reset, session revocation and staff MFA; capabilities are configuration/test obligations, not automatic guarantees. |
| Work processing | Separate worker process from the same Python image, durable PostgreSQL jobs/outbox | Handles payments, RAS, reconciliation and notification recovery without premature distributed infrastructure. Confirm the supported job implementation before building. |
| Payments | SumUp Hosted Checkout initially | Smaller card-handling surface; embedded widget remains an alternative. Operator's online merchant eligibility is unverified. |
| Lock integration | RAS 2.0 adapter | Vendor contract and installed hardware validation required before committing an activation/rotation design. |
| Edge and deployment | Caddy + Docker Compose | HTTPS, static React assets, same-origin authenticated `/api`, private application/database networking. |
| Messaging | Production SMTP + authenticated support dashboard | WhatsApp is optional and cannot depend on a free personal-account bot. |
| Tests | Existing pytest + PostgreSQL integration tests + browser tests + Storybook | Preserve CLI behaviour and test real database conflicts and full parent/staff flows. Select exact runner additions later. |

Allauth's email uniqueness/lookup and session behaviour need explicit acceptance
tests. The proposed baseline is not an identity-provider marketplace exercise:
use one identity authority. Do not add Supabase Auth on top of allauth without
reopening that choice.

### Alternatives, honestly compared

| Option | Strength | Cost for this project |
|---|---|---|
| Django + Ninja + Django ORM | Integrated management/auth foundation while retaining Pydantic/OpenAPI | New framework conventions; custom parent UI and object-level authorisation still required. |
| FastAPI + Pydantic + SQLAlchemy 2 + Alembic | Fits existing issues; explicit application interfaces and strong relational tooling | Must deliberately select/operate authentication, email verification/recovery, staff management and administration. FastAPI security primitives are not a complete account system. |
| Django + Django REST Framework | Mature permission/serializer ecosystem | Also valid; Ninja better matches the requested Pydantic preference. No need to install both for the same endpoints. |
| Existing Express + PostgreSQL | Avoids a language migration; React already integrates | Requires completing the same domain/security/integration work; Python tooling already exists. No correctness benefit from rewriting alone. |
| Python-rendered UI / Python UI frameworks | Can suit internal tools | No demonstrated advantage over the existing React investment for an accessible interactive floor plan. Django admin can accelerate restricted staff workflows, not replace the parent UX. |
| Supabase frontend-direct database writes | Rapid CRUD/auth prototypes | Makes it harder to centralise payment/lock/booking policies unless carefully implemented with RLS and transactional functions. A Python API remains justified here. |

Pydantic validates contracts; it is not an ORM and does not provide booking
concurrency guarantees. ORMs do not eliminate transaction/locking design.
Benchmarking FastAPI versus Django request speed is not the deciding factor for
this workload; operator burden, reliable workflows and maintainability matter.

## 6. Hosting, privacy and security

### Supabase versus conventional PostgreSQL

Supabase Free can support a synthetic-data prototype; it is not the recommended
production baseline because of inactivity pausing, backups, and email limitations.
An EU-region paid Supabase project is an option, not an automatic DSGVO answer.
With Django/allauth, its PostgreSQL hosting may be useful while its Auth and
Realtime features would be redundant.

Two coherent deployment models remain:

1. Compose for Caddy/application/worker plus externally managed EU PostgreSQL and
   production SMTP. Managed database operations reduce volunteer maintenance;
   actual provider, contracts, pricing and restore responsibilities remain open.
2. Full Compose including PostgreSQL on an appropriately operated EU host.
   More deployment control but the Förderverein must own patching, encrypted
   off-host backups, monitoring and incident response.

Self-hosting the entire Supabase platform is not the default recommendation for
this Django design. It adds infrastructure without a demonstrated requirement.
Compose deployability does not imply external payment/lock/email providers are
self-hostable, nor does it mean a single host is highly available.

### Proportionate baseline

- Framework-supported password hashing, never plaintext or reversible passwords.
  Select/tune an established password hasher (Argon2id is a candidate), with
  library-managed verification and upgrades.
- HTTPS, private database network, encrypted disks and encrypted independent
  backups; encryption at rest is a host/provider responsibility, not a Docker
  checkbox.
- Same-origin Secure/HttpOnly session cookies and CSRF protection. No long-lived
  browser bearer tokens in local storage as the default.
- Verified email before booking; safe password-reset/resend with rate limits,
  non-enumerating responses, single-use/expiring links and revocation tests.
- Staff least privilege and MFA; support staff should not automatically see
  master credentials or issue refunds.
- Authorise every pupil, booking, support and credential operation against the
  current principal. UUIDs alone do not provide authorisation.
- Store retrievable locker/master credentials using authenticated application
  encryption, with keys separate from database dumps; test rotation/recovery.
  Review whether the app should store a master credential at all or keep it in
  a restricted secrets store. Never hash a credential that must be revealed.
- Standard auth emails and reference data may be readable to appropriately
  privileged application/database operators under this baseline. If protection
  from database administrators becomes a requirement, revisit email lookup,
  allauth compatibility, field encryption and key custody explicitly.
- Minimise pupil data, isolate logs/audits, define deletion/retention and access
  procedures. Do not put codes, names or payment detail in group alerts.
- Keep secrets outside images/source, use least-privilege application DB roles,
  patch dependencies, restrict admin interfaces, and exercise backup restores.

The low-threat description does not remove the need for ordinary access control,
financial reconciliation, or safe treatment of physical-access credentials.
See the research note for AVV/transfer/DPIA review gates; no legal compliance claim
is made.

## 7. AI-ready without AI-specific infrastructure

Build an ordinary, well-documented, typed HTTP interface first:

- Stable operation IDs and versioning, explicit request/response schemas,
  pagination, structured error codes and a published supported OpenAPI contract.
- Distinguish reads from commands; use repeat-safe request identifiers for
  booking/payment/rotation operations and persist outcomes.
- Dedicated revocable agent identities with narrowly scoped permissions and
  auditable ownership/delegation. Never give an agent arbitrary SQL or a staff
  master credential.
- Server-authorised operation scopes; distinguish user and automation principals.
  Define whether a particular agent acts for a guardian or for staff.
- Human approval and recent authentication for sensitive actions such as refunds,
  master access, rotations or mass booking changes, according to an agreed policy.
- Do not expose secret reveal to agent principals by default. Names and support
  content must not be sent to a third-party model merely because the HTTP
  interface is callable by agents.
- An MCP adapter can later wrap approved operations; it must not bypass policy.
  No vector database, LLM runtime, autonomous operations or MCP server is needed
  just to make the application integration-ready.

## 8. Proposed Compose topology

```text
Internet -> caddy (only public 80/443)
              |-- built React assets
              `-- /api and restricted administration -> python-web
python-web -> postgres
worker     -> postgres, SumUp, RAS, SMTP
```

Development adds Vite HMR and a local email sink. Web and worker share the same
application image, not independent codebases. Apply explicit migrations as a
release step; do not have every production replica race to migrate at startup.
Use health checks, bounded DB pools, graceful shutdown, persistent database
volumes, secret mounts, resource limits and documented recovery.

No runtime package install, development server, Storybook or unprotected
PostgreSQL listener belongs in the production topology.

## 9. Dependency-ordered implementation plan (not yet authorised)

| Phase | Deliverable | Acceptance gate |
|---|---|---|
| 0. Close design and provider gaps | Confirm domain rules, stack, hosting operations owner, RAS contract, SumUp online eligibility, privacy scope | Written agreed model and vendor facts; replace conflicting issue assumptions only with approval. |
| 1. Protect and model | Capture CLI/prototype baselines; model pupil/year/class placement, inventory slots, claims and state machines; plan legacy import | Existing CLI behaviour preserved; synthetic fixtures; term/conflict/late-payment rules testable. |
| 2. Foundation and local Compose | Chosen Python framework, PostgreSQL, explicit migrations, Caddy/Vite development paths, worker/email infrastructure | One-command dev startup, health checks, migration/backup restore smoke tests; no live PII. |
| 3. Identity and ownership | Verified email, sign-in/out/reset, child profiles, staff roles/MFA | Tests for guardian isolation, token expiry, account enumeration, CSRF, staff permissions and recovery. |
| 4. Reference data and import | School years, class-room placement, geometry, compartments, maintenance, legacy importer | Repeatable validated imports; no overwritten active claims; fixtures for 7A/7B and Q1. |
| 5. End-to-end unpaid booking | Accessible picker, sidebar, persisted 30-minute holds, window control | Real PostgreSQL race tests: exactly one winner; losers receive 409; deadlines work with worker stopped and browser closed. |
| 6. Payment | SumUp sandbox, checkout/reconciliation, durable paid-booking transition, late payment/refund exceptions | Duplicate/out-of-order/missing callbacks, mismatched amounts, provider timeouts and late payment cannot double-allocate or silently lose money. |
| 7. Lock access | RAS adapter, pending/ready/error dashboard, explicit reveal/rotation | Tested on vendor sandbox and real lock; old-code/sequence behaviour documented; retries/unknown outcomes do not accidentally issue conflicting codes. |
| 8. Operations | Staff dashboard, support/email, defects, closure, class-room management, audit and exception handling | A damaged paid locker and failed provisioning have visible recovery workflows; no credentials in notifications. |
| 9. Production readiness | Hosting/DPA review, restore drill, monitoring, HTTPS, load tests, release/rollback runbook | Operator acceptance; controlled real payment/refund and physical-access tests; recovery and manual fallback exercised. |
| Later | Cohort booking eligibility, renewals UX, richer optimiser, optional WhatsApp, additional sites | Separate requirements and threat/permission review; do not block the first release on speculative infrastructure. |

Keep application slices vertical where practical. Do not postpone all operations,
privacy, or failure handling until the last phase: their acceptance requirements
apply throughout. This plan has no credible time estimate until vendor access,
operational ownership and remaining product rules are settled.

### Minimum invariant test matrix

- Many simultaneous claims for one locker/year: one successful hold only.
- Expired hold cannot be paid into a booking; stale tabs and duplicate requests
  cannot renew it implicitly or release another guardian's claim.
- Expiry racing successful-payment processing has a single deterministic outcome
  under the same allocation-slot lock.
- Duplicate webhook, reconciliation and worker delivery fulfill once locally.
- Paid-but-unprovisioned stays visible and recoverable through process restarts.
- Refund/rotation timeouts produce unknown/reconciliation states, not blind retries.
- Next-year booking does not change current-year access.
- Maintenance/closure/reassignment races obey the same inventory policy.
- Cross-guardian and unauthorised agent reads/commands fail without exposing PII.
- Class-room changes preserve booking entitlement and correctly refresh guidance.
- Database and encrypted-credential backups can both be recovered with controlled
  key access.

## 10. Design frontier for the next discussion

These are not silently settled:

1. How should staff resolve independently entered duplicate pupil records or a
   legitimate ownership transfer? One owner is confirmed for the first release;
   future invitations must not leak enrolment information.
2. Is an unknown upcoming class allowed, or must staff resolve it before booking?
   Missing room guidance must never be replaced with a guessed room.
3. School-year access dates, booking-opening dates and the period for new-code
   activation; how current occupancy is imported and year rollover is handled.
4. Price, deposit, cancellation/refund rules, replacement lockers and code-rotation
   limits. One checkout per child or a combined sibling purchase?
5. Does central closure stop only new holds or also payments on existing holds?
   Emergency safety closure should be a separate explicit operation.
6. What is the late-payment refund procedure and service target? What if automatic
   refund fails or requires staff approval?
7. Who operates hosting, updates, SMTP delivery, secrets, restores and incidents?
   What budget and peak demand must the production design accommodate?
8. What exact RAS product, code lifecycle, master access, term activation and
   recovery interface does the installed hardware support?
9. Which agent operations are actually needed, under whose authority?
10. Which support staff/notifications and privacy approvals are required before
    live use? State-specific legal analysis remains out of this exploration.

Record future answers here and update the glossary when terminology is resolved.
Create accepted ADRs only for actual approved, consequential trade-offs; no ADR
has been invented to make this exploratory recommendation look final.

## Framework and database sources

- [Django authentication](https://docs.djangoproject.com/en/5.2/topics/auth/)
- [Django Ninja: Pydantic and OpenAPI](https://django-ninja.dev/)
- [django-allauth configuration](https://docs.allauth.org/en/latest/account/configuration.html)
- [django-allauth headless](https://docs.allauth.org/en/latest/headless/index.html)
- [FastAPI features](https://fastapi.tiangolo.com/features/)
- [SQLAlchemy overview](https://docs.sqlalchemy.org/en/20/intro.html)
- [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html)
