from django.db import models
from django.db.models import F, Q

from .identified_model import IdentifiedModel
from .school import School


class SchoolYear(IdentifiedModel):
    school = models.ForeignKey(School, on_delete=models.PROTECT)
    label = models.CharField(max_length=30)
    access_starts = models.DateField()
    access_ends = models.DateField()
    booking_opens = models.DateTimeField()
    booking_closes = models.DateTimeField()
    booking_enabled = models.BooleanField(default=False)
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="EUR")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["school", "label"], name="school_year_label_unique"),
            models.CheckConstraint(condition=Q(access_ends__gt=F("access_starts")), name="year_access_dates_ordered"),
            models.CheckConstraint(condition=Q(booking_closes__gt=F("booking_opens")), name="year_booking_dates_ordered"),
        ]
