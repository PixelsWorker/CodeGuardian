import { parseGitHubPrUrl } from './github-url.js';
import { buildDemoReport } from '../fixtures/fixtures.js';
import type {
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
  | { type: "EDIT_PR_URL"; text?: string; backspace?: boolean; preset?: string }
  | { type: "SUBMIT_PR_URL" }
  | { type: "START_INSPECTION" }
  | { type: "START_SPECIALISTS" }
  | { type: "SPECIALIST_PROGRESS"; role: string; progress: number; activity?: string }
  | { type: "SIMULATE_FAILURE"; role: string; reason: string }
  | { type: "SPECIALIST_TIMEOUT"; role: string; reason?: string }
  | { type: "SPECIALIST_SKIP"; role: string; reason?: string }
  | { type: "STEP_ALL_PROGRESS" }
  | { type: "RESET_SPECIALISTS_QUEUED" }
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
      if (state.runStatus === "published") {
        return { ...state, screen: action.screen, errorMessage: null };
      }
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
          const hasFailed = state.specialists.some(s => s.state !== "complete");
          nextStatus = hasFailed ? "partial" : "ready";
        }
      }
      return { ...state, screen: action.screen, runStatus: nextStatus, errorMessage: null };
    }

    case "SET_PR_URL":
      return { ...state, prUrl: action.url, urlError: null };

    case "EDIT_PR_URL": {
      if (state.screen !== "pr_input") return state;
      const knownPreset = state.prUrl === '' || [42, 404, 99, 429].some(n => state.prUrl === `https://github.com/example/demo/pull/${n}`) || state.prUrl === 'https://github.com/private-org/secret-repo/pull/1';
      const prUrl = action.backspace ? Array.from(state.prUrl).slice(0, -1).join('')
        : action.preset && knownPreset ? action.preset : state.prUrl + (action.text ?? '');
      return { ...state, prUrl, urlError: null };
    }

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

      const parsed = parseGitHubPrUrl(state.prUrl);
      if (!parsed) return { ...state, urlError: "Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number" };
      const { owner, repo, number: prNumber, url: trimmed } = parsed;

      // Offline PR failure demonstrations: restricted to exact documented preset identities
      // (owner, repo, prNumber) so arbitrary custom repositories (e.g. 'draft-js', 'closed-loop',
      // 'forbidden-planet', or custom PRs on orgs like 'private-org') are not erroneously treated as failure scenarios.
      if (owner === "private-org" && repo === "secret-repo" && prNumber === 1) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Unauthorized Repository: GitHub credentials lack read access to '${owner}/${repo}'. HTTP 403 Forbidden.`,
        };
      }

      if (owner === "example" && repo === "demo" && prNumber === 404) {
        return {
          ...state,
          screen: "error",
          runStatus: "failed",
          errorMessage: `Pull Request Not Found: PR #${prNumber} on '${owner}/${repo}' is closed or was deleted on remote. HTTP 404 Not Found.`,
        };
      }

      if (owner === "example" && repo === "demo" && prNumber === 99) {
        return {
          ...state,
          screen: "error",
          runStatus: "blocked",
          errorMessage: `Draft Pull Request: PR #${prNumber} is currently in Draft state. CodeGuardian requires pull requests to be marked ready for review.`,
        };
      }

      if (owner === "example" && repo === "demo" && prNumber === 429) {
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
      if (state.screen === "inspection" && state.runStatus === "published") {
        return { ...state, screen: "specialist" };
      }
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
          state: "queued",
          progress: 0,
          currentActivity: "Queued in manager execution pool. Waiting for worker assignment...",
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
            // Only active lanes may accept progress; preserve terminal coverage outcomes.
            if (s.state !== "queued" && s.state !== "running") {
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
          if (s.state !== "queued" && s.state !== "running") {
            return s;
          }
          if (s.state === "queued") {
            return {
              ...s,
              state: "running",
              progress: 25,
              currentActivity: "Analyzing diff hunks against policy...",
            };
          }
          const nextProgress = Math.min(100, s.progress + 25);
          return {
            ...s,
            progress: nextProgress,
            state: nextProgress >= 100 ? "complete" : "running",
            currentActivity: nextProgress >= 100 ? "Analysis complete." : s.currentActivity,
          };
        }),
      };

    case "RESET_SPECIALISTS_QUEUED":
      if (state.screen !== "specialist" || (state.runStatus !== "running" && state.runStatus !== "queued")) {
        return state;
      }
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.state === "failed" || s.state === "timed_out" || s.state === "skipped" || s.state === "complete" || s.state === "partial") {
            return s;
          }
          return {
            ...s,
            state: "queued",
            progress: 0,
            currentActivity: "Queued in manager execution pool. Waiting for worker assignment...",
          };
        }),
      };

    case "CANCEL_RUN":
      if (state.runStatus === "published") {
        return state;
      }
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
      if (state.screen === "specialist" && state.runStatus === "published") {
        return { ...state, screen: "consensus" };
      }
      if (state.screen !== "specialist" || state.runStatus !== "running") {
        return state;
      }
      return {
        ...state,
        screen: "consensus",
        runStatus: "validating",
        specialists: state.specialists.map(s => {
          if (s.state === "failed" || s.state === "timed_out" || s.state === "skipped" || s.state === "partial") {
            return s;
          }
          return {
            ...s,
            progress: 100,
            state: "complete",
            currentActivity: s.currentActivity.startsWith("Queued") ? "Analysis complete." : s.currentActivity,
          };
        }),
      };

    case "VALIDATE_FINDINGS": {
      if (state.screen === "consensus" && state.runStatus === "published") {
        return { ...state, screen: "report" };
      }
      // Allow validating findings when actively validating, ready, or partial
      if (
        state.screen !== "consensus" ||
        (state.runStatus !== "validating" && state.runStatus !== "ready" && state.runStatus !== "partial")
      ) {
        return state;
      }
      const report = buildDemoReport(state.prIdentity, state.specialists, state.findings);
      return { ...state, screen: "report", runStatus: report.status, report };
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
