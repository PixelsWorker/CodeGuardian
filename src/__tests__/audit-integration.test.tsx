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

    expect(screen.getByText(/Filter: independently_verified/i)).toBeDefined();
    expect(screen.getByText(/src\/utils\/serverConfig\.ts/i)).toBeDefined();
  });

  // Test 8: Jules Activity simulation runs, reports progress, and can be cancelled
  it('8. Jules Activity simulation can be cancelled mid-run without leaks', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-repo-audit'));
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

  // Test 12: CLI Command Dispatcher handles audit commands
  it('12. CLI Command Dispatcher executes codeguardian audit command and launches workflow', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/Type CLI command/i);
    const enterBtn = screen.getByText(/Enter ↵/i);

    act(() => {
      fireEvent.change(input, { target: { value: 'codeguardian audit PixelsWorker/CodeGuardian' } });
      fireEvent.click(enterBtn);
    });

    // Navigates to audit activity
    expect(screen.getByText(/AUDIT VIEW D: JULES AUDIT ACTIVITIES/i)).toBeDefined();
  });
});
