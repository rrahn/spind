from locker_tools.assignee import Assignee
from locker_tools.locker import Locker
from locker_tools.output import write_csv


class TestWriteCsv:
    def test_writes_paste_ready_rows_betrag_to_spind(self, tmp_path):
        pairs = [
            (Assignee(forename="Ada", surname="Byron", grade="7A", amount=50), Locker(1, 1)),
            (Assignee(forename="Bob", surname="Ross", grade="9B", amount=0), Locker(30, 1)),
        ]
        out = tmp_path / "paste.csv"

        write_csv(out, pairs)

        lines = out.read_text(encoding="utf-8").splitlines()
        # 10 columns D..M: Betrag, <E>, Vorname, Name, Klasse, <Tel>, <Email>, <Etage>, <Bemerkung>, Spind
        assert lines == [
            "50;;Ada;Byron;7A;;;;;1/1",
            "0;;Bob;Ross;9B;;;;;30/1",
        ]

    def test_betrag_keeps_fractional_amount(self, tmp_path):
        pairs = [(Assignee(forename="Eli", surname="Ott", grade="12", amount=12.5), Locker(5, 1))]
        out = tmp_path / "paste.csv"

        write_csv(out, pairs)

        assert out.read_text(encoding="utf-8").splitlines() == ["12.5;;Eli;Ott;12;;;;;5/1"]
