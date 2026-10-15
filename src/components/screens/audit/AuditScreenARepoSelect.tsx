import React from 'react';
import { RepositorySnapshot, AuditScreen } from '../../../types/auditContract';
import { DEFAULT_REPOSITORY_SNAPSHOT, EXTERNAL_REACT_SNAPSHOT } from '../../../data/auditScenarios';
import { 
  GitBranch, 
  GitCommit, 
  FolderTree, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Filter, 
  FileCode, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

interface AuditScreenARepoSelectProps {
  noColor: boolean;
  snapshot: RepositorySnapshot;
  setSnapshot: React.Dispatch<React.SetStateAction<RepositorySnapshot>>;
  setIsShaVerified?: (verified: boolean) => void;
  setPlanApproved?: (approved: boolean) => void;
  onNavigate: (screen: AuditScreen) => void;
  onStartAudit: () => void;
}

export const AuditScreenARepoSelect: React.FC<AuditScreenARepoSelectProps> = ({
  noColor,
  snapshot,
  setSnapshot,
  setIsShaVerified,
  setPlanApproved,
  onNavigate,
  onStartAudit,
}) => {
  const [ownerInput, setOwnerInput] = React.useState(snapshot.owner);
  const [repoInput, setRepoInput] = React.useState(snapshot.repo);
  const [branchInput, setBranchInput] = React.useState(snapshot.requested_branch);
  const [shaInput, setShaInput] = React.useState(snapshot.intended_commit_sha);
  const [isEditingExclusions, setIsEditingExclusions] = React.useState(false);
  const [exclusionInput, setExclusionInput] = React.useState(snapshot.exclusion_patterns.join(', '));

  React.useEffect(() => {
    setOwnerInput(snapshot.owner);
    setRepoInput(snapshot.repo);
    setBranchInput(snapshot.requested_branch);
    setShaInput(snapshot.intended_commit_sha);
    setExclusionInput(snapshot.exclusion_patterns.join(', '));
  }, [
    snapshot.owner,
    snapshot.repo,
    snapshot.requested_branch,
    snapshot.intended_commit_sha,
    snapshot.exclusion_patterns,
  ]);

  // 40-character hexadecimal validation represents syntax checking, not source verification
  const isShaValid = /^[0-9a-f]{40}$/i.test(shaInput.trim());
  const isRepoValid = /^[a-zA-Z0-9_.-]+$/.test(ownerInput.trim()) && /^[a-zA-Z0-9_.-]+$/.test(repoInput.trim());

  const handleApplyChanges = () => {
    const patterns = exclusionInput.split(',').map((s) => s.trim()).filter(Boolean);
    const o = ownerInput.trim();
    const r = repoInput.trim();
    const isCodeGuardian = o === 'PixelsWorker' && r === 'CodeGuardian';
    const isReact = o === 'facebook' && r === 'react';

    // Editing snapshot invalidates source verification and plan approval
    setSnapshot((prev) => ({
      ...prev,
      owner: o,
      repo: r,
      requested_branch: branchInput.trim(),
      intended_commit_sha: shaInput.trim(),
      verified_audit_commit_sha: null,
      exclusion_patterns: patterns,
      tracked_files: isCodeGuardian
        ? DEFAULT_REPOSITORY_SNAPSHOT.tracked_files
        : isReact
        ? EXTERNAL_REACT_SNAPSHOT.tracked_files
        : [],
      total_files_count: isCodeGuardian
        ? DEFAULT_REPOSITORY_SNAPSHOT.total_files_count
        : isReact
        ? EXTERNAL_REACT_SNAPSHOT.total_files_count
        : 0,
      tracked_file_manifest_digest: isCodeGuardian
        ? DEFAULT_REPOSITORY_SNAPSHOT.tracked_file_manifest_digest
        : isReact
        ? EXTERNAL_REACT_SNAPSHOT.tracked_file_manifest_digest
        : 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    }));
    if (setIsShaVerified) setIsShaVerified(false);
    if (setPlanApproved) setPlanApproved(false);
  };

  const handleQuickSelectPreset = (owner: string, repo: string, sha: string) => {
    setOwnerInput(owner);
    setRepoInput(repo);
    setShaInput(sha);
    if (owner === 'facebook' && repo === 'react') {
      setSnapshot({
        ...EXTERNAL_REACT_SNAPSHOT,
        intended_commit_sha: sha,
        verified_audit_commit_sha: null,
      });
    } else if (owner === 'PixelsWorker' && repo === 'CodeGuardian') {
      const isBaselineSha = sha === DEFAULT_REPOSITORY_SNAPSHOT.intended_commit_sha;
      setSnapshot({
        ...DEFAULT_REPOSITORY_SNAPSHOT,
        intended_commit_sha: sha,
        verified_audit_commit_sha: isBaselineSha ? sha : null,
      });
      if (setIsShaVerified) setIsShaVerified(isBaselineSha);
      if (setPlanApproved) setPlanApproved(false);
      return;
    } else {
      setSnapshot((prev) => ({
        ...prev,
        owner,
        repo,
        intended_commit_sha: sha,
        verified_audit_commit_sha: null,
        tracked_files: [],
        total_files_count: 0,
        tracked_file_manifest_digest: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      }));
    }
    if (setIsShaVerified) setIsShaVerified(false);
    if (setPlanApproved) setPlanApproved(false);
  };

  return (
    <div className="space-y-4">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <FolderTree className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW A: REPOSITORY IDENTITY & SNAPSHOT SELECTION
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Proposed G06 Scope</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px]">
            SNAPSHOT PINNED
          </span>
        </div>
      </div>

      {/* Critical Architecture Rule Callout */}
      <div className={`p-3 rounded border text-xs ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-amber-900/50 bg-amber-950/20 text-amber-200'
      }`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">INDEPENDENT COMMIT PINNING REQUIREMENT (API-CONTRACT §8)</div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Google Jules API selects a mutable <code className="text-amber-300 font-mono">startingBranch</code> rather than an immutable Git commit SHA. 
              To guarantee reproducible, non-drifting audits, CodeGuardian pins and verifies the full 40-character commit SHA <strong>before</strong> Jules starts.
            </p>
          </div>
        </div>
      </div>

      {/* Repository Selection Form */}
      <div className="p-3 rounded border border-zinc-800 bg-black/40 space-y-3 text-xs">
        <div className="font-bold text-zinc-300 flex items-center justify-between">
          <span>TARGET REPOSITORY SNAPSHOT</span>
          <span className="text-[10px] text-zinc-500 font-normal">Independent reader metadata</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {/* Owner & Repo */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span>GitHub Owner / Repository:</span>
              {!isRepoValid && <span className="text-red-400 text-[10px]">* Invalid format</span>}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={ownerInput}
                onChange={(e) => setOwnerInput(e.target.value)}
                placeholder="Owner (e.g. PixelsWorker)"
                className="w-1/2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-zinc-600">/</span>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="Repo (e.g. CodeGuardian)"
                className="w-1/2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Branch & Commit SHA */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Target Branch:</span>
              <span className="text-zinc-500 text-[10px]">Ref: refs/heads/main</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <GitBranch className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                <input
                  type="text"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="main"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded pl-7 pr-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Full 40-character commit SHA */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="text-zinc-400 flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Intended Full Commit SHA (40 hex chars):</span>
              </label>
              <span className={isShaValid ? 'text-emerald-400' : 'text-red-400'}>
                {isShaValid ? '✓ Valid full 40-character SHA' : '✗ Must be exact 40 hex characters'}
              </span>
            </div>
            <input
              type="text"
              value={shaInput}
              onChange={(e) => setShaInput(e.target.value)}
              placeholder="40-char commit SHA (e.g. 3c9db33177e7ee8e2c6310ac05af21839f0cac08)"
              className={`w-full bg-zinc-900 border rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none font-mono ${
                isShaValid ? 'border-zinc-700 focus:border-cyan-500' : 'border-red-500/80 bg-red-950/20'
              }`}
            />
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80 text-[11px]">
          <span className="text-zinc-500">Sample Snapshots:</span>
          <button
            type="button"
            onClick={() => handleQuickSelectPreset('PixelsWorker', 'CodeGuardian', '3c9db33177e7ee8e2c6310ac05af21839f0cac08')}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition"
          >
            PixelsWorker/CodeGuardian @ 3c9db3 (Baseline)
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelectPreset('facebook', 'react', 'a28189c17758380e227a69b765b21008745341cd')}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition"
          >
            facebook/react @ a28189 (External Open Source)
          </button>
        </div>
      </div>

      {/* Manifest Digest & Tracked Files Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Manifest & Scope */}
        <div className="p-3 rounded border border-zinc-800 bg-zinc-900/40 space-y-2">
          <div className="font-bold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              INVENTORY INTEGRITY DIGEST
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Tracked Files:</span>
              <span className="text-zinc-200 font-semibold">{snapshot.total_files_count} files</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Manifest Digest:</span>
              <span className="text-cyan-400 truncate max-w-[200px]" title={snapshot.tracked_file_manifest_digest}>
                {snapshot.tracked_file_manifest_digest.slice(0, 24)}...
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Excluded Items:</span>
              <span className="text-zinc-400">{snapshot.exclusion_patterns.length} patterns</span>
            </div>
          </div>
        </div>

        {/* Exclusion Scope */}
        <div className="p-3 rounded border border-zinc-800 bg-zinc-900/40 space-y-2">
          <div className="font-bold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              SCOPE EXCLUSIONS
            </span>
            <button
              onClick={() => setIsEditingExclusions(!isEditingExclusions)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              {isEditingExclusions ? 'Done' : 'Edit Patterns'}
            </button>
          </div>
          {isEditingExclusions ? (
            <input
              data-testid="exclusion-patterns-input"
              type="text"
              value={exclusionInput}
              onChange={(e) => setExclusionInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 font-mono"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {snapshot.exclusion_patterns.map((pat) => (
                <span key={pat} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700">
                  {pat}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-zinc-500">
            Exclusions prevent Jules workers from auditing binary assets, vendor packages, or large test fixtures.
          </div>
        </div>
      </div>

      {/* Tracked Files Manifest Browser */}
      <div className="border border-zinc-800 rounded overflow-hidden text-xs">
        <div className="px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-zinc-400" />
            TRACKED MANIFEST INVENTORY ({snapshot.tracked_files.length} ITEMS)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Immutable Reader Snapshot: {snapshot.intended_commit_sha.slice(0, 10)}
          </span>
        </div>
        <div className="max-h-40 overflow-y-auto divide-y divide-zinc-800/60 font-mono text-[11px] p-1 bg-black/30">
          {snapshot.tracked_files.map((file, idx) => (
            <div key={file} className="px-2 py-1 flex items-center justify-between hover:bg-zinc-900/40">
              <span className="text-zinc-300">{file}</span>
              <span className="text-zinc-500 text-[10px]">
                {file.endsWith('.lock') || file.startsWith('dist/') ? (
                  <span className="text-amber-500/80">[EXCLUDED]</span>
                ) : (
                  <span className="text-emerald-500/80">[INVENTORIED]</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={handleApplyChanges}
          className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition"
        >
          Save Snapshot Configuration
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_coverage')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
          >
            Inspect Coverage Ledger
          </button>
          <button
            onClick={() => {
              handleApplyChanges();
              onStartAudit();
            }}
            disabled={!isShaValid || !isRepoValid}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              isShaValid && isRepoValid
                ? noColor
                  ? 'bg-zinc-100 text-zinc-900 font-bold'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Audit Preflight</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
