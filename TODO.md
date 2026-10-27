# G00 Native Ink CLI Execution Checklist

- [x] Step 1: Initialize Ink 8 + React 19 package scaffold and verify smoke test
- [x] Step 2: Update tsconfig.json to include tests in typecheck
- [x] Step 3: Implement contracts and Zod schemas in `ink/src/types/contracts.ts`
- [x] Step 4: Implement synthetic fixtures in `ink/src/fixtures/` (PR, diff, findings, report)
- [x] Step 5: Implement deterministic CLI state reducer & formatters in `ink/src/core/`
- [x] Step 6: Implement shared UI components in `ink/src/components/` (Header, Footer, ProgressBar, DiffHunkView)
- [x] Step 7: Implement all 9 screens in `ink/src/screens/`
- [x] Step 8: Wire App router and Commander CLI entrypoint in `ink/src/App.tsx` and `ink/src/cli.tsx`
- [x] Step 9: Build test suite in `ink/tests/` (CLI args, state transitions, components, narrow/NO_COLOR)
- [x] Step 10: Run the recorded Linux candidate checks, executable build, and capture historical execution receipts

## Historical Eight-Layer Test Record (123/123 recorded; not final-head evidence)

> The counts below are retained as originally recorded. Their source does not bind them to reviewed feature head `49e8991` or merge commit `ee9575e`; no date or candidate SHA is inferred here. They are not final-head acceptance evidence.
- [x] Layer 1 (L1) — Toolchain and Ink 8 smoke testing (`tests/l1-toolchain-smoke.test.tsx` — 5 tests)
- [x] Layer 2 (L2) — Schema and domain unit testing (`tests/l2-schema-contracts.test.ts` — 17 tests)
- [x] Layer 3 (L3) — CLI parser and safety tests (`tests/l3-cli-parser.test.ts` — 17 tests)
- [x] Layer 4 (L4) — Terminal UI component and interaction testing (`tests/l4-terminal-interaction.test.tsx` — 10 tests)
- [x] Layer 5 (L5) — Static type and contract testing (`tests/l5-static-type.test.ts` — 10 tests & `tsc --noEmit`)
- [x] Layer 6 (L6) — Complete mock pipeline integration (`tests/l6-mock-pipeline.test.ts` — 10 tests)
- [x] Layer 7 (L7) — Deterministic terminal snapshots (`tests/l7-snapshots.test.tsx` — 14 snapshots)
- [x] Layer 8 (L8) — Compiled CLI binary/subprocess E2E (`tests/l8-subprocess-e2e.test.ts` — 14 tests)
- [x] Baseline suites (`cli.test.ts` — 12 tests, `screens.test.tsx` — 13 tests, `smoke.test.tsx` — 1 test)
- [x] Total: 11 test files, 123 passing tests, 0 failures, 14 snapshots verified
- [x] CodeRabbit CLI: Clean review pass (`No new findings ✔`, 20 files reviewed)
- [x] Historical verification record asserted zero external writes and zero network egress. The walkthrough receipts did not establish independent network-egress telemetry; retain this as a historical assertion, not an independently verified network guarantee.

## Historical Fedora Node 22 run (270/271; retained)

- Automated suite: `npm test` 270/271 PASS; 1 FAIL at `tests/l1-toolchain-smoke.test.tsx` because the project assertion requires Node >=24; that historical run used Node 22.23.3.
- Build: `npm run build` PASS (`tsc`, exit 0).
- Native PTY at that earlier candidate reported unreadable 40-column layout and a 60-column footer collision; cancellation/error and terminal restoration were recorded PASS.
- Recorded non-TTY help, Markdown/JSON report, invalid-input, and refusal paths PASS. Full matrix and Rockson walkthrough remain incomplete.
- Receipts: `../evidence/g00-ink-cli-demo/2026-10-23-closeout/FEDORA-AUTOMATED-TEST-RECEIPT-2026-10-23.json`; `../evidence/g00-ink-cli-demo/2026-10-23-closeout/FEDORA-NATIVE-TTY-RECEIPT-2026-10-23.md`; `../evidence/g00-ink-cli-demo/2026-10-23-closeout/FEDORA-NONTTY-CLI-RECEIPT-2026-10-23.json`.
- Windows verification remains DEFERRED / NOT RUN, NOT WAIVED. Historical 123/123 results above remain unchanged and are not final-head evidence.

## Remaining G00 closeout gates

- [x] PR #1 merged the Native Ink CLI to `main` at `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f`; PR #4 merged the responsive correction to `dev` at `0e5e95c74b32bfc6228a65a160f341bf49b0c34e`; PR #5 merged the Report/NO_COLOR correction at `cf39f19e946d102cc2e4adc2c06b80963b890215`; PR #6 merged the Inspection readability correction, producing `dev` HEAD `9d8e7d6e8876b3a78e0fc1e623a5d50220898987`.
- [x] Historical PR #4 automated evidence: 277/277 tests across 16 files, focused L4 18/18, affected L7 snapshot PASS, and TypeScript build PASS. Receipts: `../evidence/g00-ink-cli-demo/2026-10-24-closeout/PR4-SNAPSHOT-FOLLOWUP/`.
- [x] PR #6 local verification receipts report 281/281 full tests, 47/47 focused L4, 14/14 snapshots and TypeScript build PASS. Receipts are under `../evidence/g00-ink-cli-demo/2026-10-26-inspection-layout-followup/`. These are agent-reported local results; no independent hosted CI run is evidenced.
- [ ] Disposition the reported high-severity npm audit warning and esbuild 0.28.2/0.25.12 `allowScripts` warnings. No dependency fix or script approval is authorized by this checklist.
- [x] Recorded merge-candidate non-TTY checks: help, invalid URL, real-execution refusal, JSON/Markdown reports, real-publication refusal, and unknown run ID all have results in `FEDORA-NONTTY-CLI-RECEIPT-2026-10-23.json` at `ee9575e`. Final PR #4-head rerun is not receipted; retain that distinction and seek Rockson’s risk disposition if no rerun is performed.
- [x] Recorded nine-screen PTY traversal (screens 1–8 happy path; screen 9 separate cancellation/error path), report-format toggle, dry-run denial/no external write, exit status, and terminal restoration in `ROCKSON-WALKTHROUGH-PR4/attempt-2/WALKTHROUGH-RECEIPT.md`. This is supporting evidence only; it does not satisfy Rockson’s personal UX acceptance.
- [x] Responsive layout cases and terminal restoration are represented by PR #4 Welcome/Auth breakpoint receipts; earlier TTY evidence records 40/60/80, `NO_COLOR`, cancellation and restoration. Environment limitation: Linux kernel/Freedesktop SDK Flatpak userspace; Windows and named-emulator behavior were not verified.
- [x] Automated tests cover specialist timeout, skip, partial failure/cancellation, partial reports, stale-SHA refusal and permission-denied publication; review these as simulated/mock behavior only. The 277-test PR #4 suite is historical coverage evidence; PR #6 local receipts report 281 total tests.
- [ ] Obtain Rockson’s personal accept/deficiency decision after reviewing the complete nine-screen native Ink CLI experience.
- [ ] Record whether Rockson accepts the evidence gap for final-head non-TTY reruns, full native PTY demonstrations of every error/partial/timeout/retry combination, and independent final-candidate report-integrity/digest verification. These are not established by the current receipts; do not mark them complete without new evidence or an explicit risk decision.
- [ ] Record Windows TTY/non-TTY verification as DEFERRED / NOT RUN, NOT WAIVED; do not claim Windows compatibility or acceptance.
- [x] Reconcile the six authorized governance documents locally; preserve all existing edits and keep this diff unstaged pending Rockson’s review. No commit or publication is authorized.
- [ ] Reconcile archive/worktree lifecycle separately: the 2026-10-23 archive predates final PR #4/#5/#6 evidence; no complete final manifest, append-only register or retirement receipts were found in the inspected workspace. PR #4/#5/#6 worktree paths are absent, but authorized retirement is not established. Do not invent or backdate missing receipts.
- [x] Prepare four focused GitHub issue drafts for nine-screen acceptance, archive/worktree reconciliation, dependency/security warning disposition, and Windows/independent-CI verification. Drafts are under `../evidence/g00-ink-cli-demo/2026-10-27-closeout/issues/`; no issue creation is authorized without separate approval.
- [ ] Keep the independent `string-width` direct-dependency decision open until separately decided.
- [ ] Keep G01 blocked until formal G00 acceptance and separate architecture/contract and implementation approvals.
