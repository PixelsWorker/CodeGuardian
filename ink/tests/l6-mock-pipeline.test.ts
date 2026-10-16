import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  cliReducer,
  CliState,
} from '../src/core/state-machine.js';
import {
  SYNTHETIC_PR_IDENTITY,
  SYNTHETIC_FINDINGS,
  SYNTHETIC_REPORT,
} from '../src/fixtures/fixtures.js';
import { formatReportMarkdown, formatReportJson } from '../src/core/report-formatter.js';

describe('L6 — Complete Mock Pipeline Integration', () => {
  it('Scenario 1: Complete Successful Run (URL → Inspect → Specialists → Consensus → Report → Publish)', () => {
    let state = createInitialState(true);
    expect(state.screen).toBe('welcome');
    expect(state.runStatus).toBe('queued');

    // 1. Submit PR URL
    state = cliReducer(state, {
      type: 'SET_PR_URL',
      url: 'https://github.com/example/demo/pull/42',
    });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.screen).toBe('inspection');
    expect(state.runStatus).toBe('inspecting');
    expect(state.prIdentity.owner).toBe('example');
    expect(state.prIdentity.number).toBe(42);

    // 2. Start Specialists
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    expect(state.screen).toBe('specialist');
    expect(state.runStatus).toBe('running');
    expect(state.specialists.every(s => s.state === 'running')).toBe(true);

    // 3. Complete Specialists
    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    expect(state.screen).toBe('consensus');
    expect(state.runStatus).toBe('validating');
    expect(state.specialists.every(s => s.state === 'complete')).toBe(true);

    // 4. Manager Consensus & Validation
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    expect(state.screen).toBe('report');
    expect(state.runStatus).toBe('ready');
    expect(state.report.status).toBe('ready');
    expect(state.report.findings.length).toBe(4);
    expect(state.report.tests.executed).toBe(false);

    // 5. Navigate to Publish gate
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'publish' });
    expect(state.screen).toBe('publish');
    expect(state.publishDecision).toBe('pending');

    // 6. Confirm simulated publication
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.publishDecision).toBe('confirmed');
    expect(state.publishOutcome).toBe('normal');
    expect(state.runStatus).toBe('published');

    // 7. Starting a new review resets publish decision to pending
    state = cliReducer(state, {
      type: 'SET_PR_URL',
      url: 'https://github.com/example/demo/pull/42',
    });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.publishDecision).toBe('pending');
    expect(state.publishOutcome).toBe('normal');
  });

  it('Scenario 2: Partial Run with Specialist Failure & Incomplete Coverage Warnings', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });

    // Simulate Quality lane crash
    state = cliReducer(state, {
      type: 'SIMULATE_FAILURE',
      role: 'quality',
      reason: 'AST parser crash on benchmark test suite',
    });

    const qualityWorker = state.specialists.find(s => s.role === 'quality');
    expect(qualityWorker?.state).toBe('failed');
    expect(qualityWorker?.failureReason).toContain('AST parser crash');

    // Finish remaining lanes
    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });

    expect(state.screen).toBe('report');
    expect(state.runStatus).toBe('partial');
    expect(state.report.status).toBe('partial');
    expect(state.report.worker_states.find(w => w.worker_id === 'worker-qty')?.state).toBe('failed');
    expect(state.report.warnings.some(w => w.includes('Incomplete worker coverage'))).toBe(true);
    // Navigate to publish gate and deny — must preserve partial runStatus
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'publish' });
    expect(state.screen).toBe('publish');
    expect(state.runStatus).toBe('partial');
    state = cliReducer(state, { type: 'DENY_PUBLISH' });
    expect(state.publishDecision).toBe('denied');
    expect(state.runStatus).toBe('partial');
    expect(state.report.status).toBe('partial');
  });

  it('Scenario 3: Authentication Failures & Preflight Remediation Guidance', () => {
    let state = createInitialState(true);
    expect(state.githubAuth).toBe('authenticated');
    expect(state.codexAuth).toBe('authenticated');

    // Cycle to not_authenticated
    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('not_authenticated');

    // Verify submitting PR URL while unauthenticated blocks inspection
    const blockedSubmit = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(blockedSubmit.screen).toBe('error');
    expect(blockedSubmit.runStatus).toBe('blocked');
    expect(blockedSubmit.errorMessage).toContain('Preflight authentication blocked');

    // Verify starting specialists while unauthenticated blocks execution
    const blockedSpecialists = cliReducer(state, { type: 'START_SPECIALISTS' });
    expect(blockedSpecialists.screen).toBe('error');
    expect(blockedSpecialists.runStatus).toBe('blocked');
    expect(blockedSpecialists.errorMessage).toContain('Preflight authentication blocked');

    // Cycle to insufficient_permissions
    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('insufficient_permissions');

    // Cycle to session_expired
    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('session_expired');

    // Block preflight
    state = cliReducer(state, {
      type: 'SET_ERROR',
      status: 'blocked',
      message: 'Preflight authentication blocked: session_expired. Run `gh auth login` and `codex login`.',
    });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe('blocked');
    expect(state.errorMessage).toContain('Preflight authentication blocked');
  });

  it('Scenario 4: Invalid PR URLs & Host Rejections', () => {
    let state = createInitialState(true);

    // GitLab URL rejected
    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://gitlab.com/gitlab-org/gitlab/pull/42' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toContain('Invalid GitHub PR URL');
    expect(state.screen).toBe('welcome');

    // Bitbucket URL rejected
    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://bitbucket.org/owner/repo/pull/1' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toContain('Invalid GitHub PR URL');

    // Malformed path rejected
    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://github.com/facebook/react/issues/100' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toContain('Invalid GitHub PR URL');
  });

  it('Scenario 5: User Cancellation & Safe Teardown', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    expect(state.runStatus).toBe('running');

    // User presses [Esc] during specialist execution
    state = cliReducer(state, { type: 'CANCEL_RUN' });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe('cancelled');
    expect(state.errorMessage).toContain('cancelled by user');
    expect(state.specialists.every(s => s.state === 'cancelled' || s.state === 'complete')).toBe(true);
  });

  it('Scenario 6: Retry & Complete State Reset (No Leakage Across Runs)', () => {
    let state = createInitialState(true);

    // Attempting to publish without a completed review is blocked
    expect(cliReducer(state, { type: 'APPROVE_PUBLISH' })).toEqual(state);

    // Complete review flow to reach eligible publish state
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'publish' });
    expect(state.runStatus).toBe('ready');

    // Complete run and confirm publish
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.publishDecision).toBe('confirmed');
    expect(state.runStatus).toBe('published');

    // Reset via RESET action
    state = cliReducer(state, { type: 'RESET' });
    expect(state.screen).toBe('welcome');
    expect(state.runStatus).toBe('queued');
    expect(state.publishDecision).toBe('pending');
    expect(state.publishOutcome).toBe('normal');
    expect(state.errorMessage).toBeNull();

    // From error screen, RETRY_RUN action also resets cleanly
    state = cliReducer(state, { type: 'SET_ERROR', message: 'Fatal simulation crash' });
    expect(state.screen).toBe('error');
    state = cliReducer(state, { type: 'RETRY_RUN' });
    expect(state.screen).toBe('welcome');
    expect(state.runStatus).toBe('queued');
    expect(state.errorMessage).toBeNull();
  });

  it('Scenario 7: Late / Stale Worker Updates are Ignored Once Run is Cancelled or Errored', () => {
    // 1. Verify progress arriving after failure does not revive a failed specialist
    let runState = createInitialState(true);
    runState = cliReducer(runState, { type: 'START_SPECIALISTS' });
    runState = cliReducer(runState, {
      type: 'SIMULATE_FAILURE',
      role: 'quality',
      reason: 'AST syntax error',
    });
    expect(runState.specialists.find(s => s.role === 'quality')?.state).toBe('failed');

    // Stale progress arrives for failed specialist
    runState = cliReducer(runState, {
      type: 'SPECIALIST_PROGRESS',
      role: 'quality',
      progress: 100,
      activity: 'Late recovery attempt',
    });
    expect(runState.specialists.find(s => s.role === 'quality')?.state).toBe('failed');

    // 2. Cancellation guards
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, { type: 'CANCEL_RUN' });
    expect(state.runStatus).toBe('cancelled');

    // Simulate late arriving worker progress after cancellation
    const cancelledStateBefore = { ...state };
    state = cliReducer(state, {
      type: 'SPECIALIST_PROGRESS',
      role: 'security',
      progress: 100,
      activity: 'Late AST parse finish',
    });
    expect(state.runStatus).toBe('cancelled');
    expect(state.screen).toBe('error');
    expect(state.specialists).toEqual(cancelledStateBefore.specialists);

    // Simulate late worker failure after cancellation
    state = cliReducer(state, {
      type: 'SIMULATE_FAILURE',
      role: 'logic',
      reason: 'Late timeout',
    });
    expect(state.runStatus).toBe('cancelled');
    expect(state.specialists).toEqual(cancelledStateBefore.specialists);

    // Simulate late FINISH_SPECIALISTS after cancellation
    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    expect(state.runStatus).toBe('cancelled');
    expect(state.screen).toBe('error');
    expect(state.specialists).toEqual(cancelledStateBefore.specialists);

    // Simulate late VALIDATE_FINDINGS after cancellation
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    expect(state.runStatus).toBe('cancelled');
    expect(state.screen).toBe('error');

    // Simulate late APPROVE_PUBLISH after cancellation
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.runStatus).toBe('cancelled');
    expect(state.screen).toBe('error');
    expect(state.publishDecision).toBe('pending');

    // 3. Verify SIMULATE_FAILURE after report validation is rejected
    let finishedState = createInitialState(true);
    finishedState = cliReducer(finishedState, { type: 'START_SPECIALISTS' });
    finishedState = cliReducer(finishedState, { type: 'FINISH_SPECIALISTS' });
    finishedState = cliReducer(finishedState, { type: 'VALIDATE_FINDINGS' });
    expect(finishedState.screen).toBe('report');
    expect(finishedState.runStatus).toBe('ready');

    const postValidationFailure = cliReducer(finishedState, {
      type: 'SIMULATE_FAILURE',
      role: 'quality',
      reason: 'Late post-validation crash',
    });
    expect(postValidationFailure.screen).toBe('report');
    expect(postValidationFailure.runStatus).toBe('ready');
    expect(postValidationFailure.report.status).toBe('ready');
  });

  it('Scenario 8: Stale Head SHA Blocks Publication Confirmation', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'publish' });
    expect(state.screen).toBe('publish');
    expect(state.runStatus).toBe('ready');

    state = cliReducer(state, { type: 'TRIGGER_STALE_SHA' });
    expect(state.publishOutcome).toBe('stale_sha');

    // Attempting to approve must be refused
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.publishDecision).toBe('pending');
    expect(state.runStatus).not.toBe('published');

    // Attempting to deny while stale is also ignored/blocked
    state = cliReducer(state, { type: 'DENY_PUBLISH' });
    expect(state.publishDecision).toBe('pending');
  });

  it('Scenario 9: Publication Evidence — Only verified_diff Findings are Eligible for Inline Comments', () => {
    const findings = SYNTHETIC_REPORT.findings;
    const verifiedInline = findings.filter(f => f.verification === 'verified_diff');
    const uncertainSummary = findings.filter(f => f.verification !== 'verified_diff');

    expect(verifiedInline.length).toBe(3);
    expect(uncertainSummary.length).toBe(1);

    // Finding f-004 is uncertain (needs_context)
    const f4 = findings.find(f => f.id === 'f-004');
    expect(f4?.verification).toBe('needs_context');

    // All verified_diff findings have non-null line and non-null side
    for (const f of verifiedInline) {
      expect(f.line).not.toBeNull();
      expect(f.side).not.toBeNull();
    }
  });

  it('Scenario 10: Clear Distinction Between In-Memory Mock and Non-Interactive Export', () => {
    // Non-interactive export functions produce self-contained strings
    const md = formatReportMarkdown(SYNTHETIC_REPORT);
    const json = formatReportJson(SYNTHETIC_REPORT);

    expect(typeof md).toBe('string');
    expect(typeof json).toBe('string');

    const parsedJson = JSON.parse(json);
    expect(parsedJson.run_id).toBe(SYNTHETIC_REPORT.run_id);
    expect(parsedJson.tests.executed).toBe(false);
  });
});
