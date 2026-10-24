import { describe, it, expect, vi, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { render, cleanup } from 'ink-testing-library';
import { Box } from 'ink';
import stringWidth from 'string-width';
import { App } from '../src/App.js';
import { Footer } from '../src/components/Footer.js';
import { Header } from '../src/components/Header.js';
import { AuthScreen } from '../src/screens/AuthScreen.js';
import { ReportScreen } from '../src/screens/ReportScreen.js';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.js';
import { SYNTHETIC_REPORT } from '../src/fixtures/fixtures.js';

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

  it('keeps Welcome actions vertically separated until the horizontal row fits', () => {
    for (const cols of [40, 48, 60, 64, 65, 80]) {
      const tree = (
        <Box width={cols}>
          <WelcomeScreen onStart={() => undefined} onAuthCheck={() => undefined} />
        </Box>
      );
      const instance = render(tree);
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(tree);

      const frame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
      const semanticText = frame.replace(/\s+/g, ' ');
      expect(semanticText).toContain('Press [Enter] to Begin PR Review');
      expect(semanticText).toContain('or');
      expect(semanticText).toContain('Press [A] for Auth Status');
      expect(semanticText).not.toContain('orPress');
      const actionLines = frame.split('\n').map(line => line.replace(/[│┌┐└┘─]/g, ' '));
      const beginLine = actionLines.findIndex(line => line.includes('Press [Enter] to Begin'));
      const authLine = actionLines.findIndex(line => line.includes('[A] for Auth'));
      const separatorLine = actionLines.findIndex(line => line.trim() === 'or');
      expect(beginLine).toBeGreaterThanOrEqual(0);
      expect(authLine).toBeGreaterThanOrEqual(0);
      if (cols < 65) {
        expect(beginLine).not.toBe(authLine);
        expect(separatorLine).toBeGreaterThan(beginLine);
        expect(separatorLine).toBeLessThan(authLine);
      } else {
        expect(beginLine).toBe(authLine);
        expect(actionLines[beginLine]).toContain('  or  ');
      }
    }
  });

  it('stacks blocked Authentication actions through 96 columns', () => {
    for (const cols of [72, 80, 96, 97, 100]) {
      const tree = (
        <Box width={cols}>
          <AuthScreen
            githubAuth="not_authenticated"
            codexAuth="authenticated"
            onContinue={() => undefined}
            onBack={() => undefined}
          />
        </Box>
      );
      const instance = render(tree);
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(tree);

      const frame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
      const actionLines = frame.split('\n');
      const enterLine = actionLines.findIndex(line => line.includes('Press [Enter]'));
      const cycleLine = actionLines.findIndex(line => line.includes('[T] Cycle Auth State (Demo)'));
      const escapeLine = actionLines.findIndex(line => line.includes('Press [Esc]'));
      const semanticText = frame.replace(/\s+/g, ' ');
      expect(semanticText).toContain('Press [Enter] Verify Preflight (Blocked)');
      expect(semanticText).toContain('[T] Cycle Auth State (Demo)');
      expect(semanticText).toContain('Press [Esc] Return');
      expect(enterLine).toBeGreaterThanOrEqual(0);
      expect(cycleLine).toBeGreaterThanOrEqual(0);
      expect(escapeLine).toBeGreaterThanOrEqual(0);
      if (cols < 97) {
        expect(new Set([enterLine, cycleLine, escapeLine]).size).toBe(3);
      } else {
        expect(enterLine).toBe(cycleLine);
        expect(cycleLine).toBe(escapeLine);
      }
    }
  });

  it('keeps Authentication actions distinct at 40, 60, and 80 columns', async () => {
    for (const cols of [40, 60, 80]) {
      const onContinue = vi.fn();
      const onCycleAuth = vi.fn();
      const onBack = vi.fn();
      const tree = (
        <Box width={cols}>
          <AuthScreen
            githubAuth="authenticated"
            codexAuth="authenticated"
            onContinue={onContinue}
            onCycleAuth={onCycleAuth}
            onBack={onBack}
          />
        </Box>
      );
      const instance = render(tree);
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(tree);

      const frame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
      const semanticText = frame.replace(/\s+/g, ' ');
      expect(semanticText).toContain('Press [Enter] Proceed');
      expect(semanticText).toContain('[T] Cycle Auth State (Demo)');
      expect(semanticText).toContain('Press [Esc] Return');
      expect(semanticText).not.toContain('|[T]');
      expect(frame).not.toContain('Proceed[T]');

      instance.stdin.write('t');
      await delay();
      expect(onCycleAuth).toHaveBeenCalledOnce();
      instance.stdin.write('\r');
      await delay();
      expect(onContinue).toHaveBeenCalledOnce();
      instance.stdin.write('\u001B');
      await delay();
      expect(onBack).toHaveBeenCalledOnce();
    }
  });

  it('keeps all Authentication status badges separate from descriptions at 40, 60, and 80 columns', () => {
    const scenarios = [
      { state: 'authenticated', badge: '✓ AUTHENTICATED' },
      { state: 'not_authenticated', badge: '✗ NOT AUTHENTICATED' },
      { state: 'session_expired', badge: '✗ EXPIRED SESSION' },
      { state: 'insufficient_permissions', badge: '⚠️ INSUFFICIENT SCOPES' },
    ] as const;
    const descriptions = [
      'Required for read-only PR metadata, changed files, and diff inspection',
      'Required for bounded specialist analysis lanes (ChatGPT login or API key)',
    ];

    for (const cols of [40, 60, 80]) {
      for (const { state, badge } of scenarios) {
        const tree = (
          <Box width={cols}>
            <AuthScreen
              githubAuth={state}
              codexAuth={state}
              onContinue={() => undefined}
              onBack={() => undefined}
            />
          </Box>
        );
        const instance = render(tree);
        Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
        instance.stdout.emit('resize');
        instance.rerender(tree);

        const frame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
        const semanticText = frame.replace(/[│╭╮╰╯─]/g, ' ').replace(/\s+/g, ' ');
        const plainLines = frame.split('\n');
        for (const [heading, cardBadge] of [
          ['GitHub CLI (gh) Session', badge],
          ['Codex CLI / SDK Session', badge],
        ]) {
          const cardLine = plainLines.find(line => line.includes(heading));
          expect(cardLine).toBeDefined();
          expect(cardLine?.includes(cardBadge)).toBe(false);
        }
        for (const description of descriptions) {
          expect(semanticText).toContain(description);
        }
        expect(semanticText.match(new RegExp(badge.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))).toHaveLength(2);
        expect(frame).not.toMatch(/changeATED|inspectionAUTHENTICATED|AUTHENTI\s+CATED/);
        expect(plainLines.some(line => line.includes('Required for') && line.includes(badge))).toBe(false);
      }
    }
  });

  it('keeps GitHub and Codex status cards readable across the 104-column breakpoint', () => {
    const scenarios = [
      { state: 'authenticated', badge: '✓ AUTHENTICATED' },
      { state: 'not_authenticated', badge: '✗ NOT AUTHENTICATED' },
      { state: 'session_expired', badge: '✗ EXPIRED SESSION' },
      { state: 'insufficient_permissions', badge: '⚠️ INSUFFICIENT SCOPES' },
    ] as const;
    const descriptions = [
      'Required for read-only PR metadata, changed files, and diff inspection',
      'Required for bounded specialist analysis lanes (ChatGPT login or API key)',
    ];

    for (const cols of [95, 96, 100, 104]) {
      for (const github of scenarios) {
        for (const codex of scenarios) {
          const tree = (
            <Box width={cols}>
              <AuthScreen
                githubAuth={github.state}
                codexAuth={codex.state}
                onContinue={() => undefined}
                onBack={() => undefined}
              />
            </Box>
          );
          const instance = render(tree);
          Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
          instance.stdout.emit('resize');
          instance.rerender(tree);

          const frame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
          const semanticText = frame.replace(/[│╭╮╰╯─]/g, ' ').replace(/\s+/g, ' ');
          const plainLines = frame.split('\n');
          const hasLongFailureBadge =
            github.state === 'insufficient_permissions' || codex.state === 'insufficient_permissions';
          const hasNotAuthenticatedBadge =
            github.state === 'not_authenticated' || codex.state === 'not_authenticated';
          const expectsCompactCards =
            cols < 96 ||
            (cols < 100 && (hasLongFailureBadge || hasNotAuthenticatedBadge)) ||
            (cols < 104 && hasLongFailureBadge);
          for (const description of descriptions) {
            expect(semanticText).toContain(description);
          }
          for (const { badge } of [github, codex]) {
            expect(semanticText).toContain(badge);
          }
          expect(frame).not.toMatch(/changeATED|inspectionAUTHENTICATED|AUTHENTI\s+CATED/);
          expect(plainLines.some(line =>
            line.includes('Required for') &&
            [...scenarios].some(({ badge }) => line.includes(badge))
          )).toBe(false);
          for (const [heading, badge] of [
            ['GitHub CLI (gh) Session', github.badge],
            ['Codex CLI / SDK Session', codex.badge],
          ]) {
            const cardLine = plainLines.find(line => line.includes(heading));
            expect(cardLine).toBeDefined();
            expect(cardLine?.includes(badge)).toBe(!expectsCompactCards);
          }
        }
      }
    }
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

  it('keeps severity, verification badges, and long finding titles distinct at 40/60/80/100 columns with NO_COLOR', async () => {
    const colorProbe = `
      const tty = await import('node:tty');
      tty.default.isatty = () => true;
      const { pathToFileURL } = await import('node:url');
      const { createCliProgram } = await import(pathToFileURL(process.cwd() + '/src/cli.tsx'));
      const { render } = await import('ink-testing-library');
      let instance;
      const program = createCliProgram({ renderApp: element => { instance = render(element); } });
      program.parse(['node', 'codeguardian', 'review', 'https://github.com/example/demo/pull/42', '--demo']);
      const waitFor = async marker => {
        for (let attempt = 0; attempt < 50; attempt++) {
          if (instance?.lastFrame()?.includes(marker)) return;
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        throw new Error('CLI did not reach expected screen marker: ' + marker);
      };
      for (const marker of ['Changed Files List', 'Security Specialist', 'Consensus Summary Statistics']) {
        await waitFor(marker);
        instance.stdin.write('\\r');
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      await waitFor('Consolidated Review Report');
      const frame = instance.lastFrame() || '';
      process.stdout.write(JSON.stringify({
        hasAnsi: /\\u001B\\[[0-9;]*m/.test(frame),
        hasReportTitle: frame.includes('Consolidated Review Report'),
        forceColorAfterStartup: process.env.FORCE_COLOR ?? null,
      }));
      instance.cleanup();
    `;
    const runColorProbe = (noColor: boolean, forceColor = false) => {
      const env = { ...process.env };
      delete env.FORCE_COLOR;
      delete env.CI;
      delete env.GITHUB_ACTIONS;
      env.TERM = 'xterm-256color';
      if (noColor) env.NO_COLOR = '1';
      else delete env.NO_COLOR;
      if (forceColor) env.FORCE_COLOR = '1';
      return JSON.parse(execFileSync(process.execPath, [
        '--import', 'tsx', '--input-type=module', '-e', colorProbe,
      ], { cwd: process.cwd(), env, encoding: 'utf8' })) as {
        hasAnsi: boolean;
        hasReportTitle: boolean;
        forceColorAfterStartup: string | null;
      };
    };

    const colorEnabledControl = runColorProbe(false);
    const noColorReport = runColorProbe(true);
    const explicitColorOverride = runColorProbe(true, true);
    expect(colorEnabledControl.hasAnsi).toBe(true);
    expect(colorEnabledControl.hasReportTitle).toBe(true);
    expect(colorEnabledControl.forceColorAfterStartup).toBe(null);
    expect(noColorReport.hasReportTitle).toBe(true);
    expect(noColorReport.hasAnsi).toBe(false);
    expect(noColorReport.forceColorAfterStartup).toBe(null);
    expect(explicitColorOverride.hasReportTitle).toBe(true);
    expect(explicitColorOverride.hasAnsi).toBe(true);
    expect(explicitColorOverride.forceColorAfterStartup).toBe('1');

    const longTitle = 'Insecure fallback key generated when AUTH_SECRET is omitted — with an additional long explanation for narrow terminals';
    const report = {
      ...SYNTHETIC_REPORT,
      findings: SYNTHETIC_REPORT.findings.map(finding =>
        finding.id === 'f-002' ? { ...finding, title: longTitle } : finding
      ),
    };

    const assertSeparated = (frame: string, badge: string, titleStart: string) => {
      const lines = frame.split('\n');
      const titleLine = lines.findIndex(line => line.includes(titleStart));
      expect(titleLine).toBeGreaterThan(0);
      const badgeLine = titleLine - 1;
      expect(lines[badgeLine]).toContain(badge);
      expect(lines[badgeLine]).not.toContain(titleStart);
      expect(lines[titleLine]).not.toContain(badge);
    };

    for (const cols of [40, 60, 80, 100]) {
      const tree = (
        <Box width={cols}>
          <ReportScreen report={report} onProceedToPublish={() => {}} onBack={() => {}} />
        </Box>
      );
      const instance = render(tree);
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(tree);

      const rawFrame = instance.lastFrame() || '';
      const frame = rawFrame.replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
      const semanticText = frame.replace(/[│╭╮╰╯─]/g, ' ').replace(/\s+/g, ' ');
      const compactText = semanticText.replace(/\s+/g, '');
      expect(semanticText).toContain('Insecure fallback');
      expect(semanticText).toContain('AUTH_SECRET is omitted');
      expect(semanticText).toContain('additional long explanation for narrow terminals');
      expect(semanticText).toContain('VERIFIED DIFF');
      expect(semanticText).toContain('NEEDS CONTEXT');
      expect(semanticText).toContain('REJECTED');
      expect(frame).not.toMatch(/VERIFIED DIFF[ \t]*Insecure fallback/);
      expect(frame).not.toMatch(/NEEDS CONTEXT[ \t]*Missing connection timeout/);
      expect(frame).not.toMatch(/REJECTED[ \t]*Legacy helper assertion/);
      expect(compactText).toContain(SYNTHETIC_REPORT.report_digest);
      expect(semanticText).toContain('Path: src/demo.ts:17');

      assertSeparated(frame, '[VERIFIED DIFF]', 'Insecure fallback');
      assertSeparated(frame, '[NEEDS CONTEXT]', 'Missing connection timeout');
      assertSeparated(frame, '[REJECTED]', 'Legacy helper assertion');

      instance.stdin.write('\u001B[B');
      await delay();
      const movedFrame = (instance.lastFrame() || '').replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '');
      const movedSemanticText = movedFrame.replace(/[│╭╮╰╯─]/g, ' ').replace(/\s+/g, ' ');
      const movedCompactText = movedSemanticText.replace(/\s+/g, '');
      expect(movedFrame).toContain('▶');
      expect(movedSemanticText).toContain('Path: src/auth/token.ts:45');
      expect(movedCompactText).toContain(SYNTHETIC_REPORT.report_digest);
    }
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
      expect(frame).toContain('CodeGuardian');
      expect(frame).toContain('Target: #42');
      expect(frame).toContain('[Enter] Begin');
      expect(frame).toContain('[A] Auth status');
      expect(frame).toContain('[Q] Quit');
      expect(frame).toContain('TUI v0.1.0');
      expect(frame).not.toContain('QuitTUI');

      // Assert that rendered lines fit within the named terminal column width
      const lines = frame.split('\n');
      for (const line of lines) {
        const cleanLine = line.replace(/\u001B\[[0-9;]*[a-zA-Z]/g, '');
        expect(stringWidth(cleanLine)).toBeLessThanOrEqual(cols);
      }

      // The 40/60-column views stack the product identity, screen title, hints,
      // and version into separate rows. At 80 columns the horizontal layout fits.
      const plainLines = lines.map(line => line.replace(/\u001B\[[0-9;]*[a-zA-Z]/g, ''));
      const productLine = plainLines.findIndex(line => line.includes('CodeGuardian'));
      const titleLine = plainLines.findIndex(line => line.includes('Welcome & CLI Overview'));
      const quitLine = plainLines.findIndex(line => line.includes('[Q] Quit'));
      const versionLine = plainLines.findIndex(line => line.includes('TUI v0.1.0'));
      expect(productLine).toBeGreaterThanOrEqual(0);
      expect(quitLine).toBeGreaterThanOrEqual(0);
      expect(versionLine).toBeGreaterThanOrEqual(0);
      if (cols < 72) {
        expect(titleLine).toBeGreaterThan(productLine);
        expect(titleLine).not.toBe(productLine);
        expect(versionLine).not.toBe(quitLine);
      } else {
        expect(titleLine).toBe(productLine);
      }
    }
  });

  it('keeps long header metadata and navigation hints semantically intact at 40, 60, and 80 columns', () => {
    const title = '4. PR Diff Inspection & Risk Overview';
    const target = 'Target: #123456789 — feat(authentication): rotate credentials safely';
    const hints = ['[Enter] Continue', '[Esc] Back', '[Q] Quit'];

    for (const cols of [40, 60, 80]) {
      const tree = (
        <Box width={cols} flexDirection="column">
          <Header
            screen="inspection"
            prNumber={123456789}
            prTitle="feat(authentication): rotate credentials safely"
            isDemo={true}
          />
          <Footer hints={hints} />
        </Box>
      );
      const instance = render(tree);
      Object.defineProperty(instance.stdout, 'columns', { value: cols, configurable: true });
      instance.stdout.emit('resize');
      instance.rerender(tree);

      const frame = instance.lastFrame() || '';
      const plainFrame = frame
        .replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '')
        .replace(/[┌┐└┘│─]/g, ' ')
        .replace(/\s+/g, ' ');
      expect(plainFrame).toContain('CodeGuardian');
      expect(plainFrame).toContain(title);
      expect(plainFrame).toContain('DEMO ONLY');
      expect(plainFrame).toContain(target);
      expect(plainFrame).toContain('[Enter] Continue');
      expect(plainFrame).toContain('[Esc] Back');
      expect(plainFrame).toContain('[Q] Quit');
      expect(plainFrame).toContain('TUI v0.1.0');
      expect(plainFrame).not.toContain('QuitTUI');

      const cleanLines = frame
        .replace(/\u001B\[[0-9;?]*[a-zA-Z]/g, '')
        .split('\n');
      for (const line of cleanLines) {
        expect(stringWidth(line)).toBeLessThanOrEqual(cols);
      }
      if (cols < 72) {
        const quitLine = cleanLines.findIndex(line => line.includes('[Q] Quit'));
        const versionLine = cleanLines.findIndex(line => line.includes('TUI v0.1.0'));
        expect(quitLine).toBeGreaterThanOrEqual(0);
        expect(versionLine).toBeGreaterThan(quitLine);
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
