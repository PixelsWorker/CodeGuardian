import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from 'ink-testing-library';
import { App } from '../src/App.js';
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
  SYNTHETIC_REPORT
} from '../src/fixtures/fixtures.js';

describe('G00 Nine-Screen Terminal Components', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders Screen 1: WelcomeScreen', () => {
    const { lastFrame } = render(
      <WelcomeScreen onStart={() => {}} onAuthCheck={() => {}} />
    );
    expect(lastFrame()).toContain('Welcome to CodeGuardian');
    expect(lastFrame()).toContain('codeguardian review');
  });

  it('renders Screen 2: AuthScreen with preflight status', () => {
    const { lastFrame } = render(
      <AuthScreen
        githubAuth="authenticated"
        codexAuth="authenticated"
        onContinue={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('GitHub CLI (gh) Session');
    expect(lastFrame()).toContain('AUTHENTICATED');
  });

  it('renders Screen 2: AuthScreen with blocked preflight warning when unauthenticated', () => {
    const { lastFrame } = render(
      <AuthScreen
        githubAuth="not_authenticated"
        codexAuth="authenticated"
        onContinue={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('NOT AUTHENTICATED');
    expect(lastFrame()).toContain('Preflight incomplete');
    expect(lastFrame()).toContain('Verify Preflight (Blocked)');
  });

  it('renders Screen 3: PrEntryScreen with validation', () => {
    const { lastFrame } = render(
      <PrEntryScreen
        prUrl="https://github.com/example/demo/pull/42"
        error={null}
        onChangeUrl={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('Enter Target GitHub Pull Request URL');
    expect(lastFrame()).toContain('https://github.com/example/demo/pull/42');
  });

  it('renders Screen 3: PrEntryScreen with validation error message', () => {
    const { lastFrame } = render(
      <PrEntryScreen
        prUrl="https://gitlab.com/wrong/url"
        error="Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number"
        onChangeUrl={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('Validation Error');
    expect(lastFrame()).toContain('Invalid GitHub PR URL');
  });

  it('renders Screen 4: InspectScreen with file changes and diffs', () => {
    const { lastFrame } = render(
      <InspectScreen
        pr={SYNTHETIC_PR_IDENTITY}
        onStartAnalysis={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('PR #42');
    expect(lastFrame()).toContain('Changed Files List');
    expect(lastFrame()).toContain('src/demo.ts');
  });

  it('renders Screen 5: SpecialistScreen with all 4 canonical specialists', () => {
    const { lastFrame } = render(
      <SpecialistScreen
        specialists={CANONICAL_SPECIALISTS}
        onComplete={() => {}}
        onFailLane={() => {}}
        onCancel={() => {}}
      />
    );
    expect(lastFrame()).toContain('Security Specialist');
    expect(lastFrame()).toContain('Logic & Correctness Specialist');
    expect(lastFrame()).toContain('Architecture Specialist');
    expect(lastFrame()).toContain('Quality, Testing & Performance Specialist');
    expect(lastFrame()).toContain('Press [Esc] to test User Cancellation');
  });

  it('renders Screen 6: ConsensusScreen with deduplication stats', () => {
    const { lastFrame } = render(
      <ConsensusScreen
        specialists={CANONICAL_SPECIALISTS}
        findings={SYNTHETIC_FINDINGS}
        onProceed={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('Manager Validation, Synthesis & Deduplication');
    expect(lastFrame()).toContain('Accepted Findings: 4');
  });

  it('renders Screen 7: ReportScreen with findings', () => {
    const { lastFrame } = render(
      <ReportScreen
        report={SYNTHETIC_REPORT}
        onProceedToPublish={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('Consolidated Review Report');
    expect(lastFrame()).toContain('Null input is dereferenced in token resolver');
  });

  it('renders Screen 8: PublishScreen with dry-run safety warnings', () => {
    const { lastFrame } = render(
      <PublishScreen
        report={SYNTHETIC_REPORT}
        outcome="normal"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    expect(lastFrame()).toContain('Dry-Run Publication Preview & Safeguards');
    expect(lastFrame()).toContain('NO EXTERNAL API CALL OR NETWORK WRITE OCCURS');
    expect(lastFrame()).toContain('findings placed on verified diff hunks');
    expect(lastFrame()).toContain('Summary-only Findings');
  });

  it('renders Screen 8: PublishScreen with blocked stale head SHA', () => {
    const { lastFrame } = render(
      <PublishScreen
        report={SYNTHETIC_REPORT}
        outcome="stale_sha"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    expect(lastFrame()).toContain('PUBLICATION BLOCKED: STALE HEAD SHA');
    expect(lastFrame()).not.toContain('Do you authorize submitting this review comment?');
  });

  it('renders Screen 9: ErrorScreen on cancellation', () => {
    const { lastFrame } = render(
      <ErrorScreen
        errorMessage="Run cancelled by user."
        onRetry={() => {}}
        onExit={() => {}}
      />
    );
    expect(lastFrame()).toContain('Review Process Interrupted / Cancelled');
    expect(lastFrame()).toContain('Zero partial comments or review drafts leaked to GitHub');
  });

  it('renders full App top-level router with header and footer', () => {
    const { lastFrame } = render(<App initialScreen="welcome" isDemo={true} />);
    expect(lastFrame()).toContain('CodeGuardian');
    expect(lastFrame()).toContain('DEMO ONLY');
    expect(lastFrame()).toContain('TUI v0.1.0');
  });
});
