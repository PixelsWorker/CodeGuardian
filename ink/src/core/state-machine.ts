import {
  ActiveScreen,
  AuthState,
  FinalWorkerState,
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
  SYNTHETIC_REPORT,
  SYNTHETIC_PARTIAL_REPORT
} from '../fixtures/fixtures.js';

export type PublishOutcome =
  | "normal"
  | "denied"
  | "stale_sha"
  | "permission_denied"
  | "duplicate";

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
  publishOutcome: PublishOutcome;
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
  | { type: "SPECIALIST_TIMEOUT"; role: string; reason?: string }
  | { type: "SPECIALIST_SKIP"; role: string; reason?: string }
  | { type: "STEP_ALL_PROGRESS" }
  | { type: "CANCEL_RUN" }
  | { type: "RETRY_RUN" }
  | { type: "FINISH_SPECIALISTS" }
  | { type: "VALIDATE_FINDINGS" }
  | { type: "TOGGLE_EXPORT_FORMAT" }
  | { type: "APPROVE_PUBLISH" }
  | { type: "DENY_PUBLISH" }
  | { type: "TRIGGER_STALE_SHA" }
  | { type: "TRIGGER_PERMISSION_DENIED" }
  | { type: "TRIGGER_DUPLICATE" }
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
    case "NAVIGATE": {
      let nextStatus = state.runStatus;
      if (action.screen === "consensus") {
        if (state.runStatus === "ready" || state.runStatus === "partial") {
          nextStatus = "validating";
        }
      } else if (action.screen === "specialist") {
        if (state.runStatus === "validating" || state.runStatus === "ready" || state.runStatus === "partial") {
          nextStatus = "running";
        }
      } else if (action.screen === "report") {
        if (state.runStatus === "validating") {
          const hasFailed = state.specialists.some(s => s.state === "failed" || s.state === "timed_out");
          nextStatus = hasFailed ? "partial" : "ready";
        }
      }
      return { ...state, screen: action.screen, runStatus: nextStatus, errorMessage: null };
    }

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

      const owner = match[1];
      const repo = match[2];
      const prNumber = parseInt(match[3], 10);
      const lowerUrl = trimmed.toLowerCase();

      // Offline PR failure demonstrations
      if (
        lowerUrl.includes("unauthorized") ||
        lowerUrl.includes("forbidden") ||
        owner === "private-org" ||
        owner === "unauthorized-org"
      ) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Unauthorized Repository: GitHub credentials lack read access to '${owner}/${repo}'. HTTP 403 Forbidden.`,
        };
      }

      if (lowerUrl.includes("closed") || lowerUrl.includes("deleted") || prNumber === 404) {
        return {
          ...state,
          screen: "error",
          runStatus: "failed",
          errorMessage: `Pull Request Not Found: PR #${prNumber} on '${owner}/${repo}' is closed or was deleted on remote. HTTP 404 Not Found.`,
        };
      }

      if (lowerUrl.includes("draft") || prNumber === 99) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Draft Pull Request: PR #${prNumber} is currently in Draft state. CodeGuardian requires pull requests to be marked ready for review.`,
        };
      }

      if (lowerUrl.includes("rate-limit") || lowerUrl.includes("ratelimit") || prNumber === 429) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `API Rate Limit Exceeded: GitHub REST/GraphQL rate limit reached for client. Resets in 42 minutes. HTTP 429 Too Many Requests.`,
        };
      }

      const isCustomPr = !(owner === "example" && repo === "demo" && prNumber === 42);
      const newPrIdentity = {
        ...state.prIdentity,
        owner,
        repo,
        number: prNumber,
        url: trimmed,
        title: isCustomPr ? `[DEMO] PR #${prNumber}: ${owner}/${repo}` : SYNTHETIC_PR_IDENTITY.title,
        author: isCustomPr ? `${owner}-contributor` : SYNTHETIC_PR_IDENTITY.author,
        head_branch: isCustomPr ? `feature/pr-${prNumber}` : SYNTHETIC_PR_IDENTITY.head_branch,
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
            // Keep a failed/timed_out specialist in terminal state; ignore late progress updates
            if (s.state === "failed" || s.state === "timed_out" || s.state === "skipped") {
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

    case "SPECIALIST_TIMEOUT":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.role === action.role) {
            return {
              ...s,
              state: "timed_out",
              failureReason: action.reason || "Specialist exceeded 60s execution budget",
              currentActivity: `TIMED OUT: ${action.reason || "Specialist exceeded 60s execution budget"}`,
            };
          }
          return s;
        }),
      };

    case "SPECIALIST_SKIP":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.role === action.role) {
            return {
              ...s,
              state: "skipped",
              currentActivity: `SKIPPED: ${action.reason || "No relevant diff files present for this lane"}`,
            };
          }
          return s;
        }),
      };

    case "STEP_ALL_PROGRESS":
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.state === "failed" || s.state === "timed_out" || s.state === "skipped" || s.state === "complete") {
            return s;
          }
          const nextProgress = Math.min(100, s.progress + 30);
          return {
            ...s,
            progress: nextProgress,
            state: nextProgress >= 100 ? "complete" : "running",
            currentActivity: nextProgress >= 100 ? "Analysis complete." : s.currentActivity,
          };
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
      if (state.screen !== "specialist") {
        return state;
      }
      return {
        ...state,
        screen: "consensus",
        runStatus: "validating",
        specialists: state.specialists.map(s => {
          if (s.state === "failed" || s.state === "timed_out" || s.state === "skipped") {
            return s;
          }
          return {
            ...s,
            progress: 100,
            state: "complete",
          };
        }),
      };

    case "VALIDATE_FINDINGS": {
      // Allow validating findings when actively validating, ready, or partial
      if (
        state.screen !== "consensus" ||
        (state.runStatus !== "validating" && state.runStatus !== "ready" && state.runStatus !== "partial")
      ) {
        return state;
      }
      const failedSpecialists = state.specialists.filter(
        s => s.state === "failed" || s.state === "timed_out"
      );
      const isPartial = failedSpecialists.length > 0;
      const status: RunStatus = isPartial ? "partial" : "ready";
      const roleToId: Record<string, string> = {
        security: "worker-sec",
        logic: "worker-log",
        architecture: "worker-arc",
        quality: "worker-qty",
      };
      const updatedWorkerStates: Array<{ worker_id: string; state: FinalWorkerState }> = state.specialists.map(s => {
        let finalState: FinalWorkerState = "complete";
        if (s.state === "failed" || s.state === "timed_out") {
          finalState = "failed";
        } else if (s.state === "skipped") {
          finalState = "skipped";
        } else if (s.state === "partial") {
          finalState = "partial";
        }
        return {
          worker_id: roleToId[s.role] || `worker-${s.role}`,
          state: finalState,
        };
      });
      const additionalWarnings = isPartial
        ? [
            `Incomplete worker coverage: ${failedSpecialists.length} specialist lane(s) failed (${failedSpecialists.map(s => s.displayName).join(', ')})`,
            "Findings from failed specialists may be omitted or unverified"
          ]
        : [];
      const updatedSummary = isPartial
        ? `PARTIAL REVIEW: Incomplete specialist coverage (${failedSpecialists.map(s => s.displayName).join(', ')} failed). Automated publishing gated on operator review.`
        : (state.prIdentity.number === 42 && state.prIdentity.owner === "example"
            ? SYNTHETIC_REPORT.summary
            : `Completed review of PR #${state.prIdentity.number} (${state.prIdentity.owner}/${state.prIdentity.repo}) across 4 canonical specialists.`);

      const isCustomPr = !(state.prIdentity.owner === "example" && state.prIdentity.repo === "demo" && state.prIdentity.number === 42);
      let calculatedRunId: string;
      if (isCustomPr) {
        calculatedRunId = `run-20261016-${state.prIdentity.owner}-${state.prIdentity.repo}-${state.prIdentity.number}${isPartial ? '-partial' : ''}`;
      } else {
        calculatedRunId = isPartial ? "run-20261016-g00-partial" : SYNTHETIC_REPORT.run_id;
      }

      return {
        ...state,
        screen: "report",
        runStatus: status,
        report: {
          ...state.report,
          run_id: calculatedRunId,
          status,
          pr: state.prIdentity,
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
      // Block confirmation if SHA is stale or permissions are denied
      if (
        state.screen !== "publish" ||
        (state.runStatus !== "ready" && state.runStatus !== "partial") ||
        state.publishOutcome === "stale_sha" ||
        state.publishOutcome === "permission_denied" ||
        state.publishDecision !== "pending"
      ) {
        return state;
      }
      return {
        ...state,
        screen: "publish",
        publishDecision: "confirmed",
        runStatus: "published",
      };

    case "DENY_PUBLISH":
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
      if (state.screen !== "publish" || state.publishDecision !== "pending") {
        return state;
      }
      return {
        ...state,
        publishOutcome: state.publishOutcome === "stale_sha" ? "normal" : "stale_sha",
      };
    }

    case "TRIGGER_PERMISSION_DENIED": {
      if (state.screen !== "publish" || state.publishDecision !== "pending") {
        return state;
      }
      return {
        ...state,
        publishOutcome: state.publishOutcome === "permission_denied" ? "normal" : "permission_denied",
      };
    }

    case "TRIGGER_DUPLICATE": {
      if (state.screen !== "publish" || state.publishDecision !== "pending") {
        return state;
      }
      return {
        ...state,
        publishOutcome: state.publishOutcome === "duplicate" ? "normal" : "duplicate",
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
