from pathlib import Path

from click.testing import CliRunner

from locker_tools.main import cli

ASSETS = Path(__file__).parent / "assets"
SPIND_XLSX = ASSETS / "spind.xlsx"

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


def test_assign_requires_person_options():
    runner = CliRunner()
    result = runner.invoke(cli, ["assign", "--database", str(SPIND_XLSX)])
    assert result.exit_code != 0
