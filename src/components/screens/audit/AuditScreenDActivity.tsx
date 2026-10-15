import React, { useState, useEffect, useRef } from 'react';
import { JulesActivity, JulesActivityState, AuditScreen, RepositorySnapshot, RepositoryAuditReport } from '../../../types/auditContract';
import { 
  Play, 
  RotateCcw, 
  XOctagon, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  ArrowRight, 
  Cpu, 
  Terminal 
} from 'lucide-react';

interface AuditScreenDActivityProps {
  noColor: boolean;
  activities: JulesActivity[];
  setActivities: React.Dispatch<React.SetStateAction<JulesActivity[]>>;
  onNavigate: (screen: AuditScreen) => void;
  onCancelAudit: () => void;
  onRunAudit?: () => void;
  autoStartToken: number | null;
  snapshot?: RepositorySnapshot;
  report?: RepositoryAuditReport;
}

export const AuditScreenDActivity: React.FC<AuditScreenDActivityProps> = ({
  noColor,
  activities,
  setActivities,
  onNavigate,
  onCancelAudit,
  onRunAudit,
  autoStartToken,
  snapshot,
  report,
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('act_arch');
  const [activeStep, setActiveStep] = useState<number>(0);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const runGenerationRef = useRef<number>(0);

  const isCodeGuardian = snapshot ? (snapshot.owner === 'PixelsWorker' && snapshot.repo === 'CodeGuardian') : false;
  const sessionId = report && report.jules_session_ids && report.jules_session_ids.length > 0
    ? report.jules_session_ids[0]
    : (isCodeGuardian && (!report || report.status === 'ready') ? 'jules-sess-2026-88a4' : null);

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];
  const isAnyRunning = activities.some((a) => a.state === 'running');
  const isAllComplete = activities.every((a) => a.state === 'complete');
  const isCancelled = activities.every((a) => a.state === 'cancelled');

  const totalCandidateFindings = activities.reduce((sum, a) => sum + a.candidateFindingsCount, 0);

  const clearSimulationTimers = () => {
    activeTimersRef.current.forEach(clearTimeout);
    activeTimersRef.current = [];
  };

  const handleStartSimulation = () => {
    clearSimulationTimers();
    runGenerationRef.current += 1;
    const currentGeneration = runGenerationRef.current;

    // Reset all activities to running with low progress
    setActivities((prev) =>
      prev.map((a) => ({
        ...a,
        state: 'running',
        progress: 15,
        durationMs: 0,
      }))
    );
    setActiveStep(1);

    // Schedule progressive updates
    const t1 = setTimeout(() => {
      if (runGenerationRef.current !== currentGeneration) return;
      setActivities((prev) =>
        prev.map((a, i) => ({
          ...a,
          state: i < 2 ? 'running' : 'running',
          progress: i === 0 ? 60 : 40,
          durationMs: 1200,
        }))
      );
      setActiveStep(2);

      const t2 = setTimeout(() => {
        if (runGenerationRef.current !== currentGeneration) return;
        setActivities((prev) =>
          prev.map((a, i) => ({
            ...a,
            state: i < 3 ? 'running' : 'running',
            progress: i < 2 ? 100 : 75,
            durationMs: 2500,
          }))
        );
        setActiveStep(3);

        const t3 = setTimeout(() => {
          if (runGenerationRef.current !== currentGeneration) return;
          setActivities((prev) =>
            prev.map((a) => ({
              ...a,
              state: 'complete',
              progress: 100,
              durationMs: 4000,
            }))
          );
          setActiveStep(4);
        }, 800);
        activeTimersRef.current.push(t3);
      }, 700);
      activeTimersRef.current.push(t2);
    }, 600);
    activeTimersRef.current.push(t1);
  };

  const handleCancel = () => {
    runGenerationRef.current += 1;
    clearSimulationTimers();
    onCancelAudit();
  };

  useEffect(() => {
    if (autoStartToken) {
      handleStartSimulation();
    }
    return () => {
      runGenerationRef.current += 1;
      clearSimulationTimers();
    };
  }, [autoStartToken]);

  const getStateBadge = (state: JulesActivityState) => {
    if (noColor) {
      return `border border-zinc-500 font-mono text-[10px] uppercase text-zinc-200`;
    }
    switch (state) {
      case 'running':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-pulse font-bold';
      case 'complete':
        return 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold';
      case 'cancelled':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono';
      case 'timed_out':
      case 'failed':
        return 'bg-red-950 text-red-300 border border-red-800/60 font-bold';
      case 'queued':
      default:
        return 'bg-zinc-900 text-zinc-500 border border-zinc-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW D: JULES AUDIT ACTIVITIES (EXPERIMENTAL v1alpha)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {sessionId ? (
            <span className="text-zinc-500">Session: {sessionId}</span>
          ) : (
            <span className="text-zinc-500 font-mono">Session: None (Unverified)</span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            {totalCandidateFindings} CANDIDATE CLAIMS
          </span>
        </div>
      </div>

      {/* Unverified Findings Warning */}
      <div className={`p-3 rounded border text-xs space-y-1 ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-amber-900/60 bg-amber-950/20 text-amber-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>UNVERIFIED CANDIDATE CLAIMS — INDEPENDENT VALIDATION MANDATORY</span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed">
          Findings generated in this view are <strong>unverified candidate claims</strong> emitted by the Google Jules model.
          Model output is untrusted. In the next view, CodeGuardian Manager will independently trace source code, caller relationships,
          and commit proof before accepting any finding.
        </p>
      </div>

      {/* Control Bar */}
      <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onRunAudit) {
                onRunAudit();
              } else {
                handleStartSimulation();
              }
            }}
            disabled={isAnyRunning}
            className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition ${
              isAnyRunning
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : noColor
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAllComplete ? 'Re-run Jules Analysis' : 'Run Jules Analysis'}</span>
          </button>

          {isAnyRunning && (
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900/80 text-red-200 border border-red-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <XOctagon className="w-3.5 h-3.5" />
              <span>Cancel / Abort</span>
            </button>
          )}

          {isCancelled && (
            <button
              onClick={() => {
                if (onRunAudit) {
                  onRunAudit();
                } else {
                  handleStartSimulation();
                }
              }}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 text-xs flex items-center gap-1.5 transition font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Cancelled Session</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <span>Overall: {isAllComplete ? '100%' : isAnyRunning ? 'Analyzing...' : isCancelled ? 'Cancelled' : 'Ready'}</span>
          <span>4 Lanes Active</span>
        </div>
      </div>

      {/* 4 Activity Lanes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {activities.map((act) => {
          const isSelected = selectedActivityId === act.id;
          return (
            <div
              key={act.id}
              onClick={() => setSelectedActivityId(act.id)}
              className={`p-3 rounded border transition cursor-pointer select-none space-y-2.5 ${
                isSelected
                  ? 'border-cyan-500/80 bg-zinc-900/90 shadow-md ring-1 ring-cyan-500/30'
                  : 'border-zinc-800 bg-black/40 hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-zinc-200 text-xs">{act.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Scope: {act.targetScope}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${getStateBadge(act.state)}`}>
                  [{act.state}]
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Progress</span>
                  <span>{act.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      act.state === 'complete'
                        ? 'bg-emerald-500'
                        : act.state === 'cancelled'
                        ? 'bg-zinc-600'
                        : act.state === 'failed' || act.state === 'timed_out'
                        ? 'bg-red-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${act.progress}%` }}
                  />
                </div>
              </div>

              {/* Action and Candidate Counter */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                <span className="truncate max-w-[200px] text-zinc-300 text-[10px]">
                  {act.currentAction}
                </span>
                <span className="text-amber-400 font-semibold flex-shrink-0">
                  {act.candidateFindingsCount} candidate findings
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Activity Log Stream */}
      <div className="border border-zinc-800 rounded overflow-hidden text-xs">
        <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>ACTIVITY TELEMETRY & CONSOLE: {selectedActivity.name}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {selectedActivity.logs.length} entries
          </span>
        </div>

        <div className="p-3 bg-black/60 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
          {selectedActivity.logs.map((log, i) => (
            <div key={i} className="text-zinc-300 leading-relaxed">
              <span className="text-zinc-600 select-none mr-2">{i + 1}.</span>
              <span>{log}</span>
            </div>
          ))}
          {selectedActivity.state === 'running' && (
            <div className="text-cyan-400 animate-pulse">
              &gt; Streaming AST and cross-file references...
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_coverage')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
        >
          ← Coverage Ledger
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_scenarios')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition font-mono"
          >
            Audit Scenarios
          </button>
          <button
            onClick={() => onNavigate('audit_verification')}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
            }`}
          >
            <span>Proceed to Manager Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
