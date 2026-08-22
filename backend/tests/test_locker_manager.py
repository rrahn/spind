import io
from pathlib import Path

import pytest

from locker_tools.locker import Locker
from locker_tools.locker_manager import LockerManager

ASSETS = Path(__file__).parent / "assets"

LOCKERS_CSV = ASSETS / "lockers.csv"
SPIND_XLSX = ASSETS / "spind.xlsx"


class TestLockerManager:
    @pytest.fixture
    def manager(self) -> LockerManager:
        with LOCKERS_CSV.open(newline="", encoding="UTF-8") as f:
            return LockerManager.from_csv(f)

    def test_available_lockers_excludes_defect_rows(self, manager):
        assert manager.available_lockers() == [
            Locker(1, 1),
            Locker(5, 1),
            Locker(30, 1),
            Locker(20, 1),
        ]

    def test_num_available_counts_only_available(self, manager):
        assert manager.num_available() == 4

    def test_available_lockers_excludes_occupied_rows(self):
        # Besetzt=1 marks an occupied (non-free) locker, even when not defect.
        text = "Etage;Spind;Fach;Besetzt;Defekt\nEG;1;1;0;\nEG;2;1;1;\n"
        manager = LockerManager.from_csv(io.StringIO(text))
        assert manager.available_lockers() == [Locker(1, 1)]

    def test_get_returns_available_locker_by_index(self, manager):
        # get(k) is positional access into the available lockers (file order).
        assert manager.get(0) == Locker(1, 1)
        assert manager.get(1) == Locker(5, 1)
        assert manager.get(3) == Locker(20, 1)

    def test_get_raises_indexerror_out_of_range(self, manager):
        with pytest.raises(IndexError):
            manager.get(4)

    def test_from_csv_raises_when_etage_missing(self):
        text = "Etage;Spind;Fach;Besetzt;Defekt\nEG;1;1;0;\n;2;1;0;\n"
        with pytest.raises(RuntimeError) as excinfo:
            LockerManager.from_csv(io.StringIO(text))
        message = str(excinfo.value)
        assert ";2;1;0;" in message  # faulty row listed verbatim
        assert "row 2" in message  # 1-based data row index (header excluded)

    def test_from_csv_raises_when_spind_missing(self):
        text = "Etage;Spind;Fach;Besetzt;Defekt\nEG;1;1;0;\nEG;;1;0;\n"
        with pytest.raises(RuntimeError) as excinfo:
            LockerManager.from_csv(io.StringIO(text))
        message = str(excinfo.value)
        assert "EG;;1;0;" in message
        assert "row 2" in message

    def test_from_csv_raises_when_fach_missing(self):
        text = "Etage;Spind;Fach;Besetzt;Defekt\nEG;1;1;0;\nEG;2;;0;\n"
        with pytest.raises(RuntimeError) as excinfo:
            LockerManager.from_csv(io.StringIO(text))
        message = str(excinfo.value)
        assert "EG;2;;0;" in message
        assert "row 2" in message

    def test_from_csv_stops_at_blank_row_ignoring_trailing_meta(self):
        # A blank row ends the table; trailing summary/note rows are ignored.
        text = (
            "Etage;Spind;Fach;Besetzt;Defekt\n"
            "EG;1;1;0;\n"
            "EG;2;1;0;\n"
            "\n"
            ";Total;317;41;7;;;;;;;;\n"
            "R9 - Foerderverein Tuer Rechts;B010;;;;;2\n"
        )
        manager = LockerManager.from_csv(io.StringIO(text))
        assert manager.available_lockers() == [Locker(1, 1), Locker(2, 1)]

    def test_from_excel_reads_second_sheet(self):
        # The DB sheet (spind_db) mirrors lockers.csv, so availability matches.
        manager = LockerManager.from_excel(SPIND_XLSX)
        assert manager.available_lockers() == [
            Locker(1, 1),
            Locker(5, 1),
            Locker(30, 1),
            Locker(20, 1),
        ]
