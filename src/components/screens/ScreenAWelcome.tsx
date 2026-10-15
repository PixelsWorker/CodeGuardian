import React from 'react';
import { ActiveScreen } from '../../types/contract';
import { 
  Play, 
  Key, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FolderTree, 
  ShieldCheck, 
  Layers, 
  GitPullRequest, 
  Cpu 
} from 'lucide-react';

interface ScreenAWelcomeProps {
  noColor: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onRunDefaultDemo: () => void;
  onLaunchRepoAudit?: () => void;
}

export const ScreenAWelcome: React.FC<ScreenAWelcomeProps> = ({
  noColor,
  onNavigate,
  onRunDefaultDemo,
  onLaunchRepoAudit,
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
        <div className="mt-2 text-xs text-zinc-400 flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2 gap-2">
          <span>Unified Code Integrity Platform: Multi-Agent PR Review & Full Repository Audit</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-semibold">[G00 PR REVIEW]</span>
            <span className="font-mono text-amber-400 font-semibold">[G06 REPO AUDIT]</span>
          </div>
        </div>
      </div>

      {/* Two Primary Interactive Workflows Banner */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>SELECT ACTIVE WORKFLOW</span>
          <span className="text-[10px] text-zinc-500 font-normal">Independent contract boundaries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Workflow 1: Pull Request Review */}
          <div className={`p-4 rounded-lg border flex flex-col justify-between space-y-3 transition group ${
            noColor
              ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
              : 'border-cyan-500/40 bg-cyan-950/20 hover:border-cyan-400/80 hover:bg-cyan-950/30 text-zinc-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                  <GitPullRequest className="w-4 h-4 text-cyan-400" />
                  <span>1. Review Pull Request</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono font-bold">
                  G00-G03 MVP
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Codex multi-agent PR review capability. Simulates 4 specialist lanes (Security, Logic, Architecture, Quality) with diff-anchored validation, P0-P3 severity breakdown, and confirmation-gated GitHub <code className="text-cyan-300 font-mono">COMMENT</code> review publication.
              </p>
              <div className="font-mono text-[10px] text-zinc-500 space-y-0.5 pt-1">
                <div>• Target: Diff hunks & changed lines</div>
                <div>• Engine: OpenAI Codex specialist workers</div>
                <div>• Safety: Stale-SHA refusal & one-time approval nonce</div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                onClick={onRunDefaultDemo}
                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition ${
                  noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Full Review Demo (PR #42)</span>
              </button>
              <button
                onClick={() => onNavigate('scenarios')}
                className="text-xs text-zinc-400 hover:text-cyan-300 font-mono"
              >
                11 PR Scenarios →
              </button>
            </div>
          </div>

          {/* Workflow 2: Full Repository Audit */}
          <div className={`p-4 rounded-lg border flex flex-col justify-between space-y-3 transition group ${
            noColor
              ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
              : 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400/80 hover:bg-amber-950/30 text-zinc-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <FolderTree className="w-4 h-4 text-amber-400" />
                  <span>2. Audit Full Repository</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/60 text-[10px] font-mono font-bold">
                  G06 PROPOSED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Proposed Google Jules repository-wide auditing capability. Enforces pinned commit SHA verification, operator plan approval gate, 6-level coverage ledger, and independent Manager caller tracing to reject model hallucinations before exporting <code className="text-amber-300 font-mono">AUDIT.md</code>.
              </p>
              <div className="font-mono text-[10px] text-zinc-500 space-y-0.5 pt-1">
                <div>• Target: Pinned full commit snapshot & 38 tracked files</div>
                <div>• Engine: Google Jules (v1alpha) + Manager Verification</div>
                <div>• Safety: Ephemeral sandbox, no PR auto-create, no write tools</div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (onLaunchRepoAudit) {
                    onLaunchRepoAudit();
                  } else {
                    onNavigate('inspection');
                  }
                }}
                className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition ${
                  noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                }`}
                data-testid="launch-repo-audit-btn"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Launch Full Repository Audit</span>
              </button>
              <button
                onClick={() => {
                  if (onLaunchRepoAudit) {
                    onLaunchRepoAudit();
                  }
                }}
                className="text-xs text-zinc-400 hover:text-amber-300 font-mono"
              >
                Audit Views & Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated System Preflight Status Box */}
      <div className={`p-3 rounded border text-xs ${
        noColor 
          ? 'border-zinc-700 bg-zinc-900' 
          : 'border-zinc-800 bg-black/40 text-zinc-300'
      }`}>
        <div className="flex items-center justify-between mb-2 font-bold">
          <span className="text-zinc-200">INTEGRATION PREFLIGHT HEALTH (SIMULATED):</span>
          <span className="text-[10px] text-zinc-500 font-normal">CLI Check: `codeguardian auth status`</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-400">GitHub CLI:</span>
            <span className="text-emerald-400 font-semibold">[READY] alex-dev</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-400">Codex CLI:</span>
            <span className="text-emerald-400 font-semibold">[READY] Token OK</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-400">Google Jules:</span>
            <span className="text-emerald-400 font-semibold">[READY] v1alpha</span>
          </div>
        </div>
      </div>

      {/* Quick Discovery Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => onNavigate('auth')}
          className="p-2.5 rounded text-left border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 transition"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 mb-1">
            <Key className="w-3.5 h-3.5" />
            Auth Preflight
          </div>
          <div className="text-[11px] text-zinc-400">
            Test signed-out, expired session, and device-code views.
          </div>
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="p-2.5 rounded text-left border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 transition"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300 mb-1">
            <FileText className="w-3.5 h-3.5" />
            PR Review Report
          </div>
          <div className="text-[11px] text-zinc-400">
            Inspect P0-P3 findings, Markdown, and API-CONTRACT JSON.
          </div>
        </button>

        <button
          onClick={() => onNavigate('scenarios')}
          className="p-2.5 rounded text-left border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 transition"
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-red-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Edge Test Scenarios
          </div>
          <div className="text-[11px] text-zinc-400">
            Stale SHA, worker timeout, duplicate publish, etc.
          </div>
        </button>
      </div>

      {/* Command Vocabulary Reference */}
      <div className="p-3 rounded border border-zinc-800/80 bg-black/40 text-xs space-y-2">
        <div className="font-bold text-zinc-300 flex items-center justify-between">
          <span>PROPOSED CLI COMMAND VOCABULARY</span>
          <span className="text-[10px] text-zinc-500 font-normal">Simulated terminal execution</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="text-zinc-400">
            <code className="text-cyan-300 font-bold">codeguardian review &lt;PR_URL&gt; --demo</code>
            <span className="text-zinc-500 ml-2">— Run multi-agent review on target pull request</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-amber-300 font-bold">codeguardian audit &lt;OWNER/REPO&gt; --sha &lt;COMMIT_SHA&gt;</code>
            <span className="text-zinc-500 ml-2">— Launch full repository audit with pinned snapshot</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-zinc-300 font-bold">codeguardian auth status</code>
            <span className="text-zinc-500 ml-2">— Inspect GitHub, Codex, and Google Jules credentials</span>
          </div>
          <div className="text-zinc-400">
            <code className="text-zinc-300 font-bold">codeguardian report &lt;RUN_ID&gt; --format markdown|json</code>
            <span className="text-zinc-500 ml-2">— Display consolidated findings</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-[11px] text-zinc-500 flex flex-wrap items-center justify-between border-t border-zinc-900 pt-2 font-mono">
        <span>Shortcuts: <strong className="text-zinc-400">[1-9]</strong> PR Screens • <strong className="text-zinc-400">[A-F]</strong> Audit Views • <strong className="text-zinc-400">[?]</strong> Docs</span>
        <span className="text-amber-500/80">SAFE SYNTHETIC PROTOTYPE • NO SECRET TOKENS STORED</span>
      </div>
    </div>
  );
};
