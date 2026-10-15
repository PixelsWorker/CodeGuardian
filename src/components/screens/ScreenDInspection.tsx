import React, { useState } from 'react';
import { ActiveScreen } from '../../types/contract';
import { SYNTHETIC_PR_IDENTITY, MOCK_DIFF_FILES } from '../../data/mockFixtures';
import { FileCode, GitCommit, GitBranch, ArrowRight, Shield, AlertOctagon, Terminal } from 'lucide-react';

interface ScreenDInspectionProps {
  noColor: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onStartWorkerRun: () => void;
}

export const ScreenDInspection: React.FC<ScreenDInspectionProps> = ({
  noColor,
  onNavigate,
  onStartWorkerRun,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const activeFile = MOCK_DIFF_FILES[selectedFileIdx];

  return (
    <div className="space-y-4">
      {/* Screen Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian inspect example/demo#42 --fixture</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">NON-SENSITIVE MOCK FIXTURE</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen D — PR Inspection & Diff Surface Analysis
        </h2>
        <p className="text-[11px] text-zinc-400">
          Synthesizes pull request metadata, full-length commit SHAs, changed file list, and risk indicators.
        </p>
      </div>

      {/* Metadata Card */}
      <div className={`p-3 rounded border text-xs ${
        noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold text-[11px]">
              #{SYNTHETIC_PR_IDENTITY.number}
            </span>
            <span className="font-bold text-zinc-100 text-xs sm:text-sm">
              {SYNTHETIC_PR_IDENTITY.title}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Author: <strong className="text-zinc-300">@{SYNTHETIC_PR_IDENTITY.author}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 block text-[10px] flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-cyan-400" />
              BASE (TARGET)
            </span>
            <span className="text-zinc-300 font-semibold">{SYNTHETIC_PR_IDENTITY.base_branch}</span>
            <span className="block text-[10px] text-zinc-500 truncate mt-0.5" title={SYNTHETIC_PR_IDENTITY.base_sha}>
              {SYNTHETIC_PR_IDENTITY.base_sha}
            </span>
          </div>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 block text-[10px] flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-cyan-400" />
              HEAD (INCOMING)
            </span>
            <span className="text-zinc-300 font-semibold">{SYNTHETIC_PR_IDENTITY.head_branch}</span>
            <span className="block text-[10px] text-cyan-400 font-semibold truncate mt-0.5" title={SYNTHETIC_PR_IDENTITY.head_sha}>
              {SYNTHETIC_PR_IDENTITY.head_sha}
            </span>
          </div>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 block text-[10px]">CHANGED STATS</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-emerald-400 font-bold">+{SYNTHETIC_PR_IDENTITY.additions}</span>
              <span className="text-red-400 font-bold">-{SYNTHETIC_PR_IDENTITY.deletions}</span>
              <span className="text-zinc-400">({SYNTHETIC_PR_IDENTITY.changed_files_count} files)</span>
            </div>
          </div>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 block text-[10px]">RISK SURFACE CLASSIFIER</span>
            <span className="text-amber-400 font-bold flex items-center gap-1 mt-0.5">
              <AlertOctagon className="w-3 h-3" />
              HIGH RISK (AUTH & CRYPTO)
            </span>
          </div>
        </div>
      </div>

      {/* Surface Risk Flags */}
      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
        <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          RISK: SENSITIVE_AUTH_PATH (`src/auth/*`)
        </span>
        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
          RISK: NEW_EXTERNAL_DEP (`jsonwebtoken`)
        </span>
        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
          SURFACE: IN_MEMORY_CACHE_STATE
        </span>
      </div>

      {/* Changed Files & Diff Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border border-zinc-800 rounded overflow-hidden">
        {/* Left file sidebar */}
        <div className="md:col-span-4 bg-zinc-950/90 border-r border-zinc-800 p-2 text-xs font-mono space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase px-2 py-1">
            Changed Files ({MOCK_DIFF_FILES.length})
          </div>
          {MOCK_DIFF_FILES.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => setSelectedFileIdx(idx)}
              className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-[11px] transition ${
                selectedFileIdx === idx
                  ? noColor ? 'bg-zinc-800 text-white font-bold' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <span className="truncate flex items-center gap-1.5">
                <FileCode className="w-3 h-3 flex-shrink-0" />
                {file.path}
              </span>
              <span className="text-[10px] text-zinc-500 flex-shrink-0 ml-1">
                +{file.additions} -{file.deletions}
              </span>
            </button>
          ))}
        </div>

        {/* Right side diff preview */}
        <div className="md:col-span-8 bg-zinc-950 p-3 text-xs font-mono overflow-x-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2 text-[11px]">
            <span className="text-zinc-300 font-semibold">{activeFile.path}</span>
            <span className="text-zinc-500">Unified Hunk View</span>
          </div>

          <pre className="text-[11px] leading-relaxed overflow-x-auto">
            {activeFile.hunk.split('\n').map((line, idx) => {
              let lineClass = 'text-zinc-400';
              if (line.startsWith('+')) {
                lineClass = noColor ? 'text-zinc-100 font-bold' : 'text-emerald-400 bg-emerald-950/20';
              } else if (line.startsWith('-')) {
                lineClass = noColor ? 'text-zinc-500 line-through' : 'text-red-400 bg-red-950/20';
              } else if (line.startsWith('@@')) {
                lineClass = 'text-cyan-400 font-bold';
              }
              return (
                <div key={idx} className={`px-1 rounded ${lineClass}`}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
        <button
          onClick={() => onNavigate('pr_input')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Back to PR Input
        </button>

        <button
          onClick={onStartWorkerRun}
          className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          Launch 4 Specialist Lanes
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
