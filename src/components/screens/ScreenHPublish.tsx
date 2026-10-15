import React, { useState } from 'react';
import { ActiveScreen } from '../../types/contract';
import { SYNTHETIC_PR_IDENTITY, SYNTHETIC_CANONICAL_REPORT } from '../../data/mockFixtures';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  RotateCcw, 
  Lock, 
  GitCommit, 
  Info 
} from 'lucide-react';

interface ScreenHPublishProps {
  noColor: boolean;
  staleSha: boolean;
  setStaleSha: (stale: boolean) => void;
  outcomeType: 'normal' | 'denied_permission' | 'stale_head' | 'duplicate_warning';
  setOutcomeType: (type: 'normal' | 'denied_permission' | 'stale_head' | 'duplicate_warning') => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenHPublish: React.FC<ScreenHPublishProps> = ({
  noColor,
  staleSha,
  setStaleSha,
  outcomeType,
  setOutcomeType,
  onNavigate,
}) => {
  const [confirmationState, setConfirmationState] = useState<'prompt' | 'confirmed' | 'cancelled'>('prompt');

  const report = SYNTHETIC_CANONICAL_REPORT;
  const currentPrHead = staleSha 
    ? "cccccccccccccccccccccccccccccccccccccccc" 
    : report.pr.head_sha;

  const isHeadShaMatching = currentPrHead === report.pr.head_sha;

  const handleConfirm = () => {
    setConfirmationState('confirmed');
  };

  const handleCancel = () => {
    setConfirmationState('cancelled');
  };

  const handleReset = () => {
    setConfirmationState('prompt');
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian publish {report.run_id} --dry-run</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">DRY-RUN / ZERO EXTERNAL WRITE</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen H — Publication Preview & Operator Approval Gate
        </h2>
        <p className="text-[11px] text-zinc-400">
          The isolated Publisher client requires human-in-the-loop explicit confirmation. Re-verifies repository identity and head SHA before any prompt.
        </p>
      </div>

      {/* Simulator Scenario Configuration Toolbar */}
      <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
        <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
          Simulate Publisher Safety Gate Condition:
        </span>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <button
            onClick={() => {
              setOutcomeType('normal');
              setStaleSha(false);
              setConfirmationState('prompt');
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              outcomeType === 'normal' && !staleSha
                ? 'bg-zinc-800 border-cyan-500 text-cyan-200 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Valid Publication Flow
          </button>
          <button
            onClick={() => {
              setOutcomeType('stale_head');
              setStaleSha(true);
              setConfirmationState('prompt');
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              staleSha
                ? 'bg-zinc-800 border-amber-500 text-amber-300 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Stale Head SHA (Commit Mismatch)
          </button>
          <button
            onClick={() => {
              setOutcomeType('denied_permission');
              setStaleSha(false);
              setConfirmationState('prompt');
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              outcomeType === 'denied_permission'
                ? 'bg-zinc-800 border-red-500 text-red-300 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Publisher Permission Denied (403)
          </button>
          <button
            onClick={() => {
              setOutcomeType('duplicate_warning');
              setStaleSha(false);
              setConfirmationState('prompt');
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              outcomeType === 'duplicate_warning'
                ? 'bg-zinc-800 border-amber-500 text-amber-300 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Duplicate Comment Blocked
          </button>
        </div>
      </div>

      {/* Prominent Warning Callout */}
      <div className={`p-3 rounded border text-xs font-mono flex items-center gap-2.5 ${
        noColor ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-amber-900/60 bg-amber-950/30 text-amber-300'
      }`}>
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>WARNING: DRY RUN ONLY — NO GITHUB WRITE.</strong> In G00, all approval interactions are local simulations. No comments or approvals are ever posted to GitHub.
        </span>
      </div>

      {/* Publisher Inspection Card */}
      <div className={`p-4 rounded border font-mono text-xs space-y-3 ${
        noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-zinc-500 block text-[10px]">TARGET PR:</span>
            <span className="text-zinc-200 font-bold">{report.pr.owner}/{report.pr.repo}#{report.pr.number}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">ACTION TYPE:</span>
            <span className="text-cyan-400 font-bold">COMMENT ONLY</span>
            <span className="text-[10px] text-zinc-500 ml-2">(Approve / Request Changes forbidden)</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">REPORT DIGEST:</span>
            <code className="text-zinc-300 text-[10px] truncate block">{report.report_digest}</code>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">INLINE COMMENTS:</span>
            <span className="text-zinc-300">0 (Demoted to summary to prevent broken line anchors)</span>
          </div>
        </div>

        {/* SHA Validation Gate */}
        <div className={`p-2.5 rounded border text-[11px] space-y-1 ${
          isHeadShaMatching
            ? 'bg-zinc-950 border-emerald-900/40 text-emerald-300'
            : 'bg-zinc-950 border-red-900/40 text-red-300'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5" />
              HEAD SHA VERIFICATION:
            </span>
            <span>{isHeadShaMatching ? '[MATCHED]' : '[STALE COMMIT MISMATCH]'}</span>
          </div>
          <div>Report Head SHA: <code className="text-zinc-300">{report.pr.head_sha}</code></div>
          <div>Live Target SHA: <code className={isHeadShaMatching ? 'text-emerald-400' : 'text-red-400'}>{currentPrHead}</code></div>
          {!isHeadShaMatching && (
            <div className="text-red-400 font-semibold pt-1 border-t border-red-900/50 mt-1">
              ✕ BLOCKED: A new commit was pushed after review generation. Stale review publication strictly rejected.
            </div>
          )}
        </div>

        {/* Alternate Error Notices */}
        {outcomeType === 'denied_permission' && (
          <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Publisher Error: Permission Denied (403)
            </div>
            <div>The authenticated GitHub user does not possess write/triage comments permission on {report.pr.owner}/{report.pr.repo}.</div>
          </div>
        )}

        {outcomeType === 'duplicate_warning' && (
          <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800 text-amber-300 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Duplicate Publication Prevention (Idempotent Guard)
            </div>
            <div>A review comment with digest <code>{report.report_digest.slice(0, 16)}...</code> already exists on this PR. Duplicate write prevented.</div>
          </div>
        )}

        {/* Interactive Confirmation Area */}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          {confirmationState === 'prompt' && (
            <div className="space-y-2">
              <div className="text-zinc-300 font-semibold">
                Would you authorize publication for this SHA? <span className="text-cyan-400">[y/N]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!isHeadShaMatching || outcomeType === 'denied_permission' || outcomeType === 'duplicate_warning'}
                  onClick={handleConfirm}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                    isHeadShaMatching && outcomeType !== 'denied_permission' && outcomeType !== 'duplicate_warning'
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  Confirm (y)
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancel (N)
                </button>
              </div>
            </div>
          )}

          {confirmationState === 'confirmed' && (
            <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs space-y-2">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                SIMULATED CONFIRMATION — NO GITHUB WRITE PERFORMED
              </div>
              <div className="text-[11px] text-zinc-300">
                In this G00 demonstration, the authorization nonce was verified and consumed locally. No network request was made to api.github.com.
              </div>
              <button
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Prompt
              </button>
            </div>
          )}

          {confirmationState === 'cancelled' && (
            <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs space-y-2">
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-zinc-500" />
                Operation cancelled by operator. No GitHub write performed.
              </div>
              <button
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Prompt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
        <button
          onClick={() => onNavigate('report')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          Back to Report
        </button>

        <button
          onClick={() => onNavigate('scenarios')}
          className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center gap-1.5 transition"
        >
          Explore All 11 Scenarios
        </button>
      </div>
    </div>
  );
};
