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
- [x] Step 10: Validate full test matrix, executable build, and capture execution receipts

## Final Eight-Layer Testing Execution (Continuous Run: Verified 123/123 Tests)
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
- [x] Zero external writes and zero network egress verified
