import { describe, expect, it, vi } from 'vitest';
import { classifyGhFailureText, readGitHubPullRequestSnapshot, ReaderFailure, sanitizeRemoteText, type CommandRunner } from '../src/core/live-github-reader.js';

const url = 'https://github.com/PixelsWorker/CodeGuardian/pull/11';
const sha1 = 'a'.repeat(40);
const sha2 = 'b'.repeat(40);

function metadata(headSha = sha2, fields: Record<string, unknown> = {}) {
  return JSON.stringify({
    number: 11,
    state: 'open',
    draft: false,
    title: 'Read-only inspection',
    user: { login: 'rockson' },
    base: { sha: sha1, ref: 'main', repo: { name: 'CodeGuardian', owner: { login: 'PixelsWorker' } } },
    head: { sha: headSha, ref: 'topic' },
    changed_files: 1,
    additions: 3,
    deletions: 1,
    ...fields,
  });
}

const filePage = (items: unknown[]) => JSON.stringify([items]);
const file = (fields: Record<string, unknown> = {}) => ({
  filename: 'ink/src/cli.tsx',
  status: 'modified',
  additions: 3,
  deletions: 1,
  patch: '@@ -1 +1 @@\n-old\n+new',
  ...fields,
});

describe('G01 live GitHub read-only adapter', () => {
  it('rejects unapproved repositories before invoking the command runner', async () => {
    const runner = vi.fn<CommandRunner>();
    const result = await readGitHubPullRequestSnapshot('https://github.com/other/repo/pull/11', { runner });
    expect(result).toMatchObject({ ok: false, kind: 'repository_not_allowed' });
    expect(runner).not.toHaveBeenCalled();
  });

  it('rejects malformed URLs before invoking gh', async () => {
    const runner = vi.fn<CommandRunner>();
    const result = await readGitHubPullRequestSnapshot('https://github.com/PixelsWorker/CodeGuardian/issues/11', { runner });
    expect(result).toMatchObject({ ok: false, kind: 'invalid_url' });
    expect(runner).not.toHaveBeenCalled();
  });

  it('uses only fixed GET API calls and returns a pinned complete snapshot', async () => {
    const outputs = ['authenticated; token output is not displayed', metadata(), filePage([file()]), metadata()];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner, now: () => new Date('2026-10-28T08:00:00.000Z') });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.status).toBe('complete');
    expect(result.snapshot.source_mode).toBe('live');
    expect(result.snapshot.warnings.join(' ')).not.toContain('token output');
    expect(result.snapshot.identity.head_sha).toBe(sha2);
    expect(result.snapshot.files[0]).toMatchObject({ path: 'ink/src/cli.tsx', status: 'modified', patch_available: true });
    expect(result.snapshot.files[0].patch).toContain('\n-old\n+new');
    expect(result.snapshot.retrieved_at).toBe('2026-10-28T08:00:00.000Z');
    expect(runner.mock.calls.map(([args]) => args)).toEqual([
      ['auth', 'status', '--hostname', 'github.com'],
      ['api', '--hostname', 'github.com', '--method', 'GET', 'repos/PixelsWorker/CodeGuardian/pulls/11'],
      ['api', '--hostname', 'github.com', '--method', 'GET', '--paginate', '--slurp', 'repos/PixelsWorker/CodeGuardian/pulls/11/files?per_page=100'],
      ['api', '--hostname', 'github.com', '--method', 'GET', 'repos/PixelsWorker/CodeGuardian/pulls/11'],
    ]);
    expect(runner.mock.calls.flatMap(([args]) => args).some(arg => /POST|PATCH|PUT|DELETE/.test(arg))).toBe(false);
  });

  it('returns a retryable failure when the PR SHA changes during retrieval', async () => {
    const outputs = ['authenticated', metadata(), filePage([file()]), metadata('c'.repeat(40))];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result).toMatchObject({ ok: false, kind: 'snapshot_changed' });
    if (!result.ok) expect(result.message).toContain('Retry to obtain a consistent snapshot.');
  });

  it('returns a retryable failure when changed-file counts or relevant metadata change during retrieval', async () => {
    const changedCountOutputs = ['authenticated', metadata(), filePage([file()]), metadata(sha2, { changed_files: 2 })];
    const changedCountRunner = vi.fn<CommandRunner>().mockImplementation(async () => changedCountOutputs.shift()!);
    const changedCountResult = await readGitHubPullRequestSnapshot(url, { runner: changedCountRunner });
    expect(changedCountResult).toMatchObject({ ok: false, kind: 'snapshot_changed' });

    const changedTitleOutputs = ['authenticated', metadata(), filePage([file()]), metadata(sha2, { title: 'Updated during read' })];
    const changedTitleRunner = vi.fn<CommandRunner>().mockImplementation(async () => changedTitleOutputs.shift()!);
    const changedTitleResult = await readGitHubPullRequestSnapshot(url, { runner: changedTitleRunner });
    expect(changedTitleResult).toMatchObject({ ok: false, kind: 'snapshot_changed' });
  });

  it('marks closed draft pull requests and missing patches without inventing diff data', async () => {
    const outputs = [
      'authenticated',
      metadata(sha2, { state: 'closed', draft: true, changed_files: 2 }),
      filePage([
        file({ patch: undefined, status: 'renamed', previous_filename: 'old/path.ts' }),
        file({ filename: 'removed/path.ts', patch: undefined, status: 'removed' }),
      ]),
      metadata(sha2, { state: 'closed', draft: true, changed_files: 2 }),
    ];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.state).toBe('closed');
      expect(result.snapshot.is_draft).toBe(true);
      expect(result.snapshot.status).toBe('partial');
      expect(result.snapshot.files[0]).toMatchObject({ status: 'renamed', previous_path: 'old/path.ts', patch: null, patch_available: false });
      expect(result.snapshot.files[1]).toMatchObject({ path: 'removed/path.ts', status: 'removed' });
      expect(result.snapshot.warnings.join(' ')).toContain('closed');
      expect(result.snapshot.warnings.join(' ')).toContain('draft');
    }
  });

  it('handles authentication, access ambiguity, hidden 404s, rate limits and timeouts with safe messages', async () => {
    const cases = [
      ['unauthenticated', 'not authenticated'],
      ['forbidden_or_not_found', 'Private repository permissions may also be reported as not found'],
      ['not_found', 'GitHub hid the private resource'],
      ['rate_limited', 'rate limit'],
      ['timeout', 'timed out'],
    ] as const;
    for (const [kind, expected] of cases) {
      const runner: CommandRunner = async () => { throw new ReaderFailure(kind, 'internal fake error'); };
      const result = await readGitHubPullRequestSnapshot(url, { runner });
      expect(result).toMatchObject({ ok: false, kind });
      if (!result.ok) {
        expect(result.message.toLowerCase()).toContain(expected.toLowerCase());
        expect(result.message).not.toContain('internal fake error');
      }
    }
  });

  it('classifies GitHub CLI failures without retaining raw stderr for the UI', () => {
    expect(classifyGhFailureText('HTTP 401: Bad credentials')).toBe('unauthenticated');
    expect(classifyGhFailureText('HTTP 403: Resource not accessible')).toBe('forbidden_or_not_found');
    expect(classifyGhFailureText('HTTP 404: Not Found')).toBe('not_found');
    expect(classifyGhFailureText('HTTP 429: secondary rate limit')).toBe('rate_limited');
  });

  it('aggregates paginated file results and marks oversized patches as truncated', async () => {
    const outputs = ['authenticated', metadata(sha2, { changed_files: 2 }),
      JSON.stringify([[file({ patch: 'x'.repeat(70_000) })], [file({ filename: 'ink/src/App.tsx' })]]),
      metadata(sha2, { changed_files: 2 })];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.pagination).toMatchObject({ complete: true, page_count: 2 });
      expect(result.snapshot.status).toBe('partial');
      expect(result.snapshot.files).toHaveLength(2);
      expect(result.snapshot.files[0].patch_truncated).toBe(true);
      expect(result.snapshot.files[0].patch).toHaveLength(65_536);
      expect(result.snapshot.warnings.join(' ')).toContain('capped');
    }
  });

  it('detects duplicate file identities across pages and never marks them complete', async () => {
    const outputs = [
      'authenticated',
      metadata(sha2, { changed_files: 2 }),
      JSON.stringify([[file()], [file({ patch: '@@ duplicate page @@' })]]),
      metadata(sha2, { changed_files: 2 }),
    ];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result).toMatchObject({ ok: true, snapshot: { status: 'partial', pagination: { complete: false }, files: [{ path: 'ink/src/cli.tsx' }] } });
    if (result.ok) expect(result.snapshot.warnings.join(' ')).toContain('duplicate changed-file identity');
  });

  it('truncates UTF-8 patches linearly at byte boundaries, including multi-patch responses', async () => {
    const exact = 'é'.repeat(32_768);
    const oversized = `${'🙂'.repeat(16_384)}x`;
    const workloads = Array.from({ length: 24 }, (_, index) => file({
      filename: `src/work-${index}.ts`,
      patch: `${'λ'.repeat(40_000)}-${index}`,
    }));
    const outputs = [
      'authenticated',
      metadata(sha2, { changed_files: 2 + workloads.length }),
      filePage([
        file({ filename: 'src/exact-limit.ts', patch: exact }),
        file({ filename: 'src/over-limit.ts', patch: oversized }),
        ...workloads,
      ]),
      metadata(sha2, { changed_files: 2 + workloads.length }),
    ];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.files).toHaveLength(26);
      expect(result.snapshot.files[0]).toMatchObject({ patch_truncated: false, patch_available: true });
      expect(Buffer.byteLength(result.snapshot.files[0].patch ?? '', 'utf8')).toBe(65_536);
      expect(result.snapshot.files[1]).toMatchObject({ patch_truncated: true, patch_available: true });
      expect(Buffer.byteLength(result.snapshot.files[1].patch ?? '', 'utf8')).toBe(65_536);
      expect(result.snapshot.files[1].patch).not.toContain('\uFFFD');
      expect(result.snapshot.files.slice(2).every(item => item.patch_truncated && Buffer.byteLength(item.patch ?? '', 'utf8') <= 65_536)).toBe(true);
      expect(result.snapshot.status).toBe('partial');
    }
  });

  it('marks the 3000-file ceiling and does not claim complete pagination', async () => {
    const manyFiles = Array.from({ length: 3000 }, (_, index) => file({ filename: `src/file-${index}.ts`, patch: undefined }));
    const outputs = ['authenticated', metadata(sha2, { changed_files: 3001 }), filePage(manyFiles), metadata(sha2, { changed_files: 3001 })];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.files).toHaveLength(3000);
      expect(result.snapshot.status).toBe('partial');
      expect(result.snapshot.pagination.file_limit_hit).toBe(true);
      expect(result.snapshot.pagination.complete).toBe(false);
    }
  });

  it('rejects unsafe file paths and malformed response shapes', async () => {
    const outputs = ['authenticated', metadata(), filePage([file({ filename: '../secret.txt' })]), metadata()];
    const runner = vi.fn<CommandRunner>().mockImplementation(async () => outputs.shift()!);
    const result = await readGitHubPullRequestSnapshot(url, { runner });
    expect(result).toMatchObject({ ok: false, kind: 'malformed_response' });
  });

  it('sanitizes terminal control sequences, C0 controls and bidi overrides', () => {
    expect(sanitizeRemoteText('\u001b[31mred\u001b[0m\u202Ename\u0007')).toBe('redname');
  });

  it('bounds sanitation of repeated unterminated OSC prefixes', () => {
    const hostileText = '\u001b]'.repeat(500_000);
    const startedAt = performance.now();
    expect(sanitizeRemoteText(hostileText, 1_000_000)).toBe('');
    expect(performance.now() - startedAt).toBeLessThan(2_000);
  });

  it('turns cancellation into a non-success result', async () => {
    const controller = new AbortController();
    const runner: CommandRunner = async (_args, signal) => {
      await new Promise<void>(resolve => signal?.addEventListener('abort', () => resolve(), { once: true }));
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    };
    const resultPromise = readGitHubPullRequestSnapshot(url, { runner, signal: controller.signal });
    controller.abort();
    expect(await resultPromise).toMatchObject({ ok: false, kind: 'cancelled' });
  });
});
