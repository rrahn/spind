from django.db import models

from .booking import Booking
from .identified_model import IdentifiedModel


class AccessCredential(IdentifiedModel):
    booking = models.OneToOneField(Booking, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=[
        ("pending", "Pending"), ("ready", "Ready"), ("failed", "Failed"), ("unknown", "Unknown"),
    ], default="pending")
    encrypted_code = models.TextField(blank=True)
    version = models.PositiveIntegerField(default=0)
