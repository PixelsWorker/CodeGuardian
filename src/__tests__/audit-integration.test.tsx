import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { AUDIT_SCENARIOS, DEFAULT_REPOSITORY_SNAPSHOT, DEFAULT_AUDIT_FINDINGS } from '../data/auditScenarios';

describe('CodeGuardian G06 Full Repository Audit Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.clearAllTimers();
    });
    vi.useRealTimers();
  });

  // Test 1: Shared Home Screen renders both PR Review and Repo Audit workflows
  it('1. Shared Home Screen presents both Review Pull Request and Audit Full Repository options', () => {
    render(<App />);

    expect(screen.getByText(/1\. Review Pull Request/i)).toBeDefined();
    expect(screen.getByText(/2\. Audit Full Repository/i)).toBeDefined();
    expect(screen.getByText(/Launch Full Review Demo \(PR #42\)/i)).toBeDefined();
    expect(screen.getAllByText(/Launch Full Repository Audit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google Jules/i).length).toBeGreaterThan(0);
  });

  // Test 2: Launching Full Repository Audit transitions to Repo Audit workflow
  it('2. Clicking Launch Full Repository Audit switches to Repo Audit workflow', () => {
    render(<App />);

    const launchAuditBtn = screen.getByTestId('launch-repo-audit-btn');
    act(() => {
      fireEvent.click(launchAuditBtn);
    });

    // Should display View A: Repository Selection
    expect(screen.getByText(/AUDIT VIEW A: REPOSITORY IDENTITY & SNAPSHOT SELECTION/i)).toBeDefined();
    expect(screen.getByText(/INDEPENDENT COMMIT PINNING REQUIREMENT/i)).toBeDefined();
    expect(screen.getByText(/TRACKED MANIFEST INVENTORY/i)).toBeDefined();
  });

  // Test 3: Switching workflow via top toggle bar
  it('3. Top toggle bar switches between PR Review and Repo Audit modes', () => {
    render(<App />);

    // Click Repo Audit toggle button
    const repoAuditToggle = screen.getByTestId('toggle-repo-audit');
    act(() => {
      fireEvent.click(repoAuditToggle);
    });

    expect(screen.getByText(/AUDIT VIEW A: REPOSITORY IDENTITY & SNAPSHOT SELECTION/i)).toBeDefined();

    // Click PR Review toggle button
    const prReviewToggle = screen.getByTestId('toggle-pr-review');
    act(() => {
      fireEvent.click(prReviewToggle);
    });

    expect(screen.getByText(/Launch Full Review Demo \(PR #42\)/i)).toBeDefined();
  });

  // Test 4: Repository Selection validates 40-char SHA and allows advancing to Preflight
  it('4. Repository Selection enforces 40-character commit SHA and advances to Preflight', () => {
    render(<App />);

    // Switch to audit
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Verify valid SHA indicator
    expect(screen.getByText(/✓ Valid full 40-character SHA/i)).toBeDefined();

    // Click Proceed to Preflight
    const proceedBtn = screen.getByText(/Proceed to Audit Preflight/i);
    act(() => {
      fireEvent.click(proceedBtn);
    });

    expect(screen.getByText(/AUDIT VIEW B: PREFLIGHT INTEGRITY & OPERATOR PLAN APPROVAL/i)).toBeDefined();
    expect(screen.getByText(/PROPOSED JULES AUDIT PLAN/i)).toBeDefined();
  });

  // Test 5: Preflight enforces requirePlanApproval: true
  it('5. Preflight blocks launch until operator approves proposed audit execution plan', () => {
    render(<App />);

    // Switch to audit
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Navigate to Preflight via bottom nav [B] Preflight
    act(() => {
      fireEvent.click(screen.getByText(/\[B\] Preflight/i));
    });

    // Click Reject Plan
    const rejectBtn = screen.getByText(/Reject Plan/i);
    act(() => {
      fireEvent.click(rejectBtn);
    });

    expect(screen.getByText(/Operator rejected proposed Jules execution plan/i)).toBeDefined();

    // Verify Launch button is disabled
    const launchBtn = screen.getByText(/Launch Jules Audit Session/i).closest('button');
    expect(launchBtn?.hasAttribute('disabled')).toBe(true);

    // Now Approve Plan
    const approveBtn = screen.getByText(/Approve Execution Plan/i);
    act(() => {
      fireEvent.click(approveBtn);
    });

    expect(screen.getByText(/OPERATOR APPROVED/i)).toBeDefined();
    expect(launchBtn?.hasAttribute('disabled')).toBe(false);
  });

  // Test 6: Drift detection refuses stale commit execution
  it('6. Snapshot identity check catches branch drift and refuses execution', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[B\] Preflight/i));
    });

    // Simulate drift
    const driftBtn = screen.getByText(/Simulate Drift/i);
    act(() => {
      fireEvent.click(driftBtn);
    });

    expect(screen.getByText(/REFUSED \(Stale Branch\)/i)).toBeDefined();
    expect(screen.getByText(/DRIFT DETECTED/i)).toBeDefined();

    // Launch button should be disabled
    const launchBtn = screen.getByText(/Launch Jules Audit Session/i).closest('button');
    expect(launchBtn?.hasAttribute('disabled')).toBe(true);
  });

  // Test 7: Coverage Ledger displays all 6 tiers and filters files
  it('7. Coverage Ledger groups files across 6 tiers and supports interactive filtering', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[C\] Coverage/i));
    });

    expect(screen.getByText(/AUDIT VIEW C: REPOSITORY COVERAGE LEDGER/i)).toBeDefined();
    expect(screen.getByText(/CANONICAL COVERAGE RULE/i)).toBeDefined();

    // Verify 6 tier buttons
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Analyzed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inspected/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inventoried/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Excluded/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unknown/i).length).toBeGreaterThan(0);

    // Click filter to Verified tier
    act(() => {
      fireEvent.click(screen.getByText(/Tier 4/i));
    });

    expect(screen.getByText(/Filter: independently[ _]verified/i)).toBeDefined();
    expect(screen.getByText(/src\/utils\/serverConfig\.ts/i)).toBeDefined();
  });

  // Test 8: Jules Activity simulation runs, reports progress, and can be cancelled
  it('8. Jules Activity simulation can be cancelled mid-run without leaks', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[B\] Preflight/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/Approve Execution Plan/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });

    expect(screen.getByText(/AUDIT VIEW D: JULES AUDIT ACTIVITIES/i)).toBeDefined();

    // Click Run Jules Analysis
    const runBtn = screen.getByText(/Re-run Jules Analysis|Run Jules Analysis/i);
    act(() => {
      fireEvent.click(runBtn);
    });

    // Check that Cancel button appears
    const cancelBtn = screen.getByText(/Cancel \/ Abort/i);
    expect(cancelBtn).toBeDefined();

    // Trigger Cancel
    act(() => {
      fireEvent.click(cancelBtn);
    });

    // Verify cancelled state
    expect(screen.getAllByText(/\[cancelled\]/i).length).toBeGreaterThan(0);
  });

  // Test 9: Manager Verification independently traces callers and rejects model hallucinations
  it('9. Manager Verification categorizes claims and rejects fabricated file hallucinations', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[E\] Verification/i));
    });

    expect(screen.getByText(/AUDIT VIEW E: CODEGUARDIAN MANAGER INDEPENDENT VERIFICATION/i)).toBeDefined();
    expect(screen.getByText(/INDEPENDENT SOURCE FACT-CHECKING/i)).toBeDefined();

    // Check counts
    expect(screen.getByText(/3 Verified/i)).toBeDefined();
    expect(screen.getByText(/2 Rejected/i)).toBeDefined();
    expect(screen.getByText(/1 Inconclusive/i)).toBeDefined();

    // Filter to Rejected hallucinations
    act(() => {
      fireEvent.click(screen.getByText(/2 Rejected/i));
    });

    // Nonexistent secret token file should be flagged as rejected
    expect(screen.getByText(/Hardcoded GitHub Personal Access Token/i)).toBeDefined();
    expect(screen.getByText(/REJECTED BY MANAGER: File "src\/auth\/secret_tokens\.ts" does NOT exist/i)).toBeDefined();
  });

  // Test 10: AUDIT.md Preview renders report and exports Markdown / JSON
  it('10. AUDIT.md Preview displays snapshot metadata and allows Markdown/JSON inspection', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });

    expect(screen.getByText(/AUDIT VIEW F: AUDIT\.md REPORT PREVIEW & ARTIFACT EXPORT/i)).toBeDefined();
    expect(screen.getByText(/PROPOSED AUDIT PUBLICATION BOUNDARY/i)).toBeDefined();

    // Switch to Raw Markdown tab
    act(() => {
      fireEvent.click(screen.getByText(/Raw Markdown/i));
    });

    expect(screen.getByText(/# CodeGuardian Repository Audit Report/i)).toBeDefined();

    // Switch to Canonical JSON tab
    act(() => {
      fireEvent.click(screen.getByText(/Canonical JSON/i));
    });

    expect(screen.getByText(/"schema_version": "1.0.0"/i)).toBeDefined();
  });

  // Test 11: Applying an Audit Scenario applies state and jumps to initial screen
  it('11. Selecting an Audit Scenario loads synthetic snapshot and transitions to designated view', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[S\] Scenarios/i));
    });

    expect(screen.getByText(/FULL REPOSITORY AUDIT: 8 DETERMINISTIC SIMULATION SCENARIOS/i)).toBeDefined();

    // Find Scenario 4: Jules Authentication Failure
    const simulateBtn = screen.getByTestId('simulate-audit_missing_auth');
    expect(simulateBtn).toBeDefined();

    act(() => {
      fireEvent.click(simulateBtn);
    });

    // Should transition to Preflight with AUTH_ERROR
    expect(screen.getByText(/AUDIT VIEW B: PREFLIGHT INTEGRITY & OPERATOR PLAN APPROVAL/i)).toBeDefined();
    expect(screen.getByText(/\[AUTH_ERROR\] Missing GCP Credentials/i)).toBeDefined();
  });

  // Test 12: CLI Command Dispatcher enforces central preflight gate when unapproved
  it('12. CLI Command Dispatcher enforces central preflight gate when unapproved and launches when approved', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/Type CLI command/i);
    const enterBtn = screen.getByText(/Enter ↵/i);

    // Initial state: planApproved is false. CLI command must redirect to View B
    act(() => {
      fireEvent.change(input, { target: { value: 'codeguardian audit PixelsWorker/CodeGuardian' } });
      fireEvent.click(enterBtn);
    });

    expect(screen.getByText(/AUDIT VIEW B: PREFLIGHT INTEGRITY & OPERATOR PLAN APPROVAL/i)).toBeDefined();

    // Now approve plan and launch
    const approveBtn = screen.getByText(/Approve Execution Plan/i);
    act(() => {
      fireEvent.click(approveBtn);
    });

    const launchBtn = screen.getByText(/Launch Jules Audit Session/i);
    act(() => {
      fireEvent.click(launchBtn);
    });

    // Navigates to audit activity
    expect(screen.getByText(/AUDIT VIEW D: JULES AUDIT ACTIVITIES/i)).toBeDefined();
  });

  // Test 13: Direct Activity Run/Re-run button respects central authorization gate
  it('13. Activity Run button respects central authorization gate and redirects to View B when unapproved', () => {
    render(<App />);

    // Switch to audit and navigate directly to Activity screen
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });

    expect(screen.getByText(/AUDIT VIEW D: JULES AUDIT ACTIVITIES/i)).toBeDefined();

    // Since planApproved is false initially, clicking Run/Re-run should redirect to View B
    const runBtn = screen.getByText(/Re-run Jules Analysis|Run Jules Analysis/i);
    act(() => {
      fireEvent.click(runBtn);
    });

    // Should redirect to Preflight (View B)
    expect(screen.getByText(/AUDIT VIEW B: PREFLIGHT INTEGRITY & OPERATOR PLAN APPROVAL/i)).toBeDefined();
  });

  // Test 14: Editing snapshot or choosing preset resets SHA verification and revokes plan approval
  it('14. Modifying snapshot parameters resets verification and revokes plan approval', () => {
    render(<App />);

    // Switch to audit preflight
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[B\] Preflight/i));
    });

    // Approve the plan
    act(() => {
      fireEvent.click(screen.getByText(/Approve Execution Plan/i));
    });
    expect(screen.getByText(/OPERATOR APPROVED/i)).toBeDefined();

    // Navigate to View A (Repo)
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });

    // Click sample snapshot preset (facebook/react)
    const presetBtn = screen.getByText(/facebook\/react @ a28189/i);
    act(() => {
      fireEvent.click(presetBtn);
    });

    // Navigate back to View B
    act(() => {
      fireEvent.click(screen.getByText(/Proceed to Audit Preflight/i));
    });

    // Plan approval must have been revoked and verification reset
    expect(screen.queryByText(/OPERATOR APPROVED/i)).toBeNull();
    expect(screen.getByText(/Approve Execution Plan/i)).toBeDefined();
  });

  // Test 15: Simulating drift or toggling auth revokes plan approval
  it('15. Simulating SHA drift or toggling auth immediately revokes plan approval', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[B\] Preflight/i));
    });

    // Approve plan first
    act(() => {
      fireEvent.click(screen.getByText(/Approve Execution Plan/i));
    });
    expect(screen.getByText(/OPERATOR APPROVED/i)).toBeDefined();

    // Simulate drift
    act(() => {
      fireEvent.click(screen.getByText(/Simulate Drift/i));
    });

    // Approval must be revoked immediately
    expect(screen.queryByText(/OPERATOR APPROVED/i)).toBeNull();
    expect(screen.getByText(/REFUSED \(Stale Branch\)/i)).toBeDefined();

    // Verify SHA again
    act(() => {
      fireEvent.click(screen.getByText(/Verify SHA/i));
    });
    // Approve plan again
    act(() => {
      fireEvent.click(screen.getByText(/Approve Execution Plan/i));
    });
    expect(screen.getByText(/OPERATOR APPROVED/i)).toBeDefined();

    // Toggle Auth to unauthenticated
    act(() => {
      fireEvent.click(screen.getByText(/Toggle Auth/i));
    });

    // Plan approval must be revoked immediately
    expect(screen.queryByText(/OPERATOR APPROVED/i)).toBeNull();
    expect(screen.getByText(/\[AUTH_ERROR\] Missing GCP Credentials/i)).toBeDefined();
  });

  // Test 16: Cross-workflow navigation cancels only active running workers/activities without clearing completed results
  it('16. Cross-workflow switching cancels only running items without wiping completed items', () => {
    render(<App />);

    // In PR Review, navigate to workers
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Start simulation
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Switch workflow to Repo Audit via top deck
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Switch back to PR Review
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-pr-review'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // The workers that were running should be cancelled, not left running
    expect(screen.queryByText(/\[RUNNING\]/i)).toBeNull();
  });

  // Test 17: Keyboard shortcut guard ignores focus in inputs, textareas, selects, and modifier keys
  it('17. Keyboard navigation ignores keypresses inside form inputs and with modifiers', () => {
    render(<App />);

    // Focus CLI input and press '2' (which normally opens Auth screen)
    const cliInput = screen.getByPlaceholderText(/Type CLI command/i);
    cliInput.focus();

    act(() => {
      fireEvent.keyDown(cliInput, { key: '2', code: 'Digit2' });
    });

    // Should remain on Welcome screen
    expect(screen.getByText(/1\. Review Pull Request/i)).toBeDefined();

    // Test modifier key (e.g. Ctrl+2) on window
    act(() => {
      fireEvent.keyDown(window, { key: '2', code: 'Digit2', ctrlKey: true });
    });

    // Should still remain on Welcome screen
    expect(screen.getByText(/1\. Review Pull Request/i)).toBeDefined();
  });

  // Test 18: Applying an audit scenario synchronizes report status, snapshot, and limitations
  it('18. Applying an audit scenario synchronizes report status and metadata', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[S\] Scenarios/i));
    });

    // Apply Partial Timeout scenario
    const partialBtn = screen.getByTestId('simulate-audit_partial_timeout');
    act(() => {
      fireEvent.click(partialBtn);
    });

    // Navigate to View F (AUDIT.md)
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });

    // Status in report should reflect PARTIAL
    expect(screen.getAllByText(/PARTIAL/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dependency activity timed out; supply chain coverage remains partial\./i)).toBeDefined();
  });

  // Test 19: Clipboard failure fallback handles writeText rejection safely
  it('19. AUDIT.md Preview handles clipboard copy failure gracefully', async () => {
    render(<App />);

    // Mock navigator.clipboard.writeText to reject
    const originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')),
      },
    });

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });

    const copyBtn = screen.getByText(/Copy Artifact/i);
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // Verify failure notification is shown
    expect(screen.getByText(/Clipboard copy failed/i)).toBeDefined();

    // Restore clipboard
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  // Test 20: Edit repository and SHA invalidates verification; verify and approve plan allows launch
  it('20. Editing repository identity and SHA invalidates verification and blocks launch until verified and approved', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });

    // Change repository inputs
    const ownerInput = screen.getByPlaceholderText(/Owner \(e\.g\. PixelsWorker\)/i);
    const repoInput = screen.getByPlaceholderText(/Repo \(e\.g\. CodeGuardian\)/i);
    const shaInput = screen.getByPlaceholderText(/40-char commit SHA/i);

    act(() => {
      fireEvent.change(ownerInput, { target: { value: 'acme-corp' } });
      fireEvent.change(repoInput, { target: { value: 'payment-gateway' } });
      fireEvent.change(shaInput, { target: { value: '1234567890abcdef1234567890abcdef12345678' } });
    });

    // Click Save Snapshot Configuration
    act(() => {
      fireEvent.click(screen.getByText(/Save Snapshot Configuration/i));
    });

    // Navigate to View B
    act(() => {
      fireEvent.click(screen.getByText(/Proceed to Audit Preflight/i));
    });

    // Verification must be invalid, preflight blocked, launch disabled
    expect(screen.getByText(/PREFLIGHT BLOCKED/i)).toBeDefined();
    expect(screen.getByText(/REFUSED \(Stale Branch\)/i)).toBeDefined();
    const launchBtn = screen.getByText(/Launch Jules Audit Session/i).closest('button');
    expect(launchBtn?.hasAttribute('disabled')).toBe(true);

    // Mock verify SHA
    act(() => {
      fireEvent.click(screen.getByText(/Verify SHA/i));
    });
    expect(screen.getByText(/MATCHED \(Pinned\)/i)).toBeDefined();

    // Still cannot launch without plan approval
    expect(launchBtn?.hasAttribute('disabled')).toBe(true);

    // Re-query launch button and approve plan
    act(() => {
      fireEvent.click(screen.getByText(/Approve Execution Plan/i));
    });
    expect(screen.getByText(/OPERATOR APPROVED/i)).toBeDefined();

    const activeLaunchBtn = screen.getByText(/Launch Jules Audit Session/i).closest('button');
    expect(activeLaunchBtn?.hasAttribute('disabled')).toBe(false);

    // Launch should now succeed to View D (Activity)
    act(() => {
      fireEvent.click(activeLaunchBtn!);
    });
    expect(screen.getByText(/AUDIT VIEW D: JULES AUDIT ACTIVITIES/i)).toBeDefined();
  });

  // Test 21: Switching to external repository replaces complete audit evidence without leaking CodeGuardian findings
  it('21. Switching to external repository clears CodeGuardian findings and provides external/unverified evidence', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });

    // Switch to facebook/react preset
    const reactPresetBtn = screen.getByText(/facebook\/react @ a28189/i);
    act(() => {
      fireEvent.click(reactPresetBtn);
    });

    // View C: Coverage Ledger must not contain CodeGuardian source files
    act(() => {
      fireEvent.click(screen.getByText(/\[C\] Coverage/i));
    });
    expect(screen.queryByText(/src\/utils\/serverConfig\.ts/i)).toBeNull();
    expect(screen.queryByText(/src\/App\.tsx/i)).toBeNull();
    expect(screen.getByText(/packages\/react\/index\.js/i)).toBeDefined();

    // View E: Verification must not contain CodeGuardian findings
    act(() => {
      fireEvent.click(screen.getByText(/\[E\] Verification/i));
    });
    expect(screen.queryByText(/ServerConfig regional wildcard bypasses DNS host allowlist/i)).toBeNull();
    expect(screen.queryByText(/Terminal log ring buffer unbound allocation/i)).toBeNull();

    // View F: Report must show facebook/react and no CodeGuardian findings
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getAllByText(/facebook\/react/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/ServerConfig regional wildcard bypasses DNS host allowlist/i)).toBeNull();
  });

  // Test 22: Transition 1: CodeGuardian → React → CodeGuardian preserves coverage, activities and report consistency
  it('22. Transition 1: CodeGuardian → React → CodeGuardian maintains coverage, activities, and report consistency', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Initial state: CodeGuardian baseline
    act(() => {
      fireEvent.click(screen.getByText(/\[C\] Coverage/i));
    });
    expect(screen.getByText(/src\/utils\/serverConfig\.ts/i)).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });
    expect(screen.getByText(/Session jules-sess-2026-88a4/i)).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getByText(/STATUS: READY/i)).toBeDefined();
    expect(screen.getByText(/Modular TypeScript terminal architecture/i)).toBeDefined();

    // Transition to React preset
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/facebook\/react @ a28189/i));
    });

    // Check React: Coverage, Activity, Report
    act(() => {
      fireEvent.click(screen.getByText(/\[C\] Coverage/i));
    });
    expect(screen.queryByText(/src\/utils\/serverConfig\.ts/i)).toBeNull();
    expect(screen.getByText(/packages\/react\/index\.js/i)).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });
    expect(screen.queryByText(/Session jules-sess-2026-88a4/i)).toBeNull();
    expect(screen.queryByText(/serverConfig\.ts/i)).toBeNull();

    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getByText(/STATUS: BLOCKED/i)).toBeDefined();
    expect(screen.queryByText(/Modular TypeScript terminal architecture/i)).toBeNull();
    expect(screen.getByText(/External repository snapshot \(facebook\/react\)/i)).toBeDefined();

    // Transition back to CodeGuardian preset
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });
    act(() => {
      fireEvent.click(screen.getByText(/PixelsWorker\/CodeGuardian @ 3c9db3/i));
    });

    // Check CodeGuardian restored consistently
    act(() => {
      fireEvent.click(screen.getByText(/\[C\] Coverage/i));
    });
    expect(screen.getByText(/src\/utils\/serverConfig\.ts/i)).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });
    expect(screen.getByText(/Session jules-sess-2026-88a4/i)).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getByText(/STATUS: READY/i)).toBeDefined();
    expect(screen.getByText(/Modular TypeScript terminal architecture/i)).toBeDefined();
  });

  // Test 23: Transition 2: Same repository → different SHA or branch invalidates previous findings and report readiness
  it('23. Transition 2: Same repository with different SHA or branch invalidates previous findings and report readiness', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Baseline report is READY
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getByText(/STATUS: READY/i)).toBeDefined();
    expect(screen.getAllByText(/AUDIT-FIND-001/i).length).toBeGreaterThan(0);

    // Edit SHA in View A
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });

    const shaInput = screen.getByPlaceholderText(/40-char commit SHA/i);
    act(() => {
      fireEvent.change(shaInput, { target: { value: '5d88ab210e789012345678901234567890123456' } });
    });
    act(() => {
      fireEvent.click(screen.getByText(/Save Snapshot Configuration/i));
    });

    // View F: Report readiness must be invalidated (BLOCKED, not READY), findings must be cleared
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.getByText(/STATUS: BLOCKED/i)).toBeDefined();
    expect(screen.queryByText(/STATUS: READY/i)).toBeNull();
    expect(screen.queryByText(/AUDIT-FIND-001/i)).toBeNull();
    expect(screen.getByText(/Unverified commit SHA or branch drift detected/i)).toBeDefined();

    // View E: Manager Verification has 0 findings
    act(() => {
      fireEvent.click(screen.getByText(/\[E\] Verification/i));
    });
    expect(screen.queryByText(/AUDIT-FIND-001/i)).toBeNull();
  });

  // Test 24: Transition 3: External repository → View D → View F verifies no CodeGuardian-specific logs, architecture claims, or Jules session identity remain
  it('24. Transition 3: External repository → View D → View F contains no CodeGuardian-specific logs, architecture claims, or Jules session identity', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
    });

    // Select custom external repository in View A
    act(() => {
      fireEvent.click(screen.getByText(/\[A\] Repo/i));
    });
    const ownerInput = screen.getByPlaceholderText(/Owner \(e\.g\. PixelsWorker\)/i);
    const repoInput = screen.getByPlaceholderText(/Repo \(e\.g\. CodeGuardian\)/i);
    const shaInput = screen.getByPlaceholderText(/40-char commit SHA/i);
    act(() => {
      fireEvent.change(ownerInput, { target: { value: 'external-org' } });
      fireEvent.change(repoInput, { target: { value: 'cloud-agent' } });
      fireEvent.change(shaInput, { target: { value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } });
    });
    act(() => {
      fireEvent.click(screen.getByText(/Save Snapshot Configuration/i));
    });

    // View D: Activity Telemetry must NOT contain CodeGuardian references
    act(() => {
      fireEvent.click(screen.getByText(/\[D\] Jules Activity/i));
    });
    expect(screen.queryByText(/jules-sess-2026-88a4/i)).toBeNull();
    expect(screen.queryByText(/3c9db33177/i)).toBeNull();
    expect(screen.queryByText(/serverConfig\.ts/i)).toBeNull();
    expect(screen.queryByText(/TerminalChrome\.tsx/i)).toBeNull();
    expect(screen.queryByText(/ScreenEMultiAgent\.tsx/i)).toBeNull();

    // View F: Report must NOT contain CodeGuardian architecture claims or session identity
    act(() => {
      fireEvent.click(screen.getByText(/\[F\] AUDIT\.md/i));
    });
    expect(screen.queryByText(/Modular TypeScript terminal architecture/i)).toBeNull();
    expect(screen.queryByText(/jules-sess-2026-88a4/i)).toBeNull();
    expect(screen.queryByText(/AUDIT-FIND-001/i)).toBeNull();
    expect(screen.getByText(/External repository snapshot \(external-org\/cloud-agent\)/i)).toBeDefined();
    expect(screen.getByText(/STATUS: FAILED/i)).toBeDefined();
  });
});
