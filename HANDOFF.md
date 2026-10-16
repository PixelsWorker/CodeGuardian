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
- **PR-Agent security correction (2026-10-16):** Plain-diff mode avoids requiring a GitHub platform token, but that alone does not guarantee the process has zero access to credentials. The runner must also explicitly: (1) isolate filesystem access — mount only the prepared diff, no host paths with tokens or keys; (2) strip all GitHub/Codex/SSH credential environment variables from the PR-Agent process; (3) block access to credential stores (`~/.config/gh`, `~/.ssh`, token files). These are separate explicit runner requirements, not implicit consequences of plain-diff mode. Provider API access (PR-Agent's own model provider) and sending source diffs externally require separate approval.


**Target repository layout after Ink package creation (not yet created):**
```
E:\Projects\CodeGuardian\
├── evidence\                  Reference & governance evidence
├── worktree\
│   └── PixelsWorker\CodeGuardian\
│       └── feat-g00-ink-cli-demo\  Dedicated feature worktree
│           └── ink\                Native terminal application (target)
│               ├── package.json
│               └── src\
└── CodeGuardian\              Git repository root
    ├── .git\
    ├── src\                   Browser UX reference — FROZEN at e8e5844
    ├── integrations\
    │   └── pr-agent\          Future G04 adapter
    └── [governance docs]
```

**Existing G00 browser prototype walkthrough:** operator walkthrough of the nine-screen browser UX has been accepted as the design reference. Native CLI implementation and explicit G00 Ink acceptance are NOT VERIFIED. The browser reference guides UX; the native terminal walkthrough is the required G00 deliverable.

**Optional G06 proposal:** Use Google Jules for repository-wide candidate findings, a pinned Git snapshot and tracked-file inventory, independent Manager source verification, coverage ledger, preliminary `JULES-AUDIT.md`, and separately approved final `AUDIT.md`. This is not part of G00 or the currently forecast G00–G05 groups. G06 remains a separate optional integration and does not delay G00–G03 MVP.

## Verified local state (2026-10-16 governance patch)

| Ref | Verified SHA | Evidence |
|---|---|---|
| `main` local HEAD | `881ec9b3e3793e15f84df5a10ffdf7a5fab43647` | Checkout path corrected to nested repository; zero divergence from `origin/main` |
| `origin/main` remote | `881ec9b3e3793e15f84df5a10ffdf7a5fab43647` | Verified synchronized on remote GitHub |
| `feat/g00-ink-cli-demo` | `881ec9b3e3793e15f84df5a10ffdf7a5fab43647` | Local dedicated worktree for G00 Ink CLI |

**Active Windows checkout:** `E:\Projects\CodeGuardian\CodeGuardian\` (nested repository root).
Git worktree: primary repository plus dedicated feature worktree at `..\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\`. `git fsck` clean. Remote: `git@github.com:PixelsWorker/CodeGuardian.git`.

Reconciliation of independent Git histories is DONE (historical merge `e3e6b281e517a2d884309d527650ba9329e76d8e`); do not repeat it.

## Governing documents and approval gates

- `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `ROADMAP.md`: proposed architecture; G06 D-09 remains proposed.
- `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`: required mock-only **native CLI** journey and acceptance tests; browser reference is not enough.
- `API-CONTRACT.md`: canonical PR findings rules; proposed repository-wide audit types must not defeat PR changed-hunk checks.
- `TECH-RESEARCH.md`: current official Jules API evidence plus known untested runtime details.
- `SETUP.md` and `REPO-INITIALIZATION.md`: current remote observations and Git history.

**Pending decisions:** architecture D-01–D-08 and G00 scope/stack acceptance (Ink 8.0, Node 24 LTS, TypeScript, npm 11.17.0); approved local execution approach (Windows Terminal); exact dependency versions and G00 feature branch/worktree; license/protection rules. G02 Codex auth, G04 provider setup, G05 webhooks and optional G06 Jules pilot are later gates.

## Next requested action / stop

**Development Manager: review setup, accepted product direction decisions, and full G00 Ink design only.** Independently inspect the local checkout and actual test results, identify missing authorizations, and request the exact group plan approval before passing bounded implementation to Codex. G01 is blocked until Rockson explicitly approves the complete G00 native Ink CLI demo.

G06 requires a separate pilot approval for source/mirror and Jules permissions, plan review, rate/cost policy, snapshot proof and report publication. No Jules session, external repo grant, app installation, report publication, implementation, deployment, merge or release has been executed by this handoff.

