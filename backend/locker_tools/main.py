import logging

import rich_click as click

from locker_tools.assignee import Assignee
from locker_tools.assignee_source import from_orders
from locker_tools.assigner import assign_lockers
from locker_tools.locker_manager import LockerManager
from locker_tools.output import render_table, write_csv


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


if __name__ == '__main__':
    cli()
