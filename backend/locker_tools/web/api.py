from datetime import date, datetime
from uuid import UUID

from django.db import IntegrityError, connection, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import ModelSchema, NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.pagination import paginate
from ninja.security import django_auth
from pydantic import Field

from .booking.models import (
    Booking, ClassGroup, Classroom, Floor, Hold, Locker, LockerUnit,
    Placement, Pupil, School, SchoolYear, SupportTicket,
)
from .booking.services import acquire_hold, database_now, release_hold, verified_guardian

api = NinjaAPI(title="School locker Python API", version="1.0.0", auth=django_auth)


class SchoolIn(Schema):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(pattern=r"^[a-z0-9-]{1,50}$")


class YearIn(Schema):
    school_id: UUID
    label: str = Field(min_length=1, max_length=30)
    access_starts: date
    access_ends: date
    booking_opens: datetime
    booking_closes: datetime
    booking_enabled: bool = False
    price_cents: int = Field(ge=0)
    currency: str = Field(default="EUR", pattern="^EUR$")


class FloorIn(Schema):
    school_id: UUID
    label: str = Field(min_length=1, max_length=50)
    level: int
    image_path: str = Field(default="", max_length=255, pattern=r"^(?:/assets/[A-Za-z0-9_./-]+)?$")


class RoomIn(Schema):
    floor_id: UUID
    label: str = Field(min_length=1, max_length=50)


class ClassIn(Schema):
    school_year_id: UUID
    label: str = Field(min_length=1, max_length=30)
    classroom_id: UUID


class UnitIn(Schema):
    floor_id: UUID
    number: int = Field(ge=1)
    x: int = Field(default=0, ge=0)
    y: int = Field(default=0, ge=0)
    width: int = Field(default=1, ge=1)
    height: int = Field(default=1, ge=1)


class LockerIn(Schema):
    unit_id: UUID
    compartment: int = Field(ge=1)
    serviceable: bool = True
    vendor_lock_id: str = Field(default="", max_length=100)


class PupilIn(Schema):
    school_id: UUID
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class PlacementIn(Schema):
    class_group_id: UUID


class HoldIn(Schema):
    placement_id: UUID
    locker_id: UUID


class TicketIn(Schema):
    booking_id: UUID
    message: str = Field(min_length=1, max_length=4000)


class IdOut(Schema):
    id: UUID


class PupilOut(IdOut):
    school_id: UUID
    first_name: str
    last_name: str


class PlacementOut(IdOut):
    pupil_id: UUID
    school_year_id: UUID
    class_group_id: UUID


class HoldOut(IdOut):
    locker_id: UUID = Field(alias="slot.locker_id")
    placement_id: UUID
    school_year_id: UUID = Field(alias="slot.school_year_id")
    expires_at: datetime
    status: str

    @staticmethod
    def resolve_status(hold):
        if hold.status == Hold.Status.ACTIVE and hold.expires_at <= database_now():
            return Hold.Status.EXPIRED
        return hold.status


class BookingOut(IdOut):
    locker_id: UUID = Field(alias="slot.locker_id")
    placement_id: UUID
    school_year_id: UUID = Field(alias="slot.school_year_id")
    status: str
    amount_cents: int
    currency: str


class TicketOut(IdOut):
    booking_id: UUID
    message: str
    status: str
    created_at: datetime


class SchoolOut(ModelSchema):
    class Meta:
        model = School
        fields = ["id", "name", "slug"]


class YearOut(ModelSchema):
    class Meta:
        model = SchoolYear
        fields = ["id", "school", "label", "access_starts", "access_ends", "booking_opens", "booking_closes", "booking_enabled", "price_cents", "currency"]


class FloorOut(ModelSchema):
    class Meta:
        model = Floor
        fields = ["id", "school", "label", "level", "image_path"]


class RoomOut(ModelSchema):
    class Meta:
        model = Classroom
        fields = ["id", "floor", "label"]


class ClassOut(ModelSchema):
    class Meta:
        model = ClassGroup
        fields = ["id", "school_year", "label", "classroom"]


class UnitOut(ModelSchema):
    class Meta:
        model = LockerUnit
        fields = ["id", "floor", "number", "x", "y", "width", "height"]


class LockerOut(ModelSchema):
    class Meta:
        model = Locker
        fields = ["id", "unit", "compartment", "serviceable"]


class InventoryOut(Schema):
    schools: list[SchoolOut]
    school_years: list[YearOut]
    floors: list[FloorOut]
    classrooms: list[RoomOut]
    classes: list[ClassOut]
    units: list[UnitOut]
    lockers: list[LockerOut]


def staff(request):
    if not request.user.is_staff:
        raise HttpError(403, "Staff access required.")


def create(model, data):
    try:
        with transaction.atomic():
            return model.objects.create(**data)
    except IntegrityError:
        raise HttpError(409, "A conflicting record already exists or a referenced record is invalid.") from None


@api.get("/health", auth=None)
def health(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return {"status": "ok", "database": "postgresql"}


@api.get("/inventory/{school_id}", response=InventoryOut)
def inventory(request, school_id: UUID):
    get_object_or_404(School, pk=school_id)
    queries = {
        "schools": School.objects.filter(pk=school_id).values("id", "name", "slug"),
        "school_years": SchoolYear.objects.filter(school_id=school_id).values(),
        "floors": Floor.objects.filter(school_id=school_id).values(),
        "classrooms": Classroom.objects.filter(floor__school_id=school_id).values(),
        "classes": ClassGroup.objects.filter(school_year__school_id=school_id).values(),
        "units": LockerUnit.objects.filter(floor__school_id=school_id).values(),
        "lockers": Locker.objects.filter(unit__floor__school_id=school_id).values("id", "unit_id", "compartment", "serviceable"),
    }
    if any(query.count() > 5000 for query in queries.values()):
        raise HttpError(413, "Inventory is too large for this initial snapshot endpoint.")
    return {name: list(query) for name, query in queries.items()}


@api.get("/schools", response=list[SchoolOut])
def schools(request):
    return list(School.objects.values("id", "name", "slug").order_by("name"))


@api.post("/schools", response=IdOut)
def add_school(request, payload: SchoolIn):
    staff(request)
    return create(School, payload.model_dump())


@api.post("/school-years", response=IdOut)
def add_year(request, payload: YearIn):
    staff(request)
    if payload.access_ends <= payload.access_starts:
        raise HttpError(422, "Access end must follow access start.")
    if timezone.is_naive(payload.booking_opens) or timezone.is_naive(payload.booking_closes):
        raise HttpError(422, "Booking timestamps must include a timezone.")
    if payload.booking_closes <= payload.booking_opens:
        raise HttpError(422, "Booking close must follow booking open.")
    with transaction.atomic():
        get_object_or_404(School.objects.select_for_update(), pk=payload.school_id)
        if SchoolYear.objects.filter(
            school_id=payload.school_id, access_starts__lt=payload.access_ends, access_ends__gt=payload.access_starts,
        ).exists():
            raise HttpError(409, "This initial API does not support overlapping school-year access periods.")
        return create(SchoolYear, payload.model_dump())


class WindowIn(Schema):
    enabled: bool


@api.patch("/school-years/{year_id}/booking-window", response=IdOut)
def booking_window(request, year_id: UUID, payload: WindowIn):
    staff(request)
    with transaction.atomic():
        year = get_object_or_404(SchoolYear.objects.select_for_update(), pk=year_id)
        year.booking_enabled = payload.enabled
        year.save(update_fields=["booking_enabled"])
    return year


@api.post("/floors", response=IdOut)
def add_floor(request, payload: FloorIn):
    staff(request)
    get_object_or_404(School, pk=payload.school_id)
    return create(Floor, payload.model_dump())


@api.post("/classrooms", response=IdOut)
def add_room(request, payload: RoomIn):
    staff(request)
    get_object_or_404(Floor, pk=payload.floor_id)
    return create(Classroom, payload.model_dump())


def check_class_room(year_id, room_id):
    year = get_object_or_404(SchoolYear, pk=year_id)
    room = get_object_or_404(Classroom.objects.select_related("floor"), pk=room_id)
    if room.floor.school_id != year.school_id:
        raise HttpError(422, "Class and room must belong to the same school.")


@api.post("/classes", response=IdOut)
def add_class(request, payload: ClassIn):
    staff(request)
    check_class_room(payload.school_year_id, payload.classroom_id)
    return create(ClassGroup, payload.model_dump())


class RoomChangeIn(Schema):
    classroom_id: UUID


@api.patch("/classes/{class_id}/classroom", response=IdOut)
def change_classroom(request, class_id: UUID, payload: RoomChangeIn):
    staff(request)
    group = get_object_or_404(ClassGroup, pk=class_id)
    check_class_room(group.school_year_id, payload.classroom_id)
    group.classroom_id = payload.classroom_id
    group.save(update_fields=["classroom"])
    return group


@api.post("/locker-units", response=IdOut)
def add_unit(request, payload: UnitIn):
    staff(request)
    get_object_or_404(Floor, pk=payload.floor_id)
    return create(LockerUnit, payload.model_dump())


@api.post("/lockers", response=IdOut)
def add_locker(request, payload: LockerIn):
    staff(request)
    get_object_or_404(LockerUnit, pk=payload.unit_id)
    return create(Locker, payload.model_dump())


class ConditionIn(Schema):
    serviceable: bool


@api.patch("/lockers/{locker_id}/condition", response=IdOut)
def locker_condition(request, locker_id: UUID, payload: ConditionIn):
    staff(request)
    with transaction.atomic():
        locker = get_object_or_404(Locker.objects.select_for_update(), pk=locker_id)
        locker.serviceable = payload.serviceable
        locker.save(update_fields=["serviceable"])
    return locker


@api.get("/pupils", response=list[PupilOut])
@paginate
def pupils(request):
    verified_guardian(request)
    return Pupil.objects.filter(guardian=request.user).order_by("id")


@api.post("/pupils", response=PupilOut)
def add_pupil(request, payload: PupilIn):
    verified_guardian(request)
    get_object_or_404(School, pk=payload.school_id)
    return create(Pupil, {**payload.model_dump(), "guardian": request.user})


@api.get("/pupils/{pupil_id}/placements", response=list[PlacementOut])
def placements(request, pupil_id: UUID):
    verified_guardian(request)
    get_object_or_404(Pupil, pk=pupil_id, guardian=request.user)
    return list(Placement.objects.filter(pupil_id=pupil_id))


@api.post("/pupils/{pupil_id}/placements", response=PlacementOut)
def add_placement(request, pupil_id: UUID, payload: PlacementIn):
    verified_guardian(request)
    with transaction.atomic():
        pupil = get_object_or_404(Pupil.objects.select_for_update(), pk=pupil_id, guardian=request.user)
        group = get_object_or_404(ClassGroup.objects.select_related("school_year"), pk=payload.class_group_id)
        if pupil.school_id != group.school_year.school_id:
            raise HttpError(422, "Pupil and class must belong to the same school.")
        return create(Placement, {"pupil": pupil, "class_group": group, "school_year": group.school_year})


@api.post("/holds", response=HoldOut)
def add_hold(request, payload: HoldIn):
    verified_guardian(request)
    return acquire_hold(request.user, payload.placement_id, payload.locker_id)


@api.get("/holds", response=list[HoldOut])
@paginate
def holds(request):
    verified_guardian(request)
    return Hold.objects.filter(placement__pupil__guardian=request.user).select_related("slot").order_by("-created_at")


@api.post("/holds/{hold_id}/release", response=HoldOut)
def remove_hold(request, hold_id: UUID):
    verified_guardian(request)
    return release_hold(request.user, hold_id)


@api.get("/bookings", response=list[BookingOut])
@paginate
def bookings(request):
    verified_guardian(request)
    return Booking.objects.filter(placement__pupil__guardian=request.user).select_related("slot").order_by("-created_at")


@api.post("/support-tickets", response=TicketOut)
def add_ticket(request, payload: TicketIn):
    verified_guardian(request)
    booking = get_object_or_404(Booking, pk=payload.booking_id, placement__pupil__guardian=request.user)
    return create(SupportTicket, {"booking": booking, "opened_by": request.user, "message": payload.message})


@api.get("/support-tickets", response=list[TicketOut])
@paginate
def tickets(request):
    verified_guardian(request)
    return SupportTicket.objects.filter(opened_by=request.user).order_by("-created_at")
