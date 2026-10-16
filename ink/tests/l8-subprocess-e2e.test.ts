import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync, execFileSync, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inkRoot = path.resolve(__dirname, '..');
const cliScript = path.resolve(inkRoot, 'dist/src/cli.js');

const EXEC_TIMEOUT_MS = 10000;

function runCliSubprocess(args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [cliScript, ...args], {
    cwd: inkRoot,
    timeout: EXEC_TIMEOUT_MS,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error,
  };
}

describe('L8 — Compiled CLI Binary / Subprocess E2E Tests', () => {
  beforeAll(() => {
    expect(fs.existsSync(cliScript)).toBe(true);
  });
  it('verifies declared package.json bin entry executes compiled binary under Node 24', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(inkRoot, 'package.json'), 'utf8'));
    const binPath = path.resolve(inkRoot, pkg.bin.codeguardian);
    expect(fs.existsSync(binPath)).toBe(true);

    const result = execFileSync(process.execPath, [binPath, '--version'], {
      encoding: 'utf8',
      timeout: EXEC_TIMEOUT_MS,
    });
    expect(result.trim()).toBe('0.1.0');
  });

  it('executes --help in Windows subprocess and exits with code 0', () => {
    const { status, stdout, stderr, error } = runCliSubprocess(['--help']);
    expect(error).toBeUndefined();
    expect(status).toBe(0);
    expect(stdout).toContain('Usage: codeguardian');
    expect(stdout).toContain('Commands:');
    expect(stdout).toContain('review');
    expect(stdout).toContain('publish');
  });

  it('executes --version in Windows subprocess and exits with code 0', () => {
    const { status, stdout, stderr, error } = runCliSubprocess(['--version']);
    expect(error).toBeUndefined();
    expect(status).toBe(0);
    expect(stdout.trim()).toBe('0.1.0');
  });

  it('executes report <RUN_ID> --format markdown and exits with code 0', () => {
    const { status, stdout, stderr, error } = runCliSubprocess([
      'report',
      'run-20261016-demo42',
      '--format',
      'markdown',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(0);
    expect(stdout).toContain('# CodeGuardian Review Report — PR #42');
    expect(stdout).toContain('Executive Summary');
    expect(stdout).toContain('Null input is dereferenced in token resolver');
  });

  it('executes report <RUN_ID> --format json and outputs valid parseable JSON', () => {
    const { status, stdout, stderr, error } = runCliSubprocess([
      'report',
      'run-demo-42',
      '--format',
      'json',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.findings.length).toBe(4);
    expect(parsed.tests.executed).toBe(false);
  });

  it('rejects unsupported report format (yaml) and exits with code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'report',
      'run-demo-42',
      '--format',
      'yaml',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Unsupported format 'yaml'");
  });

  it('rejects unknown run ID in report and exits with code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'report',
      'non-existent-run-999',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Run ID 'non-existent-run-999' not found");
  });

  it('rejects invalid auth action and exits with code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'auth',
      'logout',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Unknown auth action: logout");
  });

  it('enforces mandatory demo-only safeguard: rejects review --no-demo with exit code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'review',
      'https://github.com/example/demo/pull/42',
      '--no-demo',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Real execution mode is disabled in G00. Only --demo is supported");
  });

  it('enforces mandatory dry-run safeguard: rejects publish --no-dry-run with exit code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'publish',
      'run-demo-42',
      '--no-dry-run',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Real publication mode is disabled in G00. Only --dry-run is supported");
  });

  it('rejects invalid PR URL format from CLI invocation with exit code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'review',
      'not-a-valid-github-url',
      '--demo',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Invalid GitHub PR URL");
  });

  it('rejects unknown command and exits with code 1', () => {
    const { status, stderr, error } = runCliSubprocess([
      'unknown-subcommand',
    ]);
    expect(error).toBeUndefined();
    expect(status).toBe(1);
    expect(stderr).toContain("error: unknown command 'unknown-subcommand'");
  });

  it('handles non-TTY redirected stdin/stdout on report command and exits without hanging', () => {
    // Pipe empty input via child_process spawn
    const result = spawnSync(process.execPath, [cliScript, 'report', 'run-demo-42', '-f', 'json'], {
      cwd: inkRoot,
      input: '',
      timeout: EXEC_TIMEOUT_MS,
      encoding: 'utf8',
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.run_id).toBe('run-20261016-demo42');
  });

  it('renders actual Ink screens with non-TTY redirected stdin and exits cleanly via q', () => {
    const result = spawnSync(process.execPath, [cliScript, 'auth', 'status'], {
      cwd: inkRoot,
      input: 'q\n',
      timeout: EXEC_TIMEOUT_MS,
      encoding: 'utf8',
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Local Authentication & Toolchain Preflight Status');
    expect(result.stdout).toContain('GitHub CLI (gh) Session');
  });

  it('respects NO_COLOR=1 on rendered Ink terminal screen in subprocess', () => {
    const result = spawnSync(process.execPath, [cliScript, 'auth', 'status'], {
      cwd: inkRoot,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      input: 'q\n',
      timeout: EXEC_TIMEOUT_MS,
      encoding: 'utf8',
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    // Verify rendered screen content is visible
    expect(result.stdout).toContain('Local Authentication & Toolchain Preflight Status');
    // Verify no ANSI color escape codes are emitted
    expect(result.stdout).not.toMatch(/\u001B\[[0-9;]*m/);
  });

  it('respects NO_COLOR=1 in non-interactive report markdown export', () => {
    const { status, stdout, error } = runCliSubprocess(
      ['report', 'run-demo-42', '-f', 'markdown'],
      { NO_COLOR: '1' }
    );
    expect(error).toBeUndefined();
    expect(status).toBe(0);
    expect(stdout).not.toMatch(/\u001B\[[0-9;]*[a-zA-Z]/);
    expect(stdout).toContain('# CodeGuardian Review Report — PR #42');
  });
});
