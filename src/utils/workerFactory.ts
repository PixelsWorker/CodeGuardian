import { WorkerRole, WorkerState, WorkerInfo } from '../types/contract';

export const WORKER_ROLE_METADATA: Record<WorkerRole, { displayName: string; description: string }> = {
  security: {
    displayName: "Security Specialist (CodeGuardianMini-Sec)",
    description: "Evaluates HMAC keys, token lifecycles, and hardcoded credentials.",
  },
  logic: {
    displayName: "Logic Specialist (CodeGuardianMini-Logic)",
    description: "Performs control-flow and nullability safety checks on AST.",
  },
  architecture: {
    displayName: "Architecture Specialist (CodeGuardianMini-Arch)",
    description: "Analyzes lifecycle bounds, connection pools, and memory leaks.",
  },
  quality: {
    displayName: "Quality & Testing (CodeGuardianMini-Qual)",
    description: "Audits test coverage gaps and duplicate defect assertions.",
  },
};

/**
 * Creates a completely fresh, decoupled WorkerInfo object for a given state.
 * Guarantees that queued workers start with 0 elapsed time, 0 findings, and empty logs.
 */
export function createFreshWorker(
  role: WorkerRole,
  state: WorkerState,
  failureReason?: string
): WorkerInfo {
  const meta = WORKER_ROLE_METADATA[role];

  switch (state) {
    case "queued":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "queued",
        progress: 0,
        elapsedMs: 0,
        findingsCount: 0,
        currentActivity: "Waiting for preflight authorization & diff assignment...",
        logs: [`[00:00.00] Specialist worker '${role}' queued in manager pool.`],
      };

    case "running":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "running",
        progress: 25,
        elapsedMs: 350,
        findingsCount: 0,
        currentActivity: `Auditing diff hunks for ${role} patterns...`,
        logs: [
          `[00:00.00] Specialist worker '${role}' initialized in sandbox container.`,
          `[00:00.35] Ingesting validated unified diff hunks...`,
        ],
      };

    case "failed":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "failed",
        progress: 65,
        elapsedMs: 1250,
        findingsCount: 0,
        currentActivity: "Specialist execution terminated with parser error.",
        logs: [
          `[00:00.00] Specialist worker '${role}' initialized.`,
          `[00:01.25] Fatal error encountered during AST token traversal.`,
        ],
        failureReason: failureReason || "Parser crash: Unexpected AST token in macro expansion",
      };

    case "timed_out":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "timed_out",
        progress: 85,
        elapsedMs: 60000,
        findingsCount: 0,
        currentActivity: "Hard deadline exceeded: Execution budget exhausted (60s limit).",
        logs: [
          `[00:00.00] Specialist worker '${role}' started deep recursion search.`,
          `[01:00.00] Timeout budget expired (60000ms). Worker killed by Manager watchdog.`,
        ],
        failureReason: failureReason || "Hard deadline exceeded: 60000ms call-graph budget exhausted",
      };

    case "cancelled":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "cancelled",
        progress: 30,
        elapsedMs: 450,
        findingsCount: 0,
        currentActivity: "Aborted by operator SIGINT / cancel.",
        logs: [
          `[00:00.00] Specialist worker '${role}' started.`,
          `[00:00.45] SIGINT received: Execution aborted by operator signal.`,
        ],
      };

    case "skipped":
      return {
        role,
        displayName: meta.displayName,
        description: meta.description,
        state: "skipped",
        progress: 0,
        elapsedMs: 0,
        findingsCount: 0,
        currentActivity: "Skipped: Diff classification indicated low relevance for this domain.",
        logs: [`[00:00.00] Worker '${role}' marked skipped by Manager rule classifier.`],
      };

    case "complete":
    default:
      return getCompletedWorkerFixture(role);
  }
}

function getCompletedWorkerFixture(role: WorkerRole): WorkerInfo {
  const meta = WORKER_ROLE_METADATA[role];

  switch (role) {
    case "security":
      return {
        role: "security",
        displayName: meta.displayName,
        description: meta.description,
        state: "complete",
        progress: 100,
        elapsedMs: 1840,
        findingsCount: 2,
        currentActivity: "Audit complete. 2 candidate findings submitted to Manager.",
        logs: [
          "[00:00.12] Initializing isolated prompt container...",
          "[00:00.45] Auditing src/auth/token.ts for weak PRNG or static secrets...",
          "[00:00.82] Found static secret fallback candidate at line 45",
          "[00:01.35] Scanning tests/auth.test.ts fixture dummy secrets...",
          "[00:01.84] Generated 2 candidate finding packages for Manager validation.",
        ],
      };

    case "logic":
      return {
        role: "logic",
        displayName: meta.displayName,
        description: meta.description,
        state: "complete",
        progress: 100,
        elapsedMs: 1620,
        findingsCount: 1,
        currentActivity: "AST traversal complete. 1 candidate finding submitted to Manager.",
        logs: [
          "[00:00.10] Parsing diff hunks into TypeScript AST...",
          "[00:00.60] Tracing call graph of resolveUserPermissions()...",
          "[00:00.85] Potential null dereference detected: parseToken() return unchecked at line 17",
          "[00:01.62] Emitted 1 high-confidence correctness candidate.",
        ],
      };

    case "architecture":
      return {
        role: "architecture",
        displayName: meta.displayName,
        description: meta.description,
        state: "complete",
        progress: 100,
        elapsedMs: 2100,
        findingsCount: 2,
        currentActivity: "Resource bounds pass complete. 2 candidates submitted to Manager.",
        logs: [
          "[00:00.15] Evaluating memory allocations across session layer...",
          "[00:01.12] Unbounded global Map found in src/auth/session.ts:89 (no TTL or eviction)",
          "[00:01.42] Auditing src/db/redis.ts client options...",
          "[00:01.88] Flagged missing connectTimeout on Redis client instantiation",
          "[00:02.10] Emitted 2 reliability candidates.",
        ],
      };

    case "quality":
      return {
        role: "quality",
        displayName: meta.displayName,
        description: meta.description,
        state: "complete",
        progress: 100,
        elapsedMs: 1750,
        findingsCount: 1,
        currentActivity: "Coverage pass complete. 1 candidate submitted to Manager.",
        logs: [
          "[00:00.11] Checking test coverage for modified auth routes...",
          "[00:00.95] Identified duplicate candidate regarding token null guard in src/demo.ts",
          "[00:01.75] Emitted 1 candidate (Manager will deduplicate).",
        ],
      };
  }
}
