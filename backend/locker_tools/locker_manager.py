import csv
from enum import IntEnum

from pydantic import BaseModel, ConfigDict

from locker_tools.locker import Locker


class _Entry(BaseModel):
    """A single locker (Fach) parsed from the database together with its state.

    ``occupied`` mirrors the ``Besetzt`` column (the ground truth for whether a
    locker is taken) and ``defect`` mirrors the ``Defekt`` column.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True, frozen=True)

    locker: Locker
    occupied: bool
    defect: bool


class LockerManager:
    """In-memory view of the locker database.

    Decouples the rest of the tooling from the CSV row layout: it parses the
    locker database once and answers questions about which lockers are free.
    A locker is *available* when it is neither occupied (``Besetzt``) nor
    defect (``Defekt``).
    """

    class _Column(IntEnum):
        ETAGE = 0
        SPIND = 1
        FACH = 2
        BESETZT = 3
        DEFEKT = 4

    _REQUIRED_COLUMNS = (_Column.ETAGE, _Column.SPIND, _Column.FACH)

    def __init__(self, entries: list[_Entry]):
        self._entries = entries

    @classmethod
    def from_csv(cls, file, delimiter: str = ';') -> "LockerManager":
        """Build a manager from an open locker-database CSV file.

        The header row is skipped and blank lines are ignored. Each remaining
        row must carry the required ``Etage``, ``Spind`` and ``Fach`` fields;
        a row missing any of them raises :class:`RuntimeError` naming the
        offending row and its 1-based data-row index.
        """
        reader = csv.reader(file, delimiter=delimiter)
        next(reader, None)  # skip header

        column = cls._Column
        entries: list[_Entry] = []
        for dataRow, row in enumerate(reader, start=1):
            if not any(field.strip() for field in row):  # skip blank lines
                continue
            if any(len(row) <= i or row[i].strip() == '' for i in cls._REQUIRED_COLUMNS):
                raise RuntimeError(
                    f"Corrupted locker database: missing required field in "
                    f"row {dataRow}: {delimiter.join(row)}"
                )
            locker = Locker(int(row[column.SPIND].strip()), int(row[column.FACH].strip()))
            occupied = row[column.BESETZT].strip() not in ('', '0') if len(row) > column.BESETZT else False
            defect = row[column.DEFEKT].strip() != '' if len(row) > column.DEFEKT else False
            entries.append(_Entry(locker=locker, occupied=occupied, defect=defect))

        return cls(entries)

    def available_lockers(self) -> list[Locker]:
        """Return the free, non-defect lockers in database (file) order."""
        return [entry.locker for entry in self._entries if not entry.occupied and not entry.defect]

    def num_available(self) -> int:
        """Return the number of available lockers."""
        return len(self.available_lockers())

    def get(self, index: int) -> Locker:
        """Return the available locker at ``index`` (positional, file order).

        Raises :class:`IndexError` when ``index`` is out of range.
        """
        return self.available_lockers()[index]
