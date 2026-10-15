import React, { useState } from 'react';
import { ActiveScreen } from '../../types/contract';
import { 
  SYNTHETIC_CANONICAL_REPORT, 
  MOCK_MARKDOWN_REPORT 
} from '../../data/mockFixtures';
import { 
  FileText, 
  Code2, 
  Eye, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface ScreenGReportProps {
  noColor: boolean;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenGReport: React.FC<ScreenGReportProps> = ({
  noColor,
  onNavigate,
}) => {
  const [formatView, setFormatView] = useState<'terminal' | 'markdown' | 'json'>('terminal');
  const [copied, setCopied] = useState<boolean>(false);

  const report = SYNTHETIC_CANONICAL_REPORT;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian report {report.run_id} --format {formatView}</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">SIMULATED FIXTURE REPORT</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <h2 className="text-sm font-bold text-zinc-200">
            Screen G — Consolidated Review Report & Contract Inspector
          </h2>
          {/* Format Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setFormatView('terminal')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 text-[11px] ${
                formatView === 'terminal'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              Terminal CLI
            </button>
            <button
              onClick={() => setFormatView('markdown')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 text-[11px] ${
                formatView === 'markdown'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              Markdown
            </button>
            <button
              onClick={() => setFormatView('json')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 text-[11px] ${
                formatView === 'json'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3 h-3" />
              Contract JSON (v1)
            </button>
          </div>
        </div>
      </div>

      {/* Terminal View */}
      {formatView === 'terminal' && (
        <div className="space-y-3 font-mono">
          {/* Terminal Banner */}
          <div className={`p-3 rounded border text-xs ${
            noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2">
              <div>
                <span className="text-zinc-500">Report: </span>
                <strong className="text-cyan-300">{report.run_id}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Status: </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                  [{report.status.toUpperCase()}]
                </span>
              </div>
            </div>

            {/* Target and SHA details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div>
                Target: <strong className="text-zinc-200">{report.pr.owner}/{report.pr.repo}#{report.pr.number}</strong>
              </div>
              <div className="truncate">
                Head: <code className="text-cyan-400">{report.pr.head_sha}</code>
              </div>
            </div>

            {/* Severity Pill Counters */}
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-4 text-xs">
              <span className="text-zinc-500">Findings:</span>
              <span className="text-zinc-500 font-bold">P0 0</span>
              <span className="text-amber-400 font-bold">P1 2</span>
              <span className="text-cyan-400 font-bold">P2 2</span>
              <span className="text-zinc-500 font-bold">P3 0</span>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-2">
            {report.findings.map((finding) => (
              <div
                key={finding.id}
                className={`p-3 rounded border text-xs ${
                  noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      finding.severity === 'P1'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      [{finding.severity}]
                    </span>
                    <span className="font-bold text-zinc-100">{finding.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Source: <code className="text-zinc-300">{finding.source_workers.join(', ')}</code>
                  </span>
                </div>

                <div className="text-[11px] text-cyan-300 mb-1.5">
                  {finding.path}:{finding.line} ({finding.side})
                </div>

                <div className="text-[11px] text-zinc-300 space-y-1 bg-zinc-950 p-2 rounded border border-zinc-900">
                  <div><span className="text-zinc-500">Evidence:</span> {finding.evidence}</div>
                  <div><span className="text-zinc-500">Impact:</span> {finding.impact}</div>
                  <div><span className="text-zinc-500">Recommendation:</span> {finding.recommendation}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Test Status & Warnings Box */}
          <div className="p-3 rounded bg-zinc-950 border border-amber-900/40 text-xs space-y-1.5 text-zinc-400">
            <div className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              INTEGRITY & TEST STATUS CAVEATS
            </div>
            <div>
              • <strong>Tests Executed:</strong> <span className="text-red-400 font-semibold">false</span> (Mock CLI demonstration; no application tests run)
            </div>
            <div>
              • <strong>Report Digest:</strong> <code className="text-zinc-300">{report.report_digest}</code>
            </div>
            <div>
              • <strong>Warnings:</strong> {report.warnings.join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Markdown View */}
      {formatView === 'markdown' && (
        <div className="relative">
          <button
            onClick={() => handleCopy(MOCK_MARKDOWN_REPORT)}
            className="absolute top-2 right-2 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 z-10 font-mono"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
          <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[480px]">
            {MOCK_MARKDOWN_REPORT}
          </pre>
        </div>
      )}

      {/* JSON Schema View */}
      {formatView === 'json' && (
        <div className="relative">
          <button
            onClick={() => handleCopy(JSON.stringify(report, null, 2))}
            className="absolute top-2 right-2 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 z-10 font-mono"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[480px]">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
        <button
          onClick={() => onNavigate('validation')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Back to Validation
        </button>

        <button
          onClick={() => onNavigate('publish')}
          className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          Preview Publication (Dry Run)
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
