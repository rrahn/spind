from django.db import models

from .floor import Floor
from .identified_model import IdentifiedModel


class Classroom(IdentifiedModel):
    floor = models.ForeignKey(Floor, on_delete=models.PROTECT)
    label = models.CharField(max_length=50)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["floor", "label"], name="room_label_unique")]
