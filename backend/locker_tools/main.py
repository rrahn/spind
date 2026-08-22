#!/usr/bin/env python3

import csv
import operator

import rich_click as click
import networkx as nx
from rich.console import Console
from rich.table import Table

from locker_tools.locker import Locker

def toLocker(lockerCode: str):
    lockerID, lockerBox = lockerCode.split('/')
    return Locker(int(lockerID), int(lockerBox))

weightOffsets = [[0, 1000, 4000, 8000],
                 [1000, 0, 1000, 4000],
                 [4000, 1000, 0, 1000, 4000],
                 [8000, 4000, 0, 0]]

def computeWeight(classRoomPosition, lockerPosition):
    classRoomFloor = int(classRoomPosition / 100)
    lockerFloor = int(lockerPosition / 100)
    offset = weightOffsets[classRoomFloor][lockerFloor]
    return abs(classRoomPosition - lockerPosition) + offset


@click.group()
def cli():
    """Locker tools for the spind backend."""


@cli.command()
@click.option('-o', '--orders', required=True, type=click.File('r', encoding='UTF-8'),
              help='Locker orders CSV to read.')
@click.option('-l', '--lockers', required=True, type=click.File('r', encoding='UTF-8'),
              help='Locker database CSV to read.')
@click.option('-w', '--output', type=click.Path(dir_okay=False, writable=True),
              help='Write orders CSV with assigned lockers to this path.')
def assign(orders, lockers, output):
    """Assign lockers to open orders via minimum-weight bipartite matching."""

    # Static initialisation of locker ids, rooms, and their positions.

    lockerPerLevel = [[35, 10, 5, 4, 3, 14, 2, 1, 17, 34, 12, 11],
                      [30, 13, 29, 16, 28, 9, 8, 7, 6, 22, 18, 31],
                      [25, 27, 26, 24, 15, 23, 21, 20, 19, 33, 32]]

    lockerPositions =  {35: 3, 10: 4, 5: 6, 4: 7, 3: 8, 14: 10, 2: 11, 1: 12, 17: 14, 34: 15, 12: 18, 11: 19,
                        30: 103, 13: 104, 29: 106, 16: 107, 28: 108, 9: 110, 8: 111, 7: 112, 6: 114, 22: 115, 18: 118, 31: 119,
                        25: 203, 27: 204, 26: 206, 24: 207, 15: 208, 23: 210, 21: 211, 20: 212, 19: 214, 33: 215, 32: 216}

    roomPositions = {'R10': 16, 'R8': 17, 'R6': 9, 'R7': 13,
                     'R118': 109, 'R119': 113,  'R120': 116, 'R122': 117,
                     'R225': 201, 'R226': 202, 'R232': 209, 'R233': 213, 'R234': 216, 'R236': 217,
                     'R341': 310, 'R100': 150}

    grade2Room = {'5N': 'R8', '6N': 'R10',
                  '7A': 'R6', '7B': 'R7', '7N': 'R232',
                  '8A': 'R341', '8B': 'R236', '8N': 'R122', '8': 'R118',
                  '9A': 'R225', '9B': 'R120', '9N': 'R119', '9': 'R233',
                  '10A': 'R226', '10B': 'R118' , '10C': 'R233', '10N': 'R234',
                  'WK': 'R343',
                  '11': 'R100', '12': 'R100'}

    tabuList = [] # ['5N', '7A', '7B']

    GRADE_INDEX = 7
    LOCKER_INDEX = 12
    FORNAME_INDEX = 5
    NAME_INDEX = 6

    # #################################################################
    # Parse and generate list of unassigned and already assigned orders

    assignedOrders = []
    unassignedOrders = []
    allOrders = []  # every valid row, kept in input order for the output file
    orderReader = csv.reader(orders, dialect='excel')
    orderHeader = next(orderReader)
    # Split orders into assigned and unassigned
    skipGrade = lambda order: order[GRADE_INDEX].strip().upper() in tabuList
    duplicateAssignment = lambda order: order[LOCKER_INDEX].strip() == '???' or order[LOCKER_INDEX].strip() == ''

    for order in orderReader:
        if len(order) <= LOCKER_INDEX:  # skip blank or truncated rows
            continue
        allOrders.append(order)
        if order[GRADE_INDEX] == '' or order[GRADE_INDEX] == '???':
            continue
        if (not skipGrade(order) and duplicateAssignment(order)):
            unassignedOrders.append(order)
        else:
            assignedOrders.append(order)

    getLocker = lambda order : (toLocker(order[LOCKER_INDEX].strip()))
    occupiedLockers = list(getLocker(order) for order in assignedOrders)
    select = lambda order : (f"{order[FORNAME_INDEX].strip()} {order[NAME_INDEX].strip()}", order[GRADE_INDEX].strip().upper())
    todoOrders = dict(list(select(order) for order in unassignedOrders))
    # ############################################
    # Parse and generate list of available lockers
    isAvailable = lambda lockerRow: lockerRow[0] != '' and toLocker(lockerRow[1].strip() + '/' + lockerRow[2].strip()) not in occupiedLockers and lockerRow[4].strip() == ''
    availLockerList = []

    lockerReader = csv.reader(lockers, delimiter=';')
    next(lockerReader)
    availLocker = list(row for row in lockerReader if len(row) > 4 and isAvailable(row))
    availLockerList = [toLocker(lockerRow[1].strip() + '/' + lockerRow[2].strip()) for lockerRow in availLocker]

    # ########################################################
    # Generate bipartite graph for automatic locker assignment

    orderKeys = list(todoOrders.keys())
    n = len(orderKeys)
    m = len(availLockerList)
    G = nx.complete_bipartite_graph(n, m)

    # Assign order property to source nodes.
    for orderNodeId in range(n):
        G.nodes[orderNodeId]['order'] = orderKeys[orderNodeId]

    # Assign locker property to target nodes.
    for lockerId in range(m):
        lockerNodeId = lockerId + n
        G.nodes[lockerNodeId]['locker'] = availLockerList[lockerId]

    # Assign weights to edges between source and target nodes.
    for orderNodeId in range(n):
        try:
            grade = todoOrders[G.nodes[orderNodeId]['order']]
            room = grade2Room[grade]
            roomPosition = roomPositions[room]
        except KeyError as e:
            print(f"Grade {grade} not found in grade2Room!")
            continue

        for lockerId in range(m):
            lockerNodeId = lockerId + n
            locker = G.nodes[lockerNodeId]['locker']
            w = computeWeight(roomPosition, lockerPositions[locker.id()])
            G[orderNodeId][lockerNodeId]['weight'] = w

    # ###########################################################
    # Compute minimal weight matching of weighted bipartite graph

    M = nx.min_weight_matching(G)
    remainingAssignment = []
    newLockerByOrderKey = {}  # name -> 'id/box' for freshly matched orders

    for orderNodeId, lockerNodeId in M:
        if (orderNodeId >= n):
            orderNodeId, lockerNodeId = lockerNodeId, orderNodeId

        orderKey = G.nodes[orderNodeId]['order']
        lItem = G.nodes[lockerNodeId]['locker']
        grade = todoOrders[orderKey]
        room = grade2Room[grade]
        level = 0
        for i in range(len(lockerPerLevel)):
            if lItem.id() in lockerPerLevel[i]:
                level = i
                break

        lockerCode = str(lItem.id()) + '/' + str(lItem.box())
        newLockerByOrderKey[orderKey] = lockerCode
        remainingAssignment.append((orderKey, grade, str(level), lockerCode))

    # Add previously assigned orders to remaining assignment.
    for assignedOrder in assignedOrders:
        remainingAssignment.append((assignedOrder[5].strip(), assignedOrder[6].strip().upper(), assignedOrder[9], assignedOrder[11]))

    # Sort final assignment and render as a table
    finalAssignment = sorted(remainingAssignment, key = operator.itemgetter(1, 0))

    table = Table(title="Locker assignment")
    table.add_column("Name", style="cyan", no_wrap=True)
    table.add_column("Grade", style="magenta")
    table.add_column("Locker", style="green")
    table.add_column("Level", justify="right")
    for name, grade, level, lockerCode in finalAssignment:
        table.add_row(name, grade, lockerCode, level)

    console = Console()
    console.print(table)

    # #########################################################################
    # Write orders CSV with the newly assigned lockers filled into the locker
    # column. Previously assigned rows are copied over unchanged.
    if output:
        for order in unassignedOrders:
            orderKey = f"{order[FORNAME_INDEX].strip()} {order[NAME_INDEX].strip()}"
            if orderKey in newLockerByOrderKey:
                order[LOCKER_INDEX] = newLockerByOrderKey[orderKey]

        with open(output, 'w', newline='', encoding='UTF-8') as outFile:
            writer = csv.writer(outFile)
            writer.writerow(orderHeader)
            writer.writerows(allOrders)
        console.print(f"Wrote {len(allOrders)} orders to {output}")


if __name__ == '__main__':
    cli()
