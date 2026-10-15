import React, { useState } from 'react';
import { ActiveScreen } from '../../types/contract';
import { GitPullRequest, ArrowRight, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

interface ScreenCPullRequestProps {
  noColor: boolean;
  prUrl: string;
  setPrUrl: (url: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const ScreenCPullRequest: React.FC<ScreenCPullRequestProps> = ({
  noColor,
  prUrl,
  setPrUrl,
  onNavigate,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("valid");

  // Validate URL logic
  const parseUrl = (url: string) => {
    if (!url.trim()) return { valid: false, error: "Empty URL. Please enter a target pull request URL." };
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      return { valid: false, error: "Invalid protocol. Expected HTTPS URL (e.g. https://github.com/owner/repo/pull/42)." };
    }
    if (!url.includes("github.com")) {
      return { valid: false, error: "Non-GitHub host detected. CodeGuardian only supports GitHub pull requests in G00." };
    }
    const match = url.match(/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/(\d+)/);
    if (!match) {
      return { valid: false, error: "Malformed PR URL. Format must match: https://github.com/:owner/:repo/pull/:number" };
    }
    return {
      valid: true,
      owner: match[1],
      repo: match[2],
      number: parseInt(match[3], 10),
    };
  };

  const parsed = parseUrl(prUrl);

  const handleApplyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    switch (presetKey) {
      case "valid":
        setPrUrl("https://github.com/example/demo/pull/42");
        break;
      case "non_github":
        setPrUrl("https://gitlab.com/enterprise/portal/merge_requests/19");
        break;
      case "unauthorized":
        setPrUrl("https://github.com/secret-corp/restricted-core/pull/101");
        break;
      case "closed":
        setPrUrl("https://github.com/example/demo/pull/999");
        break;
      case "draft":
        setPrUrl("https://github.com/example/demo/pull/43");
        break;
      case "rate_limit":
        setPrUrl("https://github.com/example/demo/pull/88");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Context */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            $ <strong className="text-cyan-300">codeguardian review &lt;PR_URL&gt; --demo</strong>
          </span>
          <span className="text-[10px] text-amber-400 font-mono">SYNTHETIC INPUT ONLY</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-200 mt-1">
          Screen C — Pull Request Input & Validation
        </h2>
        <p className="text-[11px] text-zinc-400">
          Validates URL syntax, host domain, repository authorization, and PR existence prior to cloning diffs.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs">
        <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
          Simulate Input Condition:
        </span>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            { id: 'valid', label: 'Valid PR #42 (example/demo)', color: 'text-emerald-400' },
            { id: 'non_github', label: 'Non-GitHub (GitLab)', color: 'text-amber-400' },
            { id: 'unauthorized', label: 'Unauthorized Repo (403)', color: 'text-red-400' },
            { id: 'closed', label: 'Closed / Deleted PR (404)', color: 'text-red-400' },
            { id: 'draft', label: 'Draft PR Warning', color: 'text-amber-400' },
            { id: 'rate_limit', label: 'API Rate Limited (429)', color: 'text-red-400' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                selectedPreset === preset.id
                  ? 'bg-zinc-800 border-cyan-500 text-cyan-200 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field Form */}
      <div className={`p-4 rounded border ${noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-black/40'} space-y-3`}>
        <label className="block text-xs font-semibold text-zinc-300">
          Target GitHub Pull Request URL:
        </label>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={prUrl}
              onChange={(e) => {
                setPrUrl(e.target.value);
                setSelectedPreset('custom');
              }}
              placeholder="https://github.com/owner/repo/pull/42"
              className={`w-full px-3 py-2 bg-zinc-950 border rounded text-xs font-mono outline-none transition ${
                parsed.valid
                  ? 'border-emerald-500/50 text-emerald-200 focus:border-emerald-400'
                  : 'border-red-500/50 text-red-200 focus:border-red-400'
              }`}
            />
          </div>
          <button
            onClick={() => handleApplyPreset('valid')}
            className="px-2.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700"
          >
            Reset
          </button>
        </div>

        {/* Validation Result Box */}
        {parsed.valid ? (
          <div className="p-3 rounded bg-zinc-950 border border-emerald-900/50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Valid Pull Request Identity Detected
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">ALLOWLIST CHECK: PASS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">OWNER</span>
                <span className="text-zinc-200 font-semibold">{parsed.owner}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">REPO</span>
                <span className="text-zinc-200 font-semibold">{parsed.repo}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">PR NUMBER</span>
                <span className="text-cyan-400 font-semibold">#{parsed.number}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">STATUS</span>
                <span className={selectedPreset === 'draft' ? 'text-amber-400' : 'text-emerald-400'}>
                  {selectedPreset === 'draft' ? 'DRAFT (WIP)' : 'OPEN'}
                </span>
              </div>
            </div>

            {selectedPreset === 'draft' && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Notice: This PR is currently marked as DRAFT. Analysis will proceed as a preliminary review.</span>
              </div>
            )}

            {selectedPreset === 'unauthorized' && (
              <div className="p-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Error 403: Read permissions denied for secret-corp/restricted-core. Preflight halted.</span>
              </div>
            )}

            {selectedPreset === 'closed' && (
              <div className="p-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Error 404: Pull request #999 was not found or has been merged/closed.</span>
              </div>
            )}

            {selectedPreset === 'rate_limit' && (
              <div className="p-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>GitHub API Rate Limit Exceeded (429 Too Many Requests). Quota resets at 23:45:00 UTC.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded bg-zinc-950 border border-red-900/50 text-xs text-red-400 space-y-1 font-mono">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              URL Validation Failed:
            </div>
            <div className="text-[11px] text-zinc-300">{parsed.error}</div>
            <div className="text-[10px] text-zinc-500 mt-2">
              Tip: Use format <code>https://github.com/:owner/:repo/pull/:number</code>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('auth')}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
        >
          Back to Auth
        </button>

        <button
          disabled={!parsed.valid || ['unauthorized', 'closed', 'rate_limit'].includes(selectedPreset)}
          onClick={() => onNavigate('inspection')}
          className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
            parsed.valid && !['unauthorized', 'closed', 'rate_limit'].includes(selectedPreset)
              ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer shadow-sm'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          Inspect PR Metadata & Diff
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
