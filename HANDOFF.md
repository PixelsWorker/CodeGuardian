# CodeGuardian - Development Manager Handoff

**Prepared:** 2026-10-15 / **Updated:** 2026-10-27 (post-PR #6 governance reconciliation)
**Status:** G00 implementation is MERGED — FORMAL UX ACCEPTANCE PENDING. PR #1 merged to `main` at `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f`; PR #4 to `dev` at `0e5e95c74b32bfc6228a65a160f341bf49b0c34e`; PR #5 to `dev` at `cf39f19e946d102cc2e4adc2c06b80963b890215`; PR #6 to `dev`, producing current `dev` HEAD `9d8e7d6e8876b3a78e0fc1e623a5d50220898987`. PR #6 corrected the Inspection title/author layout. Its local receipts report 281/281 tests, 47/47 focused tests, 14/14 snapshots and build PASS; no independent hosted CI is evidenced. The walkthrough supports navigation but does not replace Rockson’s personal decision. Windows is DEFERRED / NOT RUN, NOT WAIVED; G01 is unauthorized.
**Product/group:** CodeGuardian / G00 Native Ink CLI closeout.

## Goal and separate workflows

The accepted product is a **native CLI-first GitHub PR reviewer** running inside Windows Terminal, Warp, Kitty, GNOME Terminal and other compatible terminals. A deterministic Manager coordinates bounded Codex specialist workers and independent source checks, while a separately authorized deterministic publisher handles future `COMMENT` reviews.

**Accepted product direction decisions (2026-10-16):**
- CodeGuardian is a native terminal application, not a standalone desktop application.
- The browser prototype (`src/`) is FROZEN at `e8e5844` as the UI/UX walkthrough reference only. No further browser prototype development is authorized; it is not the finished product.
- Implementation sequence: G00 browser reference (accepted as design reference) → G00 native Ink CLI (merged; formal acceptance pending) → G01–G03 functional MVP → G04 optional PR-Agent → post-MVP browser dashboard + WebMCP. G01 has not been authorized.
- Google Jules G06 remains a separate optional integration and does not delay the PR-review MVP.
- PR-Agent stays outside `ink/`, behind a CodeGuardian adapter. First G04 implementation: pass a validated, pinned diff to an isolated PR-Agent process. No direct GitHub access from PR-Agent.
- **PR-Agent security correction (2026-10-16):** Plain-diff mode avoids requiring a GitHub platform token, but that alone does not guarantee the process has zero access to credentials. The runner must also explicitly: (1) isolate filesystem access — mount only the prepared diff, no host paths with tokens or keys; (2) strip all GitHub/Codex/SSH credential environment variables from the PR-Agent process; (3) block access to credential stores (`~/.config/gh`, `~/.ssh`, token files). These are separate explicit runner requirements, not implicit consequences of plain-diff mode. Provider API access (PR-Agent's own model provider) and sending source diffs externally require separate approval.


**Historical planned repository layout (2026-10-16; paths not reverified current):**
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

**Historical PR #4 validation and walkthrough evidence:** PR #4 reported 277/277 tests across 16 files, focused L4 18/18, L7 snapshot PASS, and build PASS. Its follow-up receipts are under `../evidence/g00-ink-cli-demo/2026-10-24-closeout/PR4-SNAPSHOT-FOLLOWUP/`; the nine-screen walkthrough receipt and raw captures are under `../evidence/g00-ink-cli-demo/2026-10-23-closeout/ROCKSON-WALKTHROUGH-PR4/attempt-2/`. The recorded PTY environment was Linux kernel `7.2.10-200.fc44.x86_64` with Freedesktop SDK 25.08 Flatpak userspace. This supports testing, not Rockson’s personal UX acceptance or Windows verification. Windows is DEFERRED / NOT RUN, NOT WAIVED. Current PR #6 local verification receipts are summarized in the status and evidence section above.

**Optional G06 proposal:** Use Google Jules for repository-wide candidate findings, a pinned Git snapshot and tracked-file inventory, independent Manager source verification, coverage ledger, preliminary `JULES-AUDIT.md`, and separately approved final `AUDIT.md`. This is not part of G00 or the currently forecast G00–G05 groups. G06 remains a separate optional integration and does not delay G00–G03 MVP.

## Historical local state (2026-10-16 governance patch; retained)

| Ref | Verified SHA | Evidence |
|---|---|---|
| `origin/main` remote | `881ec9b3e3793e15f84df5a10ffdf7a5fab43647` | Historical remote GitHub baseline prior to local governance update |
| `main` local HEAD | `ee9a91f6de946480ff20116fa31943eee88c6a0a` | Local canonical commit reconciling G00 planning with npm & worktree |
| `feat/g00-ink-cli-demo` base | `d15473fe265a3388770c586735ac16cfc137405b` | Feature branch base commit (includes 6dd8458 scaffold, d15473f TODO-CODEX.md) |
| `feat/g00-ink-cli-demo` working | (local implementation) | Complete 25-file native Ink CLI implementation, tests, and governance corrections |

## Historical Linux host snapshot (2026-10-23)

Historical host Git receipt (captured before layout-worktree creation): `../evidence/g00-ink-cli-demo/2026-10-23-closeout/HOST-GIT-RECEIPT-2026-10-23.json`. It records the clean primary checkout at merge SHA `ee9575e` at capture time; it is not the current worktree inventory. The 2026-10-23 layout-worktree setup receipt records the then-registered `fix/g00-terminal-layout` worktree. Current canonical state is recorded below. This historical receipt does not verify any Windows checkout.

## Verified current repository state (2026-10-27)

- Canonical `dev` and `origin/dev`: `9d8e7d6e8876b3a78e0fc1e623a5d50220898987` (PR #6 merge). `main` and `origin/main`: `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f` (PR #1 merge). The PR #6 merge has parents `cf39f19e946d102cc2e4adc2c06b80963b890215` and `19ae86dcb7efac9fcfc8e6d06ffa0fac2fc2201f`.
- Before this reconciliation began, byte comparisons matched all six canonical documents to the preserved working copies under `../evidence/g00-ink-cli-demo/2026-10-26-inspection-layout-followup/canonical-working/`. The current versions include the authorized reconciliation and are therefore expected to differ from those pre-edit copies. Preserve the originals and receipts. The current six-file diff remains unstaged pending separate Git authorization.
- Only the canonical worktree is registered. PR #4/#5/#6 feature worktree paths are absent, but retirement approvals/receipts and complete final archives are not established. Preserve the archive lifecycle exception; do not infer compliant retirement from absence.
- PR #6 local verification receipts report 281/281 full tests, 47/47 focused tests, 14/14 snapshots and build PASS. No independent hosted CI run was found. Exact evidence is under `../evidence/g00-ink-cli-demo/2026-10-26-inspection-layout-followup/`.
- No standalone GitHub issues were found during the 2026-10-27 review. Issue proposals are tracking only; creation requires separate approval.
- The G00 PR #5 audit and later PR #6 review receipts record one unresolved high-severity npm audit warning. The user-provided PR #6 install transcript separately warns that esbuild 0.28.2/0.25.12 lifecycle scripts are not covered by `allowScripts`. No dependency fix or script approval is evidenced; retain both as open risk items.

**Historical Windows checkout/worktree note (2026-10-16):** `E:\Projects\CodeGuardian\CodeGuardian\` and `..\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\` were recorded as active at that time. The previously recorded `git fsck` result is historical; these paths do not establish current Windows host availability or worktree state. No accessible Windows checkout has been identified.

Reconciliation of independent Git histories is DONE (historical merge `e3e6b281e517a2d884309d527650ba9329e76d8e`); do not repeat it.

## Governing documents and approval gates

- `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `ROADMAP.md`: proposed architecture; G06 D-09 remains proposed.
- `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`: required mock-only **native CLI** journey and acceptance tests; browser reference is not enough.
- `API-CONTRACT.md`: canonical PR findings rules; proposed repository-wide audit types must not defeat PR changed-hunk checks.
- `TECH-RESEARCH.md`: current official Jules API evidence plus known untested runtime details.
- `SETUP.md` and `REPO-INITIALIZATION.md`: current remote observations and Git history.

**Current G00 closeout gates:** reconcile archive/worktree history without recreating missing evidence; prepare and review focused GitHub issue proposals; obtain Rockson’s personal accept/deficiency decision for the complete nine-screen UX and Report resize observation; explicitly record Windows as DEFERRED / NOT RUN, NOT WAIVED; disposition dependency/security and CI limitations; and retain the archive lifecycle exception unless recovered evidence supports another conclusion. PR #1/#4/#5/#6 are merged. G01 remains unauthorized.

## Next requested action / stop

**Next requested action: finish G00 closeout only.** After governance review, prepare focused issue drafts for separate GitHub authorization, then Rockson reviews the nine-screen experience and records acceptance or deficiencies. Keep archive lifecycle compliance unverified; do not claim missing archival or retirement evidence. Do not begin G01 or claim Windows verification.

G06 requires a separate pilot approval for source/mirror and Jules permissions, plan review, rate/cost policy, snapshot proof and report publication. No Jules session, external repo grant, app installation, report publication, implementation, deployment, merge or release has been executed by this handoff.

