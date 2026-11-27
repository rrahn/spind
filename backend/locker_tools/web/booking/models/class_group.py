from django.db import models

from .classroom import Classroom
from .identified_model import IdentifiedModel
from .school_year import SchoolYear


class ClassGroup(IdentifiedModel):
    school_year = models.ForeignKey(SchoolYear, on_delete=models.PROTECT)
    label = models.CharField(max_length=30)
    classroom = models.ForeignKey(Classroom, on_delete=models.PROTECT)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["school_year", "label"], name="class_year_label_unique")]
