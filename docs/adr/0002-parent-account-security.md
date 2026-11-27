# Parent account security baseline

Parents register with first name, last name, email and password through
django-allauth's headless API. The user chose this baseline after reviewing
current guidance (OWASP Password Storage Cheat Sheet, NIST SP 800-63B rev. 4).

## Database level

- Passwords are never stored. Store only **Argon2id** hashes (Django
  `Argon2PasswordHasher`, first in `PASSWORD_HASHERS`). PBKDF2/scrypt remain
  listed only so that existing hashes verify and get upgraded on the next login.
- Names and email are stored in plain columns on `booking_user`. They are **not**
  field-encrypted: email must stay searchable for login, and the threat model is
  better served by encrypted disks/backups, TLS to PostgreSQL, least-privilege
  runtime roles (no DDL; migrations use a separate role) and logs free of
  personal data. These are production prerequisites (E13), not local defaults.
- Email uniqueness is case-insensitive at database level.

## Policy and server side

- Passwords need at least 15 characters (single-factor), with no composition
  rules and no forced rotation. Common, numeric and name/email-similar passwords
  are rejected. Lower the minimum to 8 only once MFA (passkeys/TOTP via
  `allauth.mfa`) is mandatory.
- Email verification is mandatory and uses a short-lived **code** bound to the
  signup session. Entering it logs that session in; a code used in another
  browser is rejected.
- Account enumeration protection is on: duplicate signups look identical to new
  ones and only notify the existing owner.
- allauth rate limits apply. Production needs a shared cache so limits hold
  across workers.

## Client side

- No tokens in JS-accessible storage. Auth is an HttpOnly session cookie plus a
  CSRF token header. The SPA calls Django same-origin ([ADR 0003](0003-same-origin-api-proxy.md)).
- No client-side password hashing: it adds nothing over TLS and turns the hash
  into the password.
- Forms use correct `autocomplete` values (`new-password`, `one-time-code`) and
  a show-password toggle instead of a repeat field, so password managers work.
- Production: HTTPS only, HSTS, `Secure` cookies and a CSP (E13).
