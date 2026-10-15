import React from 'react';
import { AuditScenarioDefinition, AuditScreen } from '../../../types/auditContract';
import { AUDIT_SCENARIOS } from '../../../data/auditScenarios';
import { Play, CheckCircle2, AlertTriangle, ShieldAlert, XCircle, Clock, ArrowRight } from 'lucide-react';

interface AuditScreenScenariosProps {
  noColor: boolean;
  onApplyScenario: (scenario: AuditScenarioDefinition) => void;
  onNavigate: (screen: AuditScreen) => void;
}

export const AuditScreenScenarios: React.FC<AuditScreenScenariosProps> = ({
  noColor,
  onApplyScenario,
  onNavigate,
}) => {
  const getTagBadge = (tag: string) => {
    if (noColor) {
      return 'border border-zinc-500 font-mono text-[10px] uppercase text-zinc-200';
    }
    switch (tag) {
      case 'SUCCESS':
        return 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold';
      case 'PARTIAL':
        return 'bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold';
      case 'CANCELLED':
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono';
      case 'AUTH_BLOCKED':
      case 'STALE_SHA':
      case 'INVALID_REPO':
      case 'PLAN_REJECTED':
        return 'bg-red-950 text-red-300 border border-red-800/60 font-bold';
      case 'HALLUCINATIONS':
      default:
        return 'bg-purple-950 text-purple-300 border border-purple-800/60 font-bold';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            FULL REPOSITORY AUDIT: 8 DETERMINISTIC SIMULATION SCENARIOS
          </h2>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Independent Jules G06 Test Matrix
        </div>
      </div>

      {/* Intro info box */}
      <div className={`p-3 rounded border text-xs ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-cyan-900/40 bg-cyan-950/20 text-cyan-200'
      }`}>
        <p className="text-[11px] leading-relaxed">
          Select any of the 8 simulated edge scenarios below to immediately configure the repository snapshot, Jules API connection,
          plan approval state, worker failure modes, and manager verification ledger.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {AUDIT_SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="p-3.5 rounded border border-zinc-800 bg-black/40 hover:bg-zinc-900/50 transition flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-zinc-200 text-xs">{scenario.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${getTagBadge(scenario.tag)}`}>
                  {scenario.tag}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[220px]">
                Target: {scenario.initialScreen}
              </span>

              <button
                onClick={() => onApplyScenario(scenario)}
                data-testid={`simulate-${scenario.id}`}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                  noColor
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_repo')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition font-mono"
        >
          ← Repository Selection
        </button>

        <button
          onClick={() => onNavigate('audit_report')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition font-mono"
        >
          View AUDIT.md Preview →
        </button>
      </div>
    </div>
  );
};
