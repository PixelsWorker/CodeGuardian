import React, { useState } from 'react';
import { RepositorySnapshot, AuditScreen } from '../../../types/auditContract';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Clock, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  FileCheck2, 
  SlidersHorizontal 
} from 'lucide-react';

interface AuditScreenBPreflightProps {
  noColor: boolean;
  snapshot: RepositorySnapshot;
  julesAuth: 'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited';
  setJulesAuth: (val: 'authenticated' | 'unauthenticated' | 'expired' | 'rate_limited') => void;
  isShaVerified: boolean;
  setIsShaVerified: (val: boolean) => void;
  planApproved: boolean;
  setPlanApproved: (val: boolean) => void;
  onNavigate: (screen: AuditScreen) => void;
  onApproveAndLaunch: () => void;
}

export const AuditScreenBPreflight: React.FC<AuditScreenBPreflightProps> = ({
  noColor,
  snapshot,
  julesAuth,
  setJulesAuth,
  isShaVerified,
  setIsShaVerified,
  planApproved,
  setPlanApproved,
  onNavigate,
  onApproveAndLaunch,
}) => {
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const isPreflightPassed = julesAuth === 'authenticated' && isShaVerified;

  const handleRejectPlan = () => {
    setPlanApproved(false);
    setRejectionReason('Operator rejected proposed Jules execution plan: token quote and scope exceeded project budget.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW B: PREFLIGHT INTEGRITY & OPERATOR PLAN APPROVAL
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">API: Google Jules v1alpha</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isPreflightPassed
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
              : 'bg-red-950 text-red-300 border border-red-800/60'
          }`}>
            {isPreflightPassed ? 'PREFLIGHT READY' : 'PREFLIGHT BLOCKED'}
          </span>
        </div>
      </div>

      {/* Critical Security Invariant Callout */}
      <div className={`p-3 rounded border text-xs space-y-1 ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-red-900/60 bg-red-950/20 text-red-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-red-300">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>SECURITY TRUST BOUNDARY (ARCHITECTURE D-09)</span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed">
          An audit-only natural language prompt is <strong>NOT</strong> a security sandbox boundary. 
          Google Jules runs in an isolated ephemeral container with <code className="text-red-300 font-mono">AUTO_CREATE_PR = false</code>, 
          disposable read-only repository mirror, and no GitHub write permissions.
        </p>
      </div>

      {/* Preflight Checks Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Jules API Connection & Auth */}
        <div className="p-3 rounded border border-zinc-800 bg-black/40 space-y-2">
          <div className="font-bold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              JULES API CONNECTION (v1alpha)
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setJulesAuth(julesAuth === 'authenticated' ? 'unauthenticated' : 'authenticated')}
                className="text-cyan-400 hover:underline"
              >
                Toggle Auth
              </button>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Endpoint:</span>
              <span className="text-zinc-200">https://jules.googleapis.com/v1alpha</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Status:</span>
              {julesAuth === 'authenticated' && <span className="text-emerald-400 font-bold">[CONNECTED] Authorized Session</span>}
              {julesAuth === 'unauthenticated' && <span className="text-red-400 font-bold">[AUTH_ERROR] Missing GCP Credentials</span>}
              {julesAuth === 'expired' && <span className="text-amber-400 font-bold">[EXPIRED] Refresh Token Required</span>}
              {julesAuth === 'rate_limited' && <span className="text-red-400 font-bold">[429 RATE_LIMIT] Quota Exceeded</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Daily Session Quota:</span>
              <span className="text-zinc-300">12 / 20 remaining</span>
            </div>
          </div>
        </div>

        {/* Snapshot Identity Check */}
        <div className="p-3 rounded border border-zinc-800 bg-black/40 space-y-2">
          <div className="font-bold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              REMOTE SNAPSHOT IDENTITY CHECK
            </span>
            <button
              onClick={() => setIsShaVerified(!isShaVerified)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Simulate Drift
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Intended Commit SHA:</span>
              <span className="text-cyan-400 font-semibold">{snapshot.intended_commit_sha.slice(0, 12)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Remote Branch Head:</span>
              <span className={isShaVerified ? 'text-zinc-300' : 'text-amber-400'}>
                {isShaVerified ? snapshot.intended_commit_sha.slice(0, 12) + '...' : '5d88ab210e44... (DRIFT DETECTED)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">SHA Verification:</span>
              {isShaVerified ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> MATCHED (Pinned)
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> REFUSED (Stale Branch)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Constraints & Sandbox Gates */}
      <div className="p-3 rounded border border-zinc-800 bg-zinc-900/50 space-y-2 text-xs">
        <div className="font-bold text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            OPERATIONAL LIMITS & SANDBOX POLICIES
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Bound: G06 Pilot Constraints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
            <div className="text-zinc-500 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" /> Max Timeout
            </div>
            <div className="text-zinc-200 font-semibold">15m Hard Cap</div>
            <div className="text-[10px] text-zinc-500">Auto-terminates long calls</div>
          </div>

          <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
            <div className="text-zinc-500 flex items-center gap-1 mb-1">
              <Cpu className="w-3 h-3" /> Concurrency
            </div>
            <div className="text-zinc-200 font-semibold">4 Activities Max</div>
            <div className="text-[10px] text-zinc-500">Bounded worker lanes</div>
          </div>

          <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
            <div className="text-zinc-500 flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3 h-3" /> Write Authority
            </div>
            <div className="text-emerald-400 font-semibold">READ ONLY</div>
            <div className="text-[10px] text-zinc-500">PR creation disabled</div>
          </div>
        </div>
      </div>

      {/* Proposed Execution Plan & Operator Approval Gate */}
      <div className={`p-3.5 rounded border space-y-3 text-xs ${
        planApproved 
          ? 'border-emerald-900/60 bg-emerald-950/20' 
          : 'border-zinc-800 bg-black/50'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
              <span>PROPOSED JULES AUDIT PLAN (requirePlanApproval: true)</span>
              {planApproved && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                  OPERATOR APPROVED
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Plan ID: <code className="text-cyan-400 font-mono">plan-jules-g06-20261015-88a4</code> • Target: 38 files • Estimated tokens: 42,500
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!planApproved ? (
              <>
                <button
                  type="button"
                  onClick={handleRejectPlan}
                  className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 font-medium text-[11px] transition"
                >
                  Reject Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlanApproved(true);
                    setRejectionReason(null);
                  }}
                  disabled={!isPreflightPassed}
                  className={`px-3 py-1 rounded font-bold text-[11px] transition ${
                    isPreflightPassed 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Approve Execution Plan
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready to Launch
                </span>
                <button
                  type="button"
                  onClick={handleRejectPlan}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] transition"
                >
                  Revoke
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Plan item breakdown */}
        <div className="space-y-1.5 font-mono text-[11px] bg-zinc-950 p-2.5 rounded border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-300">
            <span>Activity 1: Architecture & Trust Boundaries</span>
            <span className="text-zinc-500">Scope: src/core, ARCHITECTURE.md (~8,000 tokens)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Activity 2: Security & Credential Isolation</span>
            <span className="text-zinc-500">Scope: src/auth, serverConfig.ts (~12,500 tokens)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Activity 3: State Machine & Lifecycle Isolation</span>
            <span className="text-zinc-500">Scope: ScreenEMultiAgent.tsx, App.tsx (~14,000 tokens)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Activity 4: Dependency & Vulnerability Scan</span>
            <span className="text-zinc-500">Scope: package.json, vite.config.ts (~8,000 tokens)</span>
          </div>
        </div>

        {rejectionReason && (
          <div className="p-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-[11px]">
            <strong>Plan Rejected:</strong> {rejectionReason}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_repo')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
        >
          ← Edit Repository & Scope
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_coverage')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
          >
            View Coverage Ledger
          </button>

          <button
            onClick={onApproveAndLaunch}
            disabled={!isPreflightPassed || !planApproved}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              isPreflightPassed && planApproved
                ? noColor
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>Launch Jules Audit Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
