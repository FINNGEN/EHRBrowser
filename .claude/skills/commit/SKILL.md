---
name: commit
description: Use whenever the user asks to commit changes (e.g. "commit this", "commit the current step", "/commit"). Reviews the diff and commits with a Conventional Commits message.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

## Context

- Current branch: !`git branch --show-current`
- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Recent commits: !`git log --oneline -10`

## Rules

- If on a protected branch (`main`, `master`, or similar), refuse and
  explain why — commit on a feature branch instead.
- Never stage files containing credentials or secrets (`.env`, API keys,
  cloud credentials, connection configs with tokens). If the diff touches
  these, stop and flag them instead of committing.
- If the diff contains merge conflict markers (`<<<<<<<`, `=======`,
  `>>>>>>>`), stop and flag instead of committing.
- Don't blindly stage everything untracked — check `.gitignore` and be
  cautious of build artifacts, caches, dependency folders, and large/binary
  or data files that don't look intentional.
- Commit everything as a single commit unless explicitly asked to split it.
- Never `git push`. Never `git commit --amend`. Only if explicitly asked.

## Commit message format

Conventional Commits with scope: `type(scope): summary`.

- **type** — `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`,
  `ci`.
- **scope** — the affected part of the codebase, inferred from changed
  paths. Omit if the change spans the whole project.
- **summary** — imperative mood, lowercase, no trailing period, based on
  the actual diff. Full line under 72 characters.

```
fix(api): correct age calculation in report
feat(db): add connection retry logic
docs(readme): update setup instructions
```

**Body (optional):** add one when the *why* isn't obvious from the diff —
cause of a bug, a tradeoff, an issue closed. Skip for small,
self-explanatory changes. Blank line after the subject, then free text
wrapped at ~72 chars; bullets are fine.

```
fix(api): correct age calculation in report

Off-by-one in the boundary check dropped the last bucket's records.

Fixes #58
```

## Your task

Based on the context above, stage and create a single commit following the
rules. If a rule blocks the commit, stop and explain why. Otherwise, stage
and commit in one message — no other tools, no extra commentary.