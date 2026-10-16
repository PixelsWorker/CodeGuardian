import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCliProgram } from '../src/cli.js';
import { SYNTHETIC_REPORT } from '../src/fixtures/fixtures.js';

describe('L3 — CLI Parser and Safety Tests', () => {
  let stdoutOutput: string[] = [];
  let stderrOutput: string[] = [];
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    stdoutOutput = [];
    stderrOutput = [];
    process.exitCode = undefined;

    vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      stdoutOutput.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      stderrOutput.push(args.join(' '));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
  });

  it('handles --help and displays usage with subcommands', () => {
    const program = createCliProgram({ exitOverride: true });
    let helpCaptured = '';
    program.configureOutput({
      writeOut: (str) => { helpCaptured += str; },
      writeErr: (str) => { stderrOutput.push(str); },
    });

    try {
      program.parse(['node', 'cli.js', '--help']);
    } catch (err: any) {
      expect(err.code).toBe('commander.helpDisplayed');
      expect(err.exitCode).toBe(0);
    }

    expect(helpCaptured).toContain('Usage: codeguardian');
    expect(helpCaptured).toContain('review');
    expect(helpCaptured).toContain('auth');
    expect(helpCaptured).toContain('report');
    expect(helpCaptured).toContain('publish');
  });

  it('handles --version and displays 0.1.0', () => {
    const program = createCliProgram({ exitOverride: true });
    let versionCaptured = '';
    program.configureOutput({
      writeOut: (str) => { versionCaptured += str; },
    });

    try {
      program.parse(['node', 'cli.js', '--version']);
    } catch (err: any) {
      expect(err.code).toBe('commander.version');
      expect(err.exitCode).toBe(0);
    }

    expect(versionCaptured).toContain('0.1.0');
  });

  it('handles auth status subcommand cleanly', () => {
    let rendered: any = null;
    const program = createCliProgram({
      exitOverride: true,
      renderApp: (el) => { rendered = el; },
    });
    program.parse(['node', 'cli.js', 'auth', 'status']);
    expect(process.exitCode).toBeUndefined();
    expect(stderrOutput.length).toBe(0);
    expect(rendered).toBeDefined();
    expect(rendered.props.initialScreen).toBe('auth');
    expect(rendered.props.isDemo).toBe(true);
  });

  it('rejects invalid auth action with error and exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'auth', 'revoke']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Unknown auth action: revoke"))).toBe(true);
  });

  it('handles review <URL> --demo with valid PR URL', () => {
    let rendered: any = null;
    const program = createCliProgram({
      exitOverride: true,
      renderApp: (el) => { rendered = el; },
    });
    program.parse(['node', 'cli.js', 'review', 'https://github.com/example/demo/pull/42', '--demo']);
    expect(process.exitCode).toBeUndefined();
    expect(stderrOutput.length).toBe(0);
    expect(rendered).toBeDefined();
    expect(rendered.props.initialScreen).toBe('inspection');
    expect(rendered.props.initialPrUrl).toBe('https://github.com/example/demo/pull/42');
    expect(rendered.props.isDemo).toBe(true);
  });

  it('enforces mandatory demo-only safeguard: rejects --no-demo with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'review', 'https://github.com/example/demo/pull/42', '--no-demo']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Real execution mode is disabled in G00. Only --demo is supported"))).toBe(true);
  });

  it('rejects invalid PR host (e.g. gitlab.com) with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'review', 'https://gitlab.com/org/repo/pull/42', '--demo']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Invalid GitHub PR URL"))).toBe(true);
  });

  it('rejects malformed PR path with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'review', 'https://github.com/example/demo/issues/42', '--demo']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Invalid GitHub PR URL"))).toBe(true);
  });

  it('exports report in markdown format for valid run ID', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', SYNTHETIC_REPORT.run_id, '--format', 'markdown']);
    expect(process.exitCode).toBeUndefined();
    expect(stdoutOutput.some(msg => msg.includes("# CodeGuardian Review Report — PR #42"))).toBe(true);
  });

  it('exports report in json format for valid run ID', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', 'run-demo-42', '-f', 'json']);
    expect(process.exitCode).toBeUndefined();
    const jsonStr = stdoutOutput.join('\n');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.run_id).toBe(SYNTHETIC_REPORT.run_id);
  });

  it('rejects unsupported report format (e.g. yaml, xml) with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', SYNTHETIC_REPORT.run_id, '-f', 'yaml']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Unsupported format 'yaml'"))).toBe(true);
  });

  it('exports partial review report with failed specialist coverage for run-20261016-g00-partial', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', 'run-20261016-g00-partial', '-f', 'json']);
    expect(process.exitCode).toBeUndefined();
    const jsonStr = stdoutOutput.join('\n');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.status).toBe('partial');
    expect(parsed.run_id).toBe('run-20261016-g00-partial');
    expect(parsed.worker_states.some((w: any) => w.worker_id === 'worker-qty' && w.state === 'failed')).toBe(true);
  });

  it('exports deterministic custom-PR review report for custom run ID', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', 'run-20261016-acme-frontend-101', '-f', 'json']);
    expect(process.exitCode).toBeUndefined();
    const jsonStr = stdoutOutput.join('\n');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.pr.owner).toBe('acme');
    expect(parsed.pr.repo).toBe('frontend');
    expect(parsed.pr.number).toBe(101);
  });

  it('rejects unknown run ID in report command with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'report', 'run-non-existent-999']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Run ID 'run-non-existent-999' not found"))).toBe(true);
  });

  it('handles publish <RUN_ID> --dry-run cleanly for valid run ID', () => {
    let rendered: any = null;
    const program = createCliProgram({
      exitOverride: true,
      renderApp: (el) => { rendered = el; },
    });
    program.parse(['node', 'cli.js', 'publish', SYNTHETIC_REPORT.run_id, '--dry-run']);
    expect(process.exitCode).toBeUndefined();
    expect(stderrOutput.length).toBe(0);
    expect(rendered).toBeDefined();
    expect(rendered.props.initialScreen).toBe('publish');
    expect(rendered.props.isDemo).toBe(true);
  });

  it('enforces mandatory dry-run-only safeguard: rejects --no-dry-run with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'publish', SYNTHETIC_REPORT.run_id, '--no-dry-run']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Real publication mode is disabled in G00. Only --dry-run is supported"))).toBe(true);
  });

  it('rejects unknown run ID in publish command with exit code 1', () => {
    const program = createCliProgram({ exitOverride: true });
    program.parse(['node', 'cli.js', 'publish', 'unknown-run-id']);
    expect(process.exitCode).toBe(1);
    expect(stderrOutput.some(msg => msg.includes("Run ID 'unknown-run-id' not found"))).toBe(true);
  });

  it('errors on missing required arguments for review, report, and publish', () => {
    const suppressErr = { writeErr: () => {} };
    const p1 = createCliProgram({ exitOverride: true });
    p1.configureOutput(suppressErr);
    expect(() => p1.parse(['node', 'cli.js', 'review'])).toThrow();

    const p2 = createCliProgram({ exitOverride: true });
    p2.configureOutput(suppressErr);
    expect(() => p2.parse(['node', 'cli.js', 'report'])).toThrow();

    const p3 = createCliProgram({ exitOverride: true });
    p3.configureOutput(suppressErr);
    expect(() => p3.parse(['node', 'cli.js', 'publish'])).toThrow();
  });

  it('errors on unknown commands and unknown options', () => {
    const suppressErr = { writeErr: () => {} };
    const p1 = createCliProgram({ exitOverride: true });
    p1.configureOutput(suppressErr);
    expect(() => p1.parse(['node', 'cli.js', 'unsupported-command'])).toThrow();

    const p2 = createCliProgram({ exitOverride: true });
    p2.configureOutput(suppressErr);
    expect(() => p2.parse(['node', 'cli.js', 'review', 'https://github.com/example/demo/pull/42', '--unsupported-option'])).toThrow();
  });
});
