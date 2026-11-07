import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

    class Meta:
        constraints = [models.UniqueConstraint(Lower("email"), name="user_email_case_insensitive")]


class IdentifiedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class School(IdentifiedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)


class SchoolYear(IdentifiedModel):
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    label = models.CharField(max_length=30)
    access_starts = models.DateField()
    access_ends = models.DateField()
    booking_opens = models.DateTimeField()
    booking_closes = models.DateTimeField()
    booking_enabled = models.BooleanField(default=False)
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="EUR")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["school", "label"], name="school_year_label_unique"),
            models.CheckConstraint(condition=Q(access_ends__gt=F("access_starts")), name="year_access_dates_ordered"),
            models.CheckConstraint(condition=Q(booking_closes__gt=F("booking_opens")), name="year_booking_dates_ordered"),
        ]


class Floor(IdentifiedModel):
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    label = models.CharField(max_length=50)
    level = models.IntegerField()
    image_path = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["school", "level"], name="floor_level_unique")]


class Classroom(IdentifiedModel):
    floor = models.ForeignKey(Floor, on_delete=models.PROTECT)
    label = models.CharField(max_length=50)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["floor", "label"], name="room_label_unique")]


class ClassGroup(IdentifiedModel):
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)
    label = models.CharField(max_length=30)
    classroom = models.ForeignKey(Classroom, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["school_year", "label"], name="class_year_label_unique")]


class LockerUnit(IdentifiedModel):
    floor = models.ForeignKey(Floor, on_delete=models.PROTECT)
    number = models.PositiveIntegerField()
    x = models.PositiveIntegerField(default=0)
    y = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=1)
    height = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["floor", "number"], name="unit_floor_number_unique")]


class Locker(IdentifiedModel):
    unit = models.ForeignKey(LockerUnit, on_delete=models.PROTECT)
    compartment = models.PositiveIntegerField()
    serviceable = models.BooleanField(default=True)
    vendor_lock_id = models.CharField(max_length=100, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["unit", "compartment"], name="locker_compartment_unique")]


class Pupil(IdentifiedModel):
    guardian = models.ForeignKey(User, on_delete=models.PROTECT, related_name="pupils")
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)


class Placement(IdentifiedModel):
    pupil = models.ForeignKey(Pupil, on_delete=models.PROTECT)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.PROTECT)
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["pupil", "school_year"], name="pupil_placement_year_unique")]


class LockerSlot(IdentifiedModel):
    locker = models.ForeignKey(Locker, on_delete=models.PROTECT)
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["locker", "school_year"], name="locker_year_slot_unique")]


class Hold(IdentifiedModel):
    class Status(models.TextChoices):
        ACTIVE = "active"
        RELEASED = "released"
        EXPIRED = "expired"
        CONSUMED = "consumed"

    slot = models.ForeignKey(LockerSlot, on_delete=models.PROTECT)
    placement = models.ForeignKey(Placement, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["slot"], condition=Q(status="active"), name="one_active_hold_per_slot"),
            models.UniqueConstraint(fields=["placement"], condition=Q(status="active"), name="one_active_hold_per_placement"),
        ]


class Booking(IdentifiedModel):
    class Status(models.TextChoices):
        PENDING = "pending"
        CONFIRMED = "confirmed"
        CANCELLED = "cancelled"
        ENDED = "ended"

    slot = models.ForeignKey(LockerSlot, on_delete=models.PROTECT)
    placement = models.ForeignKey(Placement, on_delete=models.PROTECT)
    hold = models.OneToOneField(Hold, on_delete=models.PROTECT)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["slot"], condition=Q(status="confirmed"), name="one_confirmed_booking_per_slot"),
            models.UniqueConstraint(fields=["placement"], condition=Q(status="confirmed"), name="one_confirmed_booking_per_placement"),
        ]


class PaymentAttempt(IdentifiedModel):
    hold = models.ForeignKey(Hold, on_delete=models.PROTECT)
    provider = models.CharField(max_length=30)
    provider_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=20, choices=[
        ("created", "Created"), ("pending", "Pending"), ("succeeded", "Succeeded"),
        ("failed", "Failed"), ("unknown", "Unknown"),
    ], default="created")
    created_at = models.DateTimeField(auto_now_add=True)


class AccessCredential(IdentifiedModel):
    booking = models.OneToOneField(Booking, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=[
        ("pending", "Pending"), ("ready", "Ready"), ("failed", "Failed"), ("unknown", "Unknown"),
    ], default="pending")
    encrypted_code = models.TextField(blank=True)
    version = models.PositiveIntegerField(default=0)


class SupportTicket(IdentifiedModel):
    booking = models.ForeignKey(Booking, on_delete=models.PROTECT)
    opened_by = models.ForeignKey(User, on_delete=models.PROTECT)
    message = models.TextField()
    status = models.CharField(max_length=12, choices=[
        ("open", "Open"), ("assigned", "Assigned"), ("resolved", "Resolved"),
    ], default="open")
    created_at = models.DateTimeField(auto_now_add=True)
