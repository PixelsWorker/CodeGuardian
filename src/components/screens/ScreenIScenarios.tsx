import React from 'react';
import { SCENARIOS } from '../../data/scenarios';
import { ScenarioDefinition, ActiveScreen } from '../../types/contract';
import { ArrowRight, Play, CheckCircle2, AlertTriangle, ShieldX, Clock } from 'lucide-react';

interface ScreenIScenariosProps {
  noColor: boolean;
  onApplyScenario: (scenario: ScenarioDefinition) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenIScenarios: React.FC<ScreenIScenariosProps> = ({
  noColor,
  onApplyScenario,
  onNavigate,
}) => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian test-suite --all-scenarios</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">11 VERIFIED TEST CASES</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen I — Failure, Edge Cases & Recovery Scenarios
        </h2>
        <p className="text-[11px] text-zinc-400">
          Explore all 11 required user journeys including edge cases, auth denial, stale commits, partial worker failures, and cancellations.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className={`p-3 rounded border flex flex-col justify-between transition ${
              noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1 font-mono">
                <span className="font-bold text-xs text-zinc-100">
                  {sc.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-cyan-300 border border-zinc-700">
                  {sc.tag}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {sc.description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-zinc-950/80 p-1.5 rounded border border-zinc-900">
                <span className="text-zinc-500">Expected:</span> {sc.expectedOutcome}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-zinc-500 font-mono">
                Initial: <code className="text-zinc-400">{sc.initialScreen}</code>
              </span>
              <button
                onClick={() => onApplyScenario(sc)}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" />
                Run Scenario
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
        <button
          onClick={() => onNavigate('welcome')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};
