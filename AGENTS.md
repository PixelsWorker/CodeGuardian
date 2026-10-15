# Repository Guidelines

## Authority and project boundaries

Repository: https://github.com/PixelsWorker/CodeGuardian.
Documented Fedora checkout: `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`. Read the parent workspace `../AGENTS.md` and the full-stack project rules before modifying files. The local working tree and the parent guide were **not** inspected by this remote-only update.

Rockson approves consequential scope, dependencies, architecture and Git actions. ChatGPT researches and plans; the Development Manager reviews setup/groups; Codex implements specifically approved work; GeminiCLI/Antigravity handles separately approved narrow corrections. Do not infer authorization to create branches, install packages, modify application code, publish comments, merge or deploy from planning documents.

## Repository layout and reality

- `src/`, `index.html`, `vite.config.ts`, `package.json`, `bun.lock`: existing nine-screen **React/Vite browser G00 UX reference**, synthetic fixtures and test source on remote `main`. This is not an accepted native CLI and not proof that tests passed.
- `G00-SCOPE.md` and `G00-CLI-WIREFRAMES.md`: draft complete **native terminal CLI** G00 acceptance target; actual native executable is unverified.
- `ARCHITECTURE.md`, `PROJECT-BRIEF.md`, `ROADMAP.md`: proposed product architecture and group roadmap. G06/Jules repository audit is OPTIONAL/PROPOSED and cannot silently expand G00.
- `API-CONTRACT.md`: canonical proposed PR review JSON contract; separately proposed repository-wide audit schema in its G06 section. Never relax PR changed-line validation to admit non-PR audit findings.
- `TECH-RESEARCH.md`, `SETUP.md`, `HANDOFF.md`, `REPO-INITIALIZATION.md`, `README.md`: evidence, preparation and governance.
- Documented sibling `../evidence/` and `../worktree/`: do not overwrite existing evidence or assume a worktree exists.

## Checks and development

Remote `package.json` declares `dev`, `build`, `lint`, `test` and `preview` scripts for the browser reference. The scripts and test files exist; **this documentation review did not execute them**. Do not claim the browser UX has passed or the native CLI is implemented.

Before approved local activity: inspect `git status -sb`, `git status --porcelain=v1`, `git rev-parse HEAD`, `git remote -v`, branch/worktree state and unfinished Git operations. Verify exact commands/results if you run tests; do not run untrusted repository scripts, arbitrary PR code or dependency installation as part of an audit without permission.

Keep mock fixtures synthetic and marked DEMO ONLY, with no real GitHub/Codex/Jules calls during G00. Preserve `NO_COLOR`, narrow-terminal and cancellation behavior in native G00 acceptance. Store no secrets in repository files, prompts, fixtures, browser bundles or logs.

## Git history and status

Original unrelated histories have been reconciled by two-parent commit `e3e6b281e517a2d884309d527650ba9329e76d8e`; no history-integration task remains. On 2026-10-15 this update's **remote read-only baseline** was:
- `main`: `3c9db33177e7ee8e2c6310ac05af21839f0cac08` (React/Vite G00 reference and documents).
- `dev`: `a39a37525ba5a5645dec8e382be0f47c735d1d0e` (planning baseline).

These are historical verified SHAs; re-read live branch heads before each operation. Local branch locations, clean status, authentication and toolchain are UNKNOWN until checked. A commit to this governance documentation does not approve G00 implementation, G06 execution, Jules access, license choice or production release.
