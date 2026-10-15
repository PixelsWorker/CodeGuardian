# SETUP - CodeGuardian

**Updated:** 2026-10-15 (remote GitHub review, not local setup verification).
**State:** PRE-G00 design/setup review; G00 native CLI acceptance and proposed Jules G06 integration NOT APPROVED.

## Repository evidence

| Item | State |
|---|---|
| Repository | https://github.com/PixelsWorker/CodeGuardian (public) |
| Remote `main` prior to governance update | `3c9db33177e7ee8e2c6310ac05af21839f0cac08` |
| Remote `dev` at inspection | `a39a37525ba5a5645dec8e382be0f47c735d1d0e` |
| Git history | Reconciled through historical two-parent merge `e3e6b281e517a2d884309d527650ba9329e76d8e` |
| Browser reference | React/Vite nine-screen G00 mock, source/test files and `package.json` on `main` |
| Native terminal CLI | NOT VERIFIED implemented/accepted |
| Local checkout | Reported path `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`; actual HEAD and status UNKNOWN |
| Local `.coderabbit.yaml` | User reported path; **absent from remote** `main` at inspection |

Unlike old setup records, remote `main` is no longer an empty documentation repository, and reconciliation is not pending. The checked-in `bun.lock` and React/Vite packages belong to the browser reference and do not authorize migration or select the native CLI stack.

## Existing prototype / claimed commands

Remote `package.json` declares `dev`, `build`, `lint`, `test` and `preview` scripts for the browser mock. A Vitest test suite exists; **no install, build, lint, browser walkthrough or test was run during this documentation task**. A prior commit added centralized Vite host validation; its runtime behavior remains untested here.

## Proposed future stack and gates

| Stage | Technology and purpose | State |
|---|---|---|
| G00 native CLI | Supported Node.js LTS / TypeScript terminal UI (Ink candidate), controlled commands, mock fixtures | Proposed; exact versions/host compatibility and scope acceptance pending |
| G01 | `gh` / GitHub API, read-only PR inspection | Later |
| G02 | Official Codex CLI/TypeScript SDK, bounded analysis workers | Later |
| G03 | Separate human-confirmed GitHub `COMMENT` publisher | Later |
| G04 | Optional PR-Agent A2A adapter | Later |
| G05 | Separately authorized GitHub App/webhooks | Later |
| G06 | Optional Google Jules `v1alpha` full-repository audit + independent Manager verification | Proposed only; pilot first |

No real API, AI worker, GitHub write, production HTTP service, Jules connection, Docker image, local database or backend was verified by this remote-only update.

## Security and permissions

Read parent workspace guidance and `AGENTS.md` before local work. Verify the current local Git branch, cleanliness, actual runtime, container/sandbox permissions and `bwrap` behavior; stop on unexpected divergence. No worker should obtain publisher credentials. Jules uses separate API credentials and a GitHub App; a prompt asking for read-only analysis cannot enforce a non-writing cloud environment.

Do not broaden G00 for G06. A G06 pilot needs independently approved repository/mirror identity, API/App access, cloud plan approval, cost/timeout bounds, snapshot proof and data-retention policy. Never store credentials in repo, prompt, fixture or browser bundle.

## Next manager gate

Review proposed architecture, native G00 UX, the existing browser reference and actually verified environment. Rockson must explicitly approve the implementation scope, exact Git targets and dependency actions before Codex work. Further commit/push/PR/merge, Jules sessions and live code reviews are not approved by this file alone. Refer to `HANDOFF.md`.
