from django.db import models

from .class_group import ClassGroup
from .identified_model import IdentifiedModel
from .pupil import Pupil
from .school_year import SchoolYear


class Placement(IdentifiedModel):
    pupil = models.ForeignKey(Pupil, on_delete=models.PROTECT)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.PROTECT)
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["pupil", "school_year"], name="pupil_placement_year_unique")]
