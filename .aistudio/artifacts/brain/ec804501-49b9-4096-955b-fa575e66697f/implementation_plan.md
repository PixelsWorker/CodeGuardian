# CodeGuardian Unified Prototype — Correction & Hardening Plan

This implementation plan resolves the CodeRabbit review findings for the unified G00 (PR Review) and G06 (Full Repository Audit) synthetic browser prototype. All modifications adhere strictly to the mock-only boundary: no external API calls, no real Jules or Codex cloud daemons, and no GitHub writes.

---

## 1. Overview of Proposed Changes

| Priority | Area | Key Objective |
|---|---|---|
| **Priority 1** | **Central Audit Gate** | Implement an authoritative gate in `App.tsx` verifying Jules auth, snapshot verification, SHA equality, and operator plan approval before starting any audit simulation. Direct unauthorized attempts to View B. |
| **Priority 2** | **Snapshot & Approval Invalidation** | Demote 40-char regex checking to syntax validation; reset SHA verification and revoke plan approval whenever repository, branch, SHA, or exclusions mutate; adjust restricted execution wording. |
| **Priority 3** | **Lifecycle & Scenarios** | Coordinate navigation through parent handlers; cancel only active `running` activities on navigation; flush timers and invalidate generation tokens; cleanly rebuild scenario telemetry. |
| **Priority 4** | **UX Corrections** | Guard keyboard shortcuts against editable focus and modifier keys; replace all underscores in coverage states; handle clipboard writes asynchronously; verify persistent DEMO ONLY labeling. |
| **Testing** | **Automated Test Matrix** | Preserve all 53 existing tests; add test suites covering blocked launches, invalidations, run bypasses, cross-workflow transitions, and async clipboard resilience. |

---

## 2. Proposed Changed-File List

1. `src/App.tsx`
   - Implement `canLaunchAudit` central authorization gate.
   - Route `codeguardian audit` CLI command, View B Launch button, and View D Run button through `handleLaunchAudit`.
   - Enforce invalidation: resetting `isShaVerified` and `planApproved` when snapshot parameters change or authentication fails.
   - Coordinate cross-screen activity cancellation (cancelling only `running` activities, clearing timers, incrementing run tokens).
   - Guard keyboard shortcuts (`INPUT`, `TEXTAREA`, `SELECT`, editable elements, and `ctrl/alt/meta` modifier keys).

2. `src/components/screens/audit/AuditScreenARepoSelect.tsx`
   - Separate 40-character hex syntax check from snapshot source verification (`verified_audit_commit_sha: null` until independently verified).
   - Invalidate verification and approved status when editing owner, repo, branch, SHA, or exclusions.

3. `src/components/screens/audit/AuditScreenBPreflight.tsx`
   - Tie preflight readiness directly to the central authorization predicate.
   - Revoke plan approval immediately when Jules auth fails or SHA drift is simulated.
   - Update wording from "READ ONLY" guarantee to "RESTRICTED (PROPOSED)" cloud sandbox arrangement.

4. `src/components/screens/audit/AuditScreenCCoverage.tsx`
   - Clean up coverage category labels: replace all underscores (`context_analyzed` ➔ `Context Analyzed`, `independently_verified` ➔ `Independently Verified`).

5. `src/components/screens/audit/AuditScreenDActivity.tsx`
   - Wire the "Run Jules Analysis" / "Re-run" button to parent authorization check rather than unconstrained self-start.
   - Invalidate background timers and callbacks on unmount or cancellation.

6. `src/components/screens/audit/AuditScreenFReport.tsx`
   - Implement asynchronous clipboard write with safe failure fallback.
   - Synchronize report snapshot, status, findings, and limitations with active scenario.

7. `src/data/auditScenarios.ts`
   - Reconstruct fresh activity telemetry for each scenario to prevent state leakage from previous runs.
   - Verify scenario expected-status descriptions align with UI outputs.

8. `src/__tests__/audit-integration.test.tsx`
   - Maintain all 12 existing audit tests.
   - Add integration tests for: central gate rejection, approved launch, SHA change invalidation, auth failure revocation, direct activity run redirection, and async clipboard errors.

---

## 3. Exact Patch Plan

### Priority 1: Central Audit Authorization Gate (`App.tsx`)
```ts
export const canLaunchAudit = (
  auth: 'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited',
  isVerified: boolean,
  snapshot: RepositorySnapshot,
  planApproved: boolean
): boolean => {
  return (
    auth === 'authenticated' &&
    isVerified &&
    Boolean(snapshot.verified_audit_commit_sha) &&
    snapshot.verified_audit_commit_sha === snapshot.intended_commit_sha &&
    planApproved
  );
};
```
- In `handleLaunchAudit`:
  - If `canLaunchAudit(...) === true`:
    - Set `activeWorkflow('repo_audit')`
    - Set `auditScreen('audit_activity')`
    - Trigger `setAuditAutoStartToken(t => (t ? t + 1 : 1))`
  - If `canLaunchAudit(...) === false`:
    - Set `activeWorkflow('repo_audit')`
    - Set `auditScreen('audit_preflight')`
    - Do NOT increment `auditAutoStartToken`

### Priority 2: Invalidation & Wording (`AuditScreenARepoSelect.tsx` & `AuditScreenBPreflight.tsx`)
- On repository input changes or preset selection:
  ```ts
  setSnapshot(prev => ({
    ...prev,
    owner: ownerInput.trim(),
    repo: repoInput.trim(),
    requested_branch: branchInput.trim(),
    intended_commit_sha: shaInput.trim(),
    verified_audit_commit_sha: null, // Reset verification
  }));
  setIsShaVerified(false);
  setPlanApproved(false);
  ```
- In `AuditScreenBPreflight.tsx`:
  - Toggling auth to non-authenticated or clicking "Simulate Drift" triggers `setPlanApproved(false)`.
  - Wording updated: "Proposed Execution Isolation: RESTRICTED (PROPOSED)" with explanatory note on proposed ephemeral container isolation.

### Priority 3: Lifecycle, Telemetry & Scenario Transitions
- `handleCancelRunningAuditActivitiesOnly()`:
  - Iterates over `auditActivities`; transitions only items with `state === 'running'` to `state === 'cancelled'`.
  - Clears simulation timers and updates run generation.
- `handleApplyAuditScenario`:
  - Resets `auditAutoStartToken(null)`.
  - Generates fresh activity fixtures with zeroed timers and initial telemetry logs matching the scenario specification.

### Priority 4: UX Adjustments
- Keyboard shortcut filter:
  ```ts
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
  const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
  if (isInput || hasModifier) return;
  ```
- Underscore replacement:
  ```ts
  const formatCoverageState = (state: string) => state.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  ```
- Clipboard handling:
  ```ts
  navigator.clipboard?.writeText(markdown)
    .then(() => setCopied(true))
    .catch(() => setCopyFailed(true));
  ```

---

## 4. Integration Test Verification Plan

1. **Gate Enforcement Test**: Executing `codeguardian audit` via terminal or clicking Launch while unapproved or unauthenticated must transition the view to `audit_preflight` with the simulation inactive.
2. **Approved Flow Test**: Once credentials are valid, SHA is verified, and plan is approved, Launch transitions to `audit_activity` and starts execution.
3. **Parameter Invalidation Test**: Changing repo identity or intended commit SHA resets verified SHA to `null` and revokes plan approval.
4. **Drift & Auth Revocation Test**: Simulating SHA drift or toggling Jules auth immediately marks the plan unapproved.
5. **Activity Run Bypass Test**: Clicking Run or Re-run on View D when unapproved redirects to View B instead of starting.
6. **Cross-Screen Worker/Activity Preservation Test**: Navigating away from View D while running cancels running activities without affecting completed ones.
7. **Keyboard Shortcut Safety Test**: Typing hotkey letters ('a', 'h', '1') into inputs or with Alt/Ctrl held does not trigger navigation.
8. **Clipboard Resilience Test**: Simulating rejected clipboard promise fails gracefully without uncaught exceptions.
9. **Full Regression Test**: All 53 existing tests across `component-integration.test.tsx`, `audit-integration.test.tsx`, and `acceptance.test.ts` pass cleanly.
