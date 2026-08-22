from locker_tools.assignee import Assignee


class TestAssignee:
    def test_holds_person_fields(self):
        a = Assignee(forename="Ada", surname="Byron", grade="9B", amount=50)
        assert (a.forename, a.surname, a.grade, a.amount) == ("Ada", "Byron", "9B", 50)

    def test_amount_defaults_to_zero(self):
        assert Assignee(forename="Ada", surname="Byron", grade="9B").amount == 0
