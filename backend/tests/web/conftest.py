from datetime import date, timedelta

import pytest
from allauth.account.models import EmailAddress
from django.test import Client
from django.utils import timezone

from locker_tools.web.booking.models import (
    ClassGroup, Classroom, Floor, Locker, LockerUnit,
    Placement, Pupil, School, SchoolYear, User,
)


@pytest.fixture
def guardian(db):
    user = User.objects.create_user(username="parent", email="parent@example.invalid", password="Correct-test-password-523!")
    EmailAddress.objects.create(user=user, email=user.email, primary=True, verified=True)
    return user


@pytest.fixture
def other_guardian(db):
    user = User.objects.create_user(username="other", email="other@example.invalid", password="Different-test-password-523!")
    EmailAddress.objects.create(user=user, email=user.email, primary=True, verified=True)
    return user


@pytest.fixture
def client(guardian):
    result = Client()
    result.force_login(guardian)
    return result


@pytest.fixture
def inventory(db, guardian):
    school = School.objects.create(name="Example school", slug="example-school")
    year = SchoolYear.objects.create(
        school=school, label="2027/28",
        access_starts=date(2027, 8, 1), access_ends=date(2028, 8, 1),
        booking_opens=timezone.now() - timedelta(days=1),
        booking_closes=timezone.now() + timedelta(days=1),
        booking_enabled=True, price_cents=2000,
    )
    floor = Floor.objects.create(school=school, label="Ground", level=0)
    room = Classroom.objects.create(floor=floor, label="101")
    group = ClassGroup.objects.create(school_year=year, label="7A", classroom=room)
    unit = LockerUnit.objects.create(floor=floor, number=1)
    locker = Locker.objects.create(unit=unit, compartment=1)
    pupil = Pupil.objects.create(guardian=guardian, school=school, first_name="Synthetic", last_name="Pupil")
    placement = Placement.objects.create(pupil=pupil, class_group=group, school_year=year)
    return {
        "school": school, "year": year, "floor": floor, "room": room,
        "group": group, "unit": unit, "locker": locker,
        "pupil": pupil, "placement": placement,
    }
