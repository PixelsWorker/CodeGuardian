# Repository Guidelines

## Authority and project boundaries

Repository: https://github.com/PixelsWorker/CodeGuardian.
**Historical Windows path (not a verified current checkout):** `E:\Projects\CodeGuardian\CodeGuardian\`. Read the parent workspace `../AGENTS.md` and the full-stack project rules before modifying files.

Rockson approves consequential scope, dependencies, architecture and Git actions. ChatGPT researches and plans; the Development Manager reviews setup/groups; Codex implements specifically approved work; GeminiCLI/Antigravity handles separately approved narrow corrections. Do not infer authorization to create branches, install packages, modify application code, publish comments, merge or deploy from planning documents.

## Repository layout and reality

- `src/`, `index.html`, `vite.config.ts`, `package.json`: nine-screen **React/Vite browser G00 UX reference**, synthetic fixtures and tests, **FROZEN at `e8e5844`**. Do not extend this browser prototype.
- `ink/`: merged **mock-only native Ink terminal application** delivered in PR #1 (`ee9575e`) with follow-up corrections in PR #4 (`0e5e95c`), PR #5 (`cf39f19`) and PR #6 (`9d8e7d6`). It includes the `codeguardian` CLI, screens, components, core logic and tests. G00 is merged but still awaits Rockson’s formal nine-screen UX acceptance; merge is not acceptance.
- `integrations/pr-agent/`: future G04 plain-diff adapter (not yet created). Isolated from `ink/`; no direct GitHub access.
- `G00-SCOPE.md` and `G00-CLI-WIREFRAMES.md`: G00 native terminal scope and UX reference; formal operator acceptance remains pending.
- `ARCHITECTURE.md`, `PROJECT-BRIEF.md`, `ROADMAP.md`: proposed product architecture and group roadmap. G06/Jules repository audit is OPTIONAL/PROPOSED and cannot silently expand G00.
- `API-CONTRACT.md`: canonical proposed PR review JSON contract; separately proposed repository-wide audit schema in its G06 section. Never relax PR changed-line validation to admit non-PR audit findings.
- `TECH-RESEARCH.md`, `SETUP.md`, `HANDOFF.md`, `REPO-INITIALIZATION.md`, `README.md`: evidence, preparation and governance.
- Sibling `../evidence/` and `../worktree/` (workspace root, not in repo): do not overwrite existing evidence or assume a worktree exists.

## Checks and development

Before approved local activity: inspect `git status -sb`, `git status --porcelain=v1`, `git rev-parse HEAD`, `git remote -v`, branch/worktree state and unfinished Git operations. Verify exact commands/results if you run tests; do not run untrusted repository scripts, arbitrary PR code or dependency installation as part of an audit without permission.

Keep mock fixtures synthetic and marked DEMO ONLY, with no real GitHub/Codex/Jules calls during G00. Preserve `NO_COLOR`, narrow-terminal and cancellation behavior in native G00 acceptance. Store no secrets in repository files, prompts, fixtures, browser bundles or logs.

## Git history and status

**Verified repository state (2026-10-27):** canonical local `dev` and `origin/dev` are at `9d8e7d6e8876b3a78e0fc1e623a5d50220898987`, the PR #6 merge. `main` and `origin/main` are at `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f`. Only the canonical `dev` worktree is currently registered. Six governance files are locally modified and preserved; do not discard, stage, commit or publish them without separate approval. The PR #4, #5 and #6 feature worktree paths are absent, but archive-before-retirement compliance is unverified; absence is not proof of authorized retirement. The parent workspace `AGENTS.md` contains a stale statement that no application source exists; this repository file does not authorize changing that separately protected parent file.

The G00 PR #5 audit and later PR #6 review receipts record an unresolved npm high-severity audit warning. The user-provided PR #6 install transcript separately warns that install scripts for esbuild 0.28.2 and 0.25.12 are not covered by `allowScripts`. No dependency fix was run. Treat these as open review/disposition items; do not approve scripts or alter dependencies without separate authorization.

Original unrelated histories have been reconciled by two-parent commit `e3e6b281e517a2d884309d527650ba9329e76d8e`; no history-integration task remains.

**2026-10-16 governance patch baseline (local verified):**
- `main` HEAD: `e8e58443c9e13129bc2ee9459751c9944eef3da9` — browser reference frozen here; snapshot fingerprinting implementation.
- Branch tracking: `origin/main` — zero divergence at patch time.

Historical remote-only checkpoints (pre-patch):
- `main` pre-patch remote: `3c9db33177e7ee8e2c6310ac05af21839f0cac08` (React/Vite G00 reference and documents).
- `dev` pre-patch: `a39a37525ba5a5645dec8e382be0f47c735d1d0e` (planning baseline).

Re-read live branch heads before each operation. A commit to this governance documentation does not approve G00 implementation, G06 execution, Jules access, license choice or production release.
