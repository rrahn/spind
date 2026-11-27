"""Initialise local development settings without overwriting existing secrets."""

import secrets
from pathlib import Path


def main():
    path = Path(".env")
    if not path.exists():
        path.write_text(Path(".env.example").read_text())
    path.chmod(0o600)
    text = path.read_text()
    lines = text.splitlines()
    existing = {line.split("=", 1)[0]: line.split("=", 1)[1] for line in lines if "=" in line and not line.startswith("#")}
    additions = {
        "DJANGO_SECRET_KEY": secrets.token_urlsafe(48),
        "DJANGO_DEBUG": "true",
    }
    for key, value in additions.items():
        if key not in existing:
            lines.append(f"{key}={value}")
        elif not existing[key] or existing[key] == "change-me":
            lines = [f"{key}={value}" if line.startswith(f"{key}=") else line for line in lines]
    path.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
