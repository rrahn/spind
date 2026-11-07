from datetime import timedelta

from allauth.account.models import EmailAddress
from django.db import connection, transaction
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError

from .models import Booking, Hold, Locker, LockerSlot, Placement, SchoolYear


def verified_guardian(request):
    if not EmailAddress.objects.filter(user=request.user, email__iexact=request.user.email, verified=True).exists():
        raise HttpError(403, "Verify your email before accessing pupil or booking operations.")


def database_now():
    with connection.cursor() as cursor:
        cursor.execute("SELECT clock_timestamp()")
        return cursor.fetchone()[0]


@transaction.atomic
def acquire_hold(user, placement_id, locker_id):
    placement = get_object_or_404(Placement.objects.select_related("pupil"), pk=placement_id, pupil__guardian=user)
    year = SchoolYear.objects.select_for_update().get(pk=placement.school_year_id)
    placement = Placement.objects.select_for_update().get(pk=placement.pk)
    locker = get_object_or_404(Locker.objects.select_for_update().select_related("unit__floor"), pk=locker_id)
    now = database_now()
    if not year.booking_enabled or not year.booking_opens <= now < year.booking_closes:
        raise HttpError(409, "Booking is closed for this school year.")
    if locker.unit.floor.school_id != year.school_id or placement.pupil.school_id != year.school_id:
        raise HttpError(422, "Pupil, locker and school year must belong to the same school.")
    if not locker.serviceable:
        raise HttpError(409, "This locker is out of service.")
    slot, _ = LockerSlot.objects.get_or_create(locker=locker, school_year=year)
    slot = LockerSlot.objects.select_for_update().get(pk=slot.pk)
    Hold.objects.filter(slot__school_year=year, status=Hold.Status.ACTIVE, expires_at__lte=now).update(status=Hold.Status.EXPIRED)
    if Booking.objects.filter(slot=slot, status=Booking.Status.CONFIRMED).exists():
        raise HttpError(409, "This locker is already booked. Choose another locker.")
    if Booking.objects.filter(placement=placement, status=Booking.Status.CONFIRMED).exists():
        raise HttpError(409, "This pupil already has a booking for this school year.")
    own_hold = Hold.objects.filter(placement=placement, status=Hold.Status.ACTIVE).first()
    if own_hold:
        if own_hold.slot_id == slot.pk:
            return own_hold
        raise HttpError(409, "Release the pupil's existing hold before choosing another locker.")
    if Hold.objects.filter(slot=slot, status=Hold.Status.ACTIVE).exists():
        raise HttpError(409, "This locker was selected by someone else. Choose another locker.")
    return Hold.objects.create(slot=slot, placement=placement, expires_at=now + timedelta(minutes=30))


@transaction.atomic
def release_hold(user, hold_id):
    hold = get_object_or_404(Hold.objects.select_related("slot"), pk=hold_id, placement__pupil__guardian=user)
    SchoolYear.objects.select_for_update().get(pk=hold.slot.school_year_id)
    hold = Hold.objects.select_for_update().get(pk=hold.pk)
    if hold.status == Hold.Status.CONSUMED:
        raise HttpError(409, "A consumed hold cannot be released.")
    if hold.status == Hold.Status.ACTIVE:
        hold.status = Hold.Status.EXPIRED if hold.expires_at <= database_now() else Hold.Status.RELEASED
        hold.save(update_fields=["status"])
    return hold
