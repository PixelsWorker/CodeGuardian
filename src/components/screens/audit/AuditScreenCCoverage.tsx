import React, { useState } from 'react';
import { RepositoryAuditCoverage, AuditCoverageLevel, AuditScreen } from '../../../types/auditContract';
import { 
  CheckCheck, 
  Layers, 
  Filter, 
  HelpCircle, 
  Ban, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface AuditScreenCCoverageProps {
  noColor: boolean;
  coverageLedger: RepositoryAuditCoverage[];
  onNavigate: (screen: AuditScreen) => void;
}

export const AuditScreenCCoverage: React.FC<AuditScreenCCoverageProps> = ({
  noColor,
  coverageLedger,
  onNavigate,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AuditCoverageLevel | 'all'>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const modules = Array.from(new Set(coverageLedger.map((c) => c.module)));

  const countByLevel: Record<AuditCoverageLevel, number> = {
    independently_verified: coverageLedger.filter((c) => c.level === 'independently_verified').length,
    context_analyzed: coverageLedger.filter((c) => c.level === 'context_analyzed').length,
    inspected: coverageLedger.filter((c) => c.level === 'inspected').length,
    inventoried: coverageLedger.filter((c) => c.level === 'inventoried').length,
    excluded: coverageLedger.filter((c) => c.level === 'excluded').length,
    unknown: coverageLedger.filter((c) => c.level === 'unknown').length,
  };

  const filteredItems = coverageLedger.filter((item) => {
    if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;
    if (selectedModule !== 'all' && item.module !== selectedModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.path.toLowerCase().includes(q) || item.module.toLowerCase().includes(q);
    }
    return true;
  });

  const getBadgeStyle = (level: AuditCoverageLevel) => {
    if (noColor) {
      return 'border border-zinc-500 text-zinc-200';
    }
    switch (level) {
      case 'independently_verified':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold';
      case 'context_analyzed':
        return 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold';
      case 'inspected':
        return 'bg-blue-950/80 text-blue-300 border border-blue-700/60';
      case 'inventoried':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-600';
      case 'excluded':
        return 'bg-amber-950/60 text-amber-300 border border-amber-800/60';
      case 'unknown':
      default:
        return 'bg-red-950/80 text-red-300 border border-red-700/60 font-bold';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW C: REPOSITORY COVERAGE LEDGER (6 TIERS)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Audited Snapshot: 3c9db33177</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
            {coverageLedger.length} tracked items
          </span>
        </div>
      </div>

      {/* Mandatory Governance Invariant */}
      <div className={`p-3 rounded border text-xs space-y-1 ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-cyan-900/40 bg-cyan-950/20 text-cyan-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>CANONICAL COVERAGE RULE (API-CONTRACT §8 RULE 3)</span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed">
          A file listed in Git is only <strong>inventoried</strong>. Promote coverage to inspected, context-analyzed, or independently-verified 
          only with independently verifiable evidence. Excluded files and unknown gaps must remain explicitly recorded.
        </p>
      </div>

      {/* 6-Level Counter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 text-xs font-mono">
        <button
          onClick={() => setSelectedLevel('independently_verified')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'independently_verified'
              ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Tier 4</div>
          <div className="font-bold text-emerald-400">{countByLevel.independently_verified} Verified</div>
          <div className="text-[9px] text-zinc-500 truncate">Manager validated</div>
        </button>

        <button
          onClick={() => setSelectedLevel('context_analyzed')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'context_analyzed'
              ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Tier 3</div>
          <div className="font-bold text-cyan-400">{countByLevel.context_analyzed} Analyzed</div>
          <div className="text-[9px] text-zinc-500 truncate">Call trees & scopes</div>
        </button>

        <button
          onClick={() => setSelectedLevel('inspected')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'inspected'
              ? 'border-blue-500 bg-blue-950/50 text-blue-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Tier 2</div>
          <div className="font-bold text-blue-400">{countByLevel.inspected} Inspected</div>
          <div className="text-[9px] text-zinc-500 truncate">AST syntax parse</div>
        </button>

        <button
          onClick={() => setSelectedLevel('inventoried')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'inventoried'
              ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Tier 1</div>
          <div className="font-bold text-zinc-300">{countByLevel.inventoried} Inventoried</div>
          <div className="text-[9px] text-zinc-500 truncate">Git index only</div>
        </button>

        <button
          onClick={() => setSelectedLevel('excluded')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'excluded'
              ? 'border-amber-500 bg-amber-950/50 text-amber-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Excluded</div>
          <div className="font-bold text-amber-400">{countByLevel.excluded} Excluded</div>
          <div className="text-[9px] text-zinc-500 truncate">Filtered scopes</div>
        </button>

        <button
          onClick={() => setSelectedLevel('unknown')}
          className={`p-2 rounded border text-left transition ${
            selectedLevel === 'unknown'
              ? 'border-red-500 bg-red-950/50 text-red-200'
              : 'border-zinc-800 bg-black/40 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="text-[10px] text-zinc-500">Gap</div>
          <div className="font-bold text-red-400">{countByLevel.unknown} Unknown</div>
          <div className="text-[9px] text-zinc-500 truncate">Uninspected gap</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by path or module..."
            className="w-full bg-transparent border-none outline-none text-xs text-zinc-200 font-mono placeholder:text-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Module Selector */}
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-zinc-500">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-black/60 border border-zinc-700 text-zinc-300 rounded px-1.5 py-0.5 text-xs cursor-pointer"
            >
              <option value="all">All Modules ({coverageLedger.length})</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {selectedLevel !== 'all' && (
            <button
              onClick={() => setSelectedLevel('all')}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono"
            >
              Reset Level Filter
            </button>
          )}
        </div>
      </div>

      {/* Coverage Table */}
      <div className="border border-zinc-800 rounded overflow-hidden text-xs">
        <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>COVERAGE LEDGER ({filteredItems.length} MATCHING)</span>
            {selectedLevel !== 'all' && (
              <span className="text-cyan-400 font-mono text-[11px]">Filter: {selectedLevel}</span>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Click row to view citations</span>
        </div>

        <div className="divide-y divide-zinc-800/60 font-mono max-h-[380px] overflow-y-auto bg-black/20">
          {filteredItems.map((item) => {
            const isExpanded = expandedFile === item.path;
            return (
              <div key={item.path} className="transition">
                <div
                  onClick={() => setExpandedFile(isExpanded ? null : item.path)}
                  className="px-3 py-2 flex items-center justify-between hover:bg-zinc-900/50 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    )}
                    <span className="text-zinc-200 font-medium truncate">{item.path}</span>
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">({item.line_count} lines)</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-zinc-500 hidden md:inline">{item.module}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getBadgeStyle(item.level)}`}>
                      {item.level.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Expanded Verification Evidence Drawer */}
                {isExpanded && (
                  <div className="px-6 py-2.5 bg-zinc-950/80 border-t border-b border-zinc-800/80 text-[11px] space-y-2">
                    <div className="font-semibold text-zinc-300 flex items-center justify-between">
                      <span>AUDIT EVIDENCE & VERIFICATION CITATIONS:</span>
                      <span className="text-zinc-500 text-[10px]">Module: {item.module}</span>
                    </div>

                    {item.evidence_references.length > 0 ? (
                      <div className="space-y-1">
                        {item.evidence_references.map((ev, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-400 italic">
                        {item.exclusion_or_unknown_reason || 'No independent verification evidence collected yet.'}
                      </div>
                    )}

                    {item.exclusion_or_unknown_reason && item.evidence_references.length > 0 && (
                      <div className="text-amber-400 text-[10px]">
                        <strong>Exclusion Note:</strong> {item.exclusion_or_unknown_reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_preflight')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
        >
          ← Preflight Checks
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_verification')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
          >
            Manager Verification
          </button>
          <button
            onClick={() => onNavigate('audit_activity')}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
            }`}
          >
            <span>View Jules Audit Activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
