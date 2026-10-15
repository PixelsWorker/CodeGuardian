import { PullRequestIdentity, ReviewFinding, ReviewReport } from '../types/contract';

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
  changed_files_count: 7,
  additions: 142,
  deletions: 38,
  is_draft: false,
};

export const MOCK_DIFF_FILES = [
  {
    path: "src/demo.ts",
    status: "modified",
    additions: 12,
    deletions: 4,
    hunk: `@@ -14,6 +14,14 @@ export function resolveUserPermissions(header?: string) {
-  const token = parseToken(header);
-  return lookupPermissions(token.sub);
+  const token = parseToken(header);
+  // BUG: token may be null if header is malformed!
+  const permissions = lookupPermissions(token.sub);
+  if (!permissions) {
+    return [];
+  }
+  return permissions;
 }`,
  },
  {
    path: "src/auth/token.ts",
    status: "modified",
    additions: 48,
    deletions: 12,
    hunk: `@@ -42,6 +42,12 @@ export function generateSessionKey(tenantId: string): string {
+  if (!process.env.AUTH_SECRET) {
+    // DANGER: Fallback to static weak key in non-prod
+    return "insecure-dev-fallback-key-" + tenantId;
+  }
+  return crypto.createHmac("sha256", process.env.AUTH_SECRET).digest("hex");
 }`,
  },
  {
    path: "src/auth/session.ts",
    status: "modified",
    additions: 34,
    deletions: 8,
    hunk: `@@ -85,6 +85,15 @@ const sessionStore = new Map<string, SessionData>();
+export function storeSession(sessionId: string, data: SessionData) {
+  // WARNING: unbounded cache, no TTL purge or max-size limit
+  sessionStore.set(sessionId, data);
+}`,
  },
  {
    path: "src/db/redis.ts",
    status: "modified",
    additions: 18,
    deletions: 2,
    hunk: `@@ -22,4 +22,10 @@ export function getRedisPool() {
+  return new Redis({
+    host: process.env.REDIS_HOST || "localhost",
+    // Notice: connectTimeoutMs not specified
+  });
 }`,
  },
  {
    path: "package.json",
    status: "modified",
    additions: 3,
    deletions: 1,
    hunk: `@@ -28,3 +28,4 @@
+  "jsonwebtoken": "^9.0.2"`,
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
  {
    id: "f-rej-005",
    source_workers: ["security"],
    severity: "P3",
    category: "security",
    title: "Candidate rejected: Test fixture comment flagged as credential",
    path: "tests/auth.test.ts",
    line: 112,
    side: "RIGHT",
    evidence: "Worker flagged comment '// test secret: dummy123' as leaked secret.",
    impact: "None. Location is in mock test fixture and line was not altered in this PR hunk.",
    recommendation: "Rejected by Manager: file line not in PR diff hunk and represents dummy test fixture.",
    confidence: "low",
    verification: "rejected",
    fingerprint: "tests/auth.test.ts:112:false_positive:sec",
    rejection_reason: "Line outside PR diff scope; false positive on test dummy value.",
  },
  {
    id: "f-dup-006",
    source_workers: ["quality"],
    severity: "P2",
    category: "correctness",
    title: "Duplicate candidate: Unsafe token dereference",
    path: "src/demo.ts",
    line: 17,
    side: "RIGHT",
    evidence: "Quality worker proposed same null check as Logic specialist.",
    impact: "Redundant finding.",
    recommendation: "Merged into f-001 by Manager deduplication pipeline.",
    confidence: "high",
    verification: "rejected",
    fingerprint: "demo.ts:17:null_deref:logic",
    rejection_reason: "Deduplicated against f-001 (same normalized AST node and line).",
  },
];

export const SYNTHETIC_CANONICAL_REPORT: ReviewReport = {
  schema_version: "1.0.0",
  run_id: "demo-run-0042-7f9a-4e21",
  pr: SYNTHETIC_PR_IDENTITY,
  status: "ready",
  findings: SYNTHETIC_FINDINGS.filter(f => f.verification !== "rejected"),
  summary: "DEMO ONLY: Simulated review identified 2 P1 high-priority defects (null dereference, insecure secret fallback) and 2 P2 architectural risks (unbounded memory store, missing redis timeout). No real GitHub or AI calls were made.",
  tests: {
    executed: false,
    details: [
      "DEMO ONLY: Mock CLI demonstration.",
      "No actual application unit, integration, or lint tests were executed.",
      "Head commit bbbbbbbb was not pulled into a local runner."
    ],
  },
  worker_states: [
    { worker_id: "security-worker", state: "complete" },
    { worker_id: "logic-worker", state: "complete" },
    { worker_id: "architecture-worker", state: "complete" },
    { worker_id: "quality-worker", state: "complete" },
  ],
  warnings: [
    "SIMULATED FIXTURE — NOT A REAL CODE REVIEW",
    "G00 EXPLORATION ONLY — NO MODEL OR GITHUB APIS INVOKED",
    "DO NOT RELY ON FINDINGS FOR PRODUCTION CODE SECURITY"
  ],
  generated_at: "2026-10-14T23:25:00Z",
  policy_revision: "codeguardian-policy-v1.0.4-demo",
  report_digest: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
};

export const MOCK_MARKDOWN_REPORT = `<!-- CodeGuardian Simulated Review Report (DEMO ONLY) -->
## 🛡️ CodeGuardian Review — Pull Request #42

> **⚠️ DEMO RUN ONLY — SIMULATED FIXTURE**  
> **Target:** \`example/demo#42\`  
> **Head SHA:** \`bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\`  
> **Report ID:** \`demo-run-0042-7f9a-4e21\`  
> **Status:** \`READY\` (4 specialists completed, 0 errors)

---

### Executive Summary
Simulated review identified **2 P1 high-severity issues** and **2 P2 reliability/performance risks**. 2 additional worker candidates were filtered out (1 duplicate, 1 out-of-diff rejection).

| Severity | Count | Category breakdown |
| :--- | :--- | :--- |
| **P0 (Critical Blocker)** | **0** | — |
| **P1 (High Priority)** | **2** | 1 Correctness, 1 Security |
| **P2 (Medium Priority)** | **2** | 1 Reliability, 1 Performance |
| **P3 (Low / Informational)** | **0** | — |

---

### 🚨 Findings Detail

#### [P1] Null input is dereferenced in token resolver
- **Location:** \`src/demo.ts:17\` (RIGHT side hunk)
- **Specialist:** \`logic\`
- **Evidence:** \`parseToken(header)\` can return null when header is absent, but \`token.sub\` is accessed without guard.
- **Impact:** Unauthenticated requests will trigger unhandled TypeError 500 crashes.
- **Recommendation:** Add early null check: \`if (!token) return [];\` before accessing \`token.sub\`.

#### [P1] Insecure fallback key generated when AUTH_SECRET is omitted
- **Location:** \`src/auth/token.ts:45\` (RIGHT side hunk)
- **Specialist:** \`security\`
- **Evidence:** Generates predictable token \`insecure-dev-fallback-key-\` when env var is undefined.
- **Impact:** Potential credential spoofing in misconfigured deployment targets.
- **Recommendation:** Fail fast with thrown configuration error rather than fallback string.

#### [P2] Unbounded in-memory Map leads to potential node memory leak
- **Location:** \`src/auth/session.ts:89\` (RIGHT side hunk)
- **Specialist:** \`architecture\`, \`quality\`
- **Evidence:** Global Map used without TTL eviction or size bounds.
- **Impact:** Gradual memory leak under production volume.
- **Recommendation:** Migrate to Redis session store or use capped LRU cache.

#### [P2] Missing connection timeout on Redis client pool
- **Location:** \`src/db/redis.ts:24\` (RIGHT side hunk)
- **Specialist:** \`architecture\`
- **Evidence:** No explicit connectionTimeout specified.
- **Impact:** Potential socket hang during network partitioning.
- **Recommendation:** Specify \`connectTimeout: 3000ms\`.

---

### 📋 Diagnostics & Integrity
- **Test execution:** \`false\` (No tests run in mock demonstration)
- **Report Digest:** \`sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\`
- **Policy Revision:** \`codeguardian-policy-v1.0.4-demo\`
`;
