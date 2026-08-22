from locker_tools.roster import ClassRoster, RosterEntry, RosterManager, RosterWriter

HEADER = ("Name", "Vorname", "Klasse", "Spind")


def _row(name="", forename="", grade="", spind=""):
    return (name, forename, grade, spind)


class TestRosterManagerParsing:
    def test_groups_entries_by_grade(self):
        rows = [
            HEADER,
            _row("Groh", "Lara", "8B", "1/1"),
            _row("Movradin", "Eduard", "9A", "2/1"),
            _row("Scharlott", "Marisa", "8B", "3/1"),
        ]
        manager = RosterManager.from_rows(rows)
        grades = [roster.grade for roster in manager.rosters]
        assert grades == ["8B", "9A"]

    def test_grades_are_natural_sorted(self):
        rows = [HEADER, _row("A", "A", "10A", "1/1"), _row("B", "B", "9A", "2/1"),
                _row("C", "C", "5N", "3/1")]
        manager = RosterManager.from_rows(rows)
        assert [r.grade for r in manager.rosters] == ["5N", "9A", "10A"]

    def test_entries_sorted_by_name_then_forename(self):
        rows = [
            HEADER,
            _row("Meyer", "Bob", "7N", "1/1"),
            _row("Meyer", "Ada", "7N", "2/1"),
            _row("Abel", "Zoe", "7N", "3/1"),
        ]
        manager = RosterManager.from_rows(rows)
        entries = manager.rosters[0].entries
        assert [(e.name, e.forename) for e in entries] == [
            ("Abel", "Zoe"),
            ("Meyer", "Ada"),
            ("Meyer", "Bob"),
        ]

    def test_skips_rows_without_spind_or_grade(self):
        rows = [
            HEADER,
            _row("Groh", "Lara", "8B", "1/1"),
            _row("NoSpind", "Tom", "8B", ""),
            _row("NoGrade", "Kim", "", "5/1"),
        ]
        manager = RosterManager.from_rows(rows)
        assert [e.name for e in manager.rosters[0].entries] == ["Groh"]

    def test_stops_at_first_blank_row(self):
        rows = [
            HEADER,
            _row("Groh", "Lara", "8B", "1/1"),
            _row("", "", "", ""),
            _row("Total", "", "8B", "99/1"),
        ]
        manager = RosterManager.from_rows(rows)
        assert [e.name for e in manager.rosters[0].entries] == ["Groh"]

    def test_columns_matched_by_header_name_any_order(self):
        rows = [
            ("Spind", "Klasse", "Name", "Vorname"),
            ("1/1", "8B", "Groh", "Lara"),
        ]
        manager = RosterManager.from_rows(rows)
        entry = manager.rosters[0].entries[0]
        assert (entry.name, entry.forename, entry.spind) == ("Groh", "Lara", "1/1")

    def test_missing_required_column_raises(self):
        rows = [("Name", "Vorname", "Klasse"), ("Groh", "Lara", "8B")]
        try:
            RosterManager.from_rows(rows)
        except RuntimeError as exc:
            assert "Spind" in str(exc)
        else:
            raise AssertionError("expected RuntimeError")


class TestRosterHtml:
    def test_html_contains_grades_names_and_signature_cells(self, tmp_path):
        rows = [
            HEADER,
            _row("Groh", "Lara", "8B", "1/1"),
            _row("Movradin", "Eduard", "9A", "2/1"),
        ]
        manager = RosterManager.from_rows(rows)
        out = tmp_path / "roster.html"

        manager.write_html(out)

        html = out.read_text(encoding="utf-8")
        assert ">8B<" in html
        assert ">9A<" in html
        assert "Groh" in html and "Movradin" in html
        assert "Ausgegeben" in html
        assert 'class="signature"' in html
        assert "break-inside: avoid" in html

    def test_writer_renders_class_tables_in_manager_order(self):
        rosters = [
            ClassRoster("5N", [RosterEntry(name="Abel", forename="Zoe", spind="1/1")]),
            ClassRoster("9A", [RosterEntry(name="Byron", forename="Ada", spind="2/1")]),
        ]
        html = RosterWriter().render(rosters)
        assert html.index(">5N<") < html.index(">9A<")
