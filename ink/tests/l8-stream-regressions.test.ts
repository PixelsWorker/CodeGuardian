import { describe, it, expect } from 'vitest';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SYNTHETIC_PR_IDENTITY, getReportForRunId } from '../src/fixtures/fixtures.js';
import { canonicalReportPayload } from '../src/core/report-digest.js';
import { createHash } from 'node:crypto';

const cli = fileURLToPath(new URL('../dist/src/cli.js', import.meta.url));
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// Reject attempts to contact services during the compiled demo. This preload is
// test-only; it does not alter the application's auth/publication safeguards.
const guard = `import net from 'node:net'; import tls from 'node:tls'; import http from 'node:http'; import https from 'node:https';
const denied=()=>{throw new Error('TEST: external network attempt forbidden')};
net.Socket.prototype.connect=denied; tls.connect=denied; http.request=denied; https.request=denied;
// Yoga loads its bundled WASM through a data URL; this is local decoding, not networking.
const originalFetch=globalThis.fetch;
globalThis.fetch=(input,init)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 if(url.startsWith('data:')) return originalFetch(input,init);
 return denied();
};`;
async function session(args: string[], chunks: Array<[string, number]>) {
  const child = spawn(process.execPath, ['--import', `data:text/javascript,${encodeURIComponent(guard)}`, cli, ...args], {
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', data => { stdout += data; }); child.stderr.on('data', data => { stderr += data; });
  child.stdin.on('error', () => {});
  const done = new Promise<number | null>((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
  const timeout = setTimeout(() => { child.kill(); }, 12000); // Cleanup only; a timeout fails, never counts as cancellation.
  try {
    await sleep(700);
    for (const [text, pause] of chunks) { child.stdin.write(text); await sleep(pause); }
    child.stdin.end();
    const code = await done;
    expect(code).toBe(0); expect(stderr).not.toContain('external network attempt');
    expect(stdout).not.toMatch(/\u001b\[[0-9;]*m/);
    return { stdout, stderr, code };
  } finally { clearTimeout(timeout); }
}
const url = 'https://github.com/my-q-org/my-repo/pull/123';
const erase = '\u007f'.repeat(SYNTHETIC_PR_IDENTITY.url.length);
describe('L8 — Compiled redirected stream regressions (current OS)', () => {
  it.each(['whole', 'split'])('preserves %s URL input including q and hyphens', async mode => {
    const pieces: Array<[string, number]> = mode === 'whole' ? [[erase + url + '\r', 150]]
      : [[erase + url.slice(0, 24), 20], [url.slice(24, 35), 20], [url.slice(35) + '\r', 150]];
    const result = await session(['auth', 'status'], [['\r', 150], ...pieces, ['q', 100]]);
    expect(result.stdout.replace(/[\s│║]/g, '')).toContain('PR#123:[DEMO]PR#123:my-q-org/my-repo');
    expect(result.stdout).not.toContain('Invalid GitHub PR URL');
  });
  it('keeps split CRLF as one Enter across screen remount', async () => {
    const result = await session(['auth', 'status'], [['\r', 150], ['\n', 150], [erase + url + '\r', 150], ['q', 100]]);
    expect(result.stdout.replace(/[\s│║]/g, '')).toContain('my-q-org/my-repo');
    expect(result.stdout).toContain('PR #123');
  });
  it('recognizes fragmented CSI and bare Escape without inserting ANSI suffix text', async () => {
    const result = await session(['review', SYNTHETIC_PR_IDENTITY.url], [
      ['\u001b', 5], ['[', 5], ['B', 150], ['q', 100],
    ]);
    expect(result.stdout).toContain('generateSessionKey');
    expect(result.stdout).not.toContain('Local Authentication');
  });
  it('completes timeout journey, safe publication and reset with no network access', async () => {
    const result = await session([], [
      ['\r', 150], ['\r', 150], ['\r', 150], ['\r', 150], ['t', 150],
      ['\r', 150], ['\r', 150], ['\r', 150], ['y', 150], ['r', 150], ['q', 100],
    ]);
    expect(result.stdout).toContain('Welcome to CodeGuardian');
    // Non-TTY Ink may emit only the final frame, so the separate publish receipt
    // below checks the finalized timeout payload rather than assuming scrollback.
    const report = getReportForRunId('run-g00~example~demo~42~cctc')!;
    const preview = await session(['publish', report.run_id, '--dry-run'], [['y', 150], ['q', 100]]);
    const flat = preview.stdout.replace(/[\s│║]/g, '');
    expect(flat).toContain('ArchitectureSpecialist:timed_out');
    expect(flat).toContain(report.report_digest);
    expect(flat).toContain('SIMULATEDPUBLICATIONCONFIRMED');
    expect(flat).toContain('NOEXTERNALWRITEPERFORMED');
  });
  it.each(['run-20261016-demo42', 'partial', 'run-g00~my-org~my-repo~12~ccts'])('exports matching Markdown/JSON and publication preview for %s', async id => {
    const json = spawnSync(process.execPath, [cli, 'report', id, '-f', 'json'], { encoding: 'utf8' });
    const md = spawnSync(process.execPath, [cli, 'report', id, '-f', 'markdown'], { encoding: 'utf8' });
    expect(json.status).toBe(0); expect(md.status).toBe(0);
    const report = JSON.parse(json.stdout);
    expect(report).toEqual(getReportForRunId(id));
    expect(report.report_digest).toBe(`sha256-${createHash('sha256').update(canonicalReportPayload(report)).digest('hex')}`);
    expect(md.stdout).toContain(report.report_digest);
    const preview = await session(['publish', id], [['n', 150], ['q', 100]]);
    expect(preview.stdout.replace(/[\s│║]/g, '')).toContain(report.report_digest);
    for (const warning of report.warnings) expect(preview.stdout.replace(/[\s│║]/g, '')).toContain(warning.replace(/[\s│║]/g, ''));
  });
  it.each([
    'https://github.com/acme/repo?tab=x/pull/1', 'https://github.com/acme/repo/pull/1#x',
    'https://user@github.com/acme/repo/pull/1', 'https://github.com/acme/re%2Fpo/pull/1',
  ])('rejects malformed URL in compiled CLI: %s', url => {
    const result = spawnSync(process.execPath, [cli, 'review', url], { encoding: 'utf8' });
    expect(result.status).toBe(1); expect(result.stderr).toContain('Invalid GitHub PR URL'); expect(result.stdout).toBe('');
  });
});
