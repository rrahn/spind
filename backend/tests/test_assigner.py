import io
import logging

from locker_tools.assignee import Assignee
from locker_tools.assigner import assign_lockers
from locker_tools.locker import Locker
from locker_tools.locker_manager import LockerManager


def manager_with(*spind_ids: int) -> LockerManager:
    header = "Etage;Spind;Fach;Besetzt;Defekt\n"
    body = "".join(f"EG;{sid};1;0;\n" for sid in spind_ids)
    return LockerManager.from_csv(io.StringIO(header + body))


class TestAssignLockers:
    def test_matches_assignees_to_available_lockers(self):
        manager = manager_with(1, 30)
        ada = Assignee(forename="Ada", surname="Byron", grade="7A")
        bob = Assignee(forename="Bob", surname="Ross", grade="9B")

        pairs = assign_lockers([ada, bob], manager)

        assert [assignee for assignee, _ in pairs] == [ada, bob]
        assert {locker for _, locker in pairs} == {Locker(1, 1), Locker(30, 1)}

    def test_skips_unknown_grade_with_warning(self, caplog):
        manager = manager_with(1, 30)
        ada = Assignee(forename="Ada", surname="Byron", grade="7A")
        zoe = Assignee(forename="Zoe", surname="Nix", grade="ZZ")

        with caplog.at_level(logging.WARNING):
            pairs = assign_lockers([ada, zoe], manager)

        assert [assignee for assignee, _ in pairs] == [ada]
        assert "Zoe" in caplog.text or "ZZ" in caplog.text

    def test_warns_on_unmatched_when_too_few_lockers(self, caplog):
        manager = manager_with(1)
        ada = Assignee(forename="Ada", surname="Byron", grade="7A")
        bob = Assignee(forename="Bob", surname="Ross", grade="9B")

        with caplog.at_level(logging.WARNING):
            pairs = assign_lockers([ada, bob], manager)

        assert len(pairs) == 1
        assert "Bob" in caplog.text or "Ada" in caplog.text
