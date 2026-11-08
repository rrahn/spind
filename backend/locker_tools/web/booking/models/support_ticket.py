from django.db import models

from .booking import Booking
from .identified_model import IdentifiedModel
from .user import User


class SupportTicket(IdentifiedModel):
    booking = models.ForeignKey(Booking, on_delete=models.PROTECT)
    opened_by = models.ForeignKey(User, on_delete=models.PROTECT)
    message = models.TextField()
    status = models.CharField(max_length=12, choices=[
        ("open", "Open"), ("assigned", "Assigned"), ("resolved", "Resolved"),
    ], default="open")
    created_at = models.DateTimeField(auto_now_add=True)
