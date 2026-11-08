from django.db import models

from .floor import Floor
from .identified_model import IdentifiedModel


class LockerUnit(IdentifiedModel):
    floor = models.ForeignKey(Floor, on_delete=models.PROTECT)
    number = models.PositiveIntegerField()
    x = models.PositiveIntegerField(default=0)
    y = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=1)
    height = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["floor", "number"], name="unit_floor_number_unique")]
