import csv
from pathlib import Path

from click.testing import CliRunner

from locker_tools.main import cli

ASSETS = Path(__file__).parent / "assets"
LOCKER_INDEX = 12

# Lockers with an empty Defekt column across all Etagen; the defect
# lockers (3/1, 9/1, 25/1) must be excluded from assignment.
AVAILABLE_LOCKERS = {"1/1", "5/1", "30/1", "20/1"}


def test_assign_fills_lockers_for_unassigned_orders(tmp_path):
    output = tmp_path / "orders_assigned.csv"

    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "assign",
            "-o", str(ASSETS / "orders.csv"),
            "-l", str(ASSETS / "lockers.csv"),
            "-w", str(output),
        ],
    )

    assert result.exit_code == 0, result.output
    assert output.exists()

    with output.open(newline="", encoding="UTF-8") as f:
        rows = list(csv.reader(f))

    data_rows = rows[1:]
    assigned = [row[LOCKER_INDEX].strip() for row in data_rows]

    # Every unassigned student now has a locker from the available set.
    assert len(assigned) == 3
    assert all(locker in AVAILABLE_LOCKERS for locker in assigned)
    # Each locker is handed out at most once.
    assert len(set(assigned)) == len(assigned)
