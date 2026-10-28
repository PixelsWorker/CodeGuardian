import { spawn } from 'node:child_process';
import { PullRequestSnapshotFileSchema, PullRequestSnapshotSchema, type PullRequestIdentity, type PullRequestSnapshot, type PullRequestSnapshotFile, type SnapshotFileStatus } from '../types/contracts.js';
import { parseGitHubPrUrl } from './github-url.js';

export const G01_ALLOWED_OWNER = 'PixelsWorker';
export const G01_ALLOWED_REPO = 'CodeGuardian';
const MAX_COMMAND_OUTPUT_BYTES = 12 * 1024 * 1024;
const MAX_PATCH_BYTES = 65_536;
const MAX_FILES = 3000;
const COMMAND_TIMEOUT_MS = 30_000;

export type GitHubReadErrorKind =
  | 'invalid_url' | 'repository_not_allowed' | 'unauthenticated' | 'forbidden_or_not_found'
  | 'not_found' | 'rate_limited' | 'timeout' | 'output_limit' | 'command_missing'
  | 'cancelled' | 'malformed_response' | 'command_failed' | 'snapshot_changed' | 'unsupported_flag';

export type GitHubReadResult =
  | { ok: true; snapshot: PullRequestSnapshot }
  | { ok: false; kind: GitHubReadErrorKind; message: string };

export type CommandRunner = (args: string[], signal?: AbortSignal) => Promise<string>;

export class ReaderFailure extends Error {
  constructor(readonly kind: GitHubReadErrorKind, message: string) {
    super(message);
  }
}

function readErrorMessage(kind: GitHubReadErrorKind): string {
  const messages: Record<GitHubReadErrorKind, string> = {
    invalid_url: 'Enter a valid GitHub pull request URL.',
    repository_not_allowed: `Live inspection is limited to ${G01_ALLOWED_OWNER}/${G01_ALLOWED_REPO}.`,
    unauthenticated: 'GitHub CLI is not authenticated for github.com. Run gh auth login, then retry.',
    forbidden_or_not_found: 'GitHub denied access. Private repository permissions may also be reported as not found.',
    not_found: 'The pull request was not found, or GitHub hid the private resource because this account lacks access.',
    rate_limited: 'GitHub rate limit reached. Wait until the reset time and retry.',
    timeout: 'GitHub inspection timed out. No complete snapshot was produced.',
    output_limit: 'GitHub response exceeded the configured size limit. No complete snapshot was produced.',
    command_missing: 'GitHub CLI (gh) is not installed or is not available on PATH.',
    cancelled: 'Inspection was cancelled.',
    malformed_response: 'GitHub returned a response that CodeGuardian could not validate.',
    command_failed: 'GitHub CLI request failed. Check authentication, network access and repository permissions.',
    snapshot_changed: 'The pull request changed while it was being read. Retry to obtain a consistent snapshot.',
    unsupported_flag: 'The installed GitHub CLI does not support a required option. Upgrade GitHub CLI to 2.48.0 or newer and retry.',
  };
  return messages[kind];
}

export function classifyGhFailureText(stderr: string): GitHubReadErrorKind {
  const detail = stderr.toLowerCase();
  if (/unknown flag|unknown shorthand flag|flag provided but not defined/.test(detail)) return 'unsupported_flag';
  if (/not logged in|authentication required|please run: gh auth login|http 401|status 401/.test(detail)) return 'unauthenticated';
  if (/rate limit|secondary rate|http 429|status 429/.test(detail)) return 'rate_limited';
  if (/http 403|status 403/.test(detail)) return 'forbidden_or_not_found';
  if (/http 404|status 404|not found/.test(detail)) return 'not_found';
  return 'command_failed';
}

function runGh(args: string[], signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new ReaderFailure('cancelled', 'Inspection was cancelled.'));

    const child = spawn('gh', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env, GH_HOST: 'github.com', GH_PROMPT_DISABLED: '1' },
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let byteCount = 0;
    let settled = false;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    let failureKind: GitHubReadErrorKind | undefined;

    const finish = (error?: Error, output?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (killTimer) clearTimeout(killTimer);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error);
      else resolve(output ?? '');
    };
    const terminate = (kind: GitHubReadErrorKind) => {
      if (failureKind) return;
      failureKind = kind;
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 1000);
    };
    const abort = () => terminate('cancelled');
    const timeout = setTimeout(() => terminate('timeout'), COMMAND_TIMEOUT_MS);
    signal?.addEventListener('abort', abort, { once: true });

    const collect = (chunk: Buffer, target: Buffer[]) => {
      byteCount += chunk.length;
      if (byteCount > MAX_COMMAND_OUTPUT_BYTES) {
        terminate('output_limit');
        return;
      }
      target.push(chunk);
    };
    child.stdout.on('data', chunk => collect(Buffer.from(chunk), stdout));
    child.stderr.on('data', chunk => collect(Buffer.from(chunk), stderr));
    child.on('error', error => {
      finish(new ReaderFailure(error.message.includes('ENOENT') ? 'command_missing' : 'command_failed',
        error.message.includes('ENOENT') ? 'GitHub CLI (gh) is not installed or is not available on PATH.' : 'GitHub CLI could not be started.'));
    });
    child.on('close', code => {
      if (failureKind) {
        finish(new ReaderFailure(failureKind, readErrorMessage(failureKind)));
        return;
      }
      if (code !== 0) {
        const detail = Buffer.concat(stderr).toString('utf8').toLowerCase();
        const kind = classifyGhFailureText(detail);
        finish(new ReaderFailure(kind, readErrorMessage(kind)));
        return;
      }
      finish(undefined, Buffer.concat(stdout).toString('utf8'));
    });
  });
}

/** Remove terminal control sequences and bidi overrides before remote text reaches Ink. */
export function sanitizeRemoteText(value: string, maxLength = 16_384): string {
  const outputLimit = Math.max(0, maxLength);
  return value
    .slice(0, outputLimit * 4)
    .replace(/\x1B(?:\[[0-?]*[ -/]*[@-~]|\][^\x07\x1B]*(?:\x07|\x1B\\)|[@-Z\\-_])/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, '')
    .slice(0, outputLimit);
}

function safePath(value: unknown): string {
  if (typeof value !== 'string') throw new ReaderFailure('malformed_response', 'GitHub returned an invalid file path.');
  const path = sanitizeRemoteText(value, 1025);
  if (value.length > 1024 || path !== value || /[\u0000-\u001f\u007f]/.test(value)) throw new ReaderFailure('malformed_response', 'GitHub returned an unsafe file path.');
  if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new ReaderFailure('malformed_response', 'GitHub returned an unsafe file path.');
  }
  return path;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ReaderFailure('malformed_response', 'GitHub returned malformed JSON.');
  return value as Record<string, unknown>;
}

function requiredString(obj: Record<string, unknown>, key: string, limit = 4096): string {
  const value = obj[key];
  if (typeof value !== 'string' || !value) throw new ReaderFailure('malformed_response', `GitHub response is missing ${key}.`);
  const safe = sanitizeRemoteText(value, limit).replace(/[\r\n\t]+/g, ' ').trim();
  if (!safe) throw new ReaderFailure('malformed_response', `GitHub response contains an invalid ${key}.`);
  return safe;
}

function requiredCount(obj: Record<string, unknown>, key: string): number {
  const value = obj[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new ReaderFailure('malformed_response', `GitHub returned an invalid ${key}.`);
  }
  return value;
}

function requiredSha(obj: Record<string, unknown>, key: string): string {
  const sha = requiredString(obj, key, 64).toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new ReaderFailure('malformed_response', `GitHub returned an invalid ${key}.`);
  return sha;
}

function parseMetadata(raw: string, number: number): { identity: PullRequestIdentity; state: 'open' | 'closed'; isDraft: boolean; changedFiles: number } {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new ReaderFailure('malformed_response', 'GitHub returned malformed pull request JSON.'); }
  const data = record(parsed);
  const base = record(data.base);
  const head = record(data.head);
  const user = record(data.user);
  const repository = record(base.repo);
  const ownerData = record(repository.owner);
  const owner = requiredString(ownerData, 'login', 100);
  const repo = requiredString(repository, 'name', 100);
  if (owner.toLowerCase() !== G01_ALLOWED_OWNER.toLowerCase() || repo.toLowerCase() !== G01_ALLOWED_REPO.toLowerCase()) {
    throw new ReaderFailure('repository_not_allowed', `Live inspection is limited to ${G01_ALLOWED_OWNER}/${G01_ALLOWED_REPO}.`);
  }
  if (data.number !== number || !['open', 'closed'].includes(String(data.state)) || typeof data.draft !== 'boolean') {
    throw new ReaderFailure('malformed_response', 'GitHub returned inconsistent pull request identity or state.');
  }
  if (typeof data.changed_files !== 'number' || !Number.isSafeInteger(data.changed_files) || data.changed_files < 0) {
    throw new ReaderFailure('malformed_response', 'GitHub returned an invalid changed-file count.');
  }
  const baseSha = requiredSha(base, 'sha');
  const headSha = requiredSha(head, 'sha');
  const title = requiredString(data, 'title', 1000);
  const author = requiredString(user, 'login', 200);
  const baseBranch = requiredString(base, 'ref', 255);
  const headBranch = requiredString(head, 'ref', 255);
  const additions = requiredCount(data, 'additions');
  const deletions = requiredCount(data, 'deletions');
  const identity: PullRequestIdentity = {
    provider: 'github', owner: G01_ALLOWED_OWNER, repo: G01_ALLOWED_REPO, number,
    url: `https://github.com/${G01_ALLOWED_OWNER}/${G01_ALLOWED_REPO}/pull/${number}`,
    base_sha: baseSha, head_sha: headSha, title, author,
    base_branch: baseBranch, head_branch: headBranch,
    changed_files_count: data.changed_files, additions, deletions, is_draft: data.draft,
  };
  return { identity, state: data.state as 'open' | 'closed', isDraft: data.draft, changedFiles: data.changed_files };
}

function truncateUtf8(value: string, maxBytes: number): { text: string; truncated: boolean } {
  const bytes = Buffer.from(value, 'utf8');
  if (bytes.byteLength <= maxBytes) return { text: value, truncated: false };

  // Move the byte boundary back over any continuation bytes so decoding never
  // introduces U+FFFD. At most three bytes are skipped for valid UTF-8.
  let end = maxBytes;
  while (end > 0 && end < bytes.byteLength && (bytes[end] & 0xc0) === 0x80) end -= 1;
  return { text: bytes.subarray(0, end).toString('utf8'), truncated: true };
}

function parseFiles(raw: string): { files: PullRequestSnapshotFile[]; pageCount: number; rawFileCount: number; duplicateFileCount: number } {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new ReaderFailure('malformed_response', 'GitHub returned malformed changed-file JSON.'); }
  if (!Array.isArray(parsed)) throw new ReaderFailure('malformed_response', 'GitHub returned an invalid paginated file response.');
  const pages: unknown[][] = parsed.length > 0 && Array.isArray(parsed[0]) ? parsed as unknown[][] : [parsed];
  const rawFiles = pages.flat();
  const seenPaths = new Set<string>();
  let duplicateFileCount = 0;
  const files = rawFiles.slice(0, MAX_FILES).flatMap(item => {
    const data = record(item);
    const path = safePath(data.filename);
    if (seenPaths.has(path)) {
      duplicateFileCount += 1;
      return [];
    }
    seenPaths.add(path);
    const statusText = typeof data.status === 'string' ? data.status : 'unknown';
    const supported = ['added', 'removed', 'modified', 'renamed', 'copied', 'changed', 'unchanged'];
    const status = (supported.includes(statusText) ? statusText : 'unknown') as SnapshotFileStatus;
    const additions = requiredCount(data, 'additions');
    const deletions = requiredCount(data, 'deletions');
    let patch: string | null = null;
    let patchTruncated = false;
    if (typeof data.patch === 'string') {
      const safe = sanitizeRemoteText(data.patch, 1_000_000).replace(/\r\n?/g, '\n').replace(/\t/g, '  ');
      const limited = truncateUtf8(safe, MAX_PATCH_BYTES);
      patch = limited.text;
      patchTruncated = limited.truncated || safe.length >= 1_000_000;
    }
    const previous = data.previous_filename === undefined ? null : safePath(data.previous_filename);
    return [PullRequestSnapshotFileSchema.parse({
      path, previous_path: previous, status, additions, deletions, patch,
      patch_available: patch !== null, patch_truncated: patchTruncated,
    })];
  });
  return { files, pageCount: pages.length, rawFileCount: rawFiles.length, duplicateFileCount };
}

function sameSnapshot(left: ReturnType<typeof parseMetadata>, right: ReturnType<typeof parseMetadata>): boolean {
  return left.identity.base_sha === right.identity.base_sha
    && left.identity.head_sha === right.identity.head_sha
    && left.state === right.state
    && left.isDraft === right.isDraft
    && left.changedFiles === right.changedFiles
    && left.identity.title === right.identity.title
    && left.identity.author === right.identity.author
    && left.identity.base_branch === right.identity.base_branch
    && left.identity.head_branch === right.identity.head_branch
    && left.identity.additions === right.identity.additions
    && left.identity.deletions === right.identity.deletions;
}

/** Read one allowlisted PR using GET-only GitHub CLI requests and verify it stayed pinned. */
export async function readGitHubPullRequestSnapshot(
  url: string,
  options: { runner?: CommandRunner; signal?: AbortSignal; now?: () => Date } = {},
): Promise<GitHubReadResult> {
  const parsed = parseGitHubPrUrl(url);
  if (!parsed) return { ok: false, kind: 'invalid_url', message: 'Enter a valid GitHub pull request URL.' };
  if (parsed.owner.toLowerCase() !== G01_ALLOWED_OWNER.toLowerCase() || parsed.repo.toLowerCase() !== G01_ALLOWED_REPO.toLowerCase()) {
    return { ok: false, kind: 'repository_not_allowed', message: `Live inspection is limited to ${G01_ALLOWED_OWNER}/${G01_ALLOWED_REPO}.` };
  }

  const runner = options.runner ?? runGh;
  const endpoint = `repos/${G01_ALLOWED_OWNER}/${G01_ALLOWED_REPO}/pulls/${parsed.number}`;
  try {
    // gh auth status suppresses tokens by default; its output is deliberately discarded.
    // --slurp used below first appeared in gh 2.48.0. Older auth-status releases
    // may also lack --active, so retry only that unsupported-option failure.
    try {
      await runner(['auth', 'status', '--active', '--hostname', 'github.com'], options.signal);
    } catch (error) {
      const kind = error && typeof error === 'object' && 'kind' in error ? (error as { kind?: unknown }).kind : undefined;
      if (kind !== 'unsupported_flag') throw error;
      await runner(['auth', 'status', '--hostname', 'github.com'], options.signal);
    }
    const firstMetadata = parseMetadata(await runner(['api', '--hostname', 'github.com', '--method', 'GET', endpoint], options.signal), parsed.number);
    const fileResult = parseFiles(await runner(['api', '--hostname', 'github.com', '--method', 'GET', '--paginate', '--slurp', `${endpoint}/files?per_page=100`], options.signal));
    const lastMetadata = parseMetadata(await runner(['api', '--hostname', 'github.com', '--method', 'GET', endpoint], options.signal), parsed.number);
    const retrievedAt = (options.now?.() ?? new Date()).toISOString();

    if (!sameSnapshot(firstMetadata, lastMetadata)) {
      return { ok: false, kind: 'snapshot_changed', message: readErrorMessage('snapshot_changed') };
    }

    const warnings: string[] = [];
    // The API documents a 3,000-file response ceiling. Exactly 3,000 files are
    // complete when the pinned metadata also reports exactly 3,000; a larger
    // metadata count proves the response was capped.
    const fileLimitHit = fileResult.rawFileCount >= MAX_FILES && firstMetadata.changedFiles > MAX_FILES;
    let paginationComplete = true;
    let snapshotComplete = true;
    if (fileLimitHit) {
      warnings.push(`GitHub's ${MAX_FILES}-file response ceiling was reached; the snapshot is incomplete.`);
      paginationComplete = false;
      snapshotComplete = false;
    }
    if (fileResult.files.length !== firstMetadata.changedFiles) {
      warnings.push(`GitHub reported ${firstMetadata.changedFiles} changed files but returned ${fileResult.files.length}; pagination or response content is inconsistent.`);
      paginationComplete = false;
      snapshotComplete = false;
    }
    if (fileResult.duplicateFileCount) {
      warnings.push(`${fileResult.duplicateFileCount} duplicate changed-file identity(ies) appeared across the paginated response; duplicate entries were omitted.`);
      paginationComplete = false;
      snapshotComplete = false;
    }
    const missingPatches = fileResult.files.filter(file => !file.patch_available).length;
    if (missingPatches) {
      warnings.push(`${missingPatches} changed file(s) have no patch in GitHub's response (for example binary or oversized files).`);
      snapshotComplete = false;
    }
    const truncatedPatches = fileResult.files.filter(file => file.patch_truncated).length;
    if (truncatedPatches) {
      warnings.push(`${truncatedPatches} patch(es) were capped at ${MAX_PATCH_BYTES} UTF-8 bytes for safe display.`);
      snapshotComplete = false;
    }
    if (fileResult.files.some(file => file.status === 'unknown')) {
      warnings.push('GitHub returned an unrecognized file status; it is displayed as unknown.');
      snapshotComplete = false;
    }
    if (firstMetadata.state === 'closed') warnings.push('This pull request is closed. Inspection is read-only; no review action is available.');
    if (firstMetadata.isDraft) warnings.push('This pull request is a draft. Inspection is read-only; no review action is available.');

    const snapshot: PullRequestSnapshot = {
      source_mode: 'live', retrieved_at: retrievedAt, identity: firstMetadata.identity,
      state: firstMetadata.state, is_draft: firstMetadata.isDraft, files: fileResult.files,
      pagination: { complete: paginationComplete, page_count: fileResult.pageCount, file_limit_hit: fileLimitHit },
      status: snapshotComplete ? 'complete' : 'partial', warnings,
    };
    return { ok: true, snapshot: PullRequestSnapshotSchema.parse(snapshot) };
  } catch (error) {
    // Vitest and other command-runner boundaries can wrap class identities; use
    // the closed error-kind set and a fixed user-facing message, never runner text.
    if (error instanceof ReaderFailure || (error && typeof error === 'object' && 'kind' in error)) {
      const kind = (error as { kind?: unknown }).kind;
      if (typeof kind === 'string' && Object.hasOwn({
        invalid_url: 1, repository_not_allowed: 1, unauthenticated: 1, forbidden_or_not_found: 1,
        not_found: 1, rate_limited: 1, timeout: 1, output_limit: 1, command_missing: 1,
        cancelled: 1, malformed_response: 1, command_failed: 1, snapshot_changed: 1, unsupported_flag: 1,
      }, kind)) {
        return { ok: false, kind: kind as GitHubReadErrorKind, message: readErrorMessage(kind as GitHubReadErrorKind) };
      }
    }
    if (error instanceof Error && error.name === 'AbortError') return { ok: false, kind: 'cancelled', message: 'Inspection was cancelled.' };
    return { ok: false, kind: 'malformed_response', message: 'GitHub returned a response that CodeGuardian could not validate.' };
  }
}
