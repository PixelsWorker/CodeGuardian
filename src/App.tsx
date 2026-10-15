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
import { 
  WorkflowMode, 
  AuditScreen, 
  RepositorySnapshot, 
  JulesActivity, 
  JulesActivityState,
  RepositoryAuditCoverage, 
  RepositoryAuditFinding, 
  RepositoryAuditReport, 
  AuditScenarioDefinition 
} from './types/auditContract';
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

// Audit Screen Components
import { AuditScreenARepoSelect } from './components/screens/audit/AuditScreenARepoSelect';
import { AuditScreenBPreflight } from './components/screens/audit/AuditScreenBPreflight';
import { AuditScreenCCoverage } from './components/screens/audit/AuditScreenCCoverage';
import { AuditScreenDActivity } from './components/screens/audit/AuditScreenDActivity';
import { AuditScreenEVerification } from './components/screens/audit/AuditScreenEVerification';
import { AuditScreenFReport } from './components/screens/audit/AuditScreenFReport';
import { AuditScreenScenarios } from './components/screens/audit/AuditScreenScenarios';

import { HandoffDocsModal } from './components/modals/HandoffDocsModal';
import { createFreshWorker } from './utils/workerFactory';
import { 
  DEFAULT_REPOSITORY_SNAPSHOT, 
  DEFAULT_JULES_ACTIVITIES, 
  DEFAULT_COVERAGE_LEDGER, 
  DEFAULT_AUDIT_FINDINGS, 
  DEFAULT_AUDIT_REPORT 
} from './data/auditScenarios';

export const canLaunchAudit = (
  auth: 'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited',
  isVerified: boolean,
  snapshot: RepositorySnapshot,
  planApproved: boolean
): boolean => {
  return (
    auth === 'authenticated' &&
    isVerified &&
    Boolean(snapshot.verified_audit_commit_sha) &&
    snapshot.verified_audit_commit_sha === snapshot.intended_commit_sha &&
    planApproved
  );
};

export const createFreshAuditActivities = (
  activitiesState: Record<string, JulesActivityState>
): JulesActivity[] => {
  return DEFAULT_JULES_ACTIVITIES.map((base) => {
    const targetState = activitiesState[base.id] || 'queued';
    let progress = 0;
    let durationMs = 0;
    let candidateFindingsCount = base.candidateFindingsCount;
    let currentAction = base.currentAction;
    let logs = [...base.logs];

    if (targetState === 'complete') {
      progress = 100;
      durationMs = base.durationMs;
    } else if (targetState === 'running') {
      progress = 45;
      durationMs = 2500;
      currentAction = 'Analyzing AST and caller dependencies...';
      logs = [
        `[00:01.00] Session initialized for ${base.name}`,
        '[00:02.50] Parsing syntax tree and extracting symbols...',
      ];
    } else if (targetState === 'cancelled') {
      progress = 30;
      durationMs = 1500;
      currentAction = 'Cancelled by operator signal';
      logs = [
        `[00:01.00] Session initialized for ${base.name}`,
        '[00:01.50] CANCELLED: Operator abort signal received.',
      ];
    } else if (targetState === 'timed_out') {
      progress = 80;
      durationMs = 15000;
      currentAction = 'Hard timeout exceeded (15m cap)';
      logs = [
        `[00:01.00] Session initialized for ${base.name}`,
        '[05:00.00] Large dependency traversal in progress...',
        '[15:00.00] ERROR: Operation timed out after 15m hard cap.',
      ];
    } else if (targetState === 'queued') {
      progress = 0;
      durationMs = 0;
      candidateFindingsCount = 0;
      currentAction = 'Waiting for preflight authorization';
      logs = [];
    } else if (targetState === 'failed') {
      progress = 10;
      durationMs = 1000;
      currentAction = 'Preflight failed or rejected';
      logs = ['[00:00.50] Preflight failed closed.'];
    }

    return {
      ...base,
      state: targetState,
      progress,
      durationMs,
      candidateFindingsCount,
      currentAction,
      logs,
    };
  });
};

const INITIAL_WORKERS: Record<WorkerRole, WorkerInfo> = {
  security: createFreshWorker("security", "complete"),
  logic: createFreshWorker("logic", "complete"),
  architecture: createFreshWorker("architecture", "complete"),
  quality: createFreshWorker("quality", "complete"),
};

export default function App() {
  // Top-level workflow mode: 'pr_review' (G00) or 'repo_audit' (G06)
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowMode>('pr_review');

  // PR Review Navigation & Screens
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('welcome');
  const [terminalWidth, setTerminalWidth] = useState<TerminalWidth>('standard');
  const [terminalTheme, setTerminalTheme] = useState<TerminalTheme>('terminal-dark');
  const [noColor, setNoColor] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // PR Review State Machine
  const [githubAuth, setGithubAuth] = useState<AuthState>('authenticated');
  const [codexAuth, setCodexAuth] = useState<AuthState>('authenticated');
  const [prUrl, setPrUrl] = useState<string>('https://github.com/example/demo/pull/42');
  const [workers, setWorkers] = useState<Record<WorkerRole, WorkerInfo>>(INITIAL_WORKERS);
  const [staleSha, setStaleSha] = useState<boolean>(false);
  const [publishOutcome, setPublishOutcome] = useState<'normal' | 'operator_denied' | 'denied_permission' | 'stale_head' | 'duplicate_warning'>('normal');
  const [autoStartToken, setAutoStartToken] = useState<number | null>(null);

  // Full Repository Audit (G06) State Machine
  const [auditScreen, setAuditScreen] = useState<AuditScreen>('audit_repo');
  const [auditSnapshot, setAuditSnapshot] = useState<RepositorySnapshot>(DEFAULT_REPOSITORY_SNAPSHOT);
  const [julesAuth, setJulesAuth] = useState<'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited'>('authenticated');
  const [isShaVerified, setIsShaVerified] = useState<boolean>(true);
  const [planApproved, setPlanApproved] = useState<boolean>(false);
  const [auditActivities, setAuditActivities] = useState<JulesActivity[]>(DEFAULT_JULES_ACTIVITIES);
  const [coverageLedger, setCoverageLedger] = useState<RepositoryAuditCoverage[]>(DEFAULT_COVERAGE_LEDGER);
  const [auditFindings, setAuditFindings] = useState<RepositoryAuditFinding[]>(DEFAULT_AUDIT_FINDINGS);
  const [auditReport, setAuditReport] = useState<RepositoryAuditReport>(DEFAULT_AUDIT_REPORT);
  const [auditAutoStartToken, setAuditAutoStartToken] = useState<number | null>(null);

  // Command prompt input
  const [commandInput, setCommandInput] = useState<string>('');

  const handleCancelRunningWorkersOnly = () => {
    setWorkers((prev) => {
      let changed = false;
      const next = { ...prev };
      (Object.keys(next) as WorkerRole[]).forEach((role) => {
        if (next[role].state === 'running') {
          changed = true;
          next[role] = createFreshWorker(role, 'cancelled');
        }
      });
      return changed ? next : prev;
    });
  };

  const handleCancelRunningAuditActivitiesOnly = () => {
    setAuditActivities((prev) => {
      let changed = false;
      const next = prev.map((a) => {
        if (a.state === 'running') {
          changed = true;
          return { ...a, state: 'cancelled' as JulesActivityState };
        }
        return a;
      });
      return changed ? next : prev;
    });
  };

  const handleSwitchWorkflow = (mode: WorkflowMode) => {
    if (activeWorkflow === mode) return;
    if (activeWorkflow === 'pr_review' && activeScreen === 'multi_agent') {
      handleCancelRunningWorkersOnly();
    }
    if (activeWorkflow === 'repo_audit' && auditScreen === 'audit_activity') {
      handleCancelRunningAuditActivitiesOnly();
    }
    setAutoStartToken(null);
    setAuditAutoStartToken(null);
    setActiveWorkflow(mode);
    if (mode === 'pr_review') {
      setActiveScreen('welcome');
    } else {
      setAuditScreen('audit_repo');
    }
  };

  const handleNavigateScreen = (screen: ActiveScreen) => {
    if (activeWorkflow === 'repo_audit' && auditScreen === 'audit_activity') {
      handleCancelRunningAuditActivitiesOnly();
    }
    if (activeScreen === 'multi_agent' && screen !== 'multi_agent') {
      handleCancelRunningWorkersOnly();
    }
    setAutoStartToken(null);
    setActiveWorkflow('pr_review');
    setActiveScreen(screen);
  };

  const handleLaunchReview = () => {
    if (activeScreen === 'multi_agent') {
      handleCancelRunningWorkersOnly();
    }
    setActiveWorkflow('pr_review');
    setAutoStartToken((prev) => (prev ? prev + 1 : 1));
    setActiveScreen('multi_agent');
  };

  // Full Repository Audit Handlers
  const handleNavigateAudit = (screen: AuditScreen) => {
    if (activeWorkflow === 'pr_review' && activeScreen === 'multi_agent') {
      handleCancelRunningWorkersOnly();
    }
    if (auditScreen === 'audit_activity' && screen !== 'audit_activity') {
      handleCancelRunningAuditActivitiesOnly();
    }
    setAuditAutoStartToken(null);
    setActiveWorkflow('repo_audit');
    setAuditScreen(screen);
  };

  const handleLaunchAudit = () => {
    setActiveWorkflow('repo_audit');
    if (canLaunchAudit(julesAuth, isShaVerified, auditSnapshot, planApproved)) {
      setAuditAutoStartToken((prev) => (prev ? prev + 1 : 1));
      setAuditScreen('audit_activity');
    } else {
      setAuditAutoStartToken(null);
      setAuditScreen('audit_preflight');
    }
  };

  const handleCancelAuditActivities = () => {
    handleCancelRunningAuditActivitiesOnly();
  };

  const handleApplyAuditScenario = (scenario: AuditScenarioDefinition) => {
    const newSnapshot: RepositorySnapshot = {
      ...auditSnapshot,
      owner: scenario.snapshotState.owner,
      repo: scenario.snapshotState.repo,
      requested_branch: scenario.snapshotState.branch,
      intended_commit_sha: scenario.snapshotState.intendedSha,
      verified_audit_commit_sha: scenario.snapshotState.isShaVerified ? scenario.snapshotState.intendedSha : null,
    };
    setAuditSnapshot(newSnapshot);
    setIsShaVerified(scenario.snapshotState.isShaVerified);
    setJulesAuth(scenario.snapshotState.julesAuth);
    setPlanApproved(scenario.snapshotState.planApproved);
    setAuditAutoStartToken(null);

    // Apply fresh activity states and logs without stale telemetry
    setAuditActivities(createFreshAuditActivities(scenario.snapshotState.activitiesState));

    // Synchronize report status, snapshot, and limitations
    setAuditReport((prev) => ({
      ...prev,
      repository: newSnapshot,
      status: scenario.snapshotState.status,
      limitations: scenario.snapshotState.isTimeout
        ? [
            ...DEFAULT_AUDIT_REPORT.limitations,
            'Dependency activity timed out; supply chain coverage remains partial.',
          ]
        : DEFAULT_AUDIT_REPORT.limitations,
    }));

    setActiveWorkflow('repo_audit');
    setAuditScreen(scenario.initialScreen);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing when in an input, textarea, select, or editable element, or modifier held
      const target = e.target as HTMLElement | null;
      const isInput = Boolean(
        target && (
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable
        )
      );
      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
      if (isInput || hasModifier) {
        return;
      }

      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        setIsDocsOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setIsDocsOpen(false);
        return;
      }

      if (activeWorkflow === 'pr_review') {
        if (e.key === '1') handleNavigateScreen('welcome');
        if (e.key === '2') handleNavigateScreen('auth');
        if (e.key === '3') handleNavigateScreen('pr_input');
        if (e.key === '4') handleNavigateScreen('inspection');
        if (e.key === '5') handleNavigateScreen('multi_agent');
        if (e.key === '6') handleNavigateScreen('validation');
        if (e.key === '7') handleNavigateScreen('report');
        if (e.key === '8') handleNavigateScreen('publish');
        if (e.key === '9') handleNavigateScreen('scenarios');
      } else {
        if (e.key === '1') handleNavigateScreen('welcome');
        if (e.key === 'a' || e.key === 'A') handleNavigateAudit('audit_repo');
        if (e.key === 'b' || e.key === 'B') handleNavigateAudit('audit_preflight');
        if (e.key === 'c' || e.key === 'C') handleNavigateAudit('audit_coverage');
        if (e.key === 'd' || e.key === 'D') handleNavigateAudit('audit_activity');
        if (e.key === 'e' || e.key === 'E') handleNavigateAudit('audit_verification');
        if (e.key === 'f' || e.key === 'F') handleNavigateAudit('audit_report');
        if (e.key === 's' || e.key === 'S') handleNavigateAudit('audit_scenarios');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWorkflow, activeScreen, auditScreen, julesAuth, isShaVerified, auditSnapshot, planApproved]);

  // Unified CLI Command Dispatcher
  const handleExecuteCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed === 'codeguardian --help' || trimmed === 'help') {
      handleNavigateScreen('welcome');
    } else if (trimmed === 'codeguardian auth status' || trimmed.startsWith('auth')) {
      if (activeWorkflow === 'repo_audit') {
        handleNavigateAudit('audit_preflight');
      } else {
        handleNavigateScreen('auth');
      }
    } else if (trimmed.startsWith('codeguardian review') || trimmed.startsWith('review')) {
      handleLaunchReview();
    } else if (trimmed.startsWith('codeguardian audit') || trimmed.startsWith('audit')) {
      handleLaunchAudit();
    } else if (trimmed.startsWith('codeguardian report') || trimmed.startsWith('report')) {
      if (activeWorkflow === 'repo_audit') {
        handleNavigateAudit('audit_report');
      } else {
        handleNavigateScreen('report');
      }
    } else if (trimmed.startsWith('codeguardian publish') || trimmed.startsWith('publish')) {
      handleNavigateScreen('publish');
    } else if (trimmed === 'codeguardian mode pr' || trimmed === 'mode pr') {
      handleSwitchWorkflow('pr_review');
    } else if (trimmed === 'codeguardian mode audit' || trimmed === 'mode audit') {
      handleSwitchWorkflow('repo_audit');
    } else if (trimmed === 'codeguardian docs' || trimmed === 'docs') {
      setIsDocsOpen(true);
    } else if (trimmed === 'clear') {
      setCommandInput('');
    } else {
      if (trimmed.includes('audit')) {
        handleLaunchAudit();
      } else {
        handleLaunchReview();
      }
    }
  };

  const handleStartReview = () => {
    handleLaunchReview();
  };

  const handleApplyScenario = (scenario: ScenarioDefinition) => {
    setAutoStartToken(null);
    setGithubAuth(scenario.setupState.githubAuth);
    setCodexAuth(scenario.setupState.codexAuth);
    setPrUrl(scenario.setupState.prUrl);
    setStaleSha(scenario.setupState.staleSha ?? false);
    setPublishOutcome(scenario.setupState.publishOutcome ?? 'normal');

    const nextWorkers = {} as Record<WorkerRole, WorkerInfo>;
    (Object.keys(scenario.setupState.workersState) as WorkerRole[]).forEach((role) => {
      const state = scenario.setupState.workersState[role];
      nextWorkers[role] = createFreshWorker(role, state);
    });
    setWorkers(nextWorkers);

    setActiveWorkflow('pr_review');
    setActiveScreen(scenario.initialScreen);
  };

  const handleCancelAllWorkers = () => {
    setWorkers((prev) => {
      const next = {} as Record<WorkerRole, WorkerInfo>;
      (Object.keys(prev) as WorkerRole[]).forEach((role) => {
        next[role] = createFreshWorker(role, 'cancelled');
      });
      return next;
    });
  };

  const handleRetryWorkerLane = (role: WorkerRole) => {
    setWorkers((prev) => ({
      ...prev,
      [role]: createFreshWorker(role, 'complete'),
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
        setActiveScreen={handleNavigateScreen}
        activeWorkflow={activeWorkflow}
        setActiveWorkflow={handleSwitchWorkflow}
        auditScreen={auditScreen}
        setAuditScreen={handleNavigateAudit}
        onOpenDocs={() => setIsDocsOpen(true)}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        onExecuteCommand={handleExecuteCommand}
      >
        {activeWorkflow === 'pr_review' ? (
          <>
            {activeScreen === 'welcome' && (
              <ScreenAWelcome
                noColor={noColor}
                onNavigate={handleNavigateScreen}
                onRunDefaultDemo={handleStartReview}
                onLaunchRepoAudit={() => {
                  setActiveWorkflow('repo_audit');
                  setAuditScreen('audit_repo');
                }}
              />
            )}

            {activeScreen === 'auth' && (
              <ScreenBAuth
                noColor={noColor}
                githubAuth={githubAuth}
                setGithubAuth={setGithubAuth}
                codexAuth={codexAuth}
                setCodexAuth={setCodexAuth}
                onNavigate={handleNavigateScreen}
              />
            )}

            {activeScreen === 'pr_input' && (
              <ScreenCPullRequest
                noColor={noColor}
                prUrl={prUrl}
                setPrUrl={setPrUrl}
                onNavigate={handleNavigateScreen}
              />
            )}

            {activeScreen === 'inspection' && (
              <ScreenDInspection
                noColor={noColor}
                onNavigate={handleNavigateScreen}
                onStartWorkerRun={handleLaunchReview}
              />
            )}

            {activeScreen === 'multi_agent' && (
              <ScreenEMultiAgent
                noColor={noColor}
                workers={workers}
                setWorkers={setWorkers}
                onNavigate={handleNavigateScreen}
                onCancelAll={handleCancelAllWorkers}
                onRetryLane={handleRetryWorkerLane}
                onRunValidation={() => handleNavigateScreen('validation')}
                autoStartToken={autoStartToken}
              />
            )}

            {activeScreen === 'validation' && (
              <ScreenFFindingsValidation
                noColor={noColor}
                onNavigate={handleNavigateScreen}
              />
            )}

            {activeScreen === 'report' && (
              <ScreenGReport
                noColor={noColor}
                onNavigate={handleNavigateScreen}
              />
            )}

            {activeScreen === 'publish' && (
              <ScreenHPublish
                noColor={noColor}
                staleSha={staleSha}
                setStaleSha={setStaleSha}
                outcomeType={publishOutcome}
                setOutcomeType={setPublishOutcome}
                onNavigate={handleNavigateScreen}
              />
            )}

            {activeScreen === 'scenarios' && (
              <ScreenIScenarios
                noColor={noColor}
                onApplyScenario={handleApplyScenario}
                onNavigate={handleNavigateScreen}
              />
            )}
          </>
        ) : (
          <>
            {auditScreen === 'audit_repo' && (
              <AuditScreenARepoSelect
                noColor={noColor}
                snapshot={auditSnapshot}
                setSnapshot={setAuditSnapshot}
                setIsShaVerified={setIsShaVerified}
                setPlanApproved={setPlanApproved}
                onNavigate={handleNavigateAudit}
                onStartAudit={() => handleNavigateAudit('audit_preflight')}
              />
            )}

            {auditScreen === 'audit_preflight' && (
              <AuditScreenBPreflight
                noColor={noColor}
                snapshot={auditSnapshot}
                julesAuth={julesAuth}
                setJulesAuth={setJulesAuth}
                isShaVerified={isShaVerified}
                setIsShaVerified={setIsShaVerified}
                planApproved={planApproved}
                setPlanApproved={setPlanApproved}
                onNavigate={handleNavigateAudit}
                onApproveAndLaunch={handleLaunchAudit}
              />
            )}

            {auditScreen === 'audit_coverage' && (
              <AuditScreenCCoverage
                noColor={noColor}
                coverageLedger={coverageLedger}
                onNavigate={handleNavigateAudit}
              />
            )}

            {auditScreen === 'audit_activity' && (
              <AuditScreenDActivity
                noColor={noColor}
                activities={auditActivities}
                setActivities={setAuditActivities}
                onNavigate={handleNavigateAudit}
                onCancelAudit={handleCancelAuditActivities}
                onRunAudit={handleLaunchAudit}
                autoStartToken={auditAutoStartToken}
              />
            )}

            {auditScreen === 'audit_verification' && (
              <AuditScreenEVerification
                noColor={noColor}
                findings={auditFindings}
                onNavigate={handleNavigateAudit}
              />
            )}

            {auditScreen === 'audit_report' && (
              <AuditScreenFReport
                noColor={noColor}
                report={auditReport}
                onNavigate={handleNavigateAudit}
              />
            )}

            {auditScreen === 'audit_scenarios' && (
              <AuditScreenScenarios
                noColor={noColor}
                onApplyScenario={handleApplyAuditScenario}
                onNavigate={handleNavigateAudit}
              />
            )}
          </>
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
