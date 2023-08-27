import argparse
import csv
import networkx as nx
from networkx.algorithms import bipartite
import operator
import sys


from classRoom import ClassRoom
from pathlib import Path
from locker import Locker
from position import Position

def toLocker(lockerCode):
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


def main():

    # Initialise argument parser
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', '--orders', type=argparse.FileType('r', encoding='UTF-8'))
    parser.add_argument('-l', '--lockers', type=argparse.FileType('r', encoding='UTF-8'))
    args = vars(parser.parse_args(sys.argv[1:]))

    if 'orders' not in args:
        parser.exit(1, message="Missing locker orders!")

    if 'lockers' not in args:
        parser.exit(1, message="Missing locker database!")

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
                      'R341': 310, 'R100': 50}

    grade2Room = {'5N': 'R10', '6N': 'R8',
                  '7A': 'R226', '7B': 'R6', '7C': 'R7', '7N': 'R234',
                  '8A': 'R233', '8B': 'R236','8N': 'R232',
                  '9A': 'R225', '9B': 'R341' ,'9N': 'R120',
                  '10A': 'R118', '10B': 'R119' , '10N': 'R122', '10XN': 'R122',
                  '11': 'R100', '12': 'R100'}

    tabuList = ['5N', '7A', '7B', '7C', '8B']

    # #################################################################
    # Parse and generate list of unassigned and already assigned orders

    assignedOrders = []
    unassignedOrders = []
    orderReader = csv.reader(args['orders'], dialect='excel')
    # skip header
    next(orderReader)
    # Split orders into assigned and unassigned
    hasGrade = lambda order: order[6].strip().upper() not in tabuList
    duplicateAssignment = lambda order: order[9].strip() == '???' or order[9].strip() == ''

    for order in orderReader:
        if order[6] == '' or order[6] == '???':
            continue
        if hasGrade(order) or duplicateAssignment(order):
            unassignedOrders.append(order)
        else:
            assignedOrders.append(order)

    getLocker = lambda order : (toLocker(order[9].strip()))
    occupiedLockers = list(getLocker(order) for order in assignedOrders)
    select = lambda order : (order[5].strip(), order[6].strip().upper())
    todoOrders = dict(list(select(order) for order in unassignedOrders))

    # ############################################
    # Parse and generate list of available lockers
    isAvailable = lambda lockerRow: lockerRow[0] != '' and toLocker(lockerRow[1].strip() + '/' + lockerRow[2].strip()) not in occupiedLockers and lockerRow[4].strip() == ''
    availLockerList = []

    lockerReader = csv.reader(args['lockers'], dialect='excel')
    next(lockerReader)
    availLocker = list(row for row in lockerReader if isAvailable(row))
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
        grade = todoOrders[G.nodes[orderNodeId]['order']]
        room = grade2Room[grade]
        roomPosition = roomPositions[room]

        for lockerId in range(m):
            lockerNodeId = lockerId + n
            locker = G.nodes[lockerNodeId]['locker']
            w = computeWeight(roomPosition, lockerPositions[locker.id()])
            G[orderNodeId][lockerNodeId]['weight'] = w

    # ###########################################################
    # Compute minimal weight matching of weighted bipartite graph

    M = nx.min_weight_matching(G)
    remainingAssignment = []

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

        remainingAssignment.append((orderKey, grade, str(level), str(lItem.id()) + '/' + str(lItem.box())))

    # Add previously assigned orders to remaining assignment.
    for assignedOrder in assignedOrders:
        remainingAssignment.append((assignedOrder[5].strip(), assignedOrder[6].strip().upper(), assignedOrder[7][0], assignedOrder[9]))

    # Sort final assignment and print list
    finalAssignment = sorted(remainingAssignment, key = operator.itemgetter(1, 0))
    for x in finalAssignment:
        print(x[0],x[1],x[3],x[2], sep=';')

# Define main method.
# main() will be executed
if __name__ == '__main__':
    main()
