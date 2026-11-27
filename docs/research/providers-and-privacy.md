# Providers and privacy

Research date: 2026-11-03. Primary-source research for the school locker
exploration. This is technical guidance, not legal approval.

## Scope and status

The user selected the Förderverein as operator and contracting organisation.
Its exact controller role, the school's role, and any data-sharing arrangement
remain subject to confirmation. The user excluded state-specific school-law
analysis from this exploration; the Bundesland is therefore intentionally
unresolved, not presumed irrelevant to production approval.

Personal data includes guardian identities, pupil names and class/grade, payment
associations, and locker access credentials.

## Supabase

### Confirmed provider facts

- Free currently includes two active projects, a 500 MB database, 50,000 monthly
  active users, 1 GB file storage, and limited egress. Projects can pause after a
  week of inactivity. Recheck pricing before choosing a plan. [S1, S3]
- Automatic daily backups are provided for paid plans; Free users should make
  independent dumps. Database backups do not include Storage object contents.
  Recovery needs independent planning and restore tests. [S2]
- Default Auth email delivery is explicitly unsuitable for production: only
  project-team addresses, currently two messages per hour, no delivery SLA.
  Guardian registration needs custom SMTP and appropriate rate limits. [S8]
- Explicit EU regions include Frankfurt, Ireland, Paris, and Stockholm. The
  generic Europe selection is not equivalent to EU-only processing. [S4]
- The current DPA identifies Supabase Pte. Ltd., addresses processor obligations,
  subprocessors, and SCCs. Regional primary processing does not prove that all
  support, metadata, or other processing stays inside the EU. [S5, S6]
- Self-hosting through Compose is supported but transfers patching, hardening,
  monitoring, backup, recovery, and availability responsibility to the operator.
  It is not the managed service deployed locally. [S7, S9]
- Disk/backup encryption and TLS are distinct from application-level encryption.
  Vault exposes plaintext through an authorised decrypted SQL view; it does not
  inherently keep decryption capability outside the database. [S5, S10]

### Recommendation

Use Free for evaluation with synthetic data, not as the production availability
baseline. Seasonal inactivity, backup limitations, and email configuration matter
more than the small school's likely database size. Free is not automatically
illegal, and paid hosting is not automatically compliant.

A managed EU-region PostgreSQL service without the full Supabase platform is also
a viable choice. Supabase is useful when its Auth/platform capabilities justify
the additional dependency; it is not required for PostgreSQL, a Python API, or
safe concurrent booking.

## DSGVO and AVV

Article 28 processing arrangements generally require an appropriate contract
(AVV/DPA) when a provider acts as processor. Confirm roles for each recipient:
hosting, email, payments, lock vendor, monitoring, and support. Do not assume every
recipient has the same processor role. [L1, L2]

Children warrant particular protection. Document a DPIA threshold assessment;
children's data alone does not establish that every deployment necessarily needs
a full DPIA. Record legal bases, data minimisation, retention, access/deletion
procedures, transfers, and technical measures before processing real records.
An EU region and signed AVV are necessary inputs where applicable, not a complete
DSGVO assessment. [L1-L4]

Email verification proves mailbox control, not guardianship. Avoid transferring
identifiable school rosters merely to simplify a booking form.

## SumUp

### Confirmed provider facts

- Hosted Checkout supplies a provider-hosted payment page; the documented session
  lasts 30 minutes. The embedded Payment Widget is another option and requires
  HTTPS for production. Existing school terminal access does not establish online
  merchant eligibility. [P1-P3]
- Backend notifications and browser redirects have different purposes.
  `CHECKOUT_STATUS_CHANGED` notifications identify a checkout; SumUp instructs
  integrations to retrieve its state through the API. A widget success callback
  does not necessarily mean successful payment. [P2, P4, P5]
- Failed webhook deliveries are retried. Exactly-once delivery, HMAC signatures,
  and universal provider-side idempotency guarantees were not established by the
  reviewed documentation and must not be invented. [P4, P5]
- Refunds refer to the SumUp transaction ID. Full/partial refunds depend on
  eligibility; inspect transaction state after uncertain responses. [P6]
- Sandbox does not move real funds. Merchant onboarding, online acceptance,
  settlement, payment methods, and production refund behaviour need validation
  for the actual Förderverein account. [P3, P7]

### Recommendation

Start with Hosted Checkout unless keeping payment embedded is a product
requirement. Keep credentials server-side. Reconcile checkout status against
expected merchant, amount, currency, and opaque local reference. Make local
payment confirmation and fulfillment duplicate-safe; reconcile pending attempts
even if notifications never arrive.

The original 15-minute hold conflicted with the 30-minute provider session.
During the design interview, the user changed the hold to 30 minutes from locker
selection, with no automatic extension. This still does not align the deadlines:
the provider session starts when checkout is created. A late successful payment
must never displace another booking; route it to recovery/refund handling.
Do not put pupil names or locker codes in checkout metadata.

## Euro-Locks / Lowe & Fletcher RAS 2.0

Official indexed product material advertises remote code allocation and
third-party integration, including offline-lock operation. Direct retrieval of
the vendor pages/brochures was blocked during research; these are product-level
claims, not a verified implementable interface. [R1, R2]

Obtain the exact lock model/firmware, licensed API specification, authentication,
test environment, rate limits, allocation/rotation semantics, and recovery
procedure. No endpoint, revocation capability, or immediate code-change guarantee
has been verified.

In particular, an offline lock cannot be assumed to receive an immediate
revocation when the portal issues a new code. Demonstrate old/new code behaviour,
sequence handling, ambiguous request recovery, and master-code handling on the
actual hardware. Booking occupancy is not live door-status telemetry.

## WhatsApp

No supported automation interface for a free personal WhatsApp account was
established. Do not use WhatsApp Web scraping, unofficial clients, or personal
session automation as infrastructure. [W3, W4]

There is now an official Business Platform Groups API; the old blanket statement
"WhatsApp has no group API" is incorrect. Current documentation lists Official
Business Account eligibility, invite joining, eight participants per group,
per-message pricing, and incompatibility with Business App numbers. Approval for
this operator is unverified. It is not a drop-in API for an existing personal
WhatsApp group. Recheck eligibility and limits before procurement. [W1, W2]

Use the authenticated support dashboard plus email notifications first.
Optional WhatsApp notices should contain only a ticket reference and portal
link, never pupil names, locker credentials, or payment details. Consider official
opt-in one-to-one Business Platform notifications separately, including templates
and opt-out requirements. [W5]

## Sources

### Supabase

- S1: [Pricing](https://supabase.com/pricing)
- S2: [Backups](https://supabase.com/docs/guides/platform/backups)
- S3: [Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- S4: [Regions](https://supabase.com/docs/guides/platform/regions)
- S5: [DPA](https://supabase.com/legal/customer-resources/data-processing-addendum)
- S6: [Subprocessors](https://supabase.com/legal/customer-resources/subprocessor-list)
- S7: [Auth architecture](https://supabase.com/docs/guides/auth/architecture)
- S8: [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- S9: [Self-hosting](https://supabase.com/docs/guides/self-hosting)
- S10: [Vault](https://supabase.com/docs/guides/database/vault)

### Data protection

- L1: [LfDI Rheinland-Pfalz: Auftragsverarbeitung](https://www.datenschutz.rlp.de/themen/auftragsverarbeitung)
- L2: [DSK: Article 28 guidance](https://www.datenschutzkonferenz-online.de/media/kp/dsk_kpnr_13.pdf)
- L3: [EDPB: Children](https://www.edpb.europa.eu/topics/key-gdpr-concepts/children_en)
- L4: [LfDI Rheinland-Pfalz: DPIA](https://www.datenschutz.rlp.de/themen/datenschutz-folgenabschaetzung)

### SumUp

- P1: [Hosted Checkout](https://developer.sumup.com/online-payments/checkouts/hosted-checkout/)
- P2: [Payment Widget](https://developer.sumup.com/online-payments/checkouts/card-widget/)
- P3: [Getting started](https://developer.sumup.com/get-started/)
- P4: [Webhooks](https://developer.sumup.com/online-payments/webhooks/)
- P5: [Create checkout](https://developer.sumup.com/api/checkouts/create/) and [retrieve checkout](https://developer.sumup.com/api/checkouts/get/)
- P6: [Refund transaction](https://developer.sumup.com/api/transactions/refund/)
- P7: [Online payments](https://developer.sumup.com/online-payments/)

### RAS 2.0

- R1: [Euro-Locks brochure](https://www.euro-locks.com/wp-content/uploads/sites/4/2022/05/RAS-2.0-Remote-Allocation-System-082024.pdf) (indexed official evidence; direct retrieval blocked)
- R2: [Lowe & Fletcher product page](https://www.lowe-and-fletcher.co.uk/products/smart-locks/remote-allocation-system-upgrade/) (indexed official evidence; direct retrieval blocked)

### WhatsApp

- W1: [Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups.md/)
- W2: [Official Business Accounts](https://developers.facebook.com/documentation/business-messaging/whatsapp/official-business-accounts)
- W3: [Messaging guidelines](https://www.whatsapp.com/legal/messaging-guidelines)
- W4: [EEA terms](https://www.whatsapp.com/legal/terms-of-service-eea)
- W5: [Business messaging policy](https://whatsappbusiness.com/policy/)
