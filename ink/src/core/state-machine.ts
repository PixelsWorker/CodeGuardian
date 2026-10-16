import {
  ActiveScreen,
  AuthState,
  PullRequestIdentity,
  ReviewFinding,
  ReviewReport,
  RunStatus,
  WorkerInfo
} from '../types/contracts.js';
import {
  SYNTHETIC_PR_IDENTITY,
  MOCK_DIFF_FILES,
  SYNTHETIC_FINDINGS,
  CANONICAL_SPECIALISTS,
  SYNTHETIC_REPORT
} from '../fixtures/fixtures.js';

export interface CliState {
  screen: ActiveScreen;
  runStatus: RunStatus;
  githubAuth: AuthState;
  codexAuth: AuthState;
  prUrl: string;
  urlError: string | null;
  prIdentity: PullRequestIdentity;
  diffFiles: typeof MOCK_DIFF_FILES;
  specialists: WorkerInfo[];
  findings: ReviewFinding[];
  report: ReviewReport;
  publishOutcome: "normal" | "denied" | "stale_sha";
  publishDecision: "pending" | "confirmed" | "denied";
  exportFormat: "markdown" | "json";
  logs: string[];
  errorMessage: string | null;
  isDemo: boolean;
}

export type CliAction =
  | { type: "NAVIGATE"; screen: ActiveScreen }
  | { type: "SET_PR_URL"; url: string }
  | { type: "SUBMIT_PR_URL" }
  | { type: "START_INSPECTION" }
  | { type: "START_SPECIALISTS" }
  | { type: "SPECIALIST_PROGRESS"; role: string; progress: number; activity?: string }
  | { type: "SIMULATE_FAILURE"; role: string; reason: string }
  | { type: "CANCEL_RUN" }
  | { type: "RETRY_RUN" }
  | { type: "FINISH_SPECIALISTS" }
  | { type: "VALIDATE_FINDINGS" }
  | { type: "TOGGLE_EXPORT_FORMAT" }
  | { type: "APPROVE_PUBLISH" }
  | { type: "DENY_PUBLISH" }
  | { type: "TRIGGER_STALE_SHA" }
  | { type: "CYCLE_AUTH_STATE" }
  | { type: "SET_ERROR"; message: string; status?: RunStatus }
  | { type: "RESET" };

export function createInitialState(isDemo: boolean = true): CliState {
  return {
    screen: "welcome",
    runStatus: "queued",
    githubAuth: "authenticated",
    codexAuth: "authenticated",
    prUrl: SYNTHETIC_PR_IDENTITY.url,
    urlError: null,
    prIdentity: SYNTHETIC_PR_IDENTITY,
    diffFiles: MOCK_DIFF_FILES,
    specialists: CANONICAL_SPECIALISTS.map(s => ({ ...s })),
    findings: [...SYNTHETIC_FINDINGS],
    report: { ...SYNTHETIC_REPORT },
    publishOutcome: "normal",
    publishDecision: "pending",
    exportFormat: "markdown",
    logs: ["[INFO] CodeGuardian CLI initialized in DEMO mode."],
    errorMessage: null,
    isDemo,
  };
}

export function cliReducer(state: CliState, action: CliAction): CliState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, screen: action.screen, errorMessage: null };

    case "SET_PR_URL":
      return { ...state, prUrl: action.url, urlError: null };

    case "SUBMIT_PR_URL": {
      // Block inspection when preflight authentication fails
      const isAuthValid = state.githubAuth === "authenticated" && state.codexAuth === "authenticated";
      if (!isAuthValid) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Preflight authentication blocked: GitHub session is '${state.githubAuth}' and Codex session is '${state.codexAuth}'. Both services must be authenticated before inspecting PRs.`,
        };
      }

      const trimmed = state.prUrl.trim();
      const match = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/);
      if (!match) {
        return {
          ...state,
          urlError: "Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number",
        };
      }
      const isCustomPr = !(match[1] === "example" && match[2] === "demo" && match[3] === "42");
      const newPrIdentity = {
        ...state.prIdentity,
        owner: match[1],
        repo: match[2],
        number: parseInt(match[3], 10),
        url: trimmed,
        title: isCustomPr ? `[DEMO] PR #${match[3]}: ${match[1]}/${match[2]}` : SYNTHETIC_PR_IDENTITY.title,
        author: isCustomPr ? `${match[1]}-contributor` : SYNTHETIC_PR_IDENTITY.author,
        head_branch: isCustomPr ? `feature/pr-${match[3]}` : SYNTHETIC_PR_IDENTITY.head_branch,
      };
      return {
        ...state,
        urlError: null,
        screen: "inspection",
        runStatus: "inspecting",
        publishOutcome: "normal",
        publishDecision: "pending",
        prIdentity: newPrIdentity,
        report: {
          ...state.report,
          pr: newPrIdentity,
        },
      };
    }

    case "START_INSPECTION": {
      const isAuthValid = state.githubAuth === "authenticated" && state.codexAuth === "authenticated";
      if (!isAuthValid) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Preflight authentication blocked: GitHub session is '${state.githubAuth}' and Codex session is '${state.codexAuth}'. Both services must be authenticated before inspecting PRs.`,
        };
      }
      return {
        ...state,
        screen: "inspection",
        runStatus: "inspecting",
        publishOutcome: "normal",
        publishDecision: "pending",
      };
    }

    case "START_SPECIALISTS": {
      const isAuthValid = state.githubAuth === "authenticated" && state.codexAuth === "authenticated";
      if (!isAuthValid) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Preflight authentication blocked: GitHub session is '${state.githubAuth}' and Codex session is '${state.codexAuth}'. Both services must be authenticated before running specialists.`,
        };
      }
      return {
        ...state,
        screen: "specialist",
        runStatus: "running",
        publishOutcome: "normal",
        publishDecision: "pending",
        specialists: state.specialists.map(s => ({
          ...s,
          state: "running",
          progress: 10,
          currentActivity: "Analyzing diff hunks against policy...",
        })),
      };
    }

    case "SPECIALIST_PROGRESS":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.role === action.role) {
            // Keep a failed specialist in the failed state; ignore late progress updates
            if (s.state === "failed") {
              return s;
            }
            return {
              ...s,
              progress: action.progress,
              currentActivity: action.activity || s.currentActivity,
              state: action.progress >= 100 ? "complete" : "running",
            };
          }
          return s;
        }),
      };

    case "SIMULATE_FAILURE":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.role === action.role) {
            return {
              ...s,
              state: "failed",
              failureReason: action.reason,
              currentActivity: `FAILED: ${action.reason}`,
            };
          }
          return s;
        }),
      };

    case "CANCEL_RUN":
      return {
        ...state,
        screen: "error",
        runStatus: "cancelled",
        errorMessage: "Run was cancelled by user.",
        specialists: state.specialists.map(s => ({
          ...s,
          state: s.state === "complete" ? "complete" : "cancelled",
          currentActivity: "Cancelled by user.",
        })),
      };

    case "RETRY_RUN":
      return {
        ...createInitialState(state.isDemo),
        screen: "welcome",
      };

    case "FINISH_SPECIALISTS":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        screen: "consensus",
        runStatus: "validating",
        specialists: state.specialists.map(s => ({
          ...s,
          progress: 100,
          state: s.state === "failed" ? "failed" : "complete",
        })),
      };

    case "VALIDATE_FINDINGS": {
      // Finalize findings only while the run is actively validating on the consensus screen
      if (state.runStatus !== "validating" || state.screen !== "consensus") {
        return state;
      }
      const failedSpecialists = state.specialists.filter(s => s.state === "failed");
      const isPartial = failedSpecialists.length > 0;
      const status: RunStatus = isPartial ? "partial" : "ready";
      const roleToId: Record<string, string> = {
        security: "worker-sec",
        logic: "worker-log",
        architecture: "worker-arc",
        quality: "worker-qty",
      };
      const updatedWorkerStates = state.specialists.map(s => ({
        worker_id: roleToId[s.role] || `worker-${s.role}`,
        state: s.state,
      }));
      const additionalWarnings = isPartial
        ? [
            `Incomplete worker coverage: ${failedSpecialists.length} specialist lane(s) failed (${failedSpecialists.map(s => s.displayName).join(', ')})`,
            "Findings from failed specialists may be omitted or unverified"
          ]
        : [];
      const updatedSummary = isPartial
        ? `PARTIAL REVIEW: Incomplete specialist coverage (${failedSpecialists.map(s => s.displayName).join(', ')} failed). Automated publishing gated on operator review.`
        : SYNTHETIC_REPORT.summary;

      return {
        ...state,
        screen: "report",
        runStatus: status,
        report: {
          ...state.report,
          status,
          worker_states: updatedWorkerStates,
          warnings: [...SYNTHETIC_REPORT.warnings, ...additionalWarnings],
          summary: updatedSummary,
        },
      };
    }

    case "TOGGLE_EXPORT_FORMAT":
      return {
        ...state,
        exportFormat: state.exportFormat === "markdown" ? "json" : "markdown",
      };

    case "APPROVE_PUBLISH":
      // Require an eligible review status (ready or partial), publish screen, and non-stale SHA before confirming
      if (
        state.screen !== "publish" ||
        (state.runStatus !== "ready" && state.runStatus !== "partial") ||
        state.publishOutcome === "stale_sha" ||
        state.publishDecision !== "pending"
      ) {
        return state;
      }
      return {
        ...state,
        screen: "publish",
        publishOutcome: "normal",
        publishDecision: "confirmed",
        runStatus: "published",
      };

    case "DENY_PUBLISH":
      // Require an eligible review status (ready or partial), publish screen, and non-stale SHA before denying
      if (
        state.screen !== "publish" ||
        (state.runStatus !== "ready" && state.runStatus !== "partial") ||
        state.publishOutcome === "stale_sha" ||
        state.publishDecision !== "pending"
      ) {
        return state;
      }
      return {
        ...state,
        screen: "publish",
        publishOutcome: "denied",
        publishDecision: "denied",
        runStatus: state.runStatus === "partial" ? "partial" : "ready",
      };

    case "TRIGGER_STALE_SHA": {
      // Allow toggling stale SHA only on publish screen while decision is pending
      if (state.screen !== "publish" || state.publishDecision !== "pending") {
        return state;
      }
      const isStale = state.publishOutcome === "stale_sha";
      return {
        ...state,
        publishOutcome: isStale ? "normal" : "stale_sha",
      };
    }

    case "CYCLE_AUTH_STATE": {
      const order: AuthState[] = [
        "authenticated",
        "not_authenticated",
        "insufficient_permissions",
        "session_expired"
      ];
      const nextIndex = (order.indexOf(state.githubAuth) + 1) % order.length;
      const nextState = order[nextIndex];
      return {
        ...state,
        githubAuth: nextState,
        codexAuth: nextState,
      };
    }

    case "SET_ERROR":
      return {
        ...state,
        screen: "error",
        errorMessage: action.message,
        runStatus: action.status || "failed",
      };

    case "RESET":
      return createInitialState(state.isDemo);

    default:
      return state;
  }
}
