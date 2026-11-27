import json
import re

import pytest
from allauth.account.models import EmailAddress
from django.core import mail
from django.test import Client

from locker_tools.web import settings as production_settings
from locker_tools.web.booking.models import User

pytestmark = pytest.mark.django_db


def send(client, path, data):
    client.get("/_allauth/browser/v1/config")
    return client.post(
        "/_allauth/browser/v1/" + path,
        data=json.dumps(data),
        content_type="application/json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


def signup(client, email, password="Strong-synthetic-password-925!", **names):
    payload = {"email": email, "password": password, "first_name": "Mila", "last_name": "Beispiel", **names}
    return send(client, "auth/signup", payload)


CODE = re.compile(r"^\s*(\d{6})\s*$", re.MULTILINE)


def verification_code(message):
    match = CODE.search(message.body)
    assert match, message.body
    return match.group(1)


def wrong_code(code):
    return "000000" if code != "000000" else "111111"


def test_signup_stores_names_and_argon2id_hash_never_plaintext(settings):
    settings.PASSWORD_HASHERS = production_settings.PASSWORD_HASHERS
    password = "Strong-synthetic-password-925!"
    response = signup(Client(enforce_csrf_checks=True), "Mila.Parent@example.invalid", password, first_name="  Mila ")
    assert response.status_code == 401
    assert [f["id"] for f in response.json()["data"]["flows"] if f.get("is_pending")] == ["verify_email"]
    user = User.objects.get(email__iexact="mila.parent@example.invalid")
    assert (user.first_name, user.last_name) == ("Mila", "Beispiel")
    assert user.password.startswith("argon2$argon2id$")
    assert password not in user.password
    assert user.check_password(password)
    assert not EmailAddress.objects.get(user=user).verified


def test_signup_code_verification_logs_in_pending_session():
    client = Client(enforce_csrf_checks=True)
    email = "new-parent@example.invalid"
    assert signup(client, email).status_code == 401
    assert client.get("/api/pupils").status_code == 401
    assert len(mail.outbox) == 1
    code = verification_code(mail.outbox[0])
    assert send(client, "auth/email/verify", {"key": wrong_code(code)}).status_code == 400
    response = send(client, "auth/email/verify", {"key": code})
    assert response.status_code == 200
    assert response.json()["data"]["user"]["display"] == "Mila"
    assert EmailAddress.objects.get(email=email).verified
    assert client.get("/api/pupils").status_code == 200
    assert client.delete("/_allauth/browser/v1/auth/session", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value).status_code == 401
    assert client.get("/api/pupils").status_code == 401
    assert send(client, "auth/login", {"email": email, "password": "Strong-synthetic-password-925!"}).status_code == 200
    assert client.get("/api/pupils").status_code == 200


def test_six_digit_code_is_invalidated_after_three_wrong_attempts():
    client = Client(enforce_csrf_checks=True)
    assert signup(client, "guess@example.invalid").status_code == 401
    code = verification_code(mail.outbox[0])
    statuses = [send(client, "auth/email/verify", {"key": wrong_code(code)}).status_code for _ in range(3)]
    assert statuses[:2] == [400, 400]
    assert send(client, "auth/email/verify", {"key": code}).status_code != 200
    assert not EmailAddress.objects.get(email="guess@example.invalid").verified
    assert client.get("/api/pupils").status_code == 401


def test_code_from_another_session_cannot_verify_or_log_in():
    assert signup(Client(enforce_csrf_checks=True), "victim@example.invalid").status_code == 401
    attacker = Client(enforce_csrf_checks=True)
    assert send(attacker, "auth/email/verify", {"key": verification_code(mail.outbox[0])}).status_code == 409
    assert not EmailAddress.objects.get(email="victim@example.invalid").verified
    assert attacker.get("/api/pupils").status_code == 401


def test_duplicate_signup_does_not_reveal_existing_account(guardian):
    response = signup(Client(enforce_csrf_checks=True), guardian.email.upper(), first_name="Mallory")
    assert response.status_code == 401
    assert User.objects.filter(email__iexact=guardian.email).count() == 1
    guardian.refresh_from_db()
    assert guardian.first_name == ""
    assert guardian.check_password("Correct-test-password-523!")
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == [guardian.email]
    assert not CODE.search(mail.outbox[0].body)


@pytest.mark.parametrize("override", [
    {"password": "Fourteen-chars"},
    {"first_name": ""},
    {"last_name": "   "},
])
def test_signup_rejects_short_passwords_and_missing_names(override):
    assert signup(Client(enforce_csrf_checks=True), "x@example.invalid", **override).status_code == 400
    assert not User.objects.filter(email="x@example.invalid").exists()
    assert mail.outbox == []


def test_reset_requires_valid_key_and_changes_password(guardian):
    client = Client(enforce_csrf_checks=True)
    response = send(client, "auth/password/request", {"email": guardian.email})
    assert response.status_code == 200
    assert len(mail.outbox) == 1
    match = re.search(r"http://localhost:3000/accounts/reset-password/([^\s]+)", mail.outbox[0].body)
    assert match
    new_password = "Changed-synthetic-password-724!"
    assert send(client, "auth/password/reset", {"key": "invalid", "password": new_password}).status_code == 400
    assert send(client, "auth/password/reset", {"key": match.group(1), "password": new_password}).status_code in (200, 401)
    guardian.refresh_from_db()
    assert guardian.check_password(new_password)
    assert send(client, "auth/password/reset", {"key": match.group(1), "password": new_password}).status_code == 400
    assert send(client, "auth/login", {"email": guardian.email, "password": "Correct-test-password-523!"}).status_code == 400
    assert send(client, "auth/login", {"email": guardian.email, "password": new_password}).status_code == 200


def test_signup_and_reset_csrf_and_password_validation():
    client = Client(enforce_csrf_checks=True)
    assert client.post("/_allauth/browser/v1/auth/signup", data=json.dumps({"email": "x@example.invalid", "password": "unsafe"}), content_type="application/json").status_code == 403
    response = send(client, "auth/signup", {"email": "x@example.invalid", "password": "123"})
    assert response.status_code == 400
    assert not User.objects.filter(email="x@example.invalid").exists()
    assert send(client, "auth/password/request", {"email": "unknown@example.invalid"}).status_code == 200
