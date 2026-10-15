# G00 - Proposed CLI UX Wireframes (MOCK ONLY)

**Status:** Illustrative **native terminal** sketches; proposed commands are NOT implemented/tested as a native CLI. A separate React/Vite G00 browser mock exists on remote `main`; this governance review did not run its tests.

## 1. CLI command vocabulary to confirm

```text
codeguardian --help
codeguardian auth status
codeguardian review <GITHUB_PR_URL> --demo
codeguardian report <RUN_ID> --format markdown|json
codeguardian publish <RUN_ID> --dry-run
```

Actual command names and flags must be accepted in G00. The demo may emulate them without a real GitHub connection.

## 2. Welcome and authentication

```text
CodeGuardian (DEMO ONLY)
-------------------------------------------
Status: Simulation. No GitHub or AI calls made.

Authentication (simulated):
  GitHub CLI   [NOT SIGNED IN]  Action: gh auth login
  Codex CLI    [NOT SIGNED IN]  Action: codex login --device-auth

Options: Review PR | View report | Help | Exit
```

## 3. PR inspection and specialist progress

```text
CodeGuardian / Demo Review              RUN demo-0042
Target: https://github.com/example/demo/pull/42
Head:   bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb (SIMULATED)
Files:  7 changed (MOCK INPUT)

Workers (SIMULATED - no model requests)
  Security      [COMPLETE]  1 candidate
  Logic         [COMPLETE]  2 candidates
  Architecture  [RUNNING ]  0 candidates
  Quality       [SKIPPED ]  Low relevance

Controls: Cancel | View worker logs | Wait
```

## 4. Consolidated report

```text
Report: demo-0042                   DEMO ONLY
Status: PARTIAL (1 worker unfinished)
Findings: P0 0 | P1 1 | P2 1 | P3 0

[P1] Possible null dereference
  src/demo.ts:17 (RIGHT)
  Evidence: Mock fixture; not verified against a real PR.
  Impact: Request may fail with an omitted argument.
  Suggested fix: Validate before dereferencing.

Warnings:
  * This is simulated fixture output, not code analysis.
  * No application tests executed.

Options: Open details | Export JSON | Publish preview | Back
```

## 5. Publication preview

```text
WARNING: DRY RUN ONLY - NO GITHUB WRITE
Target: example/demo#42
Head SHA: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
Action: COMMENT
Inline comments to post: 0 (mock; invalid line not published)

Would you authorize publication for this SHA? [y/N]
Result in G00: SIMULATED CONFIRMATION ONLY.
```

## 6. Required alternate screens

- Empty/auth denied: explain why no review is possible and next operator step.
- Invalid/non-GitHub URL: show usage and reject it.
- Partial/timeout/cancel: show which workers completed and avoid overstating coverage.
- Stale PR head SHA at preview: block hypothetical publication, offer rerun.
- GitHub write not allowed: no prompt that suggests automatic rights.
- Narrow terminal and NO_COLOR: statuses remain understandable without ANSI colors.

**Approval request:** Confirm these complete native terminal behaviors and command names. Browser prototype source/test files exist; a native CLI executable and accepted G00 walkthrough are not verified. Optional G06 repository-audit UX is separately proposed and is not part of these screens.
