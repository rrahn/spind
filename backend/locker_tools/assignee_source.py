import csv
import logging

from locker_tools.assignee import Assignee

logger = logging.getLogger(__name__)


def from_orders(file) -> list[Assignee]:
    """Read assignees from an orders CSV (``forename,surname,grade,...,amount``).

    An empty ``amount`` defaults to 0. Duplicate entries (same forename, surname
    and grade) are kept but logged as a warning.
    """
    assignees: list[Assignee] = []
    seen: set[tuple[str, str, str]] = set()
    for record in csv.DictReader(file):
        forename = (record.get('forename') or '').strip()
        surname = (record.get('surname') or '').strip()
        grade = (record.get('grade') or '').strip()
        raw_amount = (record.get('amount') or '').strip()
        amount = float(raw_amount) if raw_amount else 0

        key = (forename, surname, grade)
        if key in seen:
            logger.warning("Duplicate entry: %s %s (%s)", forename, surname, grade)
        seen.add(key)

        assignees.append(Assignee(forename=forename, surname=surname, grade=grade, amount=amount))
    return assignees
