from django.db import models
from django.db.models import Q

from .identified_model import IdentifiedModel
from .locker_slot import LockerSlot
from .placement import Placement


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
