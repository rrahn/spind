from django.db import models

from .identified_model import IdentifiedModel


class School(IdentifiedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
