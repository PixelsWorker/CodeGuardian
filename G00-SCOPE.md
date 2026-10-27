# G00 - Complete CLI UX Demo (Accepted Scope)

**Group:** G00 - Complete CLI UX Demo
**Phase:** Full product terminal UI/UX, all MVP CLI interactions, with **safe mocks only**
**Status (verified 2026-10-27):** G00 implementation and corrections are merged; **FORMAL UX ACCEPTANCE PENDING**. PR #1 merged to `main` at `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f`; PR #4 merged to `dev` at `0e5e95c74b32bfc6228a65a160f341bf49b0c34e`; PR #5 merged to `dev` at `cf39f19e946d102cc2e4adc2c06b80963b890215`; PR #6 merged to `dev`, producing current `dev` HEAD `9d8e7d6e8876b3a78e0fc1e623a5d50220898987`. PR #6 added the Inspection title/author readability correction. Local PR #6 receipts report 281/281 full tests, 47/47 focused tests, 14/14 snapshots and build PASS; these are local receipts, not independent hosted CI. The nine-screen walkthrough receipt is supporting evidence, not Rockson’s personal UX decision. Windows is DEFERRED / NOT RUN, NOT WAIVED. G01 remains unauthorized.
**Historical G00 branch/worktree record:** `feat/g00-ink-cli-demo` was used for PR #1; its remote branch was deleted after merge. PRs #4, #5 and #6 were separate post-merge corrections. Their historical worktree paths are absent from current registration/filesystem checks; required archive and retirement records have not been established. Do not recreate historical G00 branches or worktrees to imply lifecycle compliance. Future G01 work may use a separately approved branch and worktree.

## Goal

**Accepted UX design reference:** the nine-screen React/Vite browser prototype (`src/`) has been accepted by the operator as the walkthrough reference for G00. It is FROZEN at `e8e5844`. No further browser prototype development is authorized.

**Native Ink CLI deliverable:** port the accepted browser interaction patterns to real Ink terminal components, initially with mock data. The native terminal application lives in `ink/` with the CLI binary named `codeguardian`. It runs inside Windows Terminal, Warp, Kitty, GNOME Terminal and other compatible terminals.

Demonstrate the COMPLETE proposed CodeGuardian terminal user experience to Rockson in one navigable Ink CLI workflow without requiring API keys, GitHub permissions, or real Codex calls. Obtain explicit approval before implementing G01 real PR retrieval.

## In scope - the entire agreed CLI MVP experience

- Welcome/help, command discovery, and invalid-command guidance.
- Auth preflight screens for Codex and GitHub: signed-in, signed-out, device-code instructions (simulated), permission unavailable, session expired.
- PR submission by URL: valid example, invalid host/URL, unauthorized repo, deleted/closed PR, draft PR, rate limit (simulated).
- PR inspection preview: owner/repo/number, title, head/base SHA, files, changed lines, risk summary, non-sensitive mock fixture.
- Specialist selection/progress: four mock workers — Security Specialist, Logic & Correctness Specialist, Architecture Specialist, and Quality, Testing & Performance Specialist; queued, running, streaming progress, skipped, timed out, cancelled, failed, and completed (simulated only).
- Manager validation: accepted, duplicate, unsupported, invalid line, partial worker results; clear severity indicators.
- Report summary and detail views: Markdown and JSON previews, findings sorted by severity, warnings, test status (not run), persistent demo run IDs and accessible navigation.
- Publication preview: explicit confirmation layout and dry-run, stale-head protection illustration, denied permission, duplicate publication warning; NEVER make a real GitHub write.
- Cancel/retry affordances and a final clear outcome (success, partial, blocked, failed).
- Accessible terminal output, color-disabled fallback, small terminal widths, readable statuses and error explanations.

## Out of scope

- Real GitHub API/CLI login, real pull request cloning or inspection.
- Codex SDK/model requests or PR-Agent calls.
- Real GitHub review publication, even after a simulated confirmation.
- Docker credential persistence, unattended webhooks, external services.
- Further development of the browser prototype. The browser mock at `e8e5844` is the **frozen design reference**, not the G00 Ink deliverable.
- G06 repository-audit screens, Jules/GitHub cloud connections, live audit sessions and `AUDIT.md` generation.

## Done when

1. All above CLI screens/flows can be demonstrated consistently with clearly marked fixtures and **DEMO ONLY** indicators inside the Ink CLI.
2. The entire terminal user journey (including canceled, denied, partial, stale, failure cases) is reviewable in one deliverable.
3. Responsive terminal layouts at 40/60/80 and Welcome/Auth breakpoint cases are supported by the PR #4 PTY receipts; NO_COLOR and terminal restoration are covered by earlier TTY receipts and the walkthrough. These receipts identify Linux kernel `7.2.10-200.fc44.x86_64` with Freedesktop SDK 25.08 Flatpak userspace, not Windows or a named terminal emulator. Do not generalize them to every terminal. Rockson’s personal walkthrough decision remains required.
4. Historical PR #4 validation receipts report 277/277 tests across 16 files, focused L4 18/18, the affected L7 snapshot passing, and TypeScript build PASS on Node 24.21.0/npm 11.19.0. Later PR #6 local verification receipts report 281/281 tests, focused L4 47/47, 14/14 snapshots and build PASS. Preserve each receipt’s candidate SHA and exact scope; these local results are not independent hosted CI. Historical 123/123, Node 22 270/271, and intermediate candidate totals remain dated records and must not be overwritten or presented as latest results.
5. PR #1 contains the merged G00 scope and tests. Merge does not equal formal G00 acceptance; Rockson’s explicit acceptance remains required before G01.
6. Acceptance-matrix reconciliation (retain these gates until Rockson accepts the evidence or records a risk exception): (a) Redirected/non-TTY help, invalid-URL rejection, real-execution refusal, JSON/Markdown report output, real-publication refusal, and unknown-run handling passed on merge candidate `ee9575e`; see `FEDORA-NONTTY-CLI-RECEIPT-2026-10-23.json`. A rerun at final PR #6 head is not receipted; record this as pending or obtain Rockson’s explicit risk disposition. (b) Interactive navigation through screens 1–8, report-format toggles, dry-run publication denial/no external write, and separate cancellation/error screen 9 are recorded in `ROCKSON-WALKTHROUGH-PR4/attempt-2/WALKTHROUGH-RECEIPT.md`; this supports, but does not replace, the personal UX decision. (c) Error/refusal paths are represented in the non-TTY receipt and automated tests. L4 tests cover timeout, skip, partial failure and cancellation; integration/CLI tests cover partial reports, stale SHA and permission-denied publication. A native PTY demonstration of every error/partial/timeout/retry combination is not recorded and remains pending or subject to Rockson’s risk decision. (d) JSON/Markdown report output and snapshot/digest examples are present; an independent final-candidate report-integrity/digest verification receipt is not present and remains pending or subject to risk disposition. (e) Publication safety evidence covers `--no-dry-run` refusal, mock stale-SHA/permission states in tests/PTY, operator denial and an explicit no-external-write outcome. Preserve the mock-only boundary. (f) Responsive Report and Inspection layouts plus prior 40/60/80, 91/92 and 100-column cases, `NO_COLOR`, cancellation and terminal restoration are represented in PR #4/#5/#6 local test and PTY receipts. Runner details are receipt-specific: the PR #4 nine-screen walkthrough and PR #5 final PTY audit identify Python `pty.fork`; PR #6 agent-run evidence identifies a nested `script` PTY supplied by its execution environment, and its interactive captures include `script` wrapper headers. No named terminal emulator was identified, and these sessions do not certify an ordinary Fedora desktop terminal. Windows remains separate and untested. Preserve each receipt’s exact commands, results, source SHA and evidence paths.
7. Native Windows verification is DEFERRED / NOT RUN, NOT WAIVED. Complete it before any Windows compatibility claim, Windows-targeted release, or Windows acceptance sign-off.
8. Rockson explicitly accepts the complete nine-screen Ink CLI UI/UX walkthrough. This decision is still pending.

## Dependencies and estimate

- Approved verification runtime: Node `v24.21.0` and npm `11.19.0`, command-scoped. PTY runner attribution is receipt-specific: the PR #4 nine-screen walkthrough and PR #5 final PTY audit identify Python `pty.fork`; PR #6 agent-run evidence identifies a nested `script` PTY supplied by its execution environment, and its interactive captures include `script` wrapper headers. The recorded environment was Linux kernel `7.2.10-200.fc44.x86_64` with Freedesktop SDK `25.08` Flatpak userspace; this does not certify an ordinary Fedora desktop terminal. Windows remains deferred and unverified.
- Estimate: 2-3 working days after prerequisites are met; revisit if terminal UI expectations change.
- Contract: `API-CONTRACT.md` v1 draft, only mock fixtures at G00.
- Protected files allowed to be changed: `G00-SCOPE.md`, `HANDOFF.md`, `ROADMAP.md` (authorized governance status and path reconciliation only).
- **Current governance authorization (2026-10-27):** Rockson authorized local reconciliation of exactly `AGENTS.md`, `G00-SCOPE.md`, `HANDOFF.md`, `ROADMAP.md`, `SETUP.md`, and `TODO.md`, preserving existing edits and evidence. This does not authorize staging, commit, push, GitHub issue creation, worktree retirement, `main` promotion, or G01 implementation.
- Current closeout rule: the preceding protected-file authorization is retained as a historical G00 implementation record and grants no post-merge edit authority. Each current protected-file path and exact proposed correction requires separate approval.
- Historical branch/PR: `feat/g00-ink-cli-demo` targeted PR #1 against `main`; PR #1 is merged and the remote feature branch is deleted. Do not recreate it.
- **Ink package location:** `ink/` in the merged repository. Earlier Windows feature-worktree paths are historical and do not establish a current checkout. Separate `package.json`; CLI binary: `codeguardian`.

## Proposed acceptance demonstration

1. Start from help and simulated auth-preflight.
2. Supply demo PR URL and show metadata/diff overview.
3. Start all four simulated CodeGuardianMini specialist lanes (Security, Logic/Correctness, Architecture, Quality/Testing/Performance).
4. Show streaming-style progress and one partial failure.
5. Present consolidated findings, JSON export preview, and evidence caveats.
6. Open dry-run publish preview; deny, then accept simulated confirmation. Show **NO EXTERNAL WRITE**.
7. Repeat with invalid URL, stale SHA, unavailable credentials, and cancel scenarios.

## Governance

**Historical pre-implementation instruction:** This file is a GROUP BRIEF, not an executable `TODO.md`. The earlier instruction to prepare a G00 implementation TODO has been fulfilled and is no longer the current action. Any post-merge code follow-up requires a separately approved branch and PR; an existing or future PR does not grant merge permission by default.

**Browser prototype status:** `src/` is FROZEN at `e8e5844`. Operator walkthrough has been accepted. Do not extend the browser prototype. The accepted UX patterns in the browser reference are the source of truth for porting to Ink components.

