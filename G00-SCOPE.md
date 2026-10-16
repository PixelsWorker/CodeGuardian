# G00 - Complete CLI UX Demo (Accepted Scope)

**Group:** G00 - Complete CLI UX Demo
**Phase:** Full product terminal UI/UX, all MVP CLI interactions, with **safe mocks only**
**Status:** IMPLEMENTED LOCALLY â€” native Ink CLI package (`ink/`) implemented in dedicated worktree `..\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\`; browser prototype frozen at `e8e5844`; unit/screen tests passing (21/21), strict TypeScript build passing, and CodeRabbit clean. Pending draft PR publication, full eight-layer acceptance testing, and formal operator UI/UX review.
**Active branch:** `feat/g00-ink-cli-demo` in dedicated feature worktree `..\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\`; target draft PR against `main`.

## Goal

**Accepted UX design reference:** the nine-screen React/Vite browser prototype (`src/`) has been accepted by the operator as the walkthrough reference for G00. It is FROZEN at `e8e5844`. No further browser prototype development is authorized.

**Native Ink CLI deliverable:** port the accepted browser interaction patterns to real Ink terminal components, initially with mock data. The native terminal application lives in `ink/` with the CLI binary named `codeguardian`. It runs inside Windows Terminal, Warp, Kitty, GNOME Terminal and other compatible terminals.

Demonstrate the COMPLETE proposed CodeGuardian terminal user experience to Rockson in one navigable Ink CLI workflow without requiring API keys, GitHub permissions, or real Codex calls. Obtain explicit approval before implementing G01 real PR retrieval.

## In scope - the entire agreed CLI MVP experience

- Welcome/help, command discovery, and invalid-command guidance.
- Auth preflight screens for Codex and GitHub: signed-in, signed-out, device-code instructions (simulated), permission unavailable, session expired.
- PR submission by URL: valid example, invalid host/URL, unauthorized repo, deleted/closed PR, draft PR, rate limit (simulated).
- PR inspection preview: owner/repo/number, title, head/base SHA, files, changed lines, risk summary, non-sensitive mock fixture.
- Specialist selection/progress: Security, Logic & Correctness, Architecture, Quality, Testing & Performance; queued, running, streaming progress, skipped, timed out, cancelled, failed, completed (simulated only).
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
3. Responsive terminal widths and color-disabled output are checked; critical accessibility concerns and visible state cues addressed.
4. Existing relevant build/lint/type and safe mock smoke checks are run with actual commands/results (selected when G00 setup is approved).
5. One group PR contains all G00 scope and its tests. Rockson explicitly approves the complete Ink CLI demo; without approval, G01 cannot start.

## Dependencies and estimate

- Dependencies: accepted project architecture, accepted mock schema, confirmed Windows dev environment (Node 24 LTS, npm 11.17.0, TypeScript, Ink 8.0), initialized Git repository and approved branch plan, G00 scope approval.
- Estimate: 2-3 working days after prerequisites are met; revisit if terminal UI expectations change.
- Contract: `API-CONTRACT.md` v1 draft, only mock fixtures at G00.
- Protected files allowed to be changed: `G00-SCOPE.md`, `HANDOFF.md`, `ROADMAP.md` (authorized governance status and path reconciliation only).
- Branch/PR: `feat/g00-ink-cli-demo` in dedicated worktree `..\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\`. Target PR against `main`.
- **Ink package location:** `ink/` inside the feature worktree (`E:\Projects\CodeGuardian\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\ink\`). Separate `package.json`. CLI binary: `codeguardian`.

## Proposed acceptance demonstration

1. Start from help and simulated auth-preflight.
2. Supply demo PR URL and show metadata/diff overview.
3. Start all four simulated CodeGuardianMini specialist lanes (Security, Logic/Correctness, Architecture, Quality/Testing/Performance).
4. Show streaming-style progress and one partial failure.
5. Present consolidated findings, JSON export preview, and evidence caveats.
6. Open dry-run publish preview; deny, then accept simulated confirmation. Show **NO EXTERNAL WRITE**.
7. Repeat with invalid URL, stale SHA, unavailable credentials, and cancel scenarios.

## Governance

This file is a GROUP BRIEF, not an executable `TODO.md`. Once Rockson approves setup and G00 Ink scope, prepare one bounded G00 TODO using `sprint-code.md`, and include the risk-based `sprint-test.md` test plan IN that TODO. An authorized G00 branch or PR does not grant push/merge permission by default.

**Browser prototype status:** `src/` is FROZEN at `e8e5844`. Operator walkthrough has been accepted. Do not extend the browser prototype. The accepted UX patterns in the browser reference are the source of truth for porting to Ink components.

