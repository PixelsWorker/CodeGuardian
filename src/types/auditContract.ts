import { Severity, Category } from './contract';

export type WorkflowMode = 'pr_review' | 'repo_audit';

export type AuditVerification = 'verified' | 'rejected' | 'inconclusive';

export type AuditCoverageLevel =
  | 'inventoried'
  | 'inspected'
  | 'context_analyzed'
  | 'independently_verified'
  | 'excluded'
  | 'unknown';

export interface RepositorySnapshot {
  owner: string;
  repo: string;
  requested_branch: string;
  intended_commit_sha: string; // full 40-character SHA from independent reader
  verified_audit_commit_sha: string | null; // do not guess from startingBranch
  tracked_file_manifest_digest: string;
  total_files_count: number;
  tracked_files: string[];
  exclusion_patterns: string[];
}

export interface RepositoryAuditFinding {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  path: string; // repo-relative tracked path; NOT PR-only
  line_start: number | null;
  line_end: number | null;
  affected_symbol: string | null;
  claim: string;
  source_evidence: string;
  affected_callers: string[];
  impact: string;
  recommendation: string;
  source_worker: 'jules' | 'codex' | 'manager';
  source_activity_id: string | null;
  confidence: 'high' | 'medium' | 'low';
  verification: AuditVerification;
  independent_verification_notes: string;
  remediation_priority: string;
  conflicting_evidence?: string;
}

export interface RepositoryAuditCoverage {
  path: string;
  module: string;
  level: AuditCoverageLevel;
  evidence_references: string[];
  exclusion_or_unknown_reason: string | null;
  line_count: number;
}

export interface RepositoryAuditReport {
  schema_version: '1.0.0';
  audit_id: string;
  repository: RepositorySnapshot;
  status: 'ready' | 'partial' | 'blocked' | 'failed';
  findings: RepositoryAuditFinding[];
  coverage: RepositoryAuditCoverage[];
  architecture_summary: string;
  limitations: string[];
  executed_checks: string[];
  jules_session_ids: string[];
  generated_at: string;
  report_digest: string;
}

export type AuditScreen =
  | 'audit_repo'         // View A: Repo selection
  | 'audit_preflight'    // View B: Preflight checks & operator plan approval
  | 'audit_coverage'     // View C: 6-tier coverage ledger
  | 'audit_activity'     // View D: Jules activity execution & candidate findings
  | 'audit_verification' // View E: Manager source & caller verification
  | 'audit_report'       // View F: AUDIT.md preview & export
  | 'audit_scenarios';   // View S: Audit Scenarios

export type JulesActivityState = 'queued' | 'running' | 'complete' | 'failed' | 'timed_out' | 'cancelled';

export interface JulesActivity {
  id: string;
  name: string;
  targetScope: string;
  state: JulesActivityState;
  progress: number;
  candidateFindingsCount: number;
  currentAction: string;
  logs: string[];
  durationMs: number;
}

export interface AuditScenarioDefinition {
  id: string;
  name: string;
  tag: string;
  description: string;
  initialScreen: AuditScreen;
  expectedOutcome: string;
  snapshotState: {
    owner: string;
    repo: string;
    branch: string;
    intendedSha: string;
    isShaVerified: boolean;
    julesAuth: 'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited';
    planApproved: boolean;
    activitiesState: Record<string, JulesActivityState>;
    hasFabricatedClaims?: boolean;
    isTimeout?: boolean;
    isCancelled?: boolean;
    status: 'ready' | 'partial' | 'blocked' | 'failed';
  };
}
