import React from 'react';
import { ActiveScreen } from '../../types/contract';
import { Play, Key, FileText, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

interface ScreenAWelcomeProps {
  noColor: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onRunDefaultDemo: () => void;
}

export const ScreenAWelcome: React.FC<ScreenAWelcomeProps> = ({
  noColor,
  onNavigate,
  onRunDefaultDemo,
}) => {
  return (
    <div className="space-y-5">
      {/* ASCII Art Logo and Hero Header */}
      <div className="font-mono select-none">
        <pre className={`text-[11px] sm:text-xs leading-none ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`}>
{`  ____          _        ____                  _ _             
 / ___|___   __| | ___  / ___|_   _  __ _ _ __| (_) __ _ _ __  
| |   / _ \\ / _\` |/ _ \\| |  _| | | |/ _\` | '__| | |/ _\` | '_ \\ 
| |__| (_) | (_| |  __/| |_| | |_| | (_| | |  | | | (_| | | | |
 \\____\\___/ \\__,_|\\___| \\____|\\__,_|\\__,_|_|  |_|_|\\__,_|_| |_|`}
        </pre>
        <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between border-b border-zinc-800 pb-2">
          <span>Multi-Agent GitHub Pull Request Review Platform (CLI UX Exploration)</span>
          <span className="font-mono text-amber-400 font-semibold">[G00 DRAFT SPEC]</span>
        </div>
      </div>

      {/* Simulated System Status Box */}
      <div className={`p-3 rounded border text-xs ${
        noColor 
          ? 'border-zinc-700 bg-zinc-900' 
          : 'border-cyan-900/40 bg-cyan-950/20 text-zinc-300'
      }`}>
        <div className="flex items-center justify-between mb-1.5 font-bold">
          <span className="text-cyan-300">AUTHENTICATION PREFLIGHT (SIMULATED):</span>
          <span className="text-[10px] text-zinc-500 font-normal">Check: `codeguardian auth status`</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-zinc-800">
            <span className="text-zinc-400">GitHub CLI:</span>
            <span className="text-emerald-400 font-semibold">[SIGNED IN] (demo user: alex-dev)</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-zinc-800">
            <span className="text-zinc-400">Codex CLI:</span>
            <span className="text-emerald-400 font-semibold">[SIGNED IN] (device token valid)</span>
          </div>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          PRIMARY SIMULATED WORKFLOWS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={onRunDefaultDemo}
            className={`p-3 rounded text-left border transition flex items-start justify-between group ${
              noColor
                ? 'border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                : 'border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                Launch Full Review Demo (PR #42)
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Runs 4 specialists on <code className="text-cyan-300">example/demo#42</code> with live progress and findings.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 transition transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => onNavigate('auth')}
            className={`p-3 rounded text-left border transition flex items-start justify-between group ${
              noColor
                ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Inspect Auth Preflight Scenarios
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Test signed-out, expired session, and device-code login views.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 opacity-60 group-hover:opacity-100 transition" />
          </button>

          <button
            onClick={() => onNavigate('report')}
            className={`p-3 rounded text-left border transition flex items-start justify-between group ${
              noColor
                ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                View Report & Canonical Schema
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Inspect P0-P3 breakdown, Markdown render, and API-CONTRACT v1 JSON.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 opacity-60 group-hover:opacity-100 transition" />
          </button>

          <button
            onClick={() => onNavigate('scenarios')}
            className={`p-3 rounded text-left border transition flex items-start justify-between group ${
              noColor
                ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Test All 11 Edge Scenarios
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Stale SHA, worker timeout, rate limit, duplicate publication, etc.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 opacity-60 group-hover:opacity-100 transition" />
          </button>
        </div>
      </div>

      {/* Command Vocabulary Reference */}
      <div className="p-3 rounded border border-zinc-800/80 bg-black/40 text-xs space-y-2">
        <div className="font-bold text-zinc-300 flex items-center justify-between">
          <span>PROPOSED CLI COMMAND VOCABULARY</span>
          <span className="text-[10px] text-zinc-500 font-normal">Click to copy/simulate</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian --help</code>
            <span className="text-zinc-500 ml-2">— Display command discovery, options & policy info</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian auth status</code>
            <span className="text-zinc-500 ml-2">— Preflight inspection of GitHub & Codex credentials</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian review &lt;PR_URL&gt; --demo</code>
            <span className="text-zinc-500 ml-2">— Run multi-agent review on target pull request</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian report &lt;RUN_ID&gt; --format markdown|json</code>
            <span className="text-zinc-500 ml-2">— Display consolidated findings</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian publish &lt;RUN_ID&gt; --dry-run</code>
            <span className="text-zinc-500 ml-2">— Preview GitHub review comment with safe confirmation</span>
          </div>
        </div>
      </div>

      {/* Recently Simulated Runs Table & Empty State */}
      <div className="border border-zinc-800/80 rounded overflow-hidden text-xs">
        <div className="px-3 py-2 bg-zinc-900/70 border-b border-zinc-800 text-zinc-400 font-semibold flex items-center justify-between">
          <span>RECENT SIMULATED RUNS</span>
          <span className="text-[10px] text-zinc-500">Local prototype memory</span>
        </div>
        <div className="divide-y divide-zinc-800/60 font-mono text-[11px]">
          <div className="p-2.5 flex items-center justify-between hover:bg-zinc-900/40 transition">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-200 font-semibold">demo-run-0042-7f9a</span>
              <span className="text-zinc-500">example/demo#42</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400">2 P1 | 2 P2</span>
              <span className="text-emerald-400 font-medium">READY</span>
              <button
                onClick={() => onNavigate('report')}
                className="text-cyan-400 hover:underline"
              >
                Inspect →
              </button>
            </div>
          </div>
          <div className="p-2.5 flex items-center justify-between hover:bg-zinc-900/40 transition">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-200 font-semibold">demo-run-0041-part</span>
              <span className="text-zinc-500">example/demo#38</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">1 P1 | 1 P3</span>
              <span className="text-amber-400 font-medium">PARTIAL</span>
              <button
                onClick={() => onNavigate('report')}
                className="text-cyan-400 hover:underline"
              >
                Inspect →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-[11px] text-zinc-500 flex flex-wrap items-center justify-between border-t border-zinc-900 pt-2">
        <span>Keyboard shortcuts: <strong className="text-zinc-400">[1-9]</strong> Screen Jump • <strong className="text-zinc-400">[Enter]</strong> Launch Demo • <strong className="text-zinc-400">[?]</strong> Docs</span>
        <span className="text-amber-500/80">NO GITHUB CREDENTIALS OR API KEYS REQUIRED</span>
      </div>
    </div>
  );
};
