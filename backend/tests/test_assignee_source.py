import io
import logging

from locker_tools.assignee import Assignee
from locker_tools.assignee_source import from_orders


class TestFromOrders:
    def test_reads_rows_into_assignees(self):
        text = (
            "forename,surname,grade,payment_date,amount,source_file\n"
            "Ada,Byron,7A,1.8.2026,50,\n"
            "Bob,Ross,9B,2.8.2026,25,\n"
        )
        assert from_orders(io.StringIO(text)) == [
            Assignee(forename="Ada", surname="Byron", grade="7A", amount=50),
            Assignee(forename="Bob", surname="Ross", grade="9B", amount=25),
        ]

    def test_empty_amount_defaults_to_zero(self):
        text = "forename,surname,grade,payment_date,amount,source_file\nAva,Nix,9B,,,\n"
        assert from_orders(io.StringIO(text))[0].amount == 0

    def test_duplicate_entries_are_kept_and_warned(self, caplog):
        text = (
            "forename,surname,grade,payment_date,amount,source_file\n"
            "Peter,Pan,6N,25.6.2026,50,\n"
            "Peter,Pan,6N,25.6.2026,50,\n"
        )
        with caplog.at_level(logging.WARNING):
            assignees = from_orders(io.StringIO(text))
        assert len(assignees) == 2
        assert "Peter" in caplog.text
