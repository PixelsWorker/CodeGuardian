// Canonical types matching API-CONTRACT.md v1 proposed internal schema

export type Severity = "P0" | "P1" | "P2" | "P3";

export type Category = 
  | "security" 
  | "correctness" 
  | "architecture" 
  | "testing" 
  | "performance" 
  | "reliability" 
  | "compatibility";

export type RunStatus = 
  | "queued" 
  | "inspecting" 
  | "running" 
  | "validating" 
  | "ready" 
  | "partial" 
  | "blocked" 
  | "failed" 
  | "cancelled" 
  | "awaiting_approval" 
  | "publishing" 
  | "published";

export interface PullRequestIdentity {
  provider: "github";
  owner: string;
  repo: string;
  number: number;
  url: string;
  base_sha: string; // full 40-character commit SHA
  head_sha: string; // full 40-character commit SHA
  title?: string;
  author?: string;
  base_branch?: string;
  head_branch?: string;
  changed_files_count?: number;
  additions?: number;
  deletions?: number;
  is_draft?: boolean;
}

export interface ReviewFinding {
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
  rejection_reason?: string;
}

export type WorkerRole = "security" | "logic" | "architecture" | "quality";
export type WorkerState = "queued" | "running" | "complete" | "partial" | "failed" | "skipped" | "timed_out" | "cancelled";

export interface WorkerInfo {
  role: WorkerRole;
  displayName: string;
  description: string;
  state: WorkerState;
  progress: number; // 0 to 100
  elapsedMs: number;
  findingsCount: number;
  currentActivity: string;
  logs: string[];
  failureReason?: string;
}

export interface WorkerResult {
  schema_version: "1.0.0";
  run_id: string;
  worker_id: string;
  role: WorkerRole | "pr_agent";
  state: "complete" | "partial" | "failed" | "skipped";
  findings: ReviewFinding[];
  warnings: string[];
  duration_ms: number | null;
}

export interface ReviewReport {
  schema_version: "1.0.0";
  run_id: string;
  pr: PullRequestIdentity;
  status: "ready" | "partial" | "blocked" | "failed";
  findings: ReviewFinding[];
  summary: string;
  tests: { 
    executed: boolean; 
    details: string[]; 
  };
  worker_states: Array<{ worker_id: string; state: WorkerState }>;
  warnings: string[];
  generated_at: string;
  policy_revision: string;
  report_digest: string; // cryptographic digest over canonical final report
}

export interface PublicationApproval {
  pr_url: string;
  head_sha: string;
  report_digest: string;
  action: "COMMENT";
  approved_by: string;
  approved_at: string;
  expires_at: string;
  one_time_nonce: string;
}

export type ActiveScreen = 
  | "welcome"       // Screen A
  | "auth"          // Screen B
  | "pr_input"      // Screen C
  | "inspection"    // Screen D
  | "multi_agent"   // Screen E
  | "validation"    // Screen F
  | "report"        // Screen G
  | "publish"       // Screen H
  | "scenarios";    // Screen I

export type TerminalWidth = "wide" | "standard" | "narrow" | "very-narrow";
export type TerminalTheme = "terminal-dark" | "amber-crt" | "matrix-green" | "paper-light";

export type AuthState = "authenticated" | "not_authenticated" | "insufficient_permissions" | "session_expired" | "device_code_pending";

export interface ScenarioDefinition {
  id: string;
  name: string;
  tag: string;
  description: string;
  initialScreen: ActiveScreen;
  expectedOutcome: string;
  setupState: {
    githubAuth: AuthState;
    codexAuth: AuthState;
    prUrl: string;
    isUrlValid: boolean;
    urlErrorType?: "invalid_format" | "non_github" | "unauthorized" | "not_found" | "draft" | "rate_limited";
    workersState: Record<WorkerRole, WorkerState>;
    runStatus: RunStatus;
    staleSha?: boolean;
    publishOutcome?: "normal" | "operator_denied" | "denied_permission" | "stale_head" | "duplicate_warning";
  };
}
