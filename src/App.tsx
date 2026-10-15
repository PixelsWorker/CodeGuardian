import React, { useState, useEffect } from 'react';
import { 
  ActiveScreen, 
  TerminalWidth, 
  TerminalTheme, 
  AuthState, 
  WorkerRole, 
  WorkerInfo, 
  ScenarioDefinition 
} from './types/contract';
import { TerminalChrome } from './components/TerminalChrome';
import { ScreenAWelcome } from './components/screens/ScreenAWelcome';
import { ScreenBAuth } from './components/screens/ScreenBAuth';
import { ScreenCPullRequest } from './components/screens/ScreenCPullRequest';
import { ScreenDInspection } from './components/screens/ScreenDInspection';
import { ScreenEMultiAgent } from './components/screens/ScreenEMultiAgent';
import { ScreenFFindingsValidation } from './components/screens/ScreenFFindingsValidation';
import { ScreenGReport } from './components/screens/ScreenGReport';
import { ScreenHPublish } from './components/screens/ScreenHPublish';
import { ScreenIScenarios } from './components/screens/ScreenIScenarios';
import { HandoffDocsModal } from './components/modals/HandoffDocsModal';

const INITIAL_WORKERS: Record<WorkerRole, WorkerInfo> = {
  security: {
    role: "security",
    displayName: "Security Specialist (CodeGuardianMini-Sec)",
    description: "Evaluates HMAC keys, token lifecycles, and hardcoded credentials.",
    state: "complete",
    progress: 100,
    elapsedMs: 1840,
    findingsCount: 2,
    currentActivity: "Audit complete. 2 candidate findings submitted.",
    logs: [
      "[00:00.12] Initializing isolated prompt container...",
      "[00:00.45] Auditing src/auth/token.ts for weak PRNG or static secrets...",
      "[00:00.82] Found static secret fallback candidate at line 45",
      "[00:01.35] Scanning tests/auth.test.ts fixture dummy secrets...",
      "[00:01.84] Generated 2 candidate finding packages for Manager validation.",
    ],
  },
  logic: {
    role: "logic",
    displayName: "Logic Specialist (CodeGuardianMini-Logic)",
    description: "Performs control-flow and nullability safety checks on AST.",
    state: "complete",
    progress: 100,
    elapsedMs: 1620,
    findingsCount: 1,
    currentActivity: "AST traversal complete. 1 candidate finding submitted.",
    logs: [
      "[00:00.10] Parsing diff hunks into TypeScript AST...",
      "[00:00.60] Tracing call graph of resolveUserPermissions()...",
      "[00:00.85] Potential null dereference detected: parseToken() return unchecked at line 17",
      "[00:01.62] Emitted 1 high-confidence correctness candidate.",
    ],
  },
  architecture: {
    role: "architecture",
    displayName: "Architecture Specialist (CodeGuardianMini-Arch)",
    description: "Analyzes lifecycle bounds, connection pools, and memory leaks.",
    state: "complete",
    progress: 100,
    elapsedMs: 2100,
    findingsCount: 2,
    currentActivity: "Resource bounds pass complete. 2 candidates submitted.",
    logs: [
      "[00:00.15] Evaluating memory allocations across session layer...",
      "[00:01.12] Unbounded global Map found in src/auth/session.ts:89 (no TTL or eviction)",
      "[00:01.42] Auditing src/db/redis.ts client options...",
      "[00:01.88] Flagged missing connectTimeout on Redis client instantiation",
      "[00:02.10] Emitted 2 reliability candidates.",
    ],
  },
  quality: {
    role: "quality",
    displayName: "Quality & Testing (CodeGuardianMini-Qual)",
    description: "Audits test coverage gaps and duplicate defect assertions.",
    state: "complete",
    progress: 100,
    elapsedMs: 1750,
    findingsCount: 1,
    currentActivity: "Coverage pass complete. 1 candidate submitted.",
    logs: [
      "[00:00.11] Checking test coverage for modified auth routes...",
      "[00:00.95] Identified duplicate candidate regarding token null guard in src/demo.ts",
      "[00:01.75] Emitted 1 candidate (Manager will deduplicate).",
    ],
  },
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');
  const [terminalWidth, setTerminalWidth] = useState<TerminalWidth>('standard');
  const [terminalTheme, setTerminalTheme] = useState<TerminalTheme>('terminal-dark');
  const [noColor, setNoColor] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Core state machine
  const [githubAuth, setGithubAuth] = useState<AuthState>('authenticated');
  const [codexAuth, setCodexAuth] = useState<AuthState>('authenticated');
  const [prUrl, setPrUrl] = useState<string>('https://github.com/example/demo/pull/42');
  const [workers, setWorkers] = useState<Record<WorkerRole, WorkerInfo>>(INITIAL_WORKERS);
  const [staleSha, setStaleSha] = useState<boolean>(false);
  const [publishOutcome, setPublishOutcome] = useState<'normal' | 'denied_permission' | 'stale_head' | 'duplicate_warning'>('normal');

  // Command prompt input
  const [commandInput, setCommandInput] = useState<string>('');

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing when in an input element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') setActiveScreen('welcome');
      if (e.key === '2') setActiveScreen('auth');
      if (e.key === '3') setActiveScreen('pr_input');
      if (e.key === '4') setActiveScreen('inspection');
      if (e.key === '5') setActiveScreen('multi_agent');
      if (e.key === '6') setActiveScreen('validation');
      if (e.key === '7') setActiveScreen('report');
      if (e.key === '8') setActiveScreen('publish');
      if (e.key === '9') setActiveScreen('scenarios');
      if (e.key === '?' || e.key === 'h' || e.key === 'H') setIsDocsOpen(true);
      if (e.key === 'Escape') setIsDocsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CLI Command Dispatcher
  const handleExecuteCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed === 'codeguardian --help' || trimmed === 'help') {
      setActiveScreen('welcome');
    } else if (trimmed === 'codeguardian auth status' || trimmed.startsWith('auth')) {
      setActiveScreen('auth');
    } else if (trimmed.startsWith('codeguardian review') || trimmed.startsWith('review')) {
      setActiveScreen('multi_agent');
    } else if (trimmed.startsWith('codeguardian report') || trimmed.startsWith('report')) {
      setActiveScreen('report');
    } else if (trimmed.startsWith('codeguardian publish') || trimmed.startsWith('publish')) {
      setActiveScreen('publish');
    } else if (trimmed === 'codeguardian docs' || trimmed === 'docs') {
      setIsDocsOpen(true);
    } else if (trimmed === 'clear') {
      setCommandInput('');
    } else {
      // General feedback
      alert(`Simulated command executed: "${trimmed}"\nNavigating to matching review screen.`);
      setActiveScreen('multi_agent');
    }
  };

  const handleStartReview = () => {
    setActiveScreen('multi_agent');
  };

  const handleApplyScenario = (scenario: ScenarioDefinition) => {
    setGithubAuth(scenario.setupState.githubAuth);
    setCodexAuth(scenario.setupState.codexAuth);
    setPrUrl(scenario.setupState.prUrl);
    setStaleSha(scenario.setupState.staleSha ?? false);
    if (scenario.setupState.publishOutcome) {
      setPublishOutcome(scenario.setupState.publishOutcome);
    }

    // Apply worker states
    setWorkers((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WorkerRole[]).forEach((role) => {
        const state = scenario.setupState.workersState[role];
        next[role] = {
          ...next[role],
          state: state,
          progress: state === 'complete' ? 100 : state === 'failed' || state === 'timed_out' ? 65 : 0,
          failureReason: state === 'failed' 
            ? 'Parser crash: Unexpected AST token in macro expansion'
            : state === 'timed_out' 
            ? 'Hard deadline exceeded: 60000ms call-graph budget exhausted' 
            : undefined,
        };
      });
      return next;
    });

    setActiveScreen(scenario.initialScreen);
  };

  const handleCancelAllWorkers = () => {
    setWorkers((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WorkerRole[]).forEach((role) => {
        next[role] = {
          ...next[role],
          state: 'cancelled',
          currentActivity: 'Aborted by operator SIGINT / cancel.',
        };
      });
      return next;
    });
  };

  const handleRetryWorkerLane = (role: WorkerRole) => {
    setWorkers((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        state: 'complete',
        progress: 100,
        currentActivity: 'Retried successfully. Submitted candidate to Manager.',
        failureReason: undefined,
      },
    }));
  };

  return (
    <>
      <TerminalChrome
        width={terminalWidth}
        setWidth={setTerminalWidth}
        theme={terminalTheme}
        setTheme={setTerminalTheme}
        noColor={noColor}
        setNoColor={setNoColor}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onOpenDocs={() => setIsDocsOpen(true)}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        onExecuteCommand={handleExecuteCommand}
      >
        {activeScreen === 'welcome' && (
          <ScreenAWelcome
            noColor={noColor}
            onNavigate={setActiveScreen}
            onRunDefaultDemo={handleStartReview}
          />
        )}

        {activeScreen === 'auth' && (
          <ScreenBAuth
            noColor={noColor}
            githubAuth={githubAuth}
            setGithubAuth={setGithubAuth}
            codexAuth={codexAuth}
            setCodexAuth={setCodexAuth}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'pr_input' && (
          <ScreenCPullRequest
            noColor={noColor}
            prUrl={prUrl}
            setPrUrl={setPrUrl}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'inspection' && (
          <ScreenDInspection
            noColor={noColor}
            onNavigate={setActiveScreen}
            onStartWorkerRun={() => setActiveScreen('multi_agent')}
          />
        )}

        {activeScreen === 'multi_agent' && (
          <ScreenEMultiAgent
            noColor={noColor}
            workers={workers}
            setWorkers={setWorkers}
            onNavigate={setActiveScreen}
            onCancelAll={handleCancelAllWorkers}
            onRetryLane={handleRetryWorkerLane}
            onRunValidation={() => setActiveScreen('validation')}
          />
        )}

        {activeScreen === 'validation' && (
          <ScreenFFindingsValidation
            noColor={noColor}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'report' && (
          <ScreenGReport
            noColor={noColor}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'publish' && (
          <ScreenHPublish
            noColor={noColor}
            staleSha={staleSha}
            setStaleSha={setStaleSha}
            outcomeType={publishOutcome}
            setOutcomeType={setPublishOutcome}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'scenarios' && (
          <ScreenIScenarios
            noColor={noColor}
            onApplyScenario={handleApplyScenario}
            onNavigate={setActiveScreen}
          />
        )}
      </TerminalChrome>

      {/* Ink Terminal Documentation & Codex Handoff Modal */}
      <HandoffDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </>
  );
}
