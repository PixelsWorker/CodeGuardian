import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from 'ink-testing-library';
import { Box } from 'ink';
import stringWidth from 'string-width';
import { App } from '../src/App.js';

const delay = (ms: number = 30) => new Promise(resolve => setTimeout(resolve, ms));

describe('L4 — Terminal UI Component and Interaction Testing', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('navigates from WelcomeScreen to AuthScreen via Enter key', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="welcome" isDemo={true} />);
    expect(lastFrame()).toContain('Welcome to CodeGuardian');

    stdin.write('\r'); // Enter
    await delay();
    expect(lastFrame()).toContain('Local Authentication & Toolchain Preflight Status');
    expect(lastFrame()).toContain('GitHub CLI (gh) Session');
  });

  it('cycles auth states with [T] and blocks preflight when unauthenticated', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="auth" isDemo={true} />);
    expect(lastFrame()).toContain('✓ AUTHENTICATED');

    // Press 't' to cycle to not_authenticated
    stdin.write('t');
    await delay();
    expect(lastFrame()).toContain('✗ NOT AUTHENTICATED');
    expect(lastFrame()).toContain('Verify Preflight (Blocked)');

    // Attempting to proceed while blocked routes to error screen
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Review Process Interrupted / Cancelled');
    expect(lastFrame()).toContain('Preflight authentication blocked');

    // Press 'r' to return/restart
    stdin.write('r');
    await delay();
    expect(lastFrame()).toContain('Welcome to CodeGuardian');
  });

  it('handles PR URL typing, backspace, validation, and advances on valid submission', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="pr_input" isDemo={true} />);
    expect(lastFrame()).toContain('Enter Target GitHub Pull Request URL');

    // Append 'x' to the end of URL -> "https://github.com/example/demo/pull/42x" (invalid number)
    stdin.write('x');
    await delay();
    expect(lastFrame()).toContain('https://github.com/example/demo/pull/42x');

    // Submit invalid URL
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Validation Error');
    expect(lastFrame()).toContain('Invalid GitHub PR URL');

    // Backspace to remove 'x'
    stdin.write('\u0008'); // backspace
    await delay();
    expect(lastFrame()).toContain('https://github.com/example/demo/pull/42');

    // Submit valid URL
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('PR #42: feat(auth): token rotation & permission cache refresh');
    expect(lastFrame()).toContain('Base:');
    expect(lastFrame()).toContain('Head:');
  });

  it('handles offline PR failure journeys: unauthorized, closed/deleted, draft, rate-limit', async () => {
    // 1. Unauthorized repo (403)
    const unauthApp = render(<App initialScreen="pr_input" isDemo={true} />);
    unauthApp.stdin.write('@');
    await delay();
    expect(unauthApp.lastFrame()).toContain('private-org/secret-repo/pull/1');
    unauthApp.stdin.write('\r');
    await delay();
    expect(unauthApp.lastFrame()).toContain('Review Process Interrupted / Cancelled');
    expect(unauthApp.lastFrame()).toContain('Unauthorized Repository');
    expect(unauthApp.lastFrame()).toContain('HTTP 403 Forbidden');

    // 2. Closed/Deleted PR (404)
    const closedApp = render(<App initialScreen="pr_input" isDemo={true} />);
    closedApp.stdin.write('#');
    await delay();
    expect(closedApp.lastFrame()).toContain('/pull/404');
    closedApp.stdin.write('\r');
    await delay();
    expect(closedApp.lastFrame()).toContain('Pull Request Not Found');
    expect(closedApp.lastFrame()).toContain('HTTP 404');

    // 3. Draft PR (blocked)
    const draftApp = render(<App initialScreen="pr_input" isDemo={true} />);
    draftApp.stdin.write('$');
    await delay();
    expect(draftApp.lastFrame()).toContain('/pull/99');
    draftApp.stdin.write('\r');
    await delay();
    expect(draftApp.lastFrame()).toContain('Draft Pull Request');
    expect(draftApp.lastFrame()).toContain('Draft state');

    // 4. Rate Limit (429)
    const rateApp = render(<App initialScreen="pr_input" isDemo={true} />);
    rateApp.stdin.write('%');
    await delay();
    expect(rateApp.lastFrame()).toContain('/pull/429');
    rateApp.stdin.write('\r');
    await delay();
    expect(rateApp.lastFrame()).toContain('API Rate Limit Exceeded');
    expect(rateApp.lastFrame()).toContain('HTTP 429 Too Many Requests');
  });

  it('allows diff inspection file navigation via j/k and arrow keys', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="inspection" isDemo={true} />);
    expect(lastFrame()).toContain('PR #42: feat(auth): token rotation & permission cache refresh');
    expect(lastFrame()).toContain('src/demo.ts');

    // Press 'j' to navigate to next file
    stdin.write('j');
    await delay();
    expect(lastFrame()).toContain('src/auth/token.ts');

    // Press 'k' to navigate back
    stdin.write('k');
    await delay();
    expect(lastFrame()).toContain('src/demo.ts');

    // Press Enter to start specialist analysis
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Multi-Agent Specialist Execution Lanes');
  });

  it('demonstrates streaming progress, timeout, skip, failure, and cancel on SpecialistScreen', async () => {
    // 1. Test initial [QUEUED] state and [Space] stepping progress
    const streamApp = render(<App initialScreen="specialist" isDemo={true} />);
    expect(streamApp.lastFrame()).toContain('QUEUED');
    streamApp.stdin.write(' ');
    await delay();
    expect(streamApp.lastFrame()).toContain('RUNNING (25%)');

    // Test [U] re-queuing
    streamApp.stdin.write('u');
    await delay();
    expect(streamApp.lastFrame()).toContain('QUEUED');
    streamApp.stdin.write(' ');
    await delay();
    expect(streamApp.lastFrame()).toContain('RUNNING (25%)');

    // 2. Test [T] timeout on Architecture lane
    streamApp.stdin.write('t');
    await delay();
    expect(streamApp.lastFrame()).toContain('TIMED OUT');
    expect(streamApp.lastFrame()).toContain('60s timeout budget');

    // 3. Test [K] skip on Quality lane
    const skipApp = render(<App initialScreen="specialist" isDemo={true} />);
    skipApp.stdin.write('k');
    await delay();
    expect(skipApp.lastFrame()).toContain('SKIPPED');

    // 4. Test [F] partial failure simulation
    const failApp = render(<App initialScreen="specialist" isDemo={true} />);
    failApp.stdin.write('f'); // simulate failure on Quality lane
    await delay();
    expect(failApp.lastFrame()).toContain('✗ FAILED');

    // Proceed to consensus with partial failure
    failApp.stdin.write('\r');
    await delay();
    expect(failApp.lastFrame()).toContain('PARTIAL REVIEW READY');
    expect(failApp.lastFrame()).toContain('Specialist failure detected');

    // 5. Test [Esc] cancellation from specialist screen
    const cancelRun = render(<App initialScreen="specialist" isDemo={true} />);
    cancelRun.stdin.write('\u001b'); // Escape
    await delay();
    expect(cancelRun.lastFrame()).toContain('Review Process Interrupted / Cancelled');
    expect(cancelRun.lastFrame()).toContain('Run was cancelled by user');
  });

  it('accurately distinguishes verified, uncertain, and rejected findings on ConsensusScreen', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="consensus" isDemo={true} />);
    const frame = lastFrame() || '';
    expect(frame).toContain('Manager Validation, Synthesis & Deduplication Engine');
    expect(frame).toContain('3 verified against PR changed lines, 1 require broader context');
    expect(frame).toContain('Verified Diff Findings: 3');
    expect(frame).toContain('Uncertain / Needs Context: 1');
    expect(frame).not.toContain('All 4 candidate findings verified against changed line boundaries');

    // Proceed to report
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Consolidated Review Report');
  });

  it('reliably navigates backward with [Esc] and forward with [Enter] without trapping the operator', async () => {
    // Start at report screen
    const { lastFrame, stdin } = render(<App initialScreen="report" isDemo={true} />);
    expect(lastFrame()).toContain('Consolidated Review Report');

    // 1. Esc from Report -> Consensus
    stdin.write('\u001b');
    await delay();
    expect(lastFrame()).toContain('Manager Validation, Synthesis & Deduplication Engine');

    // Forward back to Report via Enter
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Consolidated Review Report');

    // 2. Esc from Report -> Consensus, then Esc from Consensus -> Specialists
    stdin.write('\u001b');
    await delay();
    expect(lastFrame()).toContain('Manager Validation, Synthesis & Deduplication Engine');

    stdin.write('\u001b');
    await delay();
    expect(lastFrame()).toContain('Multi-Agent Specialist Execution Lanes');

    // Forward back from Specialists -> Consensus via Enter
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Manager Validation, Synthesis & Deduplication Engine');

    // Forward to Report via Enter
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Consolidated Review Report');

    // Forward to Publish via Enter
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Dry-Run Publication Preview & Safeguards');

    // Esc from Publish -> Report
    stdin.write('\u001b');
    await delay();
    expect(lastFrame()).toContain('Consolidated Review Report');
  });

  it('toggles Markdown and JSON report formats on ReportScreen via [M] and [J]', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="report" isDemo={true} />);
    expect(lastFrame()).toContain('Consolidated Review Report');
    expect(lastFrame()).toContain('[SUMMARY]');

    // Press 'm' to switch to markdown preview
    stdin.write('m');
    await delay();
    expect(lastFrame()).toContain('[MARKDOWN]');
    expect(lastFrame()).toContain('# CodeGuardian Review Report');

    // Press 'j' to switch to JSON preview
    stdin.write('j');
    await delay();
    expect(lastFrame()).toContain('[JSON]');
    expect(lastFrame()).toContain('"schema_version": "1.0.0"');

    // Press 'j' again to toggle back to summary
    stdin.write('j');
    await delay();
    expect(lastFrame()).toContain('[SUMMARY]');

    // Press Enter to proceed to publish gate
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Dry-Run Publication Preview & Safeguards');
    expect(lastFrame()).toContain('Do you authorize submitting this review comment?');
  });

  it('handles publication safeguards: Stale-SHA refusal, Permission Denied, Duplicate warning, and Confirmation lock', async () => {
    const pubApp = render(<App initialScreen="publish" isDemo={true} />);
    expect(pubApp.lastFrame()).toContain('Do you authorize submitting this review comment?');

    // 1. Toggle Stale SHA
    pubApp.stdin.write('s');
    await delay();
    expect(pubApp.lastFrame()).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');

    // Attempting to confirm while stale is blocked
    pubApp.stdin.write('y');
    await delay();
    expect(pubApp.lastFrame()).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');

    // Toggle back to normal
    pubApp.stdin.write('s');
    await delay();
    expect(pubApp.lastFrame()).toContain('Do you authorize submitting this review comment?');

    // 2. Toggle Permission Denied
    pubApp.stdin.write('p');
    await delay();
    expect(pubApp.lastFrame()).toContain('PUBLICATION BLOCKED: PERMISSION DENIED (HTTP 403)');

    // Attempting to confirm while permission denied is blocked
    pubApp.stdin.write('y');
    await delay();
    expect(pubApp.lastFrame()).toContain('PUBLICATION BLOCKED: PERMISSION DENIED (HTTP 403)');

    // Toggle back to normal
    pubApp.stdin.write('p');
    await delay();
    expect(pubApp.lastFrame()).toContain('Do you authorize submitting this review comment?');

    // 3. Toggle Duplicate publication warning
    pubApp.stdin.write('d');
    await delay();
    expect(pubApp.lastFrame()).toContain('WARNING: DUPLICATE PUBLICATION DETECTED');

    // Authorize publication with duplicate warning
    pubApp.stdin.write('y');
    await delay();
    expect(pubApp.lastFrame()).toContain('✓ SIMULATED PUBLICATION CONFIRMED');
    expect(pubApp.lastFrame()).toContain('Idempotent skip logged');
    expect(pubApp.lastFrame()).toContain('Decision locked');

    // Subsequent denial or stale toggle is ignored
    pubApp.stdin.write('n');
    await delay();
    expect(pubApp.lastFrame()).toContain('✓ SIMULATED PUBLICATION CONFIRMED');

    // 4. Test operator denial on fresh instance
    const denyApp = render(<App initialScreen="publish" isDemo={true} />);
    denyApp.stdin.write('n');
    await delay();
    expect(denyApp.lastFrame()).toContain('✗ PUBLICATION DENIED BY OPERATOR');
    expect(denyApp.lastFrame()).toContain('Decision locked');
  });

  it('renders correctly under narrow terminal widths (40, 60, and 80 columns)', () => {
    for (const cols of [40, 60, 80]) {
      const instance = render(
        <Box width={cols}>
          <App initialScreen="welcome" isDemo={true} />
        </Box>
      );
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(
        <Box width={cols}>
          <App initialScreen="welcome" isDemo={true} />
        </Box>
      );
      const frame = instance.lastFrame() || '';
      expect(frame).toBeDefined();
      expect(frame).toContain('DEMO');
      expect(frame).toContain('ONLY');
      expect(frame).toContain('Welcome');

      // Assert that rendered lines fit within the named terminal column width
      const lines = frame.split('\n');
      for (const line of lines) {
        const cleanLine = line.replace(/\u001B\[[0-9;]*[a-zA-Z]/g, '');
        expect(stringWidth(cleanLine)).toBeLessThanOrEqual(cols);
      }
    }
  });

  it('maintains clear non-color readability when NO_COLOR=1 is set', async () => {
    vi.resetModules();
    vi.stubEnv('NO_COLOR', '1');
    vi.stubEnv('FORCE_COLOR', '0');

    try {
      const { App: DynamicApp } = await import('../src/App.js');
      const { lastFrame } = render(<DynamicApp initialScreen="welcome" isDemo={true} />);
      const frame = lastFrame() || '';
      expect(frame).not.toMatch(/\u001B\[[0-9;]*m/);
      expect(frame).toContain('CodeGuardian');
      expect(frame).toContain('DEMO ONLY');
      expect(frame).toContain('codeguardian review');
      expect(frame).toContain('Press [Enter] to Begin PR Review');
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
