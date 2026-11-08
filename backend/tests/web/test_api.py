import json
from datetime import timedelta
from uuid import UUID, uuid4

import pytest
from allauth.account.models import EmailAddress
from django.db import IntegrityError, transaction
from django.test import Client
from django.utils import timezone

from locker_tools.web.booking.models import Booking, Hold, Locker, LockerSlot, Placement, Pupil, School, User

pytestmark = pytest.mark.django_db


def post(client, path, data):
    return client.post(path, data=json.dumps(data), content_type="application/json")


def hold(client, inventory):
    return post(client, "/api/holds", {
        "placement_id": str(inventory["placement"].pk), "locker_id": str(inventory["locker"].pk),
    })


def test_auth_and_email_required(guardian, inventory):
    assert Client().get("/api/pupils").status_code == 401
    EmailAddress.objects.filter(user=guardian).update(verified=False)
    client = Client()
    client.force_login(guardian)
    assert client.get("/api/pupils").status_code == 403
    assert hold(client, inventory).status_code == 403


def test_password_and_email_constraints(guardian):
    assert guardian.password != "Correct-test-password-523!"
    assert guardian.check_password("Correct-test-password-523!")
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user(username="duplicate", email=guardian.email.upper(), password="test")


def test_pupil_persistence_ownership_and_placement(client, inventory, other_guardian):
    response = post(client, "/api/pupils", {
        "school_id": str(inventory["school"].pk), "first_name": "New", "last_name": "Child",
    })
    assert response.status_code == 200
    pupil = Pupil.objects.get(pk=response.json()["id"])
    assert pupil.guardian_id == inventory["pupil"].guardian_id
    assert client.get("/api/pupils?limit=1&offset=1").json()["count"] == 2
    response = post(client, f"/api/pupils/{pupil.pk}/placements", {"class_group_id": str(inventory["group"].pk)})
    assert response.status_code == 200
    assert Placement.objects.get(pk=response.json()["id"]).school_year_id == inventory["year"].pk
    assert post(client, f"/api/pupils/{pupil.pk}/placements", {"class_group_id": str(inventory["group"].pk)}).status_code == 409
    other = Client()
    other.force_login(other_guardian)
    assert other.get("/api/pupils").json() == {"items": [], "count": 0}
    assert post(other, f"/api/pupils/{pupil.pk}/placements", {"class_group_id": str(inventory["group"].pk)}).status_code == 404


def test_inventory_uuid_and_staff_gate(client, inventory, guardian):
    response = client.get(f"/api/inventory/{inventory['school'].pk}")
    assert response.status_code == 200
    data = response.json()
    assert UUID(data["lockers"][0]["id"]) == inventory["locker"].pk
    assert "vendor_lock_id" not in data["lockers"][0]
    assert data["classes"][0]["classroom"] == str(inventory["room"].pk)
    assert post(client, "/api/schools", {"name": "Another", "slug": "another"}).status_code == 403
    guardian.is_staff = True
    guardian.save()
    assert post(client, "/api/schools", {"name": "Another", "slug": "another"}).status_code == 200
    assert post(client, "/api/schools", {"name": "Another", "slug": "another"}).status_code == 409


def test_staff_inventory_creation_and_management(client, inventory, guardian):
    guardian.is_staff = True
    guardian.save()
    floor = post(client, "/api/floors", {"school_id": str(inventory["school"].pk), "label": "Upper", "level": 1})
    assert floor.status_code == 200
    room = post(client, "/api/classrooms", {"floor_id": floor.json()["id"], "label": "202"})
    assert room.status_code == 200
    group = post(client, "/api/classes", {"school_year_id": str(inventory["year"].pk), "classroom_id": room.json()["id"], "label": "7B"})
    assert group.status_code == 200
    unit = post(client, "/api/locker-units", {"floor_id": floor.json()["id"], "number": 1})
    assert unit.status_code == 200
    locker = post(client, "/api/lockers", {"unit_id": unit.json()["id"], "compartment": 1})
    assert locker.status_code == 200
    response = client.patch(f"/api/classes/{inventory['group'].pk}/classroom", data=json.dumps({"classroom_id": room.json()["id"]}), content_type="application/json")
    assert response.status_code == 200
    inventory["group"].refresh_from_db()
    assert str(inventory["group"].classroom_id) == room.json()["id"]
    response = client.patch(f"/api/school-years/{inventory['year'].pk}/booking-window", data=json.dumps({"enabled": False}), content_type="application/json")
    assert response.status_code == 200
    assert hold(client, inventory).status_code == 409
    assert client.patch(f"/api/lockers/{inventory['locker'].pk}/condition", data=json.dumps({"serviceable": False}), content_type="application/json").status_code == 200
    inventory["locker"].refresh_from_db()
    assert not inventory["locker"].serviceable


def test_staff_year_validation(client, inventory, guardian):
    guardian.is_staff = True
    guardian.save()
    now = timezone.now()
    payload = {
        "school_id": str(inventory["school"].pk), "label": "2028/29",
        "access_starts": "2028-08-01", "access_ends": "2029-08-01",
        "booking_opens": now.isoformat(), "booking_closes": (now + timedelta(days=10)).isoformat(),
        "price_cents": 2200,
    }
    assert post(client, "/api/school-years", payload).status_code == 200
    assert post(client, "/api/school-years", {**payload, "label": "overlap"}).status_code == 409
    assert post(client, "/api/school-years", {**payload, "access_ends": "2028-07-01"}).status_code == 422
    assert post(client, "/api/school-years", {**payload, "booking_opens": "2028-01-01T10:00:00"}).status_code == 422


def test_hold_shape_duration_retry_and_release(client, inventory):
    response = hold(client, inventory)
    assert response.status_code == 200
    data = response.json()
    assert set(data) == {"id", "locker_id", "placement_id", "school_year_id", "expires_at", "status"}
    stored = Hold.objects.get(pk=data["id"])
    assert abs((stored.expires_at - stored.created_at).total_seconds() - 1800) < 1
    assert hold(client, inventory).json() == data
    assert client.get("/api/holds").json()["items"][0] == data
    released = post(client, f"/api/holds/{stored.pk}/release", {})
    assert released.status_code == 200
    assert released.json()["status"] == "released"
    assert post(client, f"/api/holds/{stored.pk}/release", {}).json()["status"] == "released"
    assert hold(client, inventory).json()["id"] != data["id"]


def test_expired_hold_reclaimed(client, inventory):
    data = hold(client, inventory).json()
    Hold.objects.filter(pk=data["id"]).update(expires_at=timezone.now() - timedelta(seconds=1))
    assert client.get("/api/holds").json()["items"][0]["status"] == "expired"
    replacement = hold(client, inventory)
    assert replacement.status_code == 200
    assert replacement.json()["id"] != data["id"]
    assert Hold.objects.get(pk=data["id"]).status == "expired"


def test_ownership_closed_window_and_serviceability(client, inventory, other_guardian):
    other = Client()
    other.force_login(other_guardian)
    assert hold(other, inventory).status_code == 404
    created = hold(client, inventory).json()
    assert post(other, f"/api/holds/{created['id']}/release", {}).status_code == 404
    post(client, f"/api/holds/{created['id']}/release", {})
    year = inventory["year"]
    year.booking_enabled = False
    year.save()
    assert hold(client, inventory).status_code == 409
    year.booking_enabled = True
    year.booking_closes = timezone.now() - timedelta(seconds=1)
    year.save()
    assert hold(client, inventory).status_code == 409
    year.booking_closes = timezone.now() + timedelta(days=1)
    year.save()
    Locker.objects.filter(pk=inventory["locker"].pk).update(serviceable=False)
    assert hold(client, inventory).status_code == 409


def test_cross_school_validation(client, inventory):
    school = School.objects.create(name="Other school", slug="other")
    pupil = Pupil.objects.create(guardian=inventory["pupil"].guardian, school=school, first_name="Other", last_name="Child")
    assert post(client, f"/api/pupils/{pupil.pk}/placements", {"class_group_id": str(inventory["group"].pk)}).status_code == 422
    assert post(client, "/api/holds", {"placement_id": str(uuid4()), "locker_id": str(inventory["locker"].pk)}).status_code == 404


def test_database_claim_and_placement_constraints(client, inventory):
    created = hold(client, inventory).json()
    active = Hold.objects.get(pk=created["id"])
    with pytest.raises(IntegrityError), transaction.atomic():
        Hold.objects.create(slot=active.slot, placement=active.placement, expires_at=active.expires_at)
    other_locker = Locker.objects.create(unit=inventory["unit"], compartment=2)
    other_slot = LockerSlot.objects.create(locker=other_locker, school_year=inventory["year"])
    with pytest.raises(IntegrityError) as duplicate_pupil, transaction.atomic():
        Hold.objects.create(slot=other_slot, placement=active.placement, expires_at=active.expires_at)
    assert duplicate_pupil.value.__cause__.diag.constraint_name == "one_active_hold_per_placement"
    other_pupil = Pupil.objects.create(guardian=inventory["pupil"].guardian, school=inventory["school"], first_name="Another", last_name="Child")
    other_placement = Placement.objects.create(pupil=other_pupil, class_group=inventory["group"], school_year=inventory["year"])
    with pytest.raises(IntegrityError) as duplicate_locker, transaction.atomic():
        Hold.objects.create(slot=active.slot, placement=other_placement, expires_at=active.expires_at)
    assert duplicate_locker.value.__cause__.diag.constraint_name == "one_active_hold_per_slot"
    with pytest.raises(IntegrityError), transaction.atomic():
        LockerSlot.objects.create(locker=inventory["locker"], school_year=inventory["year"])
    with pytest.raises(IntegrityError), transaction.atomic():
        Placement.objects.create(pupil=inventory["pupil"], class_group=inventory["group"], school_year=inventory["year"])
    with pytest.raises(IntegrityError), transaction.atomic():
        Locker.objects.create(unit=inventory["unit"], compartment=1)


def test_no_payment_confirmation_endpoint(client, inventory):
    assert client.get("/api/bookings").json() == {"items": [], "count": 0}
    assert post(client, "/api/bookings", {"paid": True}).status_code == 405
    assert not Booking.objects.exists()


def test_csrf_enforced(guardian, inventory):
    client = Client(enforce_csrf_checks=True)
    client.force_login(guardian)
    assert hold(client, inventory).status_code == 403
    assert client.get("/_allauth/browser/v1/config").status_code == 200
    assert "csrftoken" in client.cookies
    response = client.post(
        "/api/holds",
        data=json.dumps({"placement_id": str(inventory["placement"].pk), "locker_id": str(inventory["locker"].pk)}),
        content_type="application/json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )
    assert response.status_code == 200
