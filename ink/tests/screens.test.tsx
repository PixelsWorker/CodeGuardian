import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from 'ink-testing-library';
import { render as renderInk } from 'ink';
import { PassThrough, Writable } from 'node:stream';
import { App } from '../src/App.js';
import { cliReducer, createInitialState } from '../src/core/state-machine.js';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.js';
import { AuthScreen } from '../src/screens/AuthScreen.js';
import { PrEntryScreen } from '../src/screens/PrEntryScreen.js';
import { clipTerminalLine, InspectScreen } from '../src/screens/InspectScreen.js';
import { SpecialistScreen } from '../src/screens/SpecialistScreen.js';
import { ConsensusScreen } from '../src/screens/ConsensusScreen.js';
import { ReportScreen } from '../src/screens/ReportScreen.js';
import { PublishScreen } from '../src/screens/PublishScreen.js';
import { ErrorScreen } from '../src/screens/ErrorScreen.js';
import { LiveInspectionApp } from '../src/screens/LiveInspectionApp.js';
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
        onEditUrl={() => {}}
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
        onEditUrl={() => {}}
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
    expect(lastFrame()).toContain('HIGH RISK (AUTH & CRYPTO)');
    expect(lastFrame()).toContain('SENSITIVE_AUTH_PATH');
  });

  it('renders a live snapshot without synthetic risk or worker affordances', async () => {
    const snapshot = {
      source_mode: 'live' as const,
      retrieved_at: '2026-10-28T08:00:00.000Z',
      identity: {
        provider: 'github' as const, owner: 'PixelsWorker', repo: 'CodeGuardian', number: 11,
        url: 'https://github.com/PixelsWorker/CodeGuardian/pull/11',
        base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40), title: 'Live PR', author: 'rockson',
        base_branch: 'dev', head_branch: 'topic', changed_files_count: 1, additions: 2, deletions: 1, is_draft: false,
      },
      state: 'open' as const, is_draft: false,
      files: [{ path: 'ink/src/cli.tsx', previous_path: null, status: 'modified' as const,
        additions: 2, deletions: 1, patch: '@@ -1 +1 @@\n-old\n+new', patch_available: true, patch_truncated: false }],
      pagination: { complete: true, page_count: 1, file_limit_hit: false }, status: 'complete' as const, warnings: [],
    };
    const { lastFrame } = render(<LiveInspectionApp prUrl={snapshot.identity.url} reader={async () => ({ ok: true, snapshot })} />);
    await new Promise(resolve => setTimeout(resolve, 80));
    const frame = lastFrame() ?? '';
    expect(frame).toContain('Live GitHub Read-Only Inspection');
    expect(frame).toContain('LIVE · READ ONLY');
    expect(frame).toContain('LIVE SNAPSHOT COMPLETE');
    expect(frame).toContain('ink/src/cli.tsx');
    expect(frame).toContain('no workers or publication');
    expect(frame).not.toContain('HIGH RISK');
    expect(frame).not.toContain('Dispatch 4 Specialist Workers');
  });

  it('shows an unavailable-patch message without counting it as diff content', () => {
    const pr = {
      provider: 'github' as const, owner: 'PixelsWorker', repo: 'CodeGuardian', number: 11,
      url: 'https://github.com/PixelsWorker/CodeGuardian/pull/11', base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40),
      title: 'Live PR', author: 'rockson', base_branch: 'dev', head_branch: 'topic', changed_files_count: 1,
      additions: 0, deletions: 0, is_draft: false,
    };
    const snapshot = {
      source_mode: 'live' as const, retrieved_at: '2026-10-28T08:00:00.000Z', identity: pr,
      state: 'open' as const, is_draft: false,
      files: [{ path: 'src/binary.png', previous_path: null, status: 'modified' as const, additions: 0, deletions: 0,
        patch: null, patch_available: false, patch_truncated: false }],
      pagination: { complete: true, page_count: 1, file_limit_hit: false }, status: 'partial' as const, warnings: [],
    };
    const { lastFrame } = render(<InspectScreen pr={pr} snapshot={snapshot} onStartAnalysis={() => {}} onBack={() => {}} />);
    expect(lastFrame()).toContain('Diff src/binary.png · 0/0 lines');
    expect(lastFrame()).toContain('GitHub did not provide a patch for this file.');
  });

  it('keeps full pinned SHAs and the live list/diff viewport within 24 terminal rows', async () => {
    const files = Array.from({ length: 300 }, (_, index) => ({
      path: index === 0
        ? 'packages/界界/😀-long-directory-name-0/nested/module-0.tsx'
        : `packages/long-directory-name-${index}/nested/module-${index}.tsx`, previous_path: null,
      status: 'modified' as const, additions: 120, deletions: 40,
      patch: Array.from({ length: 120 }, (__, line) => `${line % 2 ? '+' : '-'}${index === 0 ? '界😀' : ''}${'x'.repeat(180)} ${line}`).join('\n'),
      patch_available: true, patch_truncated: false,
    }));
    const snapshot = {
      source_mode: 'live' as const, retrieved_at: '2026-10-28T08:00:00.000Z',
      identity: {
        provider: 'github' as const, owner: 'PixelsWorker', repo: 'CodeGuardian', number: 11,
        url: 'https://github.com/PixelsWorker/CodeGuardian/pull/11',
        base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40), title: 'Live PR with a deliberately long title for viewport testing', author: 'rockson',
        base_branch: 'dev', head_branch: 'topic', changed_files_count: files.length, additions: 2, deletions: 1, is_draft: false,
      },
      state: 'open' as const, is_draft: false, files,
      pagination: { complete: true, page_count: 3, file_limit_hit: false }, status: 'complete' as const, warnings: [],
    };
    for (const columns of [80, 72, 40]) {
      const outputFrames: string[] = [];
      const stdout = new Writable({ write(chunk, _encoding, callback) { outputFrames.push(String(chunk)); callback(); } }) as Writable & { columns: number; rows: number };
      stdout.columns = columns;
      stdout.rows = 24;
      const stdin = new PassThrough() as PassThrough & { isTTY: boolean };
      stdin.isTTY = false;
      const stderr = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
      const app = renderInk(<LiveInspectionApp prUrl={snapshot.identity.url} reader={async () => ({ ok: true, snapshot })} />, {
        stdout, stdin, stderr, debug: true, exitOnCtrlC: false, patchConsole: false,
      });
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const frame = outputFrames.at(-1)?.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '') ?? '';
        const compactFrame = frame.replace(/\s/g, '');
        expect(compactFrame).toContain(`BaseSHA:${'a'.repeat(40)}`);
        expect(compactFrame).toContain(`HeadSHA:${'b'.repeat(40)}`);
        expect(frame).toContain(columns === 80 ? 'Files 1–6 of 300' : columns === 72 ? 'Files 1–5 of 300' : 'Files 1–4 of 300');
        expect(frame).toContain('Diff packages/界界/😀');
        const displayWidth = (line: string) => Array.from(line).reduce((sum, character) => {
          const point = character.codePointAt(0)!;
          if (/\p{Mark}/u.test(character) || point === 0x200d || point === 0xfe0f) return sum;
          return sum + (/\p{Emoji_Presentation}/u.test(character) || (point >= 0x2e80 && point <= 0x9fff) ? 2 : 1);
        }, 0);
        expect(frame.split('\n').filter(line => line.length > 0).every(line => displayWidth(line) <= columns)).toBe(true);
        expect(frame.split('\n').filter(line => line.length > 0).length).toBeLessThan(24);
      } finally {
        app.unmount();
        app.cleanup();
      }
    }
  });

  it('clips CJK and emoji text by terminal display cells', () => {
    const cellWidth = (value: string) => Array.from(value).reduce((sum, character) => {
      const point = character.codePointAt(0)!;
      if (/\p{Mark}/u.test(character) || point === 0x200d || point === 0xfe0f) return sum;
      return sum + (/\p{Emoji_Presentation}/u.test(character) || (point >= 0x2e80 && point <= 0x9fff) ? 2 : 1);
    }, 0);
    for (const text of ['src/界界界/very-long-module.ts', 'patch 😀😀😀 and 🇮🇳', 'heart ❤️ and fullwidth ＡＢＣ']) {
      for (const width of [8, 12, 24]) {
        const clipped = clipTerminalLine(text, width);
        expect(cellWidth(clipped)).toBeLessThanOrEqual(width);
        expect(clipped.endsWith('…') || clipped === text).toBe(true);
      }
    }
  });

  it('shows a live read error and recovers through an explicit retry', async () => {
    const snapshot = {
      source_mode: 'live' as const, retrieved_at: '2026-10-28T08:00:00.000Z',
      identity: {
        provider: 'github' as const, owner: 'PixelsWorker', repo: 'CodeGuardian', number: 11,
        url: 'https://github.com/PixelsWorker/CodeGuardian/pull/11', base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40),
        title: 'Live PR', author: 'rockson', base_branch: 'dev', head_branch: 'topic', changed_files_count: 0,
        additions: 0, deletions: 0, is_draft: false,
      },
      state: 'open' as const, is_draft: false, files: [],
      pagination: { complete: true, page_count: 1, file_limit_hit: false }, status: 'complete' as const, warnings: [],
    };
    const reader = vi.fn()
      .mockResolvedValueOnce({ ok: false, kind: 'snapshot_changed', message: 'The pull request changed while it was being read. Retry to obtain a consistent snapshot.' })
      .mockResolvedValueOnce({ ok: true, snapshot });
    const { lastFrame, stdin } = render(<LiveInspectionApp prUrl={snapshot.identity.url} reader={reader} />);
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(lastFrame()).toContain('snapshot_changed');
    expect(process.exitCode).toBe(1);
    stdin.write('r');
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(reader).toHaveBeenCalledTimes(2);
    expect(lastFrame()).toContain('LIVE SNAPSHOT COMPLETE');
    expect(process.exitCode).toBe(0);
  });

  it('returns nonzero when quitting a failed live read and zero after a successful read', async () => {
    const originalExitCode = process.exitCode;
    process.exitCode = undefined;
    try {
      const failure = render(<LiveInspectionApp prUrl="https://github.com/PixelsWorker/CodeGuardian/pull/11"
        reader={async () => ({ ok: false, kind: 'not_found', message: 'PR unavailable.' })} />);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(process.exitCode).toBe(1);
      failure.stdin.write('q');
      expect(process.exitCode).toBe(1);
      failure.cleanup();

      process.exitCode = undefined;
      const success = render(<LiveInspectionApp prUrl="https://github.com/PixelsWorker/CodeGuardian/pull/11"
        reader={async () => ({ ok: true, snapshot: {
          source_mode: 'live', retrieved_at: '2026-10-28T08:00:00.000Z',
          identity: {
            provider: 'github', owner: 'PixelsWorker', repo: 'CodeGuardian', number: 11,
            url: 'https://github.com/PixelsWorker/CodeGuardian/pull/11', base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40),
            title: 'Live PR', author: 'rockson', base_branch: 'dev', head_branch: 'topic', changed_files_count: 0,
            additions: 0, deletions: 0, is_draft: false,
          },
          state: 'open', is_draft: false, files: [], pagination: { complete: true, page_count: 1, file_limit_hit: false },
          status: 'complete', warnings: [],
        } })} />);
      await new Promise(resolve => setTimeout(resolve, 50));
      success.stdin.write('q');
      expect(process.exitCode).toBe(0);
      success.cleanup();

      process.exitCode = undefined;
      const pending = render(<LiveInspectionApp prUrl="https://github.com/PixelsWorker/CodeGuardian/pull/11"
        reader={() => new Promise(() => {})} />);
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(process.exitCode).toBe(1);
      pending.stdin.write('c');
      expect(process.exitCode).toBe(1);
      pending.cleanup();
    } finally {
      process.exitCode = originalExitCode;
    }
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
    expect(lastFrame()).toContain('Press [U] to simulate Queued worker pool state');
  });

  it('renders Screen 6: ConsensusScreen with deduplication stats and rejected findings', () => {
    const { lastFrame } = render(
      <ConsensusScreen
        specialists={CANONICAL_SPECIALISTS}
        findings={SYNTHETIC_FINDINGS}
        onProceed={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('Manager Validation, Synthesis & Deduplication');
    expect(lastFrame()).toContain('Total Candidate Findings: 5');
    expect(lastFrame()).toContain('Verified Diff Findings: 3');
    expect(lastFrame()).toContain('Rejected Findings: 1');
    expect(lastFrame()).toContain('1 finding(s) rejected as outside PR changed-line boundaries');
    expect(lastFrame()).toContain('P2 Reliability/Perf Flaws: 1');
    expect(lastFrame()).toContain('Deduplicated overlap between Architecture and Quality');
  });

  it('renders a terminal partial worker with retained findings instead of RUNNING', () => {
    const { lastFrame } = render(
      <SpecialistScreen
        specialists={[{ ...CANONICAL_SPECIALISTS[0], state: 'partial', progress: 65, findingsCount: 2 }]}
        onComplete={() => {}}
        onFailLane={() => {}}
        onCancel={() => {}}
      />
    );
    expect(lastFrame()).toContain('PARTIAL (2 findings)');
    expect(lastFrame()).not.toContain('RUNNING');
    expect(lastFrame()).not.toContain('COMPLETED');
  });

  it.each([
    ['verified_diff', 'VERIFIED DIFF'],
    ['needs_context', 'NEEDS CONTEXT'],
    ['rejected', 'REJECTED'],
  ] as const)('labels %s findings and only shows recommendations for non-rejected findings', (verification, label) => {
    const finding = {
      ...SYNTHETIC_FINDINGS[0],
      verification,
      rejection_reason: 'Outside PR changed-line boundaries',
    };
    const { lastFrame } = render(
      <ReportScreen
        report={{ ...SYNTHETIC_REPORT, findings: [finding] }}
        onProceedToPublish={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain(`[${label}]`);
    if (verification === 'rejected') {
      expect(lastFrame()).toContain('Rejection reason: Outside PR changed-line boundaries');
      expect(lastFrame()).toContain('Excluded from publication.');
      expect(lastFrame()).not.toContain('Recommendation:');
      expect(lastFrame()).not.toContain(finding.recommendation);
    } else {
      expect(lastFrame()).toContain('Recommendation:');
      expect(lastFrame()).not.toContain('Rejection reason:');
    }
  });

  it('explains rejected findings even when their optional rejection reason is missing', () => {
    const { lastFrame } = render(
      <ReportScreen
        report={{ ...SYNTHETIC_REPORT, findings: [{ ...SYNTHETIC_FINDINGS[0], verification: 'rejected' }] }}
        onProceedToPublish={() => {}}
        onBack={() => {}}
      />
    );
    expect(lastFrame()).toContain('[REJECTED]');
    expect(lastFrame()).toContain('No rejection reason provided.');
    expect(lastFrame()).not.toContain('Recommendation:');
  });

  it('keeps rejected rows visibly marked and shows the rejection reason when selected', async () => {
    const rejected = { ...SYNTHETIC_FINDINGS[1], verification: 'rejected' as const, rejection_reason: 'Outside changed lines' };
    const { lastFrame, stdin } = render(
      <ReportScreen
        report={{ ...SYNTHETIC_REPORT, findings: [SYNTHETIC_FINDINGS[0], rejected] }}
        onProceedToPublish={() => {}}
        onBack={() => {}}
      />
    );
    const initialLines = (lastFrame() || '').split('\n');
    const rejectedBadgeLine = initialLines.findIndex(line => line.includes('[REJECTED]'));
    const rejectedTitleLine = initialLines.findIndex(line => line.includes(rejected.title));
    expect(rejectedBadgeLine).toBeGreaterThanOrEqual(0);
    expect(rejectedTitleLine).toBeGreaterThan(rejectedBadgeLine);
    stdin.write('\u001b[B');
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(lastFrame()).toContain('Rejection reason: Outside changed lines');
    expect(lastFrame()).not.toContain('Recommendation:');
    stdin.write('\u001b[A');
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(lastFrame()).toContain('Recommendation:');
    expect(lastFrame()).not.toContain('Rejection reason:');
  });

  it('renders Screen 6: ConsensusScreen excludes findings and deduplication when a lane fails', () => {
    const specialistsWithFailedQuality = CANONICAL_SPECIALISTS.map(s =>
      s.role === 'quality' ? { ...s, state: 'failed' as const } : s
    );
    const { lastFrame } = render(
      <ConsensusScreen
        specialists={specialistsWithFailedQuality}
        findings={SYNTHETIC_FINDINGS}
        onProceed={() => {}}
        onBack={() => {}}
      />
    );
    // When Quality fails, f-005 (quality only) is excluded, f-003 is retained via Architecture
    expect(lastFrame()).toContain('PARTIAL REVIEW READY');
    expect(lastFrame()).toContain('Total Candidate Findings: 4');
    expect(lastFrame()).not.toContain('Deduplicated overlap between Architecture and Quality');
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
    expect(lastFrame()).toContain('Findings (5 total — use [↑/↓] to inspect):');
    expect(lastFrame()).not.toContain('Verified Findings');
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

  it('renders Screen 8: PublishScreen excludes rejected findings from Summary-only count', () => {
    const reportWithRejected = {
      ...SYNTHETIC_REPORT,
      findings: [
        { ...SYNTHETIC_FINDINGS[0], verification: 'verified_diff' as const },
        { ...SYNTHETIC_FINDINGS[1], verification: 'needs_context' as const },
        { ...SYNTHETIC_FINDINGS[2], verification: 'rejected' as const },
      ],
    };
    const { lastFrame } = render(
      <PublishScreen
        report={reportWithRejected}
        outcome="normal"
        onConfirmPublish={() => {}}
        onDenyPublish={() => {}}
        onBack={() => {}}
        onRestart={() => {}}
      />
    );
    expect(lastFrame()).toContain('1 unverified findings (needs context, omitted from inline)');
    expect(lastFrame()).not.toContain('2 unverified findings');
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

  it('shows the complete proposed payload before approval and omits rejected diagnostics', () => {
    const report = {
      ...SYNTHETIC_REPORT,
      findings: SYNTHETIC_FINDINGS.map(f => ({ ...f, evidence: `${f.evidence} END-${f.id}` })),
    };
    const { lastFrame } = render(
      <PublishScreen report={report} outcome="normal" onConfirmPublish={() => {}} onDenyPublish={() => {}} onBack={() => {}} onRestart={() => {}} />
    );
    const frame = lastFrame()!;
    const flat = frame.replace(/\s/g, '');
    expect(frame).toContain('Proposed review summary:');
    expect(frame).toContain('Proposed inline comments:');
    expect(flat).toContain(report.summary.replace(/\s/g, ''));
    for (const finding of report.findings) {
      if (finding.verification === 'rejected') {
        expect(flat).not.toContain(finding.title.replace(/\s/g, ''));
        expect(frame).not.toContain(`END-${finding.id}`);
        continue;
      }
      for (const value of [finding.title, finding.evidence, finding.impact, finding.recommendation]) {
        expect(flat).toContain(value.replace(/\s/g, ''));
      }
      const entry = `[${finding.severity}] ${finding.title}`;
      expect(flat).toContain(entry.replace(/\s/g, ''));
      expect(frame.indexOf(`END-${finding.id}`)).toBeLessThan(frame.indexOf('Do you authorize'));
      if (finding.verification === 'verified_diff') {
        expect(flat).toContain(`Path:${finding.path}:${finding.line}(${finding.side})`);
      } else {
        expect(frame).toContain('Summary only — needs context:');
      }
    }
  });

  it('shows an empty inline payload and nullable summary location without fabricating an anchor', () => {
    const finding = { ...SYNTHETIC_FINDINGS[0], verification: 'needs_context' as const, line: null, side: null };
    const { lastFrame } = render(
      <PublishScreen report={{ ...SYNTHETIC_REPORT, findings: [finding] }} outcome="normal" onConfirmPublish={() => {}} onDenyPublish={() => {}} onBack={() => {}} onRestart={() => {}} />
    );
    expect(lastFrame()).toContain('No inline comments.');
    expect(lastFrame()).toContain(`Path: ${finding.path}`);
    expect(lastFrame()).not.toContain('(RIGHT)');
    expect(lastFrame()).not.toContain(':null');
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
    expect(lastFrame()).toContain('[Enter] Begin');
    expect(lastFrame()).toContain('[A] Auth status');
  });

  it('renders screen-specific footer hints across workflow screens', () => {
    const specialistApp = render(<App initialScreen="specialist" isDemo={true} />);
    expect(specialistApp.lastFrame()).toContain('[Enter] Synthesize');
    expect(specialistApp.lastFrame()).toContain('[Esc] Cancel run');

    const prApp = render(<App initialScreen="pr_input" isDemo={true} />);
    expect(prApp.lastFrame()).toContain('[Enter] Submit');
    expect(prApp.lastFrame()).toContain('[Ctrl+C] Quit');
  });

  it('supports backward navigation and preserves published state across specialist and inspection screens', () => {
    let state = createInitialState(true);
    state = cliReducer(state, { type: "SUBMIT_PR_URL" });
    state = cliReducer(state, { type: "START_SPECIALISTS" });
    state = cliReducer(state, { type: "FINISH_SPECIALISTS" });
    state = cliReducer(state, { type: "VALIDATE_FINDINGS" });
    state = cliReducer(state, { type: "NAVIGATE", screen: "publish" });
    state = cliReducer(state, { type: "APPROVE_PUBLISH" });
    expect(state.runStatus).toBe("published");

    // Backward navigation: publish -> report -> consensus -> specialist
    state = cliReducer(state, { type: "NAVIGATE", screen: "report" });
    expect(state.runStatus).toBe("published");
    state = cliReducer(state, { type: "NAVIGATE", screen: "consensus" });
    expect(state.runStatus).toBe("published");
    state = cliReducer(state, { type: "NAVIGATE", screen: "specialist" });
    expect(state.runStatus).toBe("published");

    // CANCEL_RUN is disabled after publication
    const afterCancel = cliReducer(state, { type: "CANCEL_RUN" });
    expect(afterCancel.runStatus).toBe("published");
    expect(afterCancel.screen).toBe("specialist");

    // Navigate back to inspection and forward again
    state = cliReducer(state, { type: "NAVIGATE", screen: "inspection" });
    expect(state.screen).toBe("inspection");
    expect(state.runStatus).toBe("published");
    state = cliReducer(state, { type: "START_SPECIALISTS" });
    expect(state.screen).toBe("specialist");
    expect(state.runStatus).toBe("published");
  });
});
