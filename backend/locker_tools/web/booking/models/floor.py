from django.db import models

from .identified_model import IdentifiedModel
from .school import School


class Floor(IdentifiedModel):
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    label = models.CharField(max_length=50)
    level = models.IntegerField()
    image_path = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["school", "level"], name="floor_level_unique")]
