# CodeGuardian - Development Manager Handoff

**Prepared:** 2026-10-15 / **Updated:** 2026-10-16 (governance patch)
**Status:** UPDATED — repository relocated and governance patch applied; browser prototype frozen; Ink CLI direction accepted. This handoff records the decisions, not authorization to start G00 implementation.
**Product/group:** CodeGuardian / PRE-G00 architecture and setup review.

## Goal and separate workflows

The accepted product is a **native CLI-first GitHub PR reviewer** running inside Windows Terminal, Warp, Kitty, GNOME Terminal and other compatible terminals. A deterministic Manager coordinates bounded Codex specialist workers and independent source checks, while a separately authorized deterministic publisher handles future `COMMENT` reviews.

**Accepted product direction decisions (2026-10-16):**
- CodeGuardian is a native terminal application, not a standalone desktop application.
- The browser prototype (`src/`) is FROZEN at `e8e5844` as the UI/UX walkthrough reference only. No further browser prototype development is authorized; it is not the finished product.
- Implementation sequence: G00/G06 browser reference (complete) → G00 native Ink CLI → G01–G03 functional MVP → G04 optional PR-Agent → Post-MVP browser dashboard + WebMCP.
- Google Jules G06 remains a separate optional integration and does not delay the PR-review MVP.
- PR-Agent stays outside `ink/`, behind a CodeGuardian adapter. First G04 implementation: pass a validated, pinned diff to an isolated PR-Agent process. No direct GitHub access from PR-Agent.
- PR-Agent isolation note: plain-diff mode avoids a GitHub platform token but does not guarantee zero credential access. Runner must explicitly isolate filesystem access, environment variables, and GitHub credentials. Provider API access and sending source diffs externally require separate approval.

**Target repository layout after Ink package creation (not yet created):**
```
E:\Projects\CodeGuardian\
├── .git\
├── src\                   Browser UX reference — FROZEN at e8e5844
├── ink\                   Native terminal application (target)
│   ├── package.json
│   └── src\
├── integrations\
│   └── pr-agent\          Future G04 adapter
└── [governance docs]
```

**Existing G00 browser prototype walkthrough:** operator walkthrough of the nine-screen browser UX has been accepted as the design reference. Native CLI implementation and explicit G00 Ink acceptance are NOT VERIFIED. The browser reference guides UX; the native terminal walkthrough is the required G00 deliverable.

**Optional G06 proposal:** Use Google Jules for repository-wide candidate findings, a pinned Git snapshot and tracked-file inventory, independent Manager source verification, coverage ledger, preliminary `JULES-AUDIT.md`, and separately approved final `AUDIT.md`. This is not part of G00 or the currently forecast G00–G05 groups. G06 remains a separate optional integration and does not delay G00–G03 MVP.

## Verified local state (2026-10-16 governance patch)

| Ref | Verified SHA | Evidence |
|---|---|---|
| `main` local HEAD | `e8e58443c9e13129bc2ee9459751c9944eef3da9` | Browser reference + snapshot fingerprinting; clean working tree; zero divergence from `origin/main` |
| `main` pre-patch remote | `3c9db33177e7ee8e2c6310ac05af21839f0cac08` | Browser mock, package manifest, test source, planning docs |
| `dev` pre-patch | `a39a37525ba5a5645dec8e382be0f47c735d1d0e` | Documentation baseline |

**Active Windows checkout:** `E:\Projects\CodeGuardian\` (relocated 2026-10-16; previously at `E:\Projects\CodeGuardian\CodeGuardian\`).
Git worktree: single worktree only, no linked worktrees. `git fsck` clean. Remote: `git@github.com:PixelsWorker/CodeGuardian.git`.

Reconciliation of independent Git histories is DONE (historical merge `e3e6b281e517a2d884309d527650ba9329e76d8e`); do not repeat it.

## Governing documents and approval gates

- `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `ROADMAP.md`: proposed architecture; G06 D-09 remains proposed.
- `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`: required mock-only **native CLI** journey and acceptance tests; browser reference is not enough.
- `API-CONTRACT.md`: canonical PR findings rules; proposed repository-wide audit types must not defeat PR changed-hunk checks.
- `TECH-RESEARCH.md`: current official Jules API evidence plus known untested runtime details.
- `SETUP.md` and `REPO-INITIALIZATION.md`: current remote observations and Git history.

**Pending decisions:** architecture D-01–D-08 and G00 scope/stack acceptance (Ink 8.0, Node 24 LTS, TypeScript, pnpm); approved local execution approach (Windows Terminal); exact dependency versions and G00 feature branch/worktree; license/protection rules. G02 Codex auth, G04 provider setup, G05 webhooks and optional G06 Jules pilot are later gates.

## Next requested action / stop

**Development Manager: review setup, accepted product direction decisions, and full G00 Ink design only.** Independently inspect the local checkout and actual test results, identify missing authorizations, and request the exact group plan approval before passing bounded implementation to Codex. G01 is blocked until Rockson explicitly approves the complete G00 native Ink CLI demo.

G06 requires a separate pilot approval for source/mirror and Jules permissions, plan review, rate/cost policy, snapshot proof and report publication. No Jules session, external repo grant, app installation, report publication, implementation, deployment, merge or release has been executed by this handoff.

