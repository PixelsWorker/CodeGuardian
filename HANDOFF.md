# CodeGuardian - Development Manager Handoff

**Prepared:** 2026-10-15
**Status:** PREPARED - NOT TRANSFERRED; this is a repository planning handoff, not authorization to start G00 or G06 implementation.
**Product/group:** CodeGuardian / PRE-G00 architecture and setup review.

## Goal and separate workflows

The proposed primary product is a **native CLI-first GitHub PR reviewer**. A deterministic Manager coordinates bounded Codex specialist workers and independent source checks, while a separately authorized deterministic publisher handles future `COMMENT` reviews.

**Existing G00 evidence:** `main` contains a nine-screen React/Vite *browser* terminal-style mock and test source; native CLI implementation and explicit G00 acceptance are NOT VERIFIED. The browser reference may guide UX review but does not substitute for the required native terminal walkthrough.

**Optional G06 proposal:** Use Google Jules for repository-wide candidate findings, a pinned Git snapshot and tracked-file inventory, independent Manager source verification, coverage ledger, preliminary `JULES-AUDIT.md`, and separately approved final `AUDIT.md`. This is not part of G00 or the currently forecast G00–G05 groups.

## Verified remote state and limits

| Ref | Verified prior-to-update SHA | Evidence |
|---|---|---|
| `main` | `3c9db33177e7ee8e2c6310ac05af21839f0cac08` | Browser mock, package manifest, test source, planning docs, Vite host configuration |
| `dev` | `a39a37525ba5a5645dec8e382be0f47c735d1d0e` | Documentation baseline, no browser package manifest |

Reconciliation of independent Git histories is DONE (historical merge `e3e6b281e517a2d884309d527650ba9329e76d8e`); do not repeat it. The original branch SHAs above are timestamped checkpoints, not future instructions.

Canonical Fedora checkout: `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`. Its current clean status, branch, worktrees, sandbox (`bwrap`), Node/package tool, Docker and authenticated account state are UNKNOWN to this review. `.coderabbit.yaml` was reported locally but is absent from the inspected remote `main` tree. No build/test was executed.

## Governing documents and approval gates

- `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `ROADMAP.md`: proposed architecture; G06 D-09 remains proposed.
- `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`: required mock-only **native CLI** journey and acceptance tests; browser reference is not enough.
- `API-CONTRACT.md`: canonical PR findings rules; proposed repository-wide audit types must not defeat PR changed-hunk checks.
- `TECH-RESEARCH.md`: current official Jules API evidence plus known untested runtime details.
- `SETUP.md` and `REPO-INITIALIZATION.md`: current remote observations and Git history.

**Pending decisions:** architecture D-01–D-08 and G00 scope/stack acceptance; native CLI vs browser UX mapping; approved local execution approach (including prior reported `bwrap` issue); license/protection rules; allowed implementation paths and Git actions. G02 Codex auth, G04 provider setup, G05 webhooks and optional G06 Jules pilot are later gates.

## Next requested action / stop

**Development Manager: review setup, architecture and full G00 design only.** Independently inspect the local checkout and actual test results, identify missing authorizations, and request the exact group plan approval before passing bounded implementation to Codex. G01 is blocked until Rockson explicitly approves the complete G00 native CLI demo.

G06 requires a separate pilot approval for source/mirror and Jules permissions, plan review, rate/cost policy, snapshot proof and report publication. No Jules session, external repo grant, app installation, report publication, implementation, deployment, merge or release has been executed by this handoff.
