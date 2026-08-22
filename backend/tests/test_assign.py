from pathlib import Path

from click.testing import CliRunner

from locker_tools.main import cli

ASSETS = Path(__file__).parent / "assets"
SPIND_XLSX = ASSETS / "spind.xlsx"
ASSIGNEES_CSV = ASSETS / "assignees.csv"

# Available lockers in the spind_db sheet (not occupied, not defect).
AVAILABLE_LOCKERS = {"1/1", "5/1", "30/1", "20/1"}


def test_assign_single_person_gets_available_locker():
    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "assign",
            "--database", str(SPIND_XLSX),
            "--forename", "Ada",
            "--surname", "Byron",
            "--grade", "7A",
        ],
    )

    assert result.exit_code == 0, result.output
    assert "Ada" in result.output
    assert any(code in result.output for code in AVAILABLE_LOCKERS)


def test_assign_orders_csv_assigns_all_people():
    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "assign",
            "--database", str(SPIND_XLSX),
            "--orders", str(ASSIGNEES_CSV),
        ],
    )

    assert result.exit_code == 0, result.output
    for name in ("Byron", "Ross", "Lee"):
        assert name in result.output


def test_assign_orders_and_person_are_mutually_exclusive():
    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "assign",
            "--database", str(SPIND_XLSX),
            "--orders", str(ASSIGNEES_CSV),
            "--forename", "Ada",
            "--surname", "Byron",
            "--grade", "7A",
        ],
    )
    assert result.exit_code != 0


def test_assign_requires_a_source():
    runner = CliRunner()
    result = runner.invoke(cli, ["assign", "--database", str(SPIND_XLSX)])
    assert result.exit_code != 0
