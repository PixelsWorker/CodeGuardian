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
