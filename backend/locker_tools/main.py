#!/usr/bin/env python3

import logging

import rich_click as click
from rich.console import Console
from rich.table import Table

from locker_tools.assignee import Assignee
from locker_tools.assigner import assign_lockers
from locker_tools.locker_manager import LockerManager


@click.group()
def cli():
    """Locker tools for the spind backend."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def _render_table(pairs):
    table = Table(title="Locker assignment")
    table.add_column("Betrag", justify="right")
    table.add_column("Vorname")
    table.add_column("Name")
    table.add_column("Klasse")
    table.add_column("Spind", style="green")
    for assignee, locker in pairs:
        amount = assignee.amount
        betrag = str(int(amount)) if float(amount).is_integer() else str(amount)
        table.add_row(betrag, assignee.forename, assignee.surname, assignee.grade,
                      f"{locker.id()}/{locker.box()}")
    Console().print(table)


@cli.command()
@click.option('--database', required=True, type=click.Path(exists=True, dir_okay=False),
              help='Excel workbook with the locker database on its second sheet.')
@click.option('--forename', required=True, help='Assignee forename (Vorname).')
@click.option('--surname', required=True, help='Assignee surname (Name).')
@click.option('--grade', required=True, help='Assignee grade (Klasse).')
@click.option('--amount', default=50, type=float, show_default=True, help='Paid amount (Betrag).')
def assign(database, forename, surname, grade, amount):
    """Assign a locker to a single person via minimum-weight bipartite matching."""
    assignees = [Assignee(forename=forename, surname=surname, grade=grade, amount=amount)]
    manager = LockerManager.from_excel(database)
    pairs = assign_lockers(assignees, manager)
    _render_table(pairs)


if __name__ == '__main__':
    cli()
