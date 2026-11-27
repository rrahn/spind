from django.db import models
from django.db.models import Q

from .hold import Hold
from .identified_model import IdentifiedModel
from .locker_slot import LockerSlot
from .placement import Placement


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
