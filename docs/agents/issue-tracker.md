# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create: `gh issue create --title "..." --body "..."`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open`; add label/state filters when relevant.
- Comment: `gh issue comment <number> --body "..."`.
- Label: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: explain first with an issue comment, then run `gh issue close <number>`.
- Use GitHub sub-issues and native issue dependencies when available; otherwise record parent/blocker links in the issue body.

Run commands from this clone so `gh` infers the repo. Before the first issue creation in a session, confirm the target with `gh repo view --json nameWithOwner`; only create issues in `rrahn/spind` when that is the user's repo.

## Pull requests

PRs are not a triage/request surface by default. Change this only if the repo explicitly adopts that workflow.

When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch a ticket, use `gh issue view`.
