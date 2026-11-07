from django.db import models

from .hold import Hold
from .identified_model import IdentifiedModel


class PaymentAttempt(IdentifiedModel):
    hold = models.ForeignKey(Hold, on_delete=models.PROTECT)
    provider = models.CharField(max_length=30)
    provider_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=20, choices=[
        ("created", "Created"), ("pending", "Pending"), ("succeeded", "Succeeded"),
        ("failed", "Failed"), ("unknown", "Unknown"),
    ], default="created")
    created_at = models.DateTimeField(auto_now_add=True)
