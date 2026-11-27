from pathlib import Path
from unittest.mock import MagicMock

import pytest

from locker_tools import local_env


@pytest.mark.parametrize("current_secret", [None, "", "change-me", "existing-private-setting"])
def test_local_setup_preserves_settings_and_initialises_secret(monkeypatch, capsys, current_secret):
    source = "POSTGRES_PASSWORD=synthetic-database-setting\n# keep this comment\n"
    if current_secret is not None:
        source += f"DJANGO_SECRET_KEY={current_secret}\n"
    config = MagicMock(spec=Path)
    config.exists.return_value = True
    config.read_text.return_value = source
    monkeypatch.setattr(local_env, "Path", lambda name: config)
    local_env.main()
    result = config.write_text.call_args.args[0]
    values = dict(line.split("=", 1) for line in result.splitlines() if "=" in line and not line.startswith("#"))
    assert values["POSTGRES_PASSWORD"] == "synthetic-database-setting"
    assert "# keep this comment" in result
    assert values["DJANGO_DEBUG"] == "true"
    if current_secret == "existing-private-setting":
        assert values["DJANGO_SECRET_KEY"] == current_secret
    else:
        assert len(values["DJANGO_SECRET_KEY"]) >= 48
    config.chmod.assert_called_once_with(0o600)
    assert capsys.readouterr().out == ""


def test_local_setup_copies_template_when_missing(monkeypatch):
    config = MagicMock(spec=Path)
    config.exists.return_value = False
    template = MagicMock(spec=Path)
    template.read_text.return_value = "POSTGRES_PASSWORD=synthetic-template-setting\n"
    config.read_text.return_value = template.read_text.return_value
    monkeypatch.setattr(local_env, "Path", lambda name: config if name == ".env" else template)
    local_env.main()
    assert config.write_text.call_args_list[0].args[0] == template.read_text.return_value
    assert "DJANGO_SECRET_KEY=" in config.write_text.call_args.args[0]
