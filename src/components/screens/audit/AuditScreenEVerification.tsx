import React, { useState } from 'react';
import { RepositoryAuditFinding, AuditVerification, AuditScreen } from '../../../types/auditContract';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  FileCode2, 
  GitCommit, 
  ArrowRight, 
  Network, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';

interface AuditScreenEVerificationProps {
  noColor: boolean;
  findings: RepositoryAuditFinding[];
  onNavigate: (screen: AuditScreen) => void;
}

export const AuditScreenEVerification: React.FC<AuditScreenEVerificationProps> = ({
  noColor,
  findings,
  onNavigate,
}) => {
  const [selectedTab, setSelectedTab] = useState<AuditVerification | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(findings[0]?.id || null);

  const verifiedCount = findings.filter((f) => f.verification === 'verified').length;
  const rejectedCount = findings.filter((f) => f.verification === 'rejected').length;
  const inconclusiveCount = findings.filter((f) => f.verification === 'inconclusive').length;

  const handleTabSelect = (tab: AuditVerification | 'all') => {
    setSelectedTab(tab);
    if (tab === 'all') {
      setExpandedId(findings[0]?.id || null);
    } else {
      const match = findings.find((f) => f.verification === tab);
      setExpandedId(match ? match.id : null);
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (selectedTab === 'all') return true;
    return f.verification === selectedTab;
  });

  const getVerificationBadge = (v: AuditVerification) => {
    if (noColor) {
      return 'border border-zinc-500 font-mono text-[10px] uppercase text-zinc-200';
    }
    switch (v) {
      case 'verified':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold';
      case 'rejected':
        return 'bg-red-950/80 text-red-300 border border-red-700/60 font-bold';
      case 'inconclusive':
      default:
        return 'bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold';
    }
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'P0':
        return 'bg-red-500 text-black font-bold';
      case 'P1':
        return 'bg-red-950 text-red-300 border border-red-700 font-semibold';
      case 'P2':
        return 'bg-amber-950 text-amber-300 border border-amber-700';
      case 'P3':
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW E: CODEGUARDIAN MANAGER INDEPENDENT VERIFICATION
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Pinned Snapshot: 3c9db33177</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
            {findings.length} claims audited
          </span>
        </div>
      </div>

      {/* Mandatory Verification Constitution */}
      <div className={`p-3 rounded border text-xs space-y-1 ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-cyan-900/40 bg-cyan-950/20 text-cyan-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          <span>INDEPENDENT SOURCE FACT-CHECKING (API-CONTRACT §8 RULE 4)</span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed">
          The final Manager assigns <strong>verified</strong>, <strong>rejected</strong>, or <strong>inconclusive</strong> with documented evidence notes.
          Agreement between model agents is not independent source verification. Every source line quote, symbol declaration, and cross-file caller trace is verified against the pinned Git snapshot.
        </p>
      </div>

      {/* Filter Tabs & Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <button
          onClick={() => handleTabSelect('all')}
          className={`p-2.5 rounded border text-left transition ${
            selectedTab === 'all'
              ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Total Evaluated</div>
          <div className="font-bold text-zinc-200 text-sm">{findings.length} Claims</div>
          <div className="text-[10px] text-zinc-500">Full ledger</div>
        </button>

        <button
          onClick={() => handleTabSelect('verified')}
          className={`p-2.5 rounded border text-left transition ${
            selectedTab === 'verified'
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Verified Findings</div>
          <div className="font-bold text-emerald-400 text-sm">{verifiedCount} Verified</div>
          <div className="text-[10px] text-zinc-500">Source proven</div>
        </button>

        <button
          onClick={() => handleTabSelect('rejected')}
          className={`p-2.5 rounded border text-left transition ${
            selectedTab === 'rejected'
              ? 'border-red-500 bg-red-950/40 text-red-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Hallucinations / Fabrications</div>
          <div className="font-bold text-red-400 text-sm">{rejectedCount} Rejected</div>
          <div className="text-[10px] text-zinc-500">False claims caught</div>
        </button>

        <button
          onClick={() => handleTabSelect('inconclusive')}
          className={`p-2.5 rounded border text-left transition ${
            selectedTab === 'inconclusive'
              ? 'border-amber-500 bg-amber-950/40 text-amber-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Inconclusive Evidence</div>
          <div className="font-bold text-amber-400 text-sm">{inconclusiveCount} Inconclusive</div>
          <div className="text-[10px] text-zinc-500">Requires runtime test</div>
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedId === finding.id;
          return (
            <div
              key={finding.id}
              className={`border rounded-lg overflow-hidden transition ${
                finding.verification === 'verified'
                  ? 'border-zinc-800 bg-zinc-950/60'
                  : finding.verification === 'rejected'
                  ? 'border-red-900/60 bg-red-950/10'
                  : 'border-amber-900/60 bg-amber-950/10'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                className="p-3 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-zinc-900/40"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">
                    {finding.verification === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {finding.verification === 'rejected' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    {finding.verification === 'inconclusive' && <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      <span className="font-mono text-cyan-400 font-semibold">{finding.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-zinc-400 font-mono text-[11px] uppercase">[{finding.category}]</span>
                      <span className="text-zinc-200 font-bold truncate">{finding.title}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <span>Path: <code className="text-zinc-400">{finding.path}</code></span>
                      {finding.line_start && <span>Lines: {finding.line_start}-{finding.line_end}</span>}
                      {finding.affected_symbol && <span>Symbol: <code className="text-amber-300">{finding.affected_symbol}</code></span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getVerificationBadge(finding.verification)}`}>
                    {finding.verification}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Expanded Verification Drawer */}
              {isExpanded && (
                <div className="p-3.5 border-t border-zinc-800/80 bg-black/40 text-xs space-y-3 font-mono">
                  {/* Jules Original Claim */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase">
                      JULES MODEL CLAIM (EMITTED ACTIVITY: {finding.source_activity_id}):
                    </div>
                    <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed">
                      {finding.claim}
                    </div>
                  </div>

                  {/* Quoted Source Evidence */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase">
                      CITED SOURCE CODE EVIDENCE:
                    </div>
                    <pre className="p-2 rounded bg-zinc-950 border border-zinc-800 text-cyan-300 text-[11px] overflow-x-auto">
                      <code>{finding.source_evidence}</code>
                    </pre>
                  </div>

                  {/* Caller Trace */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                      CALLER & DEPENDENCY HIERARCHY TRACE:
                    </div>
                    {finding.affected_callers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {finding.affected_callers.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-[11px]">No callers found in AST dependency graph.</div>
                    )}
                  </div>

                  {/* Manager Independent Fact-Check & Verification Notes */}
                  <div className={`p-2.5 rounded border space-y-1 ${
                    finding.verification === 'verified'
                      ? 'border-emerald-800/60 bg-emerald-950/20 text-emerald-200'
                      : finding.verification === 'rejected'
                      ? 'border-red-800/60 bg-red-950/30 text-red-200'
                      : 'border-amber-800/60 bg-amber-950/30 text-amber-200'
                  }`}>
                    <div className="font-bold flex items-center justify-between text-[11px]">
                      <span>INDEPENDENT MANAGER VERIFICATION VERDICT:</span>
                      <span className="uppercase text-[10px]">Priority: {finding.remediation_priority}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-95">
                      {finding.independent_verification_notes}
                    </p>
                    {finding.conflicting_evidence && (
                      <div className="pt-1 text-[10px] text-red-300 border-t border-red-800/40">
                        <strong>Conflicting Evidence:</strong> {finding.conflicting_evidence}
                      </div>
                    )}
                  </div>

                  {/* Impact & Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 font-bold mb-0.5">Impact:</div>
                      <div className="text-zinc-300">{finding.impact}</div>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 font-bold mb-0.5">Recommendation:</div>
                      <div className="text-zinc-300">{finding.recommendation}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_activity')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
        >
          ← Jules Activity Logs
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_coverage')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
          >
            Coverage Ledger
          </button>
          <button
            onClick={() => onNavigate('audit_report')}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
            }`}
          >
            <span>Preview AUDIT.md Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
