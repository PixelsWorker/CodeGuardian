# Repository Guidelines

## Project Structure & Module Organization

The repository root is `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`. Run repository-relative commands here. Read the parent workspace guide at `../AGENTS.md` as well.

The parent workspace contains sibling `evidence/`, `worktree/`, and `CodeGuardian/` directories. Evidence originals live in `../evidence/CodeGuardian-Architecture-Packet/`; preserve them when editing repository copies.

This repository contains `AGENTS.md` and ten planning documents. Start with `README.md`, then consult `ARCHITECTURE.md`, `API-CONTRACT.md`, `SETUP.md`, and `G00-SCOPE.md`. No application source, tests, assets, package manifest, or build system is configured.

## Build, Test, and Development Commands

- `git status -sb`: inspect branch and working tree.
- `git diff --check`: check unstaged changes for whitespace errors.
- `git diff --cached --check`: check staged changes for whitespace errors.
- `git diff --stat`: summarize local changes.

No build, development, lint, or application test commands exist yet. Document exact commands when tooling is approved and introduced.

## Coding Style & Naming Conventions

Use concise Markdown with descriptive headings and explicit proposed or verified status. Follow existing uppercase planning filenames, such as `ARCHITECTURE.md`. TypeScript and Node.js remain proposed; no formatter, linter, or code indentation standard is established. Serialized contract examples use `snake_case` keys.

## Testing Guidelines

No test framework or coverage threshold is configured. Verify documentation against observed repository facts and review links and whitespace. Future tests should cover contract validation and publication safeguards. G00 is a draft mock CLI demonstration; label all simulated results clearly.

## Commit & Pull Request Guidelines

Current documentation branch: `dev`, at baseline `1b9f8bd`, synchronized with `origin/dev`. History includes imperative subjects and a `feat:` prefix. Use concise subjects and describe scope, validation, relevant issues, and terminal captures in pull requests.

Local `main` (`1bb5757`) is an ancestor of `dev`; `origin/main` (`dfe6daa`) has an independent history. Preserve both histories. Require explicit authorization for branches, worktrees, staging, commits, pushes, merges, dependency additions, and deployments. Do not reset, blindly pull, or force-push. Documentation delivery does not approve architecture or G00 implementation.
