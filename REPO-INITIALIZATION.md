# CodeGuardian - Repository Initialization and Git History Record

**Initial history:** 2026-10-14; **remote-state review:** 2026-10-15.
**Status:** Git integration COMPLETED; old unrelated histories are preserved.

## Historical commits (provenance, not current branches)

| Checkpoint | Commit | Explanation |
|---|---|---|
| Original remote `main` | `dfe6daa7190a24215ccfc5537e5780fe56b2909d` | Initial independent remote commit |
| Original development root | `1bb57572f3c1a544c71bb6e519f4428db22e3086` | Separate development history |
| Documentation delivery | `1b9f8bd7422548e0f05cdd7d445b9ea4a8be6ff7` | Initial architecture packet |
| DOC-01 | `f115f7d2e87b63a4d0ddf1aa70522fc9e7f1ab67` | Documentation correction |
| Reconciliation | `e3e6b281e517a2d884309d527650ba9329e76d8e` | Two-parent merge preserving original histories |

The earlier unrelated-history problem is resolved. Never repeat the integration procedure, force-push, reset a branch or mistake the historical local `main` for current remote `main`.

## Verified branch snapshots at 2026-10-15 inspection

- Remote `main`: `3c9db33177e7ee8e2c6310ac05af21839f0cac08`, includes the React/Vite browser UX prototype, TypeScript source, test files and planning Markdown documents.
- Remote `dev`: `a39a37525ba5a5645dec8e382be0f47c735d1d0e`, a documentation baseline without the browser package manifest.
- Named local path `.coderabbit.yaml` was not present in remote `main`. Local contents/status were not inspected.

These SHAs describe a **pre-governance-update** state; use fresh live Git references before future work.

## Open product work, not Git history work

Native G00 terminal UX remains draft/unaccepted; the browser mock is only a design reference. Architecture and runtime need development-manager review. G06 Google Jules is proposed and optional, independent of G00-G05. License, repository protection, dependency setup, credential isolation and new code execution require their own decisions.

A governance documentation update does not approve model execution, Jules sessions, a feature branch, application changes, PR creation/merge, comments or deployments. Existing local worktrees must be inspected before any permitted Git operation.
