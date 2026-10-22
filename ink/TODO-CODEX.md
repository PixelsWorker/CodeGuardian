# CodeGuardian G00 Native Ink CLI — Codex Implementation TODO

**Target Directory:** `E:\Projects\CodeGuardian\worktree\PixelsWorker\CodeGuardian\feat-g00-ink-cli-demo\ink\`  
**Target Branch:** `feat/g00-ink-cli-demo`  
**Base Commit:** `6dd8458` (`feat(g00): initialize ink package with verified smoke test and zero vulnerabilities`)  
**Package Manager:** `npm 11.17.0` (Node `v24.19.0`)  
**Status:** READY FOR CODEX EXECUTION  

---

## 1. Verified Stack Baseline

The following dependencies are already installed, smoke-tested, and passing in `ink/`:
- `ink`: `8.0.0`
- `react`: `19.3.1`
- `commander`: `15.0.0`
- `zod`: `3.24.2`
- `typescript`: `5.8.2`
- `tsx`: `4.23.15`
- `vitest`: `5.0.5`
- `ink-testing-library`: `4.0.0`
- Zero audit vulnerabilities (`npm audit` clean).

---

## 2. Directory Architecture for Codex

Scaffold the terminal application under `ink/src/`:

```
ink/
├── package.json
├── tsconfig.json
├── tests/
│   ├── smoke.test.tsx
│   ├── cli.test.ts
│   └── components/
│       ├── AuthStatus.test.tsx
│       ├── SpecialistLane.test.tsx
│       └── ReportView.test.tsx
└── src/
    ├── cli.tsx                 # Commander CLI entrypoint & binary dispatch
    ├── App.tsx                 # Top-level Ink App router / state machine
    ├── types/
    │   └── contracts.ts        # Zod schemas & types matching API-CONTRACT.md
    ├── fixtures/
    │   ├── demo-pr.json        # Synthetic PR metadata, diff stats, author
    │   ├── demo-findings.json  # Synthetic findings across 4 specialists
    │   └── demo-report.json    # Consolidated mock report
    ├── core/
    │   ├── state-machine.ts    # Deterministic CLI state reducer & transitions
    │   └── report-formatter.ts # Markdown & JSON output formatters
    ├── components/
    │   ├── Header.tsx          # Title banner, PR info, breadcrumbs
    │   ├── Footer.tsx          # Keybinding hints (Enter, Esc, Tab, Q, Ctrl+C)
    │   ├── ProgressBar.tsx     # Terminal progress animation
    │   └── DiffHunkView.tsx    # Styled diff chunk presentation
    └── screens/
        ├── WelcomeScreen.tsx   # Screen 1: Command help & overview
        ├── AuthScreen.tsx      # Screen 2: Preflight check (simulated gh/codex auth)
        ├── PrEntryScreen.tsx   # Screen 3: PR URL prompt & validation
        ├── InspectScreen.tsx   # Screen 4: Diff summary & risk overview
        ├── SpecialistScreen.tsx# Screen 5: 4 specialist lanes with streaming progress
        ├── ConsensusScreen.tsx # Screen 6: Manager validation & deduplication
        ├── ReportScreen.tsx    # Screen 7: Synthesized findings & format toggle
        ├── PublishScreen.tsx   # Screen 8: Dry-run confirmation (NO WRITE warning)
        └── ErrorScreen.tsx     # Screen 9: Error, cancellation & retry screen
```

---

## 3. Four Canonical Specialist Roles

In all fixtures, screens, and progress indicators, Codex must use the canonical CodeGuardian specialist definitions:
1. **Security Specialist** (Detects credential leaks, injection risks, auth flaws)
2. **Logic & Correctness Specialist** (Analyzes boundary conditions, edge cases, nullability)
3. **Architecture Specialist** (Monitors boundary violations, layer leaking, design pattern adherence)
4. **Quality, Testing & Performance Specialist** (Assesses test coverage, complexity, algorithmic hotspots)

---

## 4. Key CLI Commands & Behaviors

- `codeguardian --help` / `-h`: Displays formatted terminal help and subcommands.
- `codeguardian auth status`: Runs Screen 2 (Auth preflight check).
- `codeguardian review <URL> --demo`: Launches full interactive 9-screen walkthrough using synthetic fixtures.
- `codeguardian report <RUN_ID> --format markdown|json`: Outputs non-interactive formatted report.
- `codeguardian publish <RUN_ID> --dry-run`: Runs Screen 8 dry-run publish confirmation gate.

---

## 5. Acceptance Checklist for Codex

- [ ] All 9 screens render properly in interactive TUI mode with arrow key, tab, and enter navigation.
- [ ] Responsive to narrow terminals (< 80 columns) without broken wrapping.
- [ ] Respects `NO_COLOR` / terminal color suppression.
- [ ] Clean exit on `Ctrl+C` or `q` without orphan processes or terminal state corruption.
- [ ] `npm test` runs all component tests and passes cleanly.
- [ ] `npm run build` (`tsc`) passes with zero TypeScript errors.
- [ ] Zero real external network calls (no GitHub API, no OpenAI SDK, no Jules, no PR-Agent).


## 2026-10-21 bounded correction run — verification blocked

- Working branch: `feat/g00-ink-cli-demo`; opening HEAD `db72749cb1dee6e43f20a10f45dccb1b2aec7961`.
- Implemented reducer-based PR text edits; buffered non-raw CSI/CRLF/UTF-8 input; shared stream listener lifecycle.
- Implemented deterministic offline report recipes encoding owner, repository, PR number and four worker outcomes; full current-session report display; restored loaded report coverage on backward navigation.
- Added canonical SHA-256 finalization, strict shared URL parsing, explicit skipped/partial coverage and focused L2/L3/L4/L6/L8 regressions.
- Removed only the redundant `pretest` manifest entry. No dependency or lockfile changes.
- Supplementary Node 24 source checks passed 2,500 recipe round-trips and stream parser cases. This is NOT an eight-layer suite receipt.
- Full Vitest/type/compiled-CLI execution BLOCKED: this Linux checkout has no Ink dependencies. Installation permission requested; no packages installed.
- Windows TTY/non-TTY acceptance UNAVAILABLE in this Linux environment. Snapshot updates require actual renderer execution; existing snapshots preserved.
- Evidence: workspace sibling `evidence/g00-ink-cli-demo/2026-10-21-corrections/`.
- No commits, pushes, merges, PR state changes or G01 work. G00 technical and operator acceptance remain open.


## 2026-10-21 dependency-backed Linux verification — supersedes blocked status above

- Explicit one-time dependency restoration approved. `npm ci --ignore-scripts --no-audit --no-fund` succeeded; no package lifecycle script was enabled.
- Existing locked toolchain: Node 24.21.0, TypeScript 5.9.3, Vitest 5.0.5, React 19.3.1, Ink 8.0.0. Locked TypeScript `--noEmit`: PASS, zero diagnostics.
- Full Linux eight-layer run: **227/227 tests across 16 files PASS; 14/14 snapshots match**. Four intended report/publication snapshots updated after inspecting their differences; partial snapshot uses the actual partial fixture.
- Linux compiled CLI: redirected whole/split URL, CSI, CRLF, custom/partial exports and digest/publication parity pass. Test network guard allows Yoga's bundled WASM data URL while continuing to reject external connections.
- Separate real Linux PTY run: nine screens, 40/60/80/100-column resize responsiveness, progress, Architecture timeout, Quality skip, partial digest parity, stale/permission/duplicate gates, confirmation, reset, auth error/retry, Escape cancellation and q exit PASS.
- Evidence: workspace sibling `evidence/g00-ink-cli-demo/2026-10-21-dependency-verification/`.
- Windows TTY/non-TTY and Rockson's full operator UI/UX acceptance remain separate pending gates. No accessible Windows workspace was verified from Linux.
- Addressed GitHub review findings: restricted simulated failure scenarios to exact preset identities in `state-machine.ts` (eliminating substring false positives on repos like `draft-js`), verified `ReportScreen.tsx` avoids mislabeling unverified findings as verified, and added focused regressions. Full suite: **237/237 tests PASS; 14/14 snapshots match**.
- Existing uncommitted correction set retained. No commit, push, merge, PR state change, dependency/lockfile change or G01 work.
