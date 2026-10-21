import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { createHash } from 'node:crypto';
import { render, cleanup } from 'ink-testing-library';
import { cliReducer, createInitialState, type CliAction } from '../src/core/state-machine.js';
import { SYNTHETIC_REPORT, SYNTHETIC_FINDINGS, CANONICAL_SPECIALISTS, buildDemoReport, getReportForRunId } from '../src/fixtures/fixtures.js';
import { canonicalReportPayload, finalizeReport } from '../src/core/report-digest.js';
import { formatReportJson, formatReportMarkdown } from '../src/core/report-formatter.js';
import { ReviewReportSchema } from '../src/types/contracts.js';
import { PublishScreen } from '../src/screens/PublishScreen.js';
import { ReportScreen } from '../src/screens/ReportScreen.js';
import { App } from '../src/App.js';

const wait = () => new Promise(r => setTimeout(r, 80));
const cases: Array<[string, CliAction[]]> = [
  ['full', []],
  ['failed', [{ type: 'SIMULATE_FAILURE', role: 'quality', reason: 'Demo crash' }]],
  ['timed_out', [{ type: 'SPECIALIST_TIMEOUT', role: 'architecture' }]],
  ['skipped', [{ type: 'SPECIALIST_SKIP', role: 'quality' }]],
  ['mixed', [{ type: 'SPECIALIST_TIMEOUT', role: 'architecture' }, { type: 'SPECIALIST_SKIP', role: 'quality' }, { type: 'SIMULATE_FAILURE', role: 'security', reason: 'Demo failure' }]],
];
afterEach(cleanup);
describe('L6 — Report/export/publication integrity', () => {
  for (const identity of ['example/demo/42', 'my-org/my-repo/12']) {
    it.each(cases)(`${identity}: %s round-trips every report field`, (_name, actions) => {
      const [owner, repo, number] = identity.split('/');
      let state = cliReducer(createInitialState(), { type: 'SET_PR_URL', url: `https://github.com/${owner}/${repo}/pull/${number}` });
      state = cliReducer(state, { type: 'SUBMIT_PR_URL' });
      state = cliReducer(state, { type: 'START_SPECIALISTS' });
      for (const action of actions) state = cliReducer(state, action);
      state = cliReducer(state, { type: 'FINISH_SPECIALISTS' });
      state = cliReducer(state, { type: 'VALIDATE_FINDINGS' });
      const report = state.report;
      expect(ReviewReportSchema.parse(report)).toEqual(report);
      expect(getReportForRunId(report.run_id)).toEqual(report);
      expect(JSON.parse(formatReportJson(report))).toEqual(report);
      const md = formatReportMarkdown(report);
      for (const value of [report.run_id, report.pr.base_sha, report.pr.head_sha, report.report_digest, report.summary, ...report.warnings]) expect(md).toContain(value);
      for (const finding of report.findings) { expect(md).toContain(finding.title); expect(md).toContain(finding.verification); }
      for (const worker of report.worker_states) expect(md).toContain(`${worker.worker_id}: ${worker.state}`);
      const screen = render(<PublishScreen report={report} outcome="normal" onConfirmPublish={() => {}} onDenyPublish={() => {}} onBack={() => {}} onRestart={() => {}} />);
      const flat = screen.lastFrame()!.replace(/\s/g, '');
      expect(flat).toContain(report.report_digest);
      expect(flat).toContain(`${owner}/${repo}`);
      for (const warning of report.warnings) expect(flat).toContain(warning.replace(/\s/g, ''));
      if (_name === 'timed_out') {
        expect(report.warnings.join()).toContain('Architecture Specialist: timed_out');
        expect(report.worker_states.find(w => w.worker_id === 'worker-qty')?.state).toBe('complete');
      }
      expect(state.runStatus).toBe(actions.length ? 'partial' : 'ready');
    });
  }
  it.each(['my-org/my-repo', 'my-org-my/repo', 'my/org-my-repo', 'org-12/repo-34', 'a/re.po_12'])('unambiguous custom identity %s', pair => {
    const [owner, repo] = pair.split('/');
    const pr = { ...SYNTHETIC_REPORT.pr, owner, repo, number: 12, url: `https://github.com/${pair}/pull/12`, title: `[DEMO] PR #12: ${pair}`, author: `${owner}-contributor`, head_branch: 'feature/pr-12' };
    const report = buildDemoReport(pr, CANONICAL_SPECIALISTS);
    expect(getReportForRunId(report.run_id)?.pr).toEqual(pr);
    expect(report.run_id).toBe(`run-g00~${owner}~${repo}~12~cccc`);
  });
  it.each(['run-20261016-my-org-my-repo-12', 'run-g00~my~repo~0~cccc', 'run-g00~my~repo~12~ccc', 'run-g00~my~repo~12~cccx', 'run-g00~my~repo~12~cccc-extra'])('rejects malformed or ambiguous ID %s', id => expect(getReportForRunId(id)).toBeNull());
  it('uses independent SHA-256 over deterministic sorted canonical payload', () => {
    const report = SYNTHETIC_REPORT;
    const expected = `sha256-${createHash('sha256').update(canonicalReportPayload(report)).digest('hex')}`;
    expect(finalizeReport(report).report_digest).toBe(expected);
    expect(expected).toMatch(/^sha256-[a-f0-9]{64}$/);
    expect(finalizeReport({ ...report, report_digest: 'ignored' }).report_digest).toBe(expected);
    expect(finalizeReport(JSON.parse(JSON.stringify(report))).report_digest).toBe(expected);
    const reordered = Object.fromEntries(Object.entries(report).reverse()) as typeof report;
    expect(finalizeReport(reordered).report_digest).toBe(expected);
    for (const changed of [
      { ...report, pr: { ...report.pr, owner: 'changed' } },
      { ...report, warnings: [...report.warnings, 'changed'] },
      { ...report, findings: report.findings.slice(1) },
      { ...report, worker_states: report.worker_states.map(w => ({ ...w, state: 'skipped' as const })) },
    ]) expect(finalizeReport(changed).report_digest).not.toBe(expected);
  });
  it('preserves partial result states and warnings through loaded publication/back navigation', async () => {
    const report = getReportForRunId('run-g00~example~demo~42~ccts')!;
    const screen = render(<App initialScreen="publish" initialReport={report} />);
    screen.stdin.write('\u001b'); await wait();
    screen.stdin.write('\u001b'); await wait();
    expect(screen.lastFrame()).toContain('PARTIAL REVIEW READY');
    screen.stdin.write('\r'); await wait();
    const flat = screen.lastFrame()!.replace(/\s/g, '');
    expect(flat).toContain(report.report_digest);
    expect(flat).toContain('ArchitectureSpecialist:timed_out');
    expect(flat).toContain('Quality,Testing&PerformanceSpecialist:skipped');
  });
  it('provides the full actual in-session JSON, including late report fields', async () => {
    const report = getReportForRunId('run-g00~example~demo~42~ccts')!;
    const screen = render(<ReportScreen report={report} onProceedToPublish={() => {}} onBack={() => {}} />);
    screen.stdin.write('j'); await wait(); screen.stdin.write('e'); await wait();
    const flat = screen.lastFrame()!.replace(/\s/g, '');
    expect(screen.lastFrame()!.replace(/[│─┌┐└┘\s]/g, '')).toContain(formatReportJson(report).replace(/[│─┌┐└┘\s]/g, ''));
  });
  it('rejects unfinished workers rather than falsely finalizing them', () => {
    expect(() => buildDemoReport(SYNTHETIC_REPORT.pr, CANONICAL_SPECIALISTS.map(w => ({ ...w, state: 'running' })))).toThrow('unfinished');
  });
  it('preserves partial-only outcomes', () => {
    const report = buildDemoReport(SYNTHETIC_REPORT.pr, CANONICAL_SPECIALISTS.map(w => ({ ...w, state: w.role === 'logic' ? 'partial' : w.state })));
    expect(report.status).toBe('partial');
    expect(report.warnings.join()).toContain('Logic & Correctness Specialist: partial');
    expect(getReportForRunId(report.run_id)).toEqual(report);
  });
  it('preserves nullable line and side in formatReportMarkdown without fabricating (RIGHT)', () => {
    const reportWithNullableSide = {
      ...SYNTHETIC_REPORT,
      findings: [
        {
          ...SYNTHETIC_FINDINGS[0],
          line: null,
          side: null,
          verification: 'needs_context' as const,
        },
      ],
    };
    const md = formatReportMarkdown(reportWithNullableSide);
    expect(md).toContain(`- **File:** \`${SYNTHETIC_FINDINGS[0].path}\``);
    expect(md).not.toContain(`(RIGHT)`);
  });
});
