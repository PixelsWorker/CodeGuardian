import React, { useState, useEffect } from 'react';
import { ActiveScreen, WorkerRole, WorkerState, WorkerInfo } from '../../types/contract';
import { 
  Shield, 
  Cpu, 
  Layers, 
  Gauge, 
  Clock, 
  RotateCcw, 
  XOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';

interface ScreenEMultiAgentProps {
  noColor: boolean;
  workers: Record<WorkerRole, WorkerInfo>;
  setWorkers: React.Dispatch<React.SetStateAction<Record<WorkerRole, WorkerInfo>>>;
  onNavigate: (screen: ActiveScreen) => void;
  onCancelAll: () => void;
  onRetryLane: (role: WorkerRole) => void;
  onRunValidation: () => void;
}

export const ScreenEMultiAgent: React.FC<ScreenEMultiAgentProps> = ({
  noColor,
  workers,
  setWorkers,
  onNavigate,
  onCancelAll,
  onRetryLane,
  onRunValidation,
}) => {
  const [activeLogRole, setActiveLogRole] = useState<WorkerRole | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Check overall states
  const workerList = Object.values(workers);
  const allCompleted = workerList.every((w) => ['complete', 'failed', 'timed_out', 'skipped', 'cancelled'].includes(w.state));
  const hasFailures = workerList.some((w) => ['failed', 'timed_out'].includes(w.state));
  const hasRunning = workerList.some((w) => w.state === 'running');
  const isCancelled = workerList.every((w) => w.state === 'cancelled');

  // Interactive simulated step-by-step progress advancement
  const handleStartDeterministicRun = () => {
    setIsSimulating(true);
    // Reset to running
    setWorkers((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WorkerRole[]).forEach((role) => {
        next[role] = {
          ...next[role],
          state: 'running',
          progress: 10,
          elapsedMs: 250,
          findingsCount: 0,
        };
      });
      return next;
    });

    // Step 1: Security & Logic advance
    setTimeout(() => {
      setWorkers((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          progress: 55,
          elapsedMs: 820,
          currentActivity: "Inspecting HMAC key initialization in src/auth/token.ts...",
          logs: [...prev.security.logs, "[00:00.82] Found static secret fallback candidate at line 45"],
          findingsCount: 1,
        },
        logic: {
          ...prev.logic,
          progress: 60,
          elapsedMs: 850,
          currentActivity: "Analyzing AST dereference paths in src/demo.ts...",
          logs: [...prev.logic.logs, "[00:00.85] Potential null dereference on optional header param"],
          findingsCount: 1,
        },
      }));
    }, 600);

    // Step 2: Architecture & Quality
    setTimeout(() => {
      setWorkers((prev) => ({
        ...prev,
        architecture: {
          ...prev.architecture,
          progress: 80,
          elapsedMs: 1420,
          currentActivity: "Auditing sessionStore lifecycle and Redis connection timeouts...",
          logs: [...prev.architecture.logs, "[00:01.42] Unbounded Map structure detected in session cache"],
          findingsCount: 2,
        },
        quality: {
          ...prev.quality,
          progress: 75,
          elapsedMs: 1350,
          currentActivity: "Verifying test fixtures and duplicate logic rules...",
          logs: [...prev.quality.logs, "[00:01.35] Recommending unit test coverage on token fallback"],
          findingsCount: 1,
        },
      }));
    }, 1200);

    // Step 3: Completion
    setTimeout(() => {
      setWorkers((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          state: 'complete',
          progress: 100,
          elapsedMs: 1840,
          currentActivity: "Audit finished. 2 candidates submitted to Manager.",
          findingsCount: 2,
        },
        logic: {
          ...prev.logic,
          state: 'complete',
          progress: 100,
          elapsedMs: 1620,
          currentActivity: "AST traversal finished. 1 candidate submitted to Manager.",
          findingsCount: 1,
        },
        architecture: {
          ...prev.architecture,
          state: 'complete',
          progress: 100,
          elapsedMs: 2100,
          currentActivity: "System integrity pass complete. 2 candidates submitted to Manager.",
          findingsCount: 2,
        },
        quality: {
          ...prev.quality,
          state: 'complete',
          progress: 100,
          elapsedMs: 1750,
          currentActivity: "Diff boundary pass complete. 1 candidate submitted to Manager.",
          findingsCount: 1,
        },
      }));
      setIsSimulating(false);
    }, 1900);
  };

  const getWorkerIcon = (role: WorkerRole) => {
    switch (role) {
      case "security":
        return <Shield className="w-4 h-4 text-red-400" />;
      case "logic":
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case "architecture":
        return <Layers className="w-4 h-4 text-purple-400" />;
      case "quality":
        return <Gauge className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStateBadge = (state: WorkerState) => {
    if (noColor) {
      switch (state) {
        case "complete":
          return <span className="font-bold text-zinc-100">[COMPLETE]</span>;
        case "running":
          return <span className="font-bold text-zinc-300">[RUNNING]</span>;
        case "failed":
          return <span className="font-bold text-zinc-400">[FAILED]</span>;
        case "timed_out":
          return <span className="font-bold text-zinc-400">[TIMED OUT]</span>;
        case "cancelled":
          return <span className="font-bold text-zinc-500">[CANCELLED]</span>;
        case "skipped":
          return <span className="font-bold text-zinc-500">[SKIPPED]</span>;
        case "queued":
        default:
          return <span className="font-mono text-zinc-500">[QUEUED]</span>;
      }
    }

    switch (state) {
      case "complete":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">[COMPLETE]</span>;
      case "running":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">[RUNNING]</span>;
      case "failed":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">[FAILED]</span>;
      case "timed_out":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">[TIMED OUT]</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">[CANCELLED]</span>;
      case "skipped":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">[SKIPPED]</span>;
      case "queued":
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">[QUEUED]</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian review --workers=4</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">DETERMINISTIC SIMULATION</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <h2 className="text-sm font-bold text-zinc-200">
            Screen E — Multi-Agent Specialist Activity Lanes
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDeterministicRun}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-bold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Re-run Simulation
            </button>
            <button
              onClick={onCancelAll}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-950/60 hover:text-red-300 text-zinc-400 border border-zinc-700 text-[11px] flex items-center gap-1 transition"
            >
              <XOctagon className="w-3 h-3" />
              Cancel [Ctrl+C]
            </button>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400">
          Four independent CodeGuardianMini specialist agents execute bounded prompts against PR hunks.
        </p>
      </div>

      {/* Specialist Lanes */}
      <div className="space-y-2.5">
        {(Object.keys(workers) as WorkerRole[]).map((role) => {
          const w = workers[role];
          const isExpanded = activeLogRole === role;

          return (
            <div
              key={role}
              className={`rounded border transition ${
                noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
              }`}
            >
              {/* Lane Header */}
              <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                    {getWorkerIcon(role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-100">
                        {w.displayName}
                      </span>
                      {getStateBadge(w.state)}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-[320px] sm:max-w-md mt-0.5">
                      {w.currentActivity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {/* Candidates */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">CANDIDATES</span>
                    <span className="font-bold text-cyan-400">{w.findingsCount}</span>
                  </div>

                  {/* Elapsed */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">TIME</span>
                    <span className="text-zinc-300">{(w.elapsedMs / 1000).toFixed(1)}s</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {['failed', 'timed_out'].includes(w.state) && (
                      <button
                        onClick={() => onRetryLane(role)}
                        className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 text-[10px] font-bold"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => setActiveLogRole(isExpanded ? null : role)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                      title="Inspect worker stdout logs"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-zinc-900 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    w.state === 'failed' || w.state === 'timed_out'
                      ? 'bg-red-500'
                      : w.state === 'cancelled'
                      ? 'bg-zinc-600'
                      : noColor
                      ? 'bg-zinc-300'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  }`}
                  style={{ width: `${w.progress}%` }}
                />
              </div>

              {/* Collapsible Log Stream Drawer */}
              {isExpanded && (
                <div className="p-3 bg-zinc-950 border-t border-zinc-800/80 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-zinc-900">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      SPECIALIST DIAGNOSTIC STREAM: {role.toUpperCase()}
                    </span>
                    <span>Role isolation active • No GitHub token mounted</span>
                  </div>
                  {w.logs.length > 0 ? (
                    w.logs.map((log, idx) => (
                      <div key={idx} className="text-zinc-400 hover:text-zinc-200">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-600 italic">No output logged yet.</div>
                  )}
                  {w.failureReason && (
                    <div className="mt-1 text-red-400 font-bold bg-red-950/30 p-1.5 rounded border border-red-900/50">
                      Error: {w.failureReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Execution Summary & Validation Trigger */}
      <div className={`p-3 rounded border text-xs flex flex-wrap items-center justify-between gap-3 ${
        isCancelled
          ? 'border-zinc-700 bg-zinc-900 text-zinc-400'
          : hasFailures
          ? 'border-amber-900/60 bg-amber-950/20 text-amber-200'
          : allCompleted
          ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-200'
          : 'border-cyan-900/60 bg-cyan-950/20 text-cyan-200'
      }`}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 flex-shrink-0" />
          <span>
            {isCancelled
              ? 'Execution cancelled by operator. No findings forwarded.'
              : hasFailures
              ? 'Notice: 1 or more specialist lanes encountered an error. Run will yield a PARTIAL report.'
              : allCompleted
              ? 'All specialists finished. 6 candidate findings ready for Manager deduplication and validation.'
              : 'Specialist lanes in progress... (Deterministic demo updates active)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('inspection')}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
          >
            Back
          </button>
          <button
            disabled={isCancelled}
            onClick={onRunValidation}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              !isCancelled
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer shadow-sm'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Run Manager Validation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
