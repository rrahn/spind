from locker_tools.locker import Locker


def test_equality_matches_on_id_and_box():
    assert Locker(1, 2) == Locker(1, 2)
    assert Locker(1, 2) != Locker(1, 3)
    assert Locker(1, 2) != Locker(2, 2)


def test_ordering_by_id_then_box():
    assert Locker(1, 1) < Locker(1, 2)
    assert Locker(1, 9) < Locker(2, 0)


def test_hashable_in_set():
    lockers = {Locker(1, 1), Locker(1, 1), Locker(1, 2)}
    assert len(lockers) == 2
