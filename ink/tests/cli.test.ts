import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  cliReducer,
  CliState,
} from '../src/core/state-machine.js';
import { formatReportMarkdown, formatReportJson } from '../src/core/report-formatter.js';
import { SYNTHETIC_REPORT } from '../src/fixtures/fixtures.js';

describe('G00 CLI State Machine & Contracts', () => {
  it('initializes with clean default state in demo mode', () => {
    const state = createInitialState(true);
    expect(state.screen).toBe('welcome');
    expect(state.runStatus).toBe('queued');
    expect(state.specialists.length).toBe(4);
    expect(state.findings.length).toBe(4);
    expect(state.isDemo).toBe(true);
  });

  it('validates PR URLs correctly and rejects invalid hosts', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://gitlab.com/foo/bar/pull/1' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toContain('Invalid GitHub PR URL');
    expect(state.screen).toBe('welcome');

    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://github.com/facebook/react/pull/1234' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toBeNull();
    expect(state.screen).toBe('inspection');
    expect(state.prIdentity.owner).toBe('facebook');
    expect(state.prIdentity.repo).toBe('react');
    expect(state.prIdentity.number).toBe(1234);
    expect(state.report.pr.owner).toBe('facebook');
    expect(state.report.pr.repo).toBe('react');
    expect(state.report.pr.number).toBe(1234);
  });

  it('transitions through specialist lanes to consensus and report', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    expect(state.screen).toBe('specialist');
    expect(state.runStatus).toBe('running');

    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    expect(state.screen).toBe('consensus');
    expect(state.runStatus).toBe('validating');

    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    expect(state.screen).toBe('report');
    expect(state.runStatus).toBe('ready');
  });

  it('handles partial lane failure and sets runStatus to partial', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, {
      type: 'SIMULATE_FAILURE',
      role: 'quality',
      reason: 'AST parser crash'
    });
    expect(state.specialists.find(s => s.role === 'quality')?.state).toBe('failed');

    state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
    state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
    expect(state.screen).toBe('report');
    expect(state.runStatus).toBe('partial');
    expect(state.report.status).toBe('partial');
    expect(state.report.worker_states.find(w => w.worker_id === 'worker-qty')?.state).toBe('failed');
    expect(state.report.warnings.some(w => w.includes('Incomplete worker coverage'))).toBe(true);
    expect(state.report.summary).toContain('PARTIAL REVIEW');
  });

  it('updates metadata honestly for non-default PR URLs without Alex auth token title', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'SET_PR_URL', url: 'https://github.com/facebook/react/pull/9999' });
    state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
    expect(state.prIdentity.title).toBe('[DEMO] PR #9999: facebook/react');
    expect(state.prIdentity.author).toBe('facebook-contributor');
    expect(state.prIdentity.head_branch).toBe('feature/pr-9999');
    expect(state.report.pr.title).toBe('[DEMO] PR #9999: facebook/react');
  });

  it('handles cancellation and transitions to error screen with safe cleanup', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, { type: 'CANCEL_RUN' });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe('cancelled');
    expect(state.errorMessage).toContain('cancelled by user');
  });

  it('handles publication approval, locks decision, and blocks reversal', () => {
    // Attempting to approve from unreviewed initial state must be rejected
    const initialState = createInitialState(true);
    expect(cliReducer(initialState, { type: 'APPROVE_PUBLISH' })).toEqual(initialState);

    let state: CliState = { ...createInitialState(true), screen: 'publish', runStatus: 'ready' };
    expect(state.publishDecision).toBe('pending');
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.screen).toBe('publish');
    expect(state.publishOutcome).toBe('normal');
    expect(state.publishDecision).toBe('confirmed');
    expect(state.runStatus).toBe('published');

    // Attempting to deny after confirmation must be ignored (locked)
    state = cliReducer(state, { type: 'DENY_PUBLISH' });
    expect(state.publishDecision).toBe('confirmed');
    expect(state.runStatus).toBe('published');

    // Navigating away and returning preserves the confirmed decision
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'report' });
    state = cliReducer(state, { type: 'NAVIGATE', screen: 'publish' });
    expect(state.publishDecision).toBe('confirmed');
  });

  it('handles stale SHA simulation and blocks publication approval', () => {
    let state: CliState = { ...createInitialState(true), screen: 'publish', runStatus: 'ready' };
    state = cliReducer(state, { type: 'TRIGGER_STALE_SHA' });
    expect(state.publishOutcome).toBe('stale_sha');

    // Approving while stale must be blocked
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.publishDecision).toBe('pending');
    expect(state.runStatus).toBe('ready');

    // Toggling stale SHA restores normal outcome
    state = cliReducer(state, { type: 'TRIGGER_STALE_SHA' });
    expect(state.publishOutcome).toBe('normal');

    // Confirm decision and verify TRIGGER_STALE_SHA is rejected once decision is locked
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.publishDecision).toBe('confirmed');
    expect(state.publishOutcome).toBe('normal');
    state = cliReducer(state, { type: 'TRIGGER_STALE_SHA' });
    expect(state.publishDecision).toBe('confirmed');
    expect(state.publishOutcome).toBe('normal');
  });

  it('supports custom runStatus (such as blocked) in SET_ERROR action', () => {
    let state = createInitialState(true);
    state = cliReducer(state, {
      type: 'SET_ERROR',
      message: 'Preflight authentication blocked',
      status: 'blocked'
    });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe('blocked');
    expect(state.errorMessage).toContain('Preflight authentication blocked');
  });

  it('cycles auth states through all 4 supported variations', () => {
    let state = createInitialState(true);
    expect(state.githubAuth).toBe('authenticated');

    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('not_authenticated');

    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('insufficient_permissions');

    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('session_expired');

    state = cliReducer(state, { type: 'CYCLE_AUTH_STATE' });
    expect(state.githubAuth).toBe('authenticated');
  });

  it('resets state completely on RESET action', () => {
    let state: CliState = { ...createInitialState(true), screen: 'publish', runStatus: 'ready' };
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.runStatus).toBe('published');
    expect(state.publishDecision).toBe('confirmed');
    state = cliReducer(state, { type: 'RESET' });
    expect(state.runStatus).toBe('queued');
    expect(state.screen).toBe('welcome');
    expect(state.publishOutcome).toBe('normal');
    expect(state.publishDecision).toBe('pending');
  });

  it('formats Markdown and JSON reports correctly', () => {
    const md = formatReportMarkdown(SYNTHETIC_REPORT);
    expect(md).toContain('# CodeGuardian Review Report — PR #42');
    expect(md).toContain('Executive Summary');
    expect(md).toContain('Null input is dereferenced in token resolver');

    const jsonStr = formatReportJson(SYNTHETIC_REPORT);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.findings.length).toBe(4);
  });
});
