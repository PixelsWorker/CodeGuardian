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
import { createFreshWorker } from './utils/workerFactory';

const INITIAL_WORKERS: Record<WorkerRole, WorkerInfo> = {
  security: createFreshWorker("security", "complete"),
  logic: createFreshWorker("logic", "complete"),
  architecture: createFreshWorker("architecture", "complete"),
  quality: createFreshWorker("quality", "complete"),
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
  const [publishOutcome, setPublishOutcome] = useState<'normal' | 'operator_denied' | 'denied_permission' | 'stale_head' | 'duplicate_warning'>('normal');

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
    // Explicitly reset publish outcome to 'normal' unless scenario defines an override
    setPublishOutcome(scenario.setupState.publishOutcome ?? 'normal');

    // Create fresh decoupled worker telemetry for each role
    const nextWorkers = {} as Record<WorkerRole, WorkerInfo>;
    (Object.keys(scenario.setupState.workersState) as WorkerRole[]).forEach((role) => {
      const state = scenario.setupState.workersState[role];
      nextWorkers[role] = createFreshWorker(role, state);
    });
    setWorkers(nextWorkers);

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
