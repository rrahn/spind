import csv
from enum import IntEnum

from openpyxl import load_workbook
from pydantic import BaseModel, ConfigDict

from locker_tools.locker import Locker


class _Entry(BaseModel):
    """A single locker (Fach) parsed from the database together with its state.

    ``occupied`` mirrors the ``Besetzt`` column (the ground truth for whether a
    locker is taken) and ``defect`` mirrors the ``Defekt`` column. ``floor``
    mirrors ``Etage`` and ``issuable_keys`` mirrors ``Anzahl herausgebbarer
    Schlüssel`` (``None`` when the column is absent).
    """

    model_config = ConfigDict(arbitrary_types_allowed=True, frozen=True)

    locker: Locker
    floor: str
    occupied: bool
    defect: bool
    issuable_keys: int | None


class LockerManager:
    """In-memory view of the locker database.

    Decouples the rest of the tooling from the CSV row layout: it parses the
    locker database once and answers questions about which lockers are free.
    A locker is *available* when it is neither occupied (``Besetzt``) nor
    defect (``Defekt``), and has more than one issuable key (``Anzahl
    herausgebbarer Schlüssel``); a single or missing key means it cannot be
    handed out with a spare.
    """

    class _Column(IntEnum):
        ETAGE = 0
        SPIND = 1
        FACH = 2
        BESETZT = 3
        DEFEKT = 4
        NUMMER = 5
        ORIGINAL_SCHLUESSEL = 6
        ANZAHL_KOPIEN = 7
        ANZAHL_HERAUSGEBBARER_SCHLUESSEL = 8
        ANZAHL_SCHLUESSEL_GESAMT = 9

    _REQUIRED_COLUMNS = (_Column.ETAGE, _Column.SPIND, _Column.FACH)

    def __init__(self, entries: list[_Entry]):
        self._entries = entries

    @classmethod
    def from_csv(cls, file, delimiter: str = ';') -> "LockerManager":
        """Build a manager from an open locker-database CSV file.

        The header row is skipped; see :meth:`from_rows` for row handling
        (parsing stops at the first blank row).
        """
        reader = csv.reader(file, delimiter=delimiter)
        next(reader, None)  # skip header
        return cls.from_rows(reader)

    @classmethod
    def from_excel(cls, path, sheet_index: int = 1) -> "LockerManager":
        """Build a manager from the locker-database sheet of an Excel workbook.

        The workbook is opened read-only; ``sheet_index`` selects the database
        sheet (default: the second sheet). The header row is skipped.
        """
        workbook = load_workbook(path, read_only=True, data_only=True)
        try:
            rows = workbook.worksheets[sheet_index].iter_rows(values_only=True)
            next(rows, None)  # skip header
            return cls.from_rows(rows)
        finally:
            workbook.close()

    @classmethod
    def from_rows(cls, rows) -> "LockerManager":
        """Build a manager from header-less database rows.

        Each row is a sequence of cell values (strings, numbers or ``None``).
        Parsing stops at the first blank row, which terminates the table (any
        trailing summary or note rows below it are ignored). A row missing a
        required ``Etage``, ``Spind`` or ``Fach`` field raises
        :class:`RuntimeError` naming the offending row and its 1-based
        data-row index.
        """
        column = cls._Column
        entries: list[_Entry] = []
        for dataRow, raw in enumerate(rows, start=1):
            row = ['' if cell is None else str(cell).strip() for cell in raw]
            if not any(row):  # blank row terminates the table
                break
            if any(len(row) <= i or row[i] == '' for i in cls._REQUIRED_COLUMNS):
                raise RuntimeError(
                    f"Corrupted locker database: missing required field in "
                    f"row {dataRow}: {';'.join(row)}"
                )
            locker = Locker(int(row[column.SPIND]), int(row[column.FACH]))
            occupied = row[column.BESETZT] not in ('', '0') if len(row) > column.BESETZT else False
            defect = row[column.DEFEKT] != '' if len(row) > column.DEFEKT else False
            keys_col = column.ANZAHL_HERAUSGEBBARER_SCHLUESSEL
            issuable_keys = (
                int(row[keys_col]) if len(row) > keys_col and row[keys_col] != '' else None
            )
            entries.append(_Entry(locker=locker, floor=row[column.ETAGE], occupied=occupied,
                                  defect=defect, issuable_keys=issuable_keys))

        return cls(entries)

    @staticmethod
    def _is_available(entry: _Entry) -> bool:
        has_spare_key = entry.issuable_keys is None or entry.issuable_keys > 1
        return not entry.occupied and not entry.defect and has_spare_key

    def available_lockers(self) -> list[Locker]:
        """Return the available lockers in database (file) order."""
        return [entry.locker for entry in self._entries if self._is_available(entry)]

    def available_lockers_by_floor(self) -> dict[str, list[Locker]]:
        """Return the available lockers grouped by floor (``Etage``).

        Floors keep the order of their first appearance in the database;
        lockers within a floor keep database (file) order.
        """
        grouped: dict[str, list[Locker]] = {}
        for entry in self._entries:
            if self._is_available(entry):
                grouped.setdefault(entry.floor, []).append(entry.locker)
        return grouped

    def num_available(self) -> int:
        """Return the number of available lockers."""
        return len(self.available_lockers())

    def get(self, index: int) -> Locker:
        """Return the available locker at ``index`` (positional, file order).

        Raises :class:`IndexError` when ``index`` is out of range.
        """
        return self.available_lockers()[index]
