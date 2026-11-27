import os

from allauth.account.models import EmailAddress
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from locker_tools.web.booking.models import User

# Synthetic accounts for manual login exploration on a local/test database only.
SCENARIO_PASSWORD = "Synthetic-scenario-password-2027"
SCENARIOS = [
    ("verified-parent@example.invalid", "Vera", "Verifiziert", True),
    ("unverified-parent@example.invalid", "Uwe", "Unbestaetigt", False),
]


class Command(BaseCommand):
    help = "Create synthetic parent accounts (verified and unverified) for local login testing."

    def handle(self, *args, **options):
        if not settings.DEBUG and not os.environ.get("DJANGO_SETTINGS_MODULE", "").endswith("settings_test"):
            raise CommandError("Refusing to seed synthetic accounts outside debug or test settings.")
        for email, first_name, last_name, verified in SCENARIOS:
            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                user = User.objects.create_user(
                    username=email, email=email, password=SCENARIO_PASSWORD,
                    first_name=first_name, last_name=last_name,
                )
            EmailAddress.objects.update_or_create(
                user=user, email=email, defaults={"primary": True, "verified": verified},
            )
            state = "verified" if verified else "unverified"
            self.stdout.write(f"{email} ({state})")
        self.stdout.write(f"Password for all scenarios: {SCENARIO_PASSWORD}")
