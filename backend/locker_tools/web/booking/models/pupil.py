from django.db import models

from .identified_model import IdentifiedModel
from .school import School
from .user import User


class Pupil(IdentifiedModel):
    guardian = models.ForeignKey(User, on_delete=models.PROTECT, related_name="pupils")
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
