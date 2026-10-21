import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from 'ink-testing-library';
import { Box } from 'ink';
import stringWidth from 'string-width';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.js';
import { AuthScreen } from '../src/screens/AuthScreen.js';
import { PrEntryScreen } from '../src/screens/PrEntryScreen.js';
import { InspectScreen } from '../src/screens/InspectScreen.js';
import { SpecialistScreen } from '../src/screens/SpecialistScreen.js';
import { ConsensusScreen } from '../src/screens/ConsensusScreen.js';
import { ReportScreen } from '../src/screens/ReportScreen.js';
import { PublishScreen } from '../src/screens/PublishScreen.js';
import { ErrorScreen } from '../src/screens/ErrorScreen.js';
import {
  SYNTHETIC_PR_IDENTITY,
  CANONICAL_SPECIALISTS,
  SYNTHETIC_FINDINGS,
  SYNTHETIC_REPORT,
  SYNTHETIC_PARTIAL_REPORT,
} from '../src/fixtures/fixtures.js';

// Helper to sanitize terminal frame for deterministic snapshotting
function cleanSnapshotFrame(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    // Strip ANSI escape codes for pure structural terminal comparison
    .replace(/\u001B\[[0-9;]*[a-zA-Z]/g, '')
    .trim();
}

describe('L7 — Deterministic Terminal Snapshots', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  it('Snapshot: Screen 1 — Welcome', () => {
    const { lastFrame } = render(
      <WelcomeScreen onStart={() => {}} onAuthCheck={() => {}} />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('Welcome to CodeGuardian Native Terminal Reviewer');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 2 — Authentication Success', () => {
    const { lastFrame } = render(
      <AuthScreen
        githubAuth="authenticated"
        codexAuth="authenticated"
        onContinue={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('AUTHENTICATED');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 2 — Authentication Failure (Preflight Blocked)', () => {
    const { lastFrame } = render(
      <AuthScreen
        githubAuth="not_authenticated"
        codexAuth="authenticated"
        onContinue={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('NOT AUTHENTICATED');
    expect(frame).toContain('Verify Preflight (Blocked)');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 3 — PR Input with Validation Error', () => {
    const { lastFrame } = render(
      <PrEntryScreen
        prUrl="https://gitlab.com/invalid/repo/pull/99"
        error="Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number"
        onEditUrl={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('Validation Error');
    expect(frame).toContain('Invalid GitHub PR URL');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 4 — Diff Inspection & Hunks', () => {
    const { lastFrame } = render(
      <InspectScreen
        pr={SYNTHETIC_PR_IDENTITY}
        onStartAnalysis={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('PR #42: feat(auth): token rotation');
    expect(frame).toContain('src/demo.ts');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 5 — Specialist Lanes with Partial Failure', () => {
    const specialistsWithFailure = CANONICAL_SPECIALISTS.map(s => {
      if (s.role === 'quality') {
        return {
          ...s,
          state: 'failed' as const,
          failureReason: 'AST parser crash',
          currentActivity: 'FAILED: AST parser crash',
        };
      }
      return s;
    });

    const { lastFrame } = render(
      <SpecialistScreen
        specialists={specialistsWithFailure}
        onComplete={() => {}}
        onFailLane={() => {}}
        onCancel={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('FAILED');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 6 — Manager Consensus & Synthesis', () => {
    const { lastFrame } = render(
      <ConsensusScreen
        specialists={CANONICAL_SPECIALISTS}
        findings={SYNTHETIC_FINDINGS}
        onProceed={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('FULL CONSENSUS READY');
    expect(frame).toContain('Total Candidate Findings: 4');
    expect(frame).toContain('Verified Diff Findings: 3');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 7 — Partial Review Report', () => {
    const partialReport = SYNTHETIC_PARTIAL_REPORT;

    const { lastFrame } = render(
      <ReportScreen
        report={partialReport}
        onProceedToPublish={() => {}}
        onBack={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('PARTIAL REVIEW');
    expect(frame).toContain('Null input is dereferenced in token resolver');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 8 — Stale Head SHA Refusal', () => {
    const { lastFrame } = render(
      <PublishScreen
        report={SYNTHETIC_REPORT}
        outcome="stale_sha"
        decision="pending"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onToggleStaleSha={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');
    expect(frame).not.toContain('Do you authorize submitting this review comment?');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 8 — Simulated Publication Confirmed', () => {
    const { lastFrame } = render(
      <PublishScreen
        report={SYNTHETIC_REPORT}
        outcome="normal"
        decision="confirmed"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onToggleStaleSha={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('SIMULATED PUBLICATION CONFIRMED');
    expect(frame).toContain('NO EXTERNAL WRITE PERFORMED');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 8 — Publication Denied by Operator', () => {
    const { lastFrame } = render(
      <PublishScreen
        report={SYNTHETIC_REPORT}
        outcome="denied"
        decision="denied"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onToggleStaleSha={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('PUBLICATION DENIED BY OPERATOR');
    expect(frame).toContain('Review submission aborted');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Screen 9 — Process Interrupted / Cancellation Teardown', () => {
    const { lastFrame } = render(
      <ErrorScreen
        errorMessage="Review process cancelled by user. Safe rollback initiated."
        onRetry={() => {}}
        onExit={() => {}}
      />
    );
    const frame = cleanSnapshotFrame(lastFrame());
    expect(frame).toContain('Review Process Interrupted / Cancelled');
    expect(frame).toContain('Zero partial comments or review drafts leaked to GitHub');
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: Representative 60-Column Narrow Frame', () => {
    const instance = render(
      <Box width={60}>
        <WelcomeScreen onStart={() => {}} onAuthCheck={() => {}} />
      </Box>
    );
    Object.defineProperty(instance.stdout, 'columns', { value: 60, configurable: true });
    instance.stdout.emit('resize');
    instance.rerender(
      <Box width={60}>
        <WelcomeScreen onStart={() => {}} onAuthCheck={() => {}} />
      </Box>
    );
    const frame = cleanSnapshotFrame(instance.lastFrame());
    expect(frame).toContain('Welcome to CodeGuardian');

    // Assert that all rendered lines fit within the 60-column boundary
    const lines = frame.split('\n');
    for (const line of lines) {
      expect(stringWidth(line)).toBeLessThanOrEqual(60);
    }
    expect(frame).toMatchSnapshot();
  });

  it('Snapshot: NO_COLOR=1 Mode Representation', async () => {
    vi.resetModules();
    vi.stubEnv('NO_COLOR', '1');
    vi.stubEnv('FORCE_COLOR', '0');

    try {
      const { WelcomeScreen: DynamicWelcomeScreen } = await import('../src/screens/WelcomeScreen.js');
      const { lastFrame } = render(
        <DynamicWelcomeScreen onStart={() => {}} onAuthCheck={() => {}} />
      );
      const raw = lastFrame() || '';
      expect(raw).not.toMatch(/\u001B\[[0-9;]*m/);
      const frame = cleanSnapshotFrame(raw);
      expect(frame).toContain('Welcome to CodeGuardian');
      expect(frame).toMatchSnapshot();
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
