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
  | { type: "SET_ERROR"; message: string }
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
      const trimmed = state.prUrl.trim();
      const match = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/);
      if (!match) {
        return {
          ...state,
          urlError: "Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number",
        };
      }
      const newPrIdentity = {
        ...state.prIdentity,
        owner: match[1],
        repo: match[2],
        number: parseInt(match[3], 10),
        url: trimmed,
      };
      return {
        ...state,
        urlError: null,
        screen: "inspection",
        runStatus: "inspecting",
        prIdentity: newPrIdentity,
        report: {
          ...state.report,
          pr: newPrIdentity,
        },
      };
    }

    case "START_INSPECTION":
      return {
        ...state,
        screen: "inspection",
        runStatus: "inspecting",
      };

    case "START_SPECIALISTS":
      return {
        ...state,
        screen: "specialist",
        runStatus: "running",
        specialists: state.specialists.map(s => ({
          ...s,
          state: "running",
          progress: 10,
          currentActivity: "Analyzing diff hunks against policy...",
        })),
      };

    case "SPECIALIST_PROGRESS":
      return {
        ...state,
        specialists: state.specialists.map(s => {
          if (s.role === action.role) {
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

    case "VALIDATE_FINDINGS":
      return {
        ...state,
        screen: "report",
        runStatus: state.specialists.some(s => s.state === "failed") ? "partial" : "ready",
      };

    case "TOGGLE_EXPORT_FORMAT":
      return {
        ...state,
        exportFormat: state.exportFormat === "markdown" ? "json" : "markdown",
      };

    case "APPROVE_PUBLISH":
      return {
        ...state,
        screen: "publish",
        publishOutcome: "normal",
        runStatus: "published",
      };

    case "DENY_PUBLISH":
      return {
        ...state,
        screen: "publish",
        publishOutcome: "denied",
        runStatus: "ready",
      };

    case "SET_ERROR":
      return {
        ...state,
        screen: "error",
        errorMessage: action.message,
        runStatus: "failed",
      };

    case "RESET":
      return createInitialState(state.isDemo);

    default:
      return state;
  }
}
