# CodeGuardian G00 — Final Prototype Corrections Implementation Plan

Address the three CodeRabbit review findings: worker navigation lifecycle management (cancelling only active `running` workers on navigation, preserving completed/failed/skipped states, invalidating run-generation tokens, and preventing StrictMode unmount race conditions), Vite development server host hardening (removing `allowedHosts: true`, defaulting to `127.0.0.1` locally, and restricting preview environments to explicit trusted hosts), and comprehensive React component interaction tests.

> [!IMPORTANT]
> The mock-only G00 terminal prototype boundary is preserved. No external networks, backend daemons, or native Ink ports are introduced.

- **Confirmed Decision 1 (Selective Worker Cancellation on Leave)**: When leaving Screen E while a simulation is in progress, cancel *only* workers currently in the `running` state. Workers that are already `complete`, `failed`, `timed_out`, or `skipped` remain untouched.
- **Confirmed Decision 2 (Timer & Token Invalidation)**: Leaving Screen E flushes all active timers in `timersRef` and increments `runGenerationRef`. Any scheduled callbacks from the previous run are safely discarded.
- **Confirmed Decision 3 (Vite Security Hardening)**: Eliminate `allowedHosts: true`. In `vite.config.ts`, bind to `127.0.0.1:3000` for local developer environments, bind to `0.0.0.0:3000` only in containerized/preview environments (`K_SERVICE`, `AIS_APPLET_ID`, `PORT`), and replace wildcard host acceptance with an explicit trusted allowlist (`['localhost', '127.0.0.1', '.run.app']`).
- **Confirmed Decision 4 (React Component Regression Tests)**: Complement the existing unit tests with automated interaction tests mounting the actual React screen components to verify start ➔ leave ➔ return ➔ rerun cycles.

---

## 1. Overview & Core Concept

- **What It Does**: Fixes state leakage when operators navigate between screens mid-simulation, guarantees that returning to the workers screen presents a clean state ready for immediate re-execution, and hardens the Vite development server against DNS rebinding and untrusted host header injection.
- **Target Audience**: Reviewers evaluating the UX flow across arbitrary screen transitions and keyboard jumps before freezing the specification for native Ink development.
- **Key Value**: Guarantees zero zombie worker processes, zero stale timers, and secure local development server defaults.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Mid-Simulation Navigation*:
     - User starts a simulation in Screen E (Workers 1 & 2 complete, Worker 3 running, Worker 4 running).
     - User presses `[1]` (Welcome) or `[7]` (Report) mid-run.
     - Workers 3 & 4 transition to `[CANCELLED]`.
     - Workers 1 & 2 remain `[COMPLETE]`.
     - No orphan timer fires in the background.
     - Upon navigating back to Screen E (`[5]`), the screen shows the preserved completed workers and cancelled workers, with a clean "Re-run Simulation" button that initiates a fresh, successful run.
  2. *Scenario Switching*:
     - Switching scenarios while a simulation is executing immediately halts the old run generation and cleanly populates the new scenario's target fixture without cross-contamination.
  3. *Secure Dev Server*:
     - Dev server runs on `127.0.0.1:3000` on local machines.
     - Rejects untrusted HTTP `Host` headers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Navigation Lifecycle Coordinator in `App.tsx` & `ScreenEMultiAgent.tsx`**
  - *Chosen Approach*: `ScreenEMultiAgent` exposes `isSimulating` and unmount cleanup, but `App.tsx` (the owner of `workers` state) executes `handleCancelRunningWorkersOnly()` upon screen transition away from `multi_agent` whenever `running` workers exist.
  - *Why*: Centralizing the state transition in `App.tsx` prevents React 18/19 StrictMode double-invocation glitches (where components briefly mount, unmount, and remount during development), while guaranteeing that real user navigation cancels active workers cleanly.
- **Decision 2: Explicit Trusted Hosts Allowlist in `vite.config.ts`**
  - *Chosen Approach*: Replace `allowedHosts: true` with an explicit list:
    ```ts
    allowedHosts: ['localhost', '127.0.0.1', '.run.app']
    ```
    And bind to `127.0.0.1` locally, or `0.0.0.0` when running in Cloud Run container environments.
  - *Why*: Eliminates security warnings and prevents arbitrary host header processing while preserving seamless preview accessibility.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CodeGuardian Navigation                         │
│                                                                        │
│   Screen E (Active Simulation) ──► User presses [1] Welcome           │
│         │                                                              │
│         ├─► timersRef.current.forEach(clearTimeout)                    │
│         ├─► runGenerationRef.current++                                 │
│         └─► onLeaveWhileRunning()                                      │
│                   │                                                    │
│                   ▼                                                    │
│   App.tsx (State Store):                                               │
│         next[role] = worker.state === 'running'                        │
│           ? createFreshWorker(role, 'cancelled')                       │
│           : worker // PRESERVED (completed, failed, skipped)           │
│                                                                        │
│   Return to Screen E:                                                  │
│         • No worker remains stuck in 'running'                         │
│         • Operator clicks [Re-run] ──► Fresh run completes cleanly     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Regression Test Matrix

| # | Regression Test Case | Expected Outcome |
|---|---|---|
| 1 | Start ➔ Leave Screen ➔ Return | Active running workers cancelled; completed workers preserved |
| 2 | Start ➔ Cancel ➔ Wait 3s | Workers remain cancelled; no resurrection |
| 3 | Start ➔ Leave ➔ Return ➔ Rerun | New run generation executes and completes |
| 4 | Completed workers ➔ Leave Screen | Completed workers remain complete upon return |
| 5 | Switch scenarios mid-simulation | All timers flushed; new scenario state clean |
| 6 | Vite config host validation | No wildcard `allowedHosts: true`; explicit trusted hosts only |
| 7–16 | Existing Acceptance Tests (1–10) | All 10 existing acceptance matrix tests pass without regression |
