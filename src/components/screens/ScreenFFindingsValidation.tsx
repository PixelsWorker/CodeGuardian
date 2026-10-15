import React, { useState } from 'react';
import { ActiveScreen, ReviewFinding } from '../../types/contract';
import { SYNTHETIC_FINDINGS } from '../../data/mockFixtures';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  AlertTriangle, 
  ArrowRight, 
  Filter, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface ScreenFFindingsValidationProps {
  noColor: boolean;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenFFindingsValidation: React.FC<ScreenFFindingsValidationProps> = ({
  noColor,
  onNavigate,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'accepted' | 'rejected'>('all');

  const filteredFindings = SYNTHETIC_FINDINGS.filter((f) => {
    if (filterState === 'accepted') return f.verification !== 'rejected';
    if (filterState === 'rejected') return f.verification === 'rejected';
    return true;
  });

  const acceptedCount = SYNTHETIC_FINDINGS.filter((f) => f.verification !== 'rejected').length;
  const rejectedCount = SYNTHETIC_FINDINGS.filter((f) => f.verification === 'rejected').length;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian validate --run-id=demo-0042</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">DETERMINISTIC MANAGER PIPELINE</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen F — Manager Validation & Deduplication
        </h2>
        <p className="text-[11px] text-zinc-400">
          The deterministic CodeGuardian Manager audits raw specialist outputs, removes duplicates, validates line hunks, and assigns final severity.
        </p>
      </div>

      {/* Manager Pipeline Architecture Summary */}
      <div className={`p-3 rounded border text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono ${
        noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
      }`}>
        <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">INBOUND CANDIDATES</span>
          <span className="text-base font-bold text-cyan-400">{SYNTHETIC_FINDINGS.length}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">From 4 specialist lanes</span>
        </div>
        <div className="p-2 rounded bg-zinc-950 border border-emerald-900/40">
          <span className="text-zinc-500 block text-[10px]">ACCEPTED & VERIFIED</span>
          <span className="text-base font-bold text-emerald-400">{acceptedCount}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Anchored in PR diff hunks</span>
        </div>
        <div className="p-2 rounded bg-zinc-950 border border-red-900/40">
          <span className="text-zinc-500 block text-[10px]">FILTERED / REJECTED</span>
          <span className="text-base font-bold text-amber-400">{rejectedCount}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">1 duplicate, 1 out-of-diff</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400">Filter:</span>
          {(['all', 'accepted', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterState(tab)}
              className={`px-2 py-0.5 rounded text-[11px] transition capitalize ${
                filterState === tab
                  ? 'bg-zinc-800 text-cyan-300 font-bold border border-cyan-800'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab} ({tab === 'all' ? SYNTHETIC_FINDINGS.length : tab === 'accepted' ? acceptedCount : rejectedCount})
            </button>
          ))}
        </div>
        <span className="text-[10px] text-zinc-500">
          Fingerprint stable hash deduplication active
        </span>
      </div>

      {/* Validated Findings List */}
      <div className="space-y-2">
        {filteredFindings.map((finding) => {
          const isRejected = finding.verification === 'rejected';

          return (
            <div
              key={finding.id}
              className={`p-3 rounded border text-xs transition ${
                isRejected
                  ? noColor ? 'border-zinc-800 bg-zinc-950 opacity-75' : 'border-zinc-800 bg-zinc-950/70 opacity-80'
                  : noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40 hover:border-zinc-700'
              }`}
            >
              {/* Finding header */}
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    finding.severity === 'P1'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : finding.severity === 'P2'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    [{finding.severity}]
                  </span>
                  <span className="font-bold text-zinc-200">
                    {finding.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-zinc-500">
                    Source: <code className="text-zinc-300">{finding.source_workers.join(', ')}</code>
                  </span>
                  {isRejected ? (
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                      REJECTED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      VERIFIED_DIFF
                    </span>
                  )}
                </div>
              </div>

              {/* Location and Diff side */}
              <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center gap-3">
                <span className="text-cyan-300">{finding.path}:{finding.line ?? 'N/A'}</span>
                <span className="text-zinc-500">Side: {finding.side ?? 'None'}</span>
                <span className="text-zinc-500">Confidence: <strong className="text-zinc-300">{finding.confidence}</strong></span>
              </div>

              {/* Finding details */}
              <div className="space-y-1 text-[11px] text-zinc-300 font-mono bg-zinc-950/70 p-2 rounded border border-zinc-900">
                <div><strong className="text-zinc-500">Evidence:</strong> {finding.evidence}</div>
                <div><strong className="text-zinc-500">Impact:</strong> {finding.impact}</div>
                <div><strong className="text-zinc-500">Recommendation:</strong> {finding.recommendation}</div>
                {finding.rejection_reason && (
                  <div className="text-red-400 pt-1 border-t border-zinc-900 mt-1 font-semibold">
                    ✕ Manager Decision: {finding.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
        <button
          onClick={() => onNavigate('multi_agent')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Back to Specialist Lanes
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          View Consolidated Report & JSON
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
