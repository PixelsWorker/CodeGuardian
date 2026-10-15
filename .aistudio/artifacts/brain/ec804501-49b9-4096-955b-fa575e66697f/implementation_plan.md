# CodeGuardian G00 Prototype — CodeRabbit Review & UX Refinements (Revised)

Refine and harden the CodeGuardian browser-based terminal simulation to resolve four CodeRabbit review findings and address critical UX/state consistency concerns: deterministic worker state factories, unpolluted publishing state resets, bulletproof simulation timer cancellation with generation tokens, strict URL parsing (rejecting credentials, non-HTTPS, and invalid owner/repo tokens), and separate Operator Denial vs GitHub 403 Permission Denied scenario flows.

> [!IMPORTANT]
> All changes remain strictly scoped to the local interactive prototype in React/TypeScript. No external APIs, real GitHub tokens, or Codex integrations are introduced.

- **Confirmed Decision 1 (Fresh Worker Factories)**: Create an explicit `createFreshWorker(role, state, failureReason?)` factory that produces decoupled worker records with clean empty logs (`[]`), `elapsedMs: 0`, and `findingsCount: 0` for queued states, preventing telemetry leakage across scenario switches.
- **Confirmed Decision 2 (Publishing Outcome Reset)**: Explicitly reset `publishOutcome` to `'normal'` whenever a scenario does not define an explicit override, avoiding sticky permission-denied or stale-head errors.
- **Confirmed Decision 3 (Cancel Handler & Run-Generation Token)**: Link the Cancel button directly to `handleCancelAll`, which clears scheduled timers, sets `isSimulating(false)`, increments a `runGenerationRef` counter, and calls `onCancelAll()`. Use browser-compatible `ReturnType<typeof setTimeout>[]` for timer refs.
- **Confirmed Decision 4 (Strict URL Security & Owner/Repo Sanitization)**: Reject embedded credentials (`username !== '' || password !== ''`), enforce `protocol === 'https:'`, `hostname === 'github.com'`, and test path against `/^\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/([1-9]\d*)\/?$/`.
- **Confirmed Decision 5 (Scenario 9 UX Disambiguation)**: Disambiguate "Operator Denied Publication" (operator enters `N` / clicks Cancel at prompt) from "GitHub Write Permission Denied" (simulated GitHub API 403 on the publishing endpoint).
- **Confirmed Decision 6 (Automated Acceptance Test Suite)**: Introduce an automated Vitest/unit test suite validating the entire 9-point acceptance matrix prior to freezing the G00 design.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes an airtight, deterministic state machine and robust input validation for the CodeGuardian CLI prototype. Ensures scenarios, worker cancellation, publishing gates, and input validation behave identically every single time, serving as the gold-standard reference for Codex's native Ink/TypeScript implementation.
- **Target Audience**: Rockson and developer-tools reviewers verifying CLI workflows, keyboard handling, and component boundaries.
- **Key Value**: Provides a reliable, bug-free interactive reference that documents exact terminal behavior without relying on real cloud infrastructure.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Scenario Switching*:
     - Scenario 1 (Complete) ➔ Scenario 3 (Auth Unavailable / Queued): Workers display `[QUEUED]`, 0 candidates, 0.0s elapsed, and `"Waiting for preflight authorization..."` with fresh empty logs.
     - Scenario 9 / 10 ➔ Scenario 1: Screen H publishing gate resets to nominal state without lingering 403 permission or duplicate-warning banners.
  2. *Worker Cancellation*:
     - User clicks "Re-run Simulation", then hits "Cancel [Ctrl+C]" at 0.5s.
     - Timers are flushed, `runGeneration` increments, workers switch to `[CANCELLED]`, and pending callbacks cannot overwrite worker states.
  3. *Publishing Safety Distinction*:
     - *Scenario 9 (Operator Denied)*: Shows review ready, confirms prompt, user enters `N` ➔ `"Operation cancelled by operator. No GitHub write performed."`
     - *Scenario 5 / Publisher 403 (Permission Denied)*: Shows `"Publisher Error: Permission Denied (403). Lacks write/triage comments permission."`
  4. *PR URL Rejection*:
     - Rejects `http://github.com/example/demo/pull/42` (requires HTTPS).
     - Rejects `https://evil.com/github.com/example/demo/pull/42` (invalid hostname).
     - Rejects `https://user:pass@github.com/example/demo/pull/42` (credentials forbidden).
     - Rejects `https://github.com/bad$owner/demo/pull/42` (invalid owner/repo characters).
- **Visual Identity & Theme**:
  - Consistent monospaced developer-tool aesthetics with dark terminal, amber CRT, matrix green, and paper light themes.
  - Persistent, unmissable `CODEGUARDIAN — DEMO ONLY` header badge.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Run-Generation Token Guard**
  - *Chosen Approach*: Track active runs with an incrementing `runGenerationRef = useRef(0)`. Each `setTimeout` captures `currentGen = runGenerationRef.current`. If `runGenerationRef.current !== currentGen` when the timeout fires, the callback aborts without updating state.
  - *Why*: Immune to race conditions between cancellations and immediate re-runs.
- **Decision 2: Browser-Native Timeout Typing**
  - *Chosen Approach*: `useRef<ReturnType<typeof setTimeout>[]>([])` rather than `NodeJS.Timeout[]`.
  - *Why*: Eliminates dependencies on `@types/node` in the Vite browser environment.
- **Decision 3: Dedicated Acceptance Test Matrix Automation**
  - *Chosen Approach*: Implement a unit test suite testing URL validation, worker state factories, scenario switching, and cancellation logic.
  - *Why*: Guarantees verified compliance before design freeze.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CodeGuardian Architecture                       │
│                                                                        │
│  ┌────────────────────────┐             ┌───────────────────────────┐  │
│  │ Scenario Switcher      │             │ Screen C: URL Parser      │  │
│  │ • publishOutcome reset │             │ • protocol === 'https:'   │  │
│  │ • createFreshWorker()  │             │ • hostname === 'github.com'  │
│  └───────────┬────────────┘             │ • username === '' && pass │  │
│              │                          │ • strict owner/repo regex │  │
│              ▼                          └───────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Screen E: Multi-Agent Activity                                   │  │
│  │ • runGenerationRef.current++                                     │  │
│  │ • timersRef.current = [] (ReturnType<typeof setTimeout>)         │  │
│  │ • handleCancelAll() ──► clears timers, stops simulation, cancels │  │
│  │ • useEffect cleanup ──► clears timers                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│              │                                                         │
│              ▼                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Screen H: Publication Safety Gate                                │  │
│  │ • 'normal': Operator prompt [y/N] ──► simulated confirmation    │  │
│  │ • 'operator_denied': Operator explicitly selected [N]           │  │
│  │ • 'denied_permission': GitHub 403 lacks triage/comment rights   │  │
│  │ • 'stale_head': Commit SHA mismatch block                        │  │
│  │ • 'duplicate_warning': Digest fingerprint already posted         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Acceptance Test Matrix

| # | Test Scenario | Input / Action | Expected Result |
|---|---|---|---|
| 1 | Complete ➔ Queued Reset | Switch from Scenario 1 to Scenario 3 | All 4 workers show `[QUEUED]`, 0 candidates, 0ms, empty logs |
| 2 | Permission Error Reset | Switch from Scenario 5 to Scenario 1 | `publishOutcome` resets to `'normal'`, 403 error banner removed |
| 3 | Immediate Cancellation | Start run ➔ Cancel at 300ms ➔ Wait 3s | Workers remain `[CANCELLED]`, no delayed `[COMPLETE]` transitions |
| 4 | Rapid Re-run Safety | Start run ➔ Cancel ➔ Immediately Start | Run-generation prevents orphaned updates from previous run |
| 5 | Unmount Cleanup | Start run ➔ Navigate to Screen A | Component unmount clears all pending timer callbacks |
| 6 | Protocol Check | `http://github.com/example/demo/pull/42` | Rejected (HTTPS required) |
| 7 | Host Spoofing Check | `https://evil.com/github.com/owner/repo/pull/42` | Rejected (Invalid hostname) |
| 8 | Credential Check | `https://user:token@github.com/owner/repo/pull/42` | Rejected (Credentials forbidden in PR URL) |
| 9 | Strict Owner/Repo Check | `https://github.com/owner$invalid/repo!/pull/42` | Rejected (Invalid owner/repository characters) |
| 10 | Valid GitHub PR URL | `https://github.com/example/demo/pull/42` | Accepted (`owner: example`, `repo: demo`, `number: 42`) |
