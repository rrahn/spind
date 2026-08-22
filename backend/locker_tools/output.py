import csv

from rich.console import Console
from rich.table import Table

from locker_tools.assignee import Assignee
from locker_tools.locker import Locker

Assignment = tuple[Assignee, Locker]


def _betrag(amount: float) -> str:
    return str(int(amount)) if float(amount).is_integer() else str(amount)


def render_table(pairs: list[Assignment]) -> None:
    """Print the assignments as a rich table."""
    table = Table(title="Locker assignment")
    table.add_column("Betrag", justify="right")
    table.add_column("Vorname")
    table.add_column("Name")
    table.add_column("Klasse")
    table.add_column("Spind", style="green")
    for assignee, locker in pairs:
        table.add_row(_betrag(assignee.amount), assignee.forename, assignee.surname,
                      assignee.grade, str(locker))
    Console().print(table)


def write_csv(path, pairs: list[Assignment]) -> None:
    """Write paste-ready rows spanning the sheet columns Betrag..Spind.

    Ten ';'-separated columns; the columns auto-filled by Excel
    (E, Telefon, Email, Etage, Bemerkung) are left blank.
    """
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter=';')
        for assignee, locker in pairs:
            writer.writerow([_betrag(assignee.amount), '', assignee.forename, assignee.surname,
                             assignee.grade, '', '', '', '', str(locker)])
