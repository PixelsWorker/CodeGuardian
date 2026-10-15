import React from 'react';
import { AuthState, ActiveScreen } from '../../types/contract';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Key, ShieldCheck, ArrowRight } from 'lucide-react';

interface ScreenBAuthProps {
  noColor: boolean;
  githubAuth: AuthState;
  setGithubAuth: (state: AuthState) => void;
  codexAuth: AuthState;
  setCodexAuth: (state: AuthState) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenBAuth: React.FC<ScreenBAuthProps> = ({
  noColor,
  githubAuth,
  setGithubAuth,
  codexAuth,
  setCodexAuth,
  onNavigate,
}) => {
  const getStatusBadge = (state: AuthState) => {
    switch (state) {
      case "authenticated":
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            noColor ? 'bg-zinc-200 text-zinc-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            [AUTHENTICATED]
          </span>
        );
      case "not_authenticated":
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            noColor ? 'bg-zinc-800 text-zinc-300' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            [NOT SIGNED IN]
          </span>
        );
      case "insufficient_permissions":
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            noColor ? 'bg-zinc-800 text-zinc-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            [INSUFFICIENT SCOPES]
          </span>
        );
      case "session_expired":
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            noColor ? 'bg-zinc-800 text-zinc-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            [SESSION EXPIRED]
          </span>
        );
      case "device_code_pending":
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            noColor ? 'bg-zinc-800 text-zinc-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            [DEVICE AUTH PENDING]
          </span>
        );
    }
  };

  const isReadyToProceed = githubAuth === "authenticated" && codexAuth === "authenticated";

  return (
    <div className="space-y-4">
      {/* Screen Title & Command Context */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian auth status</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">ALL AUTH IS SIMULATED</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen B — Authentication Preflight
        </h2>
        <p className="text-[11px] text-zinc-400">
          Independent preflight validation for GitHub CLI reader and Codex CLI specialist engine.
        </p>
      </div>

      {/* Simulator State Selector Toolbar */}
      <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
        <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
          Interactive Scenario Toggles (Simulate CLI states)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-zinc-400 block mb-1">GitHub CLI Status:</span>
            <div className="flex flex-wrap gap-1">
              {(["authenticated", "not_authenticated", "insufficient_permissions", "session_expired"] as AuthState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setGithubAuth(st)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                    githubAuth === st 
                      ? 'bg-cyan-600 text-white font-bold border-cyan-400' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-zinc-400 block mb-1">Codex CLI Status:</span>
            <div className="flex flex-wrap gap-1">
              {(["authenticated", "not_authenticated", "device_code_pending", "session_expired"] as AuthState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setCodexAuth(st)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                    codexAuth === st 
                      ? 'bg-cyan-600 text-white font-bold border-cyan-400' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Independent Systems Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* GitHub CLI Panel */}
        <div className={`p-3 rounded border flex flex-col justify-between ${
          noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                GitHub CLI (`gh`)
              </span>
              {getStatusBadge(githubAuth)}
            </div>

            <div className="text-[11px] font-mono space-y-1 text-zinc-400">
              {githubAuth === "authenticated" && (
                <>
                  <div className="text-emerald-400">✓ Logged in to github.com as alex-dev</div>
                  <div>• Protocol: HTTPS</div>
                  <div>• Active account: true</div>
                  <div>• Scopes: <code className="text-zinc-300">repo:read</code> (Inspection only)</div>
                  <div className="text-zinc-500 mt-2 text-[10px]">Note: Write scope is strictly isolated to separate publisher.</div>
                </>
              )}

              {githubAuth === "not_authenticated" && (
                <>
                  <div className="text-red-400">✖ You are not logged into any GitHub hosts.</div>
                  <div className="p-2 mt-2 rounded bg-zinc-950 border border-red-900/40 text-red-300 text-[10px]">
                    To sign in, execute in your terminal:
                    <div className="font-bold mt-1 text-zinc-100">$ gh auth login --web -h github.com</div>
                  </div>
                </>
              )}

              {githubAuth === "insufficient_permissions" && (
                <>
                  <div className="text-amber-400">▲ Authenticated, but token lacks `repo` read access.</div>
                  <div className="p-2 mt-2 rounded bg-zinc-950 border border-amber-900/40 text-amber-300 text-[10px]">
                    Required fix:
                    <div className="font-bold mt-1 text-zinc-100">$ gh auth refresh -s repo</div>
                  </div>
                </>
              )}

              {githubAuth === "session_expired" && (
                <>
                  <div className="text-amber-400">▲ GitHub OAuth token expired (401 Bad Credentials).</div>
                  <div className="p-2 mt-2 rounded bg-zinc-950 border border-amber-900/40 text-amber-300 text-[10px]">
                    Required re-authentication:
                    <div className="font-bold mt-1 text-zinc-100">$ gh auth login</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Client: gh version 2.50.0</span>
            <button
              onClick={() => setGithubAuth("authenticated")}
              className="text-cyan-400 hover:underline"
            >
              Simulate Sign In
            </button>
          </div>
        </div>

        {/* Codex CLI Panel */}
        <div className={`p-3 rounded border flex flex-col justify-between ${
          noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                Codex CLI (`codex`)
              </span>
              {getStatusBadge(codexAuth)}
            </div>

            <div className="text-[11px] font-mono space-y-1 text-zinc-400">
              {codexAuth === "authenticated" && (
                <>
                  <div className="text-emerald-400">✓ Device authentication valid</div>
                  <div>• Session: ChatGPT Plus / Team token</div>
                  <div>• Engine: Codex worker lane manager</div>
                  <div>• Rate limit quota: Nominal (100% capacity)</div>
                  <div className="text-zinc-500 mt-2 text-[10px]">No platform API key needed; authenticated via developer session.</div>
                </>
              )}

              {codexAuth === "not_authenticated" && (
                <>
                  <div className="text-red-400">✖ Codex session token not detected.</div>
                  <div className="p-2 mt-2 rounded bg-zinc-950 border border-red-900/40 text-red-300 text-[10px]">
                    Run command to initiate device code exchange:
                    <div className="font-bold mt-1 text-zinc-100">$ codex login --device-auth</div>
                  </div>
                </>
              )}

              {codexAuth === "device_code_pending" && (
                <>
                  <div className="text-cyan-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Waiting for device authorization in browser...
                  </div>
                  <div className="p-2.5 mt-2 rounded bg-zinc-950 border border-cyan-800 text-[11px] space-y-1">
                    <div>1. Open URL: <code className="text-cyan-300 underline">https://auth.openai.com/device</code></div>
                    <div>2. Enter Code: <strong className="text-amber-300 text-sm tracking-wider">ABCD-1234</strong></div>
                    <div className="text-zinc-500 text-[10px]">Session will automatically pair once verified.</div>
                  </div>
                </>
              )}

              {codexAuth === "session_expired" && (
                <>
                  <div className="text-amber-400">▲ Codex refresh token expired or revoked.</div>
                  <div className="p-2 mt-2 rounded bg-zinc-950 border border-amber-900/40 text-amber-300 text-[10px]">
                    Re-authenticate device:
                    <div className="font-bold mt-1 text-zinc-100">$ codex login --device-auth</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Codex SDK: 0.14.2 (Mock Adapter)</span>
            <button
              onClick={() => setCodexAuth("authenticated")}
              className="text-cyan-400 hover:underline"
            >
              Simulate Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Preflight Gate Summary & Next Step */}
      <div className={`p-3 rounded border text-xs flex flex-wrap items-center justify-between gap-3 ${
        isReadyToProceed
          ? noColor ? 'border-zinc-700 bg-zinc-900' : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
          : noColor ? 'border-zinc-700 bg-zinc-900' : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
      }`}>
        <div className="flex items-center gap-2">
          {isReadyToProceed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>
            {isReadyToProceed 
              ? 'Preflight check passed: GitHub reader and Codex engine both authenticated.'
              : 'Preflight blocked: Review cannot begin until both services are authenticated.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('welcome')}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
          >
            Back
          </button>
          <button
            disabled={!isReadyToProceed}
            onClick={() => onNavigate('pr_input')}
            className={`px-3 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
              isReadyToProceed
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Continue to PR Input
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
