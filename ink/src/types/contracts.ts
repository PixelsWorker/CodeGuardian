import { z } from 'zod';

export const SeveritySchema = z.enum(["P0", "P1", "P2", "P3"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const CategorySchema = z.enum([
  "security",
  "correctness",
  "architecture",
  "testing",
  "performance",
  "reliability",
  "compatibility"
]);
export type Category = z.infer<typeof CategorySchema>;

export const RunStatusSchema = z.enum([
  "queued",
  "inspecting",
  "running",
  "validating",
  "ready",
  "partial",
  "blocked",
  "failed",
  "cancelled",
  "awaiting_approval",
  "publishing",
  "published"
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const PullRequestIdentitySchema = z.object({
  provider: z.literal("github"),
  owner: z.string(),
  repo: z.string(),
  number: z.number(),
  url: z.string(),
  base_sha: z.string().length(40),
  head_sha: z.string().length(40),
  title: z.string().optional(),
  author: z.string().optional(),
  base_branch: z.string().optional(),
  head_branch: z.string().optional(),
  changed_files_count: z.number().optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  is_draft: z.boolean().optional(),
});
export type PullRequestIdentity = z.infer<typeof PullRequestIdentitySchema>;

export const ReviewFindingSchema = z.object({
  id: z.string(),
  source_workers: z.array(z.string()),
  severity: SeveritySchema,
  category: CategorySchema,
  title: z.string(),
  path: z.string(),
  line: z.number().nullable(),
  side: z.enum(["RIGHT", "LEFT"]).nullable(),
  evidence: z.string(),
  impact: z.string(),
  recommendation: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  verification: z.enum(["verified_diff", "needs_context", "rejected"]),
  fingerprint: z.string(),
  rejection_reason: z.string().optional(),
}).superRefine((finding, ctx) => {
  if (finding.verification !== "verified_diff") return;
  if (finding.line === null || !Number.isSafeInteger(finding.line) || finding.line < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["line"], message: "Verified diff findings require a positive integer line." });
  }
  if (finding.side === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["side"], message: "Verified diff findings require a diff side." });
  }
});
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;

export const WorkerRoleSchema = z.enum(["security", "logic", "architecture", "quality"]);
export type WorkerRole = z.infer<typeof WorkerRoleSchema>;

export const WorkerStateSchema = z.enum([
  "queued",
  "running",
  "complete",
  "partial",
  "failed",
  "skipped",
  "timed_out",
  "cancelled"
]);
export type WorkerState = z.infer<typeof WorkerStateSchema>;

export const FinalWorkerStateSchema = z.enum([
  "complete",
  "partial",
  "failed",
  "skipped"
]);
export type FinalWorkerState = z.infer<typeof FinalWorkerStateSchema>;

export interface WorkerInfo {
  role: WorkerRole;
  displayName: string;
  description: string;
  state: WorkerState;
  progress: number;
  elapsedMs: number;
  findingsCount: number;
  currentActivity: string;
  logs: string[];
  failureReason?: string;
}

export const ReviewReportSchema = z.object({
  schema_version: z.literal("1.0.0"),
  run_id: z.string(),
  pr: PullRequestIdentitySchema,
  status: z.enum(["ready", "partial", "blocked", "failed"]),
  findings: z.array(ReviewFindingSchema),
  summary: z.string(),
  tests: z.object({
    executed: z.boolean(),
    details: z.array(z.string()),
  }),
  worker_states: z.array(
    z.object({
      worker_id: z.string(),
      state: FinalWorkerStateSchema,
    })
  ),
  warnings: z.array(z.string()),
  generated_at: z.string(),
  policy_revision: z.string(),
  report_digest: z.string().regex(/^sha256-[0-9a-f]{64}$/),
});
export type ReviewReport = z.infer<typeof ReviewReportSchema>;

export type ActiveScreen =
  | "welcome"
  | "auth"
  | "pr_input"
  | "inspection"
  | "specialist"
  | "consensus"
  | "report"
  | "publish"
  | "error";

export type AuthState =
  | "authenticated"
  | "not_authenticated"
  | "insufficient_permissions"
  | "session_expired";
