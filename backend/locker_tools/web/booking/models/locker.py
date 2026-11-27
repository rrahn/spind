from django.db import models

from .identified_model import IdentifiedModel
from .locker_unit import LockerUnit


class Locker(IdentifiedModel):
    unit = models.ForeignKey(LockerUnit, on_delete=models.PROTECT)
    compartment = models.PositiveIntegerField()
    serviceable = models.BooleanField(default=True)
    vendor_lock_id = models.CharField(max_length=100, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["unit", "compartment"], name="locker_compartment_unique")]
