import { finalizeReport } from '../core/report-digest.js';
import { parseGitHubPrUrl } from '../core/github-url.js';
import type { PullRequestIdentity, ReviewFinding, ReviewReport, WorkerInfo } from '../types/contracts.js';

export const SYNTHETIC_PR_IDENTITY: PullRequestIdentity = {
  provider: "github",
  owner: "example",
  repo: "demo",
  number: 42,
  url: "https://github.com/example/demo/pull/42",
  title: "feat(auth): token rotation & permission cache refresh",
  author: "developer-alex",
  base_branch: "main",
  head_branch: "feat/token-rotation",
  base_sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  head_sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  changed_files_count: 5,
  additions: 115,
  deletions: 27,
  is_draft: false,
};

export const MOCK_DIFF_FILES = [
  {
    path: "src/demo.ts",
    status: "modified",
    additions: 12,
    deletions: 4,
    hunk: `@@ -14,6 +14,14 @@ export function resolveUserPermissions(header?: string) {\n-  const token = parseToken(header);\n-  return lookupPermissions(token.sub);\n+  const token = parseToken(header);\n+  // BUG: token may be null if header is malformed!\n+  const permissions = lookupPermissions(token.sub);\n+  if (!permissions) {\n+    return [];\n+  }\n+  return permissions;\n }`,
  },
  {
    path: "src/auth/token.ts",
    status: "modified",
    additions: 48,
    deletions: 12,
    hunk: `@@ -42,6 +42,12 @@ export function generateSessionKey(tenantId: string): string {\n+  if (!process.env.AUTH_SECRET) {\n+    // DANGER: Fallback to static weak key in non-prod\n+    return "insecure-dev-fallback-key-" + tenantId;\n+  }\n+  return crypto.createHmac("sha256", process.env.AUTH_SECRET).digest("hex");\n }`,
  },
  {
    path: "src/auth/session.ts",
    status: "modified",
    additions: 34,
    deletions: 8,
    hunk: `@@ -85,6 +85,15 @@ const sessionStore = new Map<string, SessionData>();\n+export function storeSession(sessionId: string, data: SessionData) {\n+  // WARNING: unbounded cache, no TTL purge or max-size limit\n+  sessionStore.set(sessionId, data);\n+}`,
  },
  {
    path: "src/db/redis.ts",
    status: "modified",
    additions: 18,
    deletions: 2,
    hunk: `@@ -22,4 +22,10 @@ export function getRedisPool() {\n+  return new Redis({\n+    host: process.env.REDIS_HOST || "localhost",\n+    // Notice: connectTimeoutMs not specified\n+  });\n }`,
  },
  {
    path: "package.json",
    status: "modified",
    additions: 3,
    deletions: 1,
    hunk: `@@ -28,3 +28,4 @@\n+  "jsonwebtoken": "^9.0.2"`,
  },
];

export const SYNTHETIC_FINDINGS: ReviewFinding[] = [
  {
    id: "f-001",
    source_workers: ["logic"],
    severity: "P1",
    category: "correctness",
    title: "Null input is dereferenced in token resolver",
    path: "src/demo.ts",
    line: 17,
    side: "RIGHT",
    evidence: "parseToken(header) can return null when header is absent, but token.sub is dereferenced without guard.",
    impact: "Unauthenticated or malformed requests will trigger unhandled TypeError 500 crashes.",
    recommendation: "Add early null check: `if (!token) return [];` before accessing `token.sub`.",
    confidence: "high",
    verification: "verified_diff",
    fingerprint: "demo.ts:17:null_deref:logic",
  },
  {
    id: "f-002",
    source_workers: ["security"],
    severity: "P1",
    category: "security",
    title: "Insecure fallback key generated when AUTH_SECRET is omitted",
    path: "src/auth/token.ts",
    line: 45,
    side: "RIGHT",
    evidence: "Generates static predictable token 'insecure-dev-fallback-key-' when env var is undefined.",
    impact: "Attackers can forge arbitrary session credentials in environments with misconfigured secrets.",
    recommendation: "Throw fatal initialization error if AUTH_SECRET is missing rather than falling back to static string.",
    confidence: "high",
    verification: "verified_diff",
    fingerprint: "auth/token.ts:45:static_fallback:security",
  },
  {
    id: "f-003",
    source_workers: ["architecture", "quality"],
    severity: "P2",
    category: "reliability",
    title: "Unbounded in-memory Map leads to potential node memory leak",
    path: "src/auth/session.ts",
    line: 89,
    side: "RIGHT",
    evidence: "sessionStore is a global Map with no LRU eviction, size bounds, or TTL cleanup mechanism.",
    impact: "Server process will experience continuous heap expansion and crash via OOM under sustained traffic.",
    recommendation: "Implement an LRU cache with max capacity (e.g., lru-cache) or offload session storage to Redis with TTL.",
    confidence: "medium",
    verification: "verified_diff",
    fingerprint: "auth/session.ts:89:unbounded_map:arch",
  },
  {
    id: "f-004",
    source_workers: ["architecture"],
    severity: "P2",
    category: "performance",
    title: "Missing connection timeout on Redis client pool initialization",
    path: "src/db/redis.ts",
    line: 24,
    side: "RIGHT",
    evidence: "Redis client initialized without explicit connectTimeout or retryStrategy limits.",
    impact: "Worker threads may hang indefinitely during network partitions or cloud provider socket resets.",
    recommendation: "Configure connectTimeout: 3000ms and maxRetriesPerRequest: 3.",
    confidence: "medium",
    verification: "needs_context",
    fingerprint: "db/redis.ts:24:missing_timeout:arch",
  },
];

export const CANONICAL_SPECIALISTS: WorkerInfo[] = [
  {
    role: "security",
    displayName: "Security Specialist",
    description: "Detects credential leaks, injection risks, and auth flaws",
    state: "complete",
    progress: 100,
    elapsedMs: 2400,
    findingsCount: 1,
    currentActivity: "Analysis complete. 1 verified finding.",
    logs: [
      "[INFO] Inspecting diff hunks in src/auth/token.ts...",
      "[WARN] Potential hardcoded secret fallback detected at line 45",
      "[INFO] Verified AST syntax and security policy rules."
    ],
  },
  {
    role: "logic",
    displayName: "Logic & Correctness Specialist",
    description: "Analyzes boundary conditions, edge cases, and nullability",
    state: "complete",
    progress: 100,
    elapsedMs: 3100,
    findingsCount: 1,
    currentActivity: "Analysis complete. 1 verified finding.",
    logs: [
      "[INFO] Parsing modified functions in src/demo.ts...",
      "[WARN] Nullable dereference on token.sub without null guard",
      "[INFO] Traced caller call-stack."
    ],
  },
  {
    role: "architecture",
    displayName: "Architecture Specialist",
    description: "Monitors boundary violations, layer leaking, and patterns",
    state: "complete",
    progress: 100,
    elapsedMs: 2800,
    findingsCount: 2,
    currentActivity: "Analysis complete. 2 verified findings.",
    logs: [
      "[INFO] Scanning cross-module imports in src/auth/session.ts...",
      "[WARN] Module introduces unbounded in-memory state",
      "[WARN] Database connector missing connection timeout specification"
    ],
  },
  {
    role: "quality",
    displayName: "Quality, Testing & Performance Specialist",
    description: "Assesses test coverage, complexity, and algorithmic hotspots",
    state: "complete",
    progress: 100,
    elapsedMs: 3500,
    findingsCount: 1,
    currentActivity: "Analysis complete. 1 verified finding.",
    logs: [
      "[INFO] Evaluating test coverage for new auth routes...",
      "[WARN] Corroborating memory leak finding with Architecture lane",
      "[INFO] Benchmark simulation completed."
    ],
  },
];

export const SYNTHETIC_REPORT: ReviewReport = finalizeReport({
  schema_version: "1.0.0",
  run_id: "run-20261016-demo42",
  pr: SYNTHETIC_PR_IDENTITY,
  status: "ready",
  findings: SYNTHETIC_FINDINGS,
  summary: "Completed review of PR #42 across 4 canonical specialists. Found 2 P1 and 2 P2 issues. Automated publishing is gated on operator dry-run review.",
  tests: {
    executed: false,
    details: [
      "No actual unit tests executed by specialist lanes (static analysis mode)",
      "Findings verified against syntactic diff placement"
    ],
  },
  worker_states: [
    { worker_id: "worker-sec", state: "complete" },
    { worker_id: "worker-log", state: "complete" },
    { worker_id: "worker-arc", state: "complete" },
    { worker_id: "worker-qty", state: "complete" },
  ],
  warnings: [
    "Tests were not executed directly by specialist workers (tests.executed=false)",
    "Findings based on AST diff heuristic simulation [DEMO ONLY]"
  ],
  generated_at: "2026-10-16T11:25:00Z",
  policy_revision: "codeguardian-v1.0-strict",
  report_digest: "",
});

export function getReportForRunId(runId: string): ReviewReport | null {
  if (
    runId === SYNTHETIC_REPORT.run_id ||
    runId === "run-20261016-g00-demo" ||
    runId === "run-demo-42" ||
    runId === "demo" ||
    runId === "42"
  ) {
    return SYNTHETIC_REPORT;
  }
  if (
    runId === SYNTHETIC_PARTIAL_REPORT.run_id ||
    runId === "partial" ||
    runId === "run-partial"
  ) {
    return SYNTHETIC_PARTIAL_REPORT;
  }
  // '~' cannot occur in validated owner/repository segments. Four ordered
  // outcome codes preserve Security, Logic, Architecture and Quality independently.
  const match = runId.match(/^run-g00~([^~]+)~([^~]+)~([1-9][0-9]*)~([cftsp]{4})$/);
  if (!match) return null;
  const [, owner, repo, number, codes] = match;
  const parsed = parseGitHubPrUrl(`https://github.com/${owner}/${repo}/pull/${number}`);
  if (!parsed) return null;
  const canonical = owner === 'example' && repo === 'demo' && parsed.number === 42;
  const pr = canonical ? SYNTHETIC_PR_IDENTITY : {
    ...SYNTHETIC_PR_IDENTITY, ...parsed,
    title: `[DEMO] PR #${number}: ${owner}/${repo}`,
    author: `${owner}-contributor`, head_branch: `feature/pr-${number}`,
  };
  const workers = CANONICAL_SPECIALISTS.map((worker, i) => ({ ...worker, state: codeToState[codes[i]] }));
  const report = buildDemoReport(pr, workers);
  // Reject alternate encodings and legacy ambiguous owner-repo IDs.
  return report.run_id === runId ? report : null;
}

const stateToCode: Record<string, string> = { complete: 'c', failed: 'f', timed_out: 't', skipped: 's', partial: 'p' };
const codeToState: Record<string, WorkerInfo['state']> = { c: 'complete', f: 'failed', t: 'timed_out', s: 'skipped', p: 'partial' };
export const WORKER_IDS = ['worker-sec', 'worker-log', 'worker-arc', 'worker-qty'];

/** Deterministic offline demo recipes, not a store of arbitrary past sessions. */
export function buildDemoReport(pr: PullRequestIdentity, workers: WorkerInfo[], findings = SYNTHETIC_FINDINGS): ReviewReport {
  const ordered = CANONICAL_SPECIALISTS.map(lane => workers.find(w => w.role === lane.role)!);
  if (ordered.some(w => !w || !stateToCode[w.state])) throw new Error('Cannot finalize unfinished specialist results');
  const codes = ordered.map(w => stateToCode[w.state]).join('');
  const canonical = pr.owner === 'example' && pr.repo === 'demo' && pr.number === 42;
  const missing = ordered.filter(w => w.state !== 'complete');
  const run_id = canonical && codes === 'cccc' ? SYNTHETIC_REPORT.run_id
    : canonical && codes === 'cccf' ? 'run-20261016-g00-partial'
    : `run-g00~${pr.owner}~${pr.repo}~${pr.number}~${codes}`;
  const unavailableRoles = missing.filter(w => w.state !== 'partial').map(w => w.role);
  // A corroborating completed worker may still contribute a finding.
  const availableFindings = findings.filter(f => f.source_workers.some(role => !unavailableRoles.includes(role as WorkerInfo['role'])));
  const limitations = missing.map(w => `${w.displayName}: ${w.state}`);
  const summary = missing.length
    ? `PARTIAL REVIEW: Incomplete specialist coverage (${limitations.join('; ')}). Automated publishing gated on operator review.`
    : canonical ? SYNTHETIC_REPORT.summary : `Completed review of PR #${pr.number} (${pr.owner}/${pr.repo}) across 4 canonical specialists.`;
  return finalizeReport({
    ...SYNTHETIC_REPORT, run_id, pr, status: missing.length ? 'partial' : 'ready',
    findings: availableFindings, summary,
    worker_states: ordered.map((w, i) => ({ worker_id: WORKER_IDS[i], state: w.state === 'timed_out' ? 'failed' : w.state as 'complete' | 'failed' | 'skipped' | 'partial' })),
    warnings: [...SYNTHETIC_REPORT.warnings, ...limitations.map(w => `Incomplete worker coverage: ${w}`)],
  });
}

/** Restore final worker states on CLI publish/back navigation; timeouts remain
 * contract-compatible 'failed' worker results, with their cause in warnings. */
export function restoreSpecialists(report: ReviewReport): WorkerInfo[] {
  return CANONICAL_SPECIALISTS.map((worker, i) => {
    let state: WorkerInfo['state'] = report.worker_states.find(w => w.worker_id === WORKER_IDS[i])?.state ?? 'skipped';
    if (state === 'failed' && report.warnings.some(w => w.includes(worker.displayName) && w.includes('timed_out'))) state = 'timed_out';
    return { ...worker, state, currentActivity: `Loaded report: ${state}` };
  });
}

// Keep the historical partial alias consistent with the same recipe used by TUI runs.
export const SYNTHETIC_PARTIAL_REPORT = buildDemoReport(SYNTHETIC_PR_IDENTITY, CANONICAL_SPECIALISTS.map(w => ({ ...w, state: w.role === 'quality' ? 'failed' : 'complete' })));
