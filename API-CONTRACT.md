# CodeGuardian - Canonical Internal Contract (Proposed)

**Status:** DRAFT v1; acceptance required before G01/G02  
**Transport:** Internal TypeScript interfaces and serialized JSON reports, NOT an implemented HTTP API.  
**Ownership:** CodeGuardian Manager is authoritative for trusted context; worker output never changes permissions.

## 1. Contract rules

- Keys use `snake_case` for serialized JSON. TypeScript adapters may map to camelCase internally, but storage/CLI interchange is JSON v1 as below.
- All inbound model and PR-Agent output is untrusted. Validate at runtime against the accepted schema, not only a prompt response format.
- Preserve original `head_sha` and `base_sha`; re-fetch both identities before publication.
- Do not accept authority-bearing fields (review approval, GitHub tokens, write permissions) from workers.
- `schema_version` is required for stored artifacts; incompatible major versions must fail explicitly.
- `path` must reference an inspected file in the allowed PR diff; `line`/`side` must validate against a changed hunk before an inline comment is attempted.

## 2. Proposed serialized types

```ts
type Severity = "P0" | "P1" | "P2" | "P3";
type Category = "security" | "correctness" | "architecture" |
  "testing" | "performance" | "reliability" | "compatibility";
type RunStatus = "queued" | "inspecting" | "running" |
  "validating" | "ready" | "partial" | "blocked" |
  "failed" | "cancelled" | "awaiting_approval" |
  "publishing" | "published";

type PullRequestIdentity = {
  provider: "github";
  owner: string;
  repo: string;
  number: number;
  url: string;
  base_sha: string; // full commit SHA
  head_sha: string; // full commit SHA
};

type ReviewRequest = {
  schema_version: "1.0.0";
  run_id: string; // UUID, manager generated
  pr: PullRequestIdentity;
  trigger: "manual" | "webhook"; // webhook is later scope
  policy_revision: string;
  workers: Array<"security" | "logic" | "architecture" | "quality">;
  requested_at: string; // ISO 8601 UTC
};

type ReviewFinding = {
  id: string;               // generated/validated by manager
  source_workers: string[]; // informational only
  severity: Severity;
  category: Category;
  title: string;
  path: string;             // repo-relative, normalized, validated
  line: number | null;      // new/right side line, or left for deletion
  side: "RIGHT" | "LEFT" | null;
  evidence: string;        // exact changed behavior or bounded quote
  impact: string;
  recommendation: string;
  confidence: "high" | "medium" | "low";
  verification: "verified_diff" | "needs_context" | "rejected";
  fingerprint: string;     // manager-generated stable dedupe key
};

type WorkerResult = {
  schema_version: "1.0.0";
  run_id: string;
  worker_id: string;
  role: "security" | "logic" | "architecture" | "quality" | "pr_agent";
  state: "complete" | "partial" | "failed" | "skipped";
  findings: ReviewFinding[];
  warnings: string[];
  duration_ms: number | null;
};

type ReviewReport = {
  schema_version: "1.0.0";
  run_id: string;
  pr: PullRequestIdentity;
  status: "ready" | "partial" | "blocked" | "failed";
  findings: ReviewFinding[];
  summary: string;
  tests: { executed: boolean; details: string[] };
  worker_states: Array<{ worker_id: string; state: WorkerResult["state"] }>;
  warnings: string[];
  generated_at: string;
  policy_revision: string;
  report_digest: string;  // cryptographic digest over canonical final report
};

type PublicationApproval = {
  pr_url: string;
  head_sha: string;
  report_digest: string;
  action: "COMMENT";
  approved_by: string;
  approved_at: string;
  expires_at: string;
  one_time_nonce: string;
};
```

**Note:** These are draft interfaces, not repository source code. No package, SDK, database, or API has been installed or implemented.

## 3. Example report (simulated fixture, not a real review)

```json
{
  "schema_version": "1.0.0",
  "run_id": "11111111-1111-4111-8111-111111111111",
  "pr": {
    "provider": "github",
    "owner": "example",
    "repo": "demo",
    "number": 42,
    "url": "https://github.com/example/demo/pull/42",
    "base_sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "head_sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  },
  "status": "ready",
  "findings": [
    {
      "id": "f-001",
      "source_workers": ["logic"],
      "severity": "P1",
      "category": "correctness",
      "title": "Null input is dereferenced",
      "path": "src/demo.ts",
      "line": 17,
      "side": "RIGHT",
      "evidence": "A changed line assumes an optional input is present.",
      "impact": "Requests with missing input can crash.",
      "recommendation": "Validate input before dereferencing.",
      "confidence": "high",
      "verification": "verified_diff",
      "fingerprint": "sample-fixture-only"
    }
  ],
  "summary": "DEMO ONLY: one hypothetical correctness finding.",
  "tests": { "executed": false, "details": ["Mock CLI demonstration; no application tests run."] },
  "worker_states": [{ "worker_id": "logic-1", "state": "complete" }],
  "warnings": ["SIMULATED FIXTURE - NOT A REAL CODE REVIEW"],
  "generated_at": "2026-10-14T00:00:00Z",
  "policy_revision": "demo-v1",
  "report_digest": "sample-not-a-real-digest"
}
```

## 4. Worker interface contract

Input to a worker is an explicitly scoped package: requested role, sanitized PR metadata, approved file tree and diff/context, bounded instructions and an output schema. It must not include GitHub tokens, publishing tools, Docker socket, or manager credentials. Model output is validated and normalized into `WorkerResult`. Rejected findings are retained in diagnostics, never published.

## 5. Validation requirements

1. Validate repository/PR identity using the trusted GitHub reader; allowlist owner/repo.
2. Bound report size, number of findings, strings, and file paths; reject absolute paths, path traversal, and unsafe control sequences.
3. Validate `line` with a current diff hunk. Prefer summary text when inline line anchoring cannot be verified.
4. Require evidence plus impact and a specific fix recommendation; flag speculation as low confidence or reject.
5. Deduplicate by normalized defect and location, preserve originating workers for debugging.
6. Reject incompatible `schema_version` or missing required fields. No lenient coercion of permission or SHA fields.
7. Treat worker warnings/partial results as report limitations.

## 6. Publication contract (G03, NOT implemented)

The publisher is the only permitted GitHub write client. The CLI shows PR URL, head SHA, count/severity of findings, intended review body, and proposed inline locations. On explicit approval, the publisher verifies:

- The human-approved `(repo, PR, head SHA, report digest, action=COMMENT)` tuple matches the final report.
- The approval is recent, one-time, and not already consumed.
- The repository remains authorized and PR is still open with the same head SHA.
- Every inline comment has a valid diff line/side; invalid ones are moved to summary or rejected.
- No duplicate CodeGuardian comment already exists for the same report identity.

If any verification fails, do not publish; ask for a fresh review/approval. A `COMMENT` submission is not a Git commit and must never be misrepresented as code modification.

## 7. Tests for contract acceptance

- Correct and incorrect version/shape/field-type fixtures.
- Absolute path, traversal, cross-repo, invalid SHA, and overlong input rejection.
- Changed-side/renamed/deletion-only/invalid diff locations.
- Exact duplicate, overlapping, conflicting severity, and uncertain findings.
- Partial worker failure, cancellation, timeouts, and report digest mismatch.
- Approval replay, stale PR head SHA, unauthorized repo, and duplicate publication blocked.

A future HTTP API may adapt these internal structures after an explicit G05 design decision; do not invent routes during G00-G03.
