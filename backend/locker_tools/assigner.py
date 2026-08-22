import logging

import networkx as nx

from locker_tools.assignee import Assignee
from locker_tools.locker import Locker
from locker_tools.locker_manager import LockerManager

logger = logging.getLogger(__name__)

WEIGHT_OFFSETS = [[0, 1000, 4000, 8000],
                  [1000, 0, 1000, 4000],
                  [4000, 1000, 0, 1000, 4000],
                  [8000, 4000, 0, 0]]

GRADE_TO_ROOM = {'5N': 'R8', '6N': 'R10',
                 '7A': 'R6', '7B': 'R7', '7N': 'R232',
                 '8A': 'R341', '8B': 'R236', '8N': 'R122', '8': 'R118',
                 '9A': 'R225', '9B': 'R120', '9N': 'R119', '9': 'R233',
                 '10A': 'R226', '10B': 'R118', '10C': 'R233', '10N': 'R234',
                 'WK': 'R343',
                 '11': 'R100', '12': 'R100'}

ROOM_POSITIONS = {'R10': 16, 'R8': 17, 'R6': 9, 'R7': 13,
                  'R118': 109, 'R119': 113, 'R120': 116, 'R122': 117,
                  'R225': 201, 'R226': 202, 'R232': 209, 'R233': 213, 'R234': 216, 'R236': 217,
                  'R341': 310, 'R100': 150}

LOCKER_POSITIONS = {35: 3, 10: 4, 5: 6, 4: 7, 3: 8, 14: 10, 2: 11, 1: 12, 17: 14, 34: 15, 12: 18, 11: 19,
                    30: 103, 13: 104, 29: 106, 16: 107, 28: 108, 9: 110, 8: 111, 7: 112, 6: 114, 22: 115, 18: 118, 31: 119,
                    25: 203, 27: 204, 26: 206, 24: 207, 15: 208, 23: 210, 21: 211, 20: 212, 19: 214, 33: 215, 32: 216}


def compute_weight(classroom_position: int, locker_position: int) -> int:
    classroom_floor = classroom_position // 100
    locker_floor = locker_position // 100
    offset = WEIGHT_OFFSETS[classroom_floor][locker_floor]
    return abs(classroom_position - locker_position) + offset


def _room_position(assignee: Assignee) -> int | None:
    room = GRADE_TO_ROOM.get(assignee.grade)
    if room is None or room not in ROOM_POSITIONS:
        return None
    return ROOM_POSITIONS[room]


def _warn_no_locker(assignee: Assignee) -> None:
    logger.warning("No locker available for %s %s (grade %s)",
                   assignee.forename, assignee.surname, assignee.grade)


def assign_lockers(assignees: list[Assignee], manager: LockerManager) -> list[tuple[Assignee, Locker]]:
    """Match assignees to available lockers by minimum-weight bipartite matching.

    Assignees whose grade has no known classroom position are skipped with a
    warning. The result preserves the input order of the matched assignees; if
    there are fewer lockers than assignees, the unmatched ones are warned about.
    """
    available = manager.available_lockers()

    matchable: list[tuple[Assignee, int]] = []
    for assignee in assignees:
        position = _room_position(assignee)
        if position is None:
            logger.warning("Skipping %s %s: unknown grade %r",
                           assignee.forename, assignee.surname, assignee.grade)
            continue
        matchable.append((assignee, position))

    n, m = len(matchable), len(available)
    matching: set = set()
    if n and m:
        graph = nx.complete_bipartite_graph(n, m)
        for i, (_, room_position) in enumerate(matchable):
            for j, locker in enumerate(available):
                graph[i][j + n]['weight'] = compute_weight(room_position, LOCKER_POSITIONS[locker.id()])
        matching = nx.min_weight_matching(graph)

    locker_by_index: dict[int, Locker] = {}
    for u, v in matching:
        if u >= n:
            u, v = v, u
        locker_by_index[u] = available[v - n]

    pairs: list[tuple[Assignee, Locker]] = []
    for i, (assignee, _) in enumerate(matchable):
        if i in locker_by_index:
            pairs.append((assignee, locker_by_index[i]))
        else:
            _warn_no_locker(assignee)
    return pairs
