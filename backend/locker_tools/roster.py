import re
import webbrowser
from pathlib import Path

from jinja2 import Environment, PackageLoader, select_autoescape
from openpyxl import load_workbook
from pydantic import BaseModel, ConfigDict


class RosterEntry(BaseModel):
    """A single assigned person as shown on the printable handout."""

    model_config = ConfigDict(frozen=True)

    name: str
    forename: str
    spind: str


def _grade_sort_key(grade: str) -> tuple[int, str]:
    """Natural order for grade labels: leading number first, then the rest."""
    match = re.match(r"\s*(\d+)", grade)
    number = int(match.group(1)) if match else 0
    return (number, grade.casefold())


def _entry_sort_key(entry: RosterEntry) -> tuple[str, str]:
    return (entry.name.casefold(), entry.forename.casefold())


class ClassRoster:
    """One grade (Klasse) with its ordered list of assigned persons.

    Keeps its own persons sorted by ``name`` (then ``forename``) and renders
    itself into the class-list table fragment.
    """

    def __init__(self, grade: str, entries: list[RosterEntry]):
        self._grade = grade
        self._entries = sorted(entries, key=_entry_sort_key)

    @property
    def grade(self) -> str:
        return self._grade

    @property
    def entries(self) -> list[RosterEntry]:
        return list(self._entries)

    def render(self, template) -> str:
        """Render this class's table fragment from the given Jinja template."""
        return template.render(grade=self._grade, entries=self._entries)


class RosterWriter:
    """Renders the composition of :class:`ClassRoster` tables into one HTML page.

    Owns the page-level layout: the document shell, print CSS and the
    page-break rules that keep each class table from splitting across pages.
    """

    def __init__(self, env: Environment | None = None):
        self._env = env or Environment(
            loader=PackageLoader("locker_tools", "templates"),
            autoescape=select_autoescape(["html", "xml", "j2"]),
        )

    def render(self, rosters: list[ClassRoster]) -> str:
        """Return the full HTML document for the given class rosters."""
        class_template = self._env.get_template("class_list.html.j2")
        page_template = self._env.get_template("roster.html.j2")
        tables = [roster.render(class_template) for roster in rosters]
        return page_template.render(tables=tables)

    def write(self, rosters: list[ClassRoster], output_path) -> None:
        """Render the page and write it to ``output_path`` as UTF-8 HTML."""
        Path(output_path).write_text(self.render(rosters), encoding="utf-8")


class RosterManager:
    """In-memory view of the assignment sheet, grouped into class rosters.

    Parses the assignment sheet (columns matched by header name), groups the
    assigned people by grade and hands the ordered class rosters to a
    :class:`RosterWriter` for rendering.
    """

    _COLUMNS = ("Name", "Vorname", "Klasse", "Spind")

    def __init__(self, rosters: list[ClassRoster], writer: RosterWriter | None = None):
        self._rosters = rosters
        self._writer = writer or RosterWriter()

    @classmethod
    def from_excel(cls, path, sheet_index: int = 0, writer: RosterWriter | None = None) -> "RosterManager":
        """Build a manager from the assignment sheet of an Excel workbook.

        The workbook is opened read-only; ``sheet_index`` selects the sheet
        (default: the first sheet). The header row is the first row.
        """
        workbook = load_workbook(path, read_only=True, data_only=True)
        try:
            rows = workbook.worksheets[sheet_index].iter_rows(values_only=True)
            return cls.from_rows(rows, writer=writer)
        finally:
            workbook.close()

    @classmethod
    def from_rows(cls, rows, writer: RosterWriter | None = None) -> "RosterManager":
        """Build a manager from assignment rows whose first row is the header.

        Columns are located by header name (``Name``, ``Vorname``, ``Klasse``,
        ``Spind``); case and surrounding whitespace are ignored. Parsing stops
        at the first blank row. Rows with an empty ``Spind`` or ``Klasse`` are
        skipped (only assigned people appear on the handout).
        """
        rows = iter(rows)
        header = next(rows, None)
        if header is None:
            raise RuntimeError("Corrupted assignment sheet: missing header row")
        index = cls._header_index(header)

        grouped: dict[str, list[RosterEntry]] = {}
        for raw in rows:
            row = ["" if cell is None else str(cell).strip() for cell in raw]
            if not any(row):  # blank row terminates the table
                break
            grade = cls._value(row, index["Klasse"])
            spind = cls._value(row, index["Spind"])
            if not grade or not spind:  # skip unassigned people
                continue
            grouped.setdefault(grade, []).append(
                RosterEntry(
                    name=cls._value(row, index["Name"]),
                    forename=cls._value(row, index["Vorname"]),
                    spind=spind,
                )
            )

        rosters = [
            ClassRoster(grade, grouped[grade])
            for grade in sorted(grouped, key=_grade_sort_key)
        ]
        return cls(rosters, writer=writer)

    @classmethod
    def _header_index(cls, header) -> dict[str, int]:
        lookup = {
            str(cell).strip().casefold(): i
            for i, cell in enumerate(header)
            if cell is not None
        }
        index: dict[str, int] = {}
        for name in cls._COLUMNS:
            position = lookup.get(name.casefold())
            if position is None:
                raise RuntimeError(
                    f"Corrupted assignment sheet: missing required column '{name}'"
                )
            index[name] = position
        return index

    @staticmethod
    def _value(row: list[str], position: int) -> str:
        return row[position] if position < len(row) else ""

    @property
    def rosters(self) -> list[ClassRoster]:
        return list(self._rosters)

    def write_html(self, output_path, open_after: bool = False) -> None:
        """Render the printable handout to ``output_path`` (optionally open it)."""
        self._writer.write(self._rosters, output_path)
        if open_after:
            webbrowser.open(Path(output_path).resolve().as_uri())
