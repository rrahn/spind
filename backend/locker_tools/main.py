import logging

import rich_click as click

from locker_tools.assignee import Assignee
from locker_tools.assignee_source import from_orders
from locker_tools.assigner import assign_lockers
from locker_tools.locker_manager import LockerManager
from locker_tools.output import render_available_table, render_table, write_csv
from locker_tools.roster import RosterManager


@click.group()
def cli():
    """Locker tools for the spind backend."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def _load_assignees(orders, forename, surname, grade, amount) -> list[Assignee]:
    """Build assignees from either the orders CSV or the single-person options."""
    person = (forename, surname, grade)
    if orders is not None:
        if any(person):
            raise click.UsageError(
                "--orders cannot be combined with --forename/--surname/--grade.")
        return from_orders(orders)
    if not all(person):
        raise click.UsageError(
            "Provide --orders or all of --forename, --surname and --grade.")
    return [Assignee(forename=forename, surname=surname, grade=grade, amount=amount)]


@cli.command()
@click.option('--database', required=True, type=click.Path(exists=True, dir_okay=False),
              help='Excel workbook with the locker database on its second sheet.')
@click.option('--orders', type=click.File('r', encoding='utf-8-sig'),
              help='Orders CSV (forename,surname,grade,...,amount) for multiple assignees.')
@click.option('--forename', help='Assignee forename (Vorname).')
@click.option('--surname', help='Assignee surname (Name).')
@click.option('--grade', help='Assignee grade (Klasse).')
@click.option('--amount', default=50, type=float, show_default=True, help='Paid amount (Betrag).')
@click.option('--csv', 'csv_path', type=click.Path(dir_okay=False, writable=True),
              help='Also write a paste-ready CSV (Betrag..Spind) to this path.')
def assign(database, orders, forename, surname, grade, amount, csv_path):
    """Assign lockers to people via minimum-weight bipartite matching.

    Provide either an orders CSV (--orders) or a single person via
    --forename/--surname/--grade.
    """
    assignees = _load_assignees(orders, forename, surname, grade, amount)
    manager = LockerManager.from_excel(database)
    pairs = assign_lockers(assignees, manager)
    render_table(pairs)
    if csv_path:
        write_csv(csv_path, pairs)


@cli.command()
@click.option('--database', required=True, type=click.Path(exists=True, dir_okay=False),
              help='Excel workbook with the assignment list on its first sheet.')
@click.option('--output', 'output_path', required=True, type=click.Path(dir_okay=False, writable=True),
              help='Path of the printable HTML handout to write.')
@click.option('--grade', default=None, callback=lambda ctx, param, value: value.upper() if value else value,
              help='Only print this class (Klasse); default prints all. Case-insensitive (e.g. 8b = 8B).')
@click.option('--min-row', 'min_row', default=None, type=click.IntRange(min=1),
              help='First data row to include (1-based, header excluded; default: first row).')
@click.option('--max-row', 'max_row', default=None, type=click.IntRange(min=1),
              help='Last data row to include (inclusive, 1-based, header excluded; default: last row).')
@click.option('--open/--no-open', 'open_after', default=False, show_default=True,
              help='Open the written HTML file in the browser afterwards.')
def roster(database, output_path, grade, min_row, max_row, open_after):
    """Generate a printable per-class handout (one table per grade).

    Reads the assignment sheet (first sheet) and writes an HTML document with
    one table per grade, sorted by name, with a blank signature column. Use
    --grade to print only a single class, and --min-row/--max-row to restrict
    the range of original Excel rows that is read.
    """
    if min_row is not None and max_row is not None and min_row > max_row:
        raise click.UsageError(
            f"--min-row ({min_row}) must not be greater than --max-row ({max_row}).")
    manager = RosterManager.from_excel(database, min_row=min_row, max_row=max_row)
    try:
        manager.write_html(output_path, open_after=open_after, grade=grade)
    except KeyError as exc:
        raise click.UsageError(str(exc).strip('"')) from exc


@cli.command()
@click.option('--database', required=True, type=click.Path(exists=True, dir_okay=False),
              help='Excel workbook with the locker database on its second sheet.')
def available(database):
    """List the available lockers, grouped by floor (one table per floor).

    A locker is available when it is neither occupied (Besetzt) nor defect
    (Defekt), and has more than one issuable key (a single or missing key
    means it cannot be handed out with a spare).
    """
    manager = LockerManager.from_excel(database)
    render_available_table(manager.available_lockers_by_floor())


if __name__ == '__main__':
    cli()
