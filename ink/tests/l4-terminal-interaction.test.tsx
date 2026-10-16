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

    // Submit invalid URL -> should show validation error
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('Validation Error');
    expect(lastFrame()).toContain('Invalid GitHub PR URL');

    // Backspace key (\x7f) removes 'x', restoring valid "https://github.com/example/demo/pull/42"
    stdin.write('\x7f');
    await delay();

    // Submit valid URL -> advances to inspection screen
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('PR Diff Inspection & Risk Overview');
    expect(lastFrame()).toContain('src/demo.ts');
  });

  it('ensures typing "q" inside PR URL field does NOT terminate the CLI, but global "q" quits elsewhere', async () => {
    const { lastFrame, stdin } = render(
      <App initialScreen="pr_input" isDemo={true} />
    );

    // Typing 'q' into PR entry must append 'q' to the URL and NOT quit
    stdin.write('q');
    await delay();
    expect(lastFrame()).toContain('Enter Target GitHub Pull Request URL');
    expect(lastFrame()).toContain('https://github.com/example/demo/pull/42q');

    // Outside PR entry (e.g. Welcome screen), pressing 'q' triggers exit
    const welcome = render(<App initialScreen="welcome" isDemo={true} />);
    expect(welcome.lastFrame()).toContain('Welcome to CodeGuardian');
    welcome.stdin.write('q');
    await delay();

    // After 'q' exits the app, subsequent Enter keystrokes do not advance to Auth screen
    welcome.stdin.write('\r');
    await delay();
    expect(welcome.lastFrame()).not.toContain('Local Authentication & Toolchain Preflight Status');
  });

  it('navigates changed files with arrow keys and j/k on InspectScreen', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="inspection" isDemo={true} />);
    expect(lastFrame()).toContain('Changed Files List');
    expect(lastFrame()).toContain('src/demo.ts');

    // Press down arrow or 'j' to navigate to next file
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

  it('simulates partial specialist failure via [F] and user cancellation via [Esc]', async () => {
    // Test [F] partial failure simulation
    const { lastFrame, stdin } = render(<App initialScreen="specialist" isDemo={true} />);
    expect(lastFrame()).toContain('Security Specialist');
    expect(lastFrame()).toContain('Quality, Testing & Performance Specialist');

    stdin.write('f'); // simulate failure on Quality lane
    await delay();
    expect(lastFrame()).toContain('✗ FAILED');

    // Proceed to consensus with partial failure
    stdin.write('\r');
    await delay();
    expect(lastFrame()).toContain('PARTIAL REVIEW READY');
    expect(lastFrame()).toContain('Quality specialist crashed');

    // Test [Esc] cancellation from specialist screen
    const cancelRun = render(<App initialScreen="specialist" isDemo={true} />);
    cancelRun.stdin.write('\u001b'); // Escape
    await delay();
    expect(cancelRun.lastFrame()).toContain('Review Process Interrupted / Cancelled');
    expect(cancelRun.lastFrame()).toContain('Run was cancelled by user');
  });

  it('toggles Markdown and JSON report formats on ReportScreen via [M] and [J]', async () => {
    const { lastFrame, stdin } = render(<App initialScreen="report" isDemo={true} />);
    expect(lastFrame()).toContain('Consolidated Review Report');
    expect(lastFrame()).toContain('[SUMMARY]');

    // Press 'm' to toggle Markdown view
    stdin.write('m');
    await delay();
    expect(lastFrame()).toContain('[MARKDOWN]');
    expect(lastFrame()).toContain('# CodeGuardian Review Report');

    // Press 'j' to toggle JSON view
    stdin.write('j');
    await delay();
    expect(lastFrame()).toContain('[JSON]');
    expect(lastFrame()).toContain('"schema_version": "1.0.0"');

    // Return to summary
    stdin.write('j');
    await delay();
    expect(lastFrame()).toContain('[SUMMARY]');
  });

  it('tests PublishScreen: authorization confirmation, denial, decision lock, and stale SHA block', async () => {
    // 1. Stale SHA blocking
    const staleApp = render(<App initialScreen="publish" isDemo={true} />);
    expect(staleApp.lastFrame()).toContain('Dry-Run Publication Preview & Safeguards');

    // Toggle stale SHA
    staleApp.stdin.write('s');
    await delay();
    expect(staleApp.lastFrame()).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');

    // Attempting to confirm while stale is blocked
    staleApp.stdin.write('y');
    await delay();
    expect(staleApp.lastFrame()).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');

    // Toggle back to normal
    staleApp.stdin.write('s');
    await delay();
    expect(staleApp.lastFrame()).toContain('Do you authorize submitting this review comment?');

    // 2. Authorize confirmation and decision lock
    staleApp.stdin.write('y');
    await delay();
    expect(staleApp.lastFrame()).toContain('✓ SIMULATED PUBLICATION CONFIRMED');
    expect(staleApp.lastFrame()).toContain('NO EXTERNAL WRITE PERFORMED');
    expect(staleApp.lastFrame()).toContain('Decision locked');

    // Subsequent denial or stale toggle is ignored
    staleApp.stdin.write('n');
    await delay();
    expect(staleApp.lastFrame()).toContain('✓ SIMULATED PUBLICATION CONFIRMED');

    // 3. Test denial on fresh instance
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
