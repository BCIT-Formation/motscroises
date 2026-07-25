# CLAUDE.md

Authoritative guide for AI assistants (and humans) working on this repository. Read it fully before making any changes. Org-wide reference material (standard files, CI/CD, Docker, code style details) lives in [SHARED-CONVENTIONS.md](SHARED-CONVENTIONS.md); this file holds the hard rules plus project specifics.

## Language

- Code, identifiers, API values, commits, branches: English.
- User-facing strings, UI, exports (PDF/CSV), business documents: French first (English as secondary locale where i18n exists).
- Replies, comments, and documentation: French preferred; always match the surrounding language of the file you are editing.

## Hard rules

- Produce the smallest possible diff. Extend existing code before creating new files. No gratuitous renames or refactors.
- Match the surrounding code: the code you write must look like the code around it. KISS, DRY, YAGNI, no premature abstraction.
- Read before writing. Never invent APIs, endpoints, or business models. If blocked by missing information, stop and ask exactly one precise question.
- Production ready only: never ship `TODO`, `FIXME`, temporary mocks, or incomplete implementations.
- Minimal dependencies: prefer the standard library and platform built-ins. Every new dependency requires an ADR entry in `DECISIONS.md`.
- Comments explain WHY, not WHAT (constraints, workarounds, invariants only).

## Git

- Never push to `main` directly. One branch per task: `feat/<topic>` or `fix/<topic>` for humans, `claude/<short-description>-<session-id>` for AI work.
- Conventional Commits for commits and PR titles: `type(scope): description` (subject <= 72 chars); types: `feat, fix, docs, style, refactor, test, chore, ci, build, perf, revert`.
- Push with `git push -u origin <branch>`. PRs are squash-merged, description: What / Why / How / Verification.
- Never force-push. Rebase only with explicit approval. No `--no-verify`, no `git add -A` (stage specific files), no git config changes.
- Do not modify CI/CD, build config, release plumbing, or signing without explicit need. Ask confirmation before deletions, major refactors, or dependency changes.

## Security (non-negotiable)

- Never commit secrets: no API keys, passwords, tokens, keystores, certificates, or personal data in git. `.env` is gitignored; only `.env.example` (placeholders) is committed. Secrets live in env vars / GitHub Actions secrets.
- Validate and sanitize all external input; escape output; parameterized SQL only, never string interpolation.
- Never log credentials or personal data (`[REDACTED]`). Least privilege everywhere. GDPR: minimise personal data collection.

## Testing

- Every behaviour change gets a corresponding test. For a bug fix, write the failing regression test first.
- Mock all external dependencies: no real network in tests, DB isolated via temp dirs/fixtures.
- CI is the source of truth: run lint and tests before committing; a green pipeline is required to merge.

## Definition of done

- [ ] Lint/format clean, tests added and passing
- [ ] Docs updated with the code (README, `TODO.md`, ADR in `DECISIONS.md` if architectural)
- [ ] Conventional Commit(s), branch pushed, PR opened with What / Why / How / Verification
- [ ] No secrets, no leftover debug code, no TODO/FIXME shipped

## Project specifics

<!-- REQUIRED: fill this in for this repository. Agents rely on exact runnable commands. -->

- Overview:
- Stack:
- Install:
- Run:
- Test:
- Lint:
- Pitfalls:
