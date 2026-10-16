import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  cliReducer
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
  });

  it('handles cancellation and transitions to error screen with safe cleanup', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'START_SPECIALISTS' });
    state = cliReducer(state, { type: 'CANCEL_RUN' });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe('cancelled');
    expect(state.errorMessage).toContain('cancelled by user');
  });

  it('handles publication approval and denial without external writes', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.screen).toBe('publish');
    expect(state.publishOutcome).toBe('normal');
    expect(state.runStatus).toBe('published');

    state = cliReducer(state, { type: 'DENY_PUBLISH' });
    expect(state.publishOutcome).toBe('denied');
    expect(state.runStatus).toBe('ready');
  });

  it('resets state completely on RESET action', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: 'APPROVE_PUBLISH' });
    expect(state.runStatus).toBe('published');
    state = cliReducer(state, { type: 'RESET' });
    expect(state.runStatus).toBe('queued');
    expect(state.screen).toBe('welcome');
    expect(state.publishOutcome).toBe('normal');
  });

  it('formats Markdown and JSON reports correctly', () => {
    const md = formatReportMarkdown(SYNTHETIC_REPORT);
    expect(md).toContain('# CodeGuardian Review Report â€” PR #42');
    expect(md).toContain('Executive Summary');
    expect(md).toContain('Null input is dereferenced in token resolver');

    const jsonStr = formatReportJson(SYNTHETIC_REPORT);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.findings.length).toBe(4);
  });
});
