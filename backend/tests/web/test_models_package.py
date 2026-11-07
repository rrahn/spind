from importlib import import_module

import pytest
from django.apps import apps

from locker_tools.web.booking import models


PUBLIC_MODELS = {
    "AccessCredential": "access_credential",
    "Booking": "booking",
    "ClassGroup": "class_group",
    "Classroom": "classroom",
    "Floor": "floor",
    "Hold": "hold",
    "IdentifiedModel": "identified_model",
    "Locker": "locker",
    "LockerSlot": "locker_slot",
    "LockerUnit": "locker_unit",
    "PaymentAttempt": "payment_attempt",
    "Placement": "placement",
    "Pupil": "pupil",
    "School": "school",
    "SchoolYear": "school_year",
    "SupportTicket": "support_ticket",
    "User": "user",
}


def test_public_exports():
    assert set(models.__all__) == set(PUBLIC_MODELS)


@pytest.mark.parametrize(("name", "module_name"), PUBLIC_MODELS.items())
def test_model_module_and_django_registration(name, module_name):
    module = import_module(f"{models.__name__}.{module_name}")
    model = getattr(models, name)
    assert model is getattr(module, name)
    assert model.__module__ == module.__name__
    if name == "IdentifiedModel":
        assert model._meta.abstract
    else:
        assert apps.get_model("booking", name) is model
