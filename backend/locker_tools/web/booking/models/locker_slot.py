from django.db import models

from .identified_model import IdentifiedModel
from .locker import Locker
from .school_year import SchoolYear


class LockerSlot(IdentifiedModel):
    locker = models.ForeignKey(Locker, on_delete=models.PROTECT)
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["locker", "school_year"], name="locker_year_slot_unique")]
