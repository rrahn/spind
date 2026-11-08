import json
import re

import pytest
from allauth.account.models import EmailAddress, EmailConfirmationHMAC
from django.core import mail
from django.test import Client

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


def test_signup_verification_login_logout():
    client = Client(enforce_csrf_checks=True)
    password = "Strong-synthetic-password-925!"
    email = "new-parent@example.invalid"
    response = send(client, "auth/signup", {"email": email, "password": password})
    assert response.status_code == 401
    user = User.objects.get(email=email)
    assert user.check_password(password)
    address = EmailAddress.objects.get(user=user)
    assert not address.verified
    assert client.get("/api/pupils").status_code == 401
    assert len(mail.outbox) == 1
    assert "http://localhost:3000/accounts/confirm-email/" in mail.outbox[0].body
    response = send(client, "auth/email/verify", {"key": EmailConfirmationHMAC(address).key})
    assert response.status_code == 401
    address.refresh_from_db()
    assert address.verified
    assert client.get("/api/pupils").status_code == 401
    assert send(client, "auth/login", {"email": email, "password": password}).status_code == 200
    assert client.get("/api/pupils").status_code == 200
    assert client.delete("/_allauth/browser/v1/auth/session", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value).status_code == 401
    assert client.get("/api/pupils").status_code == 401
    assert send(client, "auth/login", {"email": email, "password": password}).status_code == 200
    assert client.get("/api/pupils").status_code == 200


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
