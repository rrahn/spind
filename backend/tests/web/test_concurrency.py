from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier

import pytest
from django.db import close_old_connections, connection
from django.utils import timezone
from ninja.errors import HttpError

from locker_tools.web.booking.models import Booking, Hold, Locker, Placement, Pupil, User
from locker_tools.web.booking.services import acquire_hold

pytestmark = pytest.mark.django_db(transaction=True)


def contenders(claims):
    barrier = Barrier(len(claims))

    def claim(pair):
        close_old_connections()
        try:
            barrier.wait(timeout=10)
            try:
                return acquire_hold(*pair).pk
            except HttpError as error:
                return error.status_code
        finally:
            connection.close()

    with ThreadPoolExecutor(max_workers=len(claims)) as executor:
        return list(executor.map(claim, claims))


def test_many_clients_one_locker(inventory, guardian):
    assert connection.vendor == "postgresql"
    claims = []
    for number in range(6):
        owner = User.objects.create_user(username=f"contender-{number}", email=f"contender-{number}@example.invalid")
        pupil = Pupil.objects.create(guardian=owner, school=inventory["school"], first_name="Synthetic", last_name=f"Child {number}")
        placement = Placement.objects.create(pupil=pupil, class_group=inventory["group"], school_year=inventory["year"])
        claims.append((owner, placement.pk, inventory["locker"].pk))
    outcomes = contenders(claims)
    assert outcomes.count(409) == 5
    assert Hold.objects.filter(status="active").count() == 1


def test_one_pupil_two_concurrent_lockers(inventory, guardian):
    other = Locker.objects.create(unit=inventory["unit"], compartment=2)
    outcomes = contenders([(guardian, inventory["placement"].pk, locker.pk) for locker in [inventory["locker"], other]])
    assert outcomes.count(409) == 1
    assert Hold.objects.filter(status="active", placement=inventory["placement"]).count() == 1


def test_concurrent_retry_preserves_deadline(inventory, guardian):
    outcomes = contenders([(guardian, inventory["placement"].pk, inventory["locker"].pk)] * 4)
    assert len(set(outcomes)) == 1
    assert Hold.objects.filter(status="active").count() == 1


def test_paid_booking_not_displaced_by_expired_hold(inventory, guardian):
    held = acquire_hold(guardian, inventory["placement"].pk, inventory["locker"].pk)
    held.status = Hold.Status.CONSUMED
    held.expires_at = timezone.now() - timedelta(minutes=1)
    held.save()
    booking = Booking.objects.create(
        slot=held.slot, placement=held.placement, hold=held,
        amount_cents=2000, currency="EUR", status=Booking.Status.CONFIRMED,
    )
    with pytest.raises(HttpError, match="already booked"):
        acquire_hold(guardian, inventory["placement"].pk, inventory["locker"].pk)
    booking.refresh_from_db()
    assert booking.status == Booking.Status.CONFIRMED
