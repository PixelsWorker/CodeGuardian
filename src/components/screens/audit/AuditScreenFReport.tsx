import React, { useState } from 'react';
import { RepositoryAuditReport, AuditScreen } from '../../../types/auditContract';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  GitCommit, 
  AlertTriangle, 
  Code, 
  Layers, 
  ArrowLeft, 
  ExternalLink 
} from 'lucide-react';

interface AuditScreenFReportProps {
  noColor: boolean;
  report: RepositoryAuditReport;
  onNavigate: (screen: AuditScreen) => void;
}

export const AuditScreenFReport: React.FC<AuditScreenFReportProps> = ({
  noColor,
  report,
  onNavigate,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copyFailed, setCopyFailed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'json'>('preview');

  const verifiedFindings = report.findings.filter((f) => f.verification === 'verified');
  const rejectedFindings = report.findings.filter((f) => f.verification === 'rejected');
  const inconclusiveFindings = report.findings.filter((f) => f.verification === 'inconclusive');

  const generateMarkdownReport = (): string => {
    return `# CodeGuardian Repository Audit Report — ${report.repository.owner}/${report.repository.repo}

**Audit ID:** \`${report.audit_id}\`  
**Generated At:** ${report.generated_at}  
**Status:** **${report.status.toUpperCase()}**  
**Report Digest:** \`${report.report_digest}\`  

## 1. Verified Repository Snapshot

- **Repository:** \`${report.repository.owner}/${report.repository.repo}\`
- **Target Branch:** \`${report.repository.requested_branch}\`
- **Intended Commit SHA:** \`${report.repository.intended_commit_sha}\`
- **Verified Audit SHA:** \`${report.repository.verified_audit_commit_sha || 'UNVERIFIED'}\`
- **Tracked File Manifest Digest:** \`${report.repository.tracked_file_manifest_digest}\`
- **Tracked Files:** ${report.repository.total_files_count} files

## 2. Architecture & Trust Summary

${report.architecture_summary}

## 3. Verified Systemic Findings (${verifiedFindings.length})

${verifiedFindings
  .map(
    (f, idx) => `### ${idx + 1}. [${f.severity}] ${f.title} (\`${f.id}\`)

- **Category:** ${f.category}
- **Location:** \`${f.path}${f.line_start ? `:${f.line_start}-${f.line_end}` : ''}\`
- **Affected Symbol:** \`${f.affected_symbol || 'N/A'}\`
- **Callers Traced:** ${f.affected_callers.length > 0 ? f.affected_callers.map((c) => `\`${c}\``).join(', ') : 'None'}
- **Impact:** ${f.impact}
- **Recommendation:** ${f.recommendation}
- **Remediation Priority:** ${f.remediation_priority}
- **Manager Verification:** ${f.independent_verification_notes}
`
  )
  .join('\n')}

## 4. Manager-Rejected Candidate Claims (${rejectedFindings.length})

*Model-generated candidate claims refuted or discarded during independent source fact-checking:*

${rejectedFindings
  .map(
    (f) => `- **\`${f.id}\` [${f.category}]:** ${f.title}  
  *Reason for Rejection:* ${f.independent_verification_notes}`
  )
  .join('\n')}

## 5. Coverage Ledger & Limitations

- **Independently Verified Files:** ${report.coverage.filter((c) => c.level === 'independently_verified').length}
- **Context-Analyzed Files:** ${report.coverage.filter((c) => c.level === 'context_analyzed').length}
- **Inspected Files:** ${report.coverage.filter((c) => c.level === 'inspected').length}
- **Inventoried (Pending):** ${report.coverage.filter((c) => c.level === 'inventoried').length}
- **Excluded Files:** ${report.coverage.filter((c) => c.level === 'excluded').length}
- **Unknown Coverage Gaps:** ${report.coverage.filter((c) => c.level === 'unknown').length}

### Coverage Limitations:
${report.limitations.map((lim) => `- ${lim}`).join('\n')}

### Executed Verification Commands:
${report.executed_checks.map((chk) => `- \`${chk}\``).join('\n')}

---
*CodeGuardian Full Repository Audit — Staged outside active branches. No GitHub write access or PR review publication action.*
`;
  };

  const handleCopy = async () => {
    const text = activeTab === 'json' ? JSON.stringify(report, null, 2) : generateMarkdownReport();
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${noColor ? 'text-zinc-200' : 'text-cyan-400'}`} />
          <h2 className="text-sm font-bold tracking-wide">
            AUDIT VIEW F: AUDIT.md REPORT PREVIEW & ARTIFACT EXPORT
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Schema: 1.0.0</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
            STATUS: {report.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Security Boundary Notice (Mandatory API-CONTRACT §8 Rule 5) */}
      <div className={`p-3 rounded border text-xs space-y-1 ${
        noColor
          ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
          : 'border-amber-900/50 bg-amber-950/20 text-amber-200'
      }`}>
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>PROPOSED AUDIT PUBLICATION BOUNDARY (API-CONTRACT §8 RULE 5)</span>
        </div>
        <p className="text-[11px] opacity-90 leading-relaxed">
          Preliminary <code className="text-amber-300 font-mono">JULES-AUDIT.md</code> is staged outside active product branches.
          Producing, committing, or publishing the final <code className="text-amber-300 font-mono">AUDIT.md</code> requires separate human operator approval.
          <strong> No G06 audit finding conveys GitHub write permission, and no full-repo finding is ever passed to the PR comment publisher.</strong>
        </p>
      </div>

      {/* Snapshot Metadata Banner */}
      <div className="p-3 rounded border border-zinc-800 bg-black/40 text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <span className="text-zinc-500">Repository:</span>{' '}
          <span className="text-zinc-200 font-bold">{report.repository.owner}/{report.repository.repo}</span>
        </div>
        <div>
          <span className="text-zinc-500">Intended Commit:</span>{' '}
          <span className="text-cyan-400">{report.repository.intended_commit_sha.slice(0, 12)}...</span>
        </div>
        <div>
          <span className="text-zinc-500">Report Digest:</span>{' '}
          <span className="text-emerald-400 truncate block" title={report.report_digest}>
            {report.report_digest.slice(0, 20)}...
          </span>
        </div>
      </div>

      {/* Format Switcher & Copy Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-zinc-900/70 border border-zinc-800 text-xs">
        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeTab === 'preview'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rendered AUDIT.md
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeTab === 'markdown'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Raw Markdown
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeTab === 'json'
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Canonical JSON (API-CONTRACT §8)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {copyFailed && (
            <span className="text-[11px] text-red-400 font-mono">Clipboard copy failed</span>
          )}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs flex items-center gap-1.5 transition font-mono"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied to Clipboard' : 'Copy Artifact'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-black/40 text-xs">
        {activeTab === 'preview' && (
          <div className="p-4 space-y-5 max-h-[440px] overflow-y-auto font-mono text-[11px]">
            {/* Title & Overview */}
            <div className="border-b border-zinc-800 pb-3">
              <h1 className="text-sm font-bold text-zinc-100 mb-1">
                # AUDIT.md — {report.repository.owner}/{report.repository.repo}
              </h1>
              <div className="text-zinc-400">
                Independent Repository-Wide Security, Architecture & Correctness Audit
              </div>
            </div>

            {/* Architecture Summary */}
            <div className="space-y-1">
              <h3 className="font-bold text-cyan-300 text-xs uppercase">1. Architecture Map & Trust Boundaries</h3>
              <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-800">
                {report.architecture_summary}
              </p>
            </div>

            {/* Verified Findings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-400 text-xs uppercase">
                  2. Verified Systemic Findings ({verifiedFindings.length})
                </h3>
                <span className="text-[10px] text-zinc-500">Manager source-proven</span>
              </div>

              <div className="space-y-2">
                {verifiedFindings.map((f, i) => (
                  <div key={f.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                      <span>{i + 1}. [{f.severity}] {f.title}</span>
                      <span className="text-cyan-400 text-[10px]">{f.id}</span>
                    </div>
                    <div className="text-zinc-400 text-[10px]">
                      Path: <code className="text-zinc-300">{f.path}</code> ({f.line_start}-{f.line_end}) • Symbol: <code className="text-amber-300">{f.affected_symbol}</code>
                    </div>
                    <div className="text-zinc-300">{f.impact}</div>
                    <div className="text-zinc-400">
                      <strong className="text-zinc-300">Recommendation:</strong> {f.recommendation}
                    </div>
                    <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-[10px]">
                      <strong>Manager Proof:</strong> {f.independent_verification_notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejected Candidate Claims */}
            <div className="space-y-2">
              <h3 className="font-bold text-red-400 text-xs uppercase">
                3. Manager-Rejected Candidate Claims ({rejectedFindings.length})
              </h3>
              <div className="space-y-1.5">
                {rejectedFindings.map((f) => (
                  <div key={f.id} className="p-2 rounded bg-red-950/20 border border-red-900/40 text-[10px] space-y-0.5">
                    <div className="font-bold text-red-300">
                      ✗ [{f.id}] {f.title} (Claimed in {f.path})
                    </div>
                    <div className="text-zinc-400">
                      <strong>Rejection Rationale:</strong> {f.independent_verification_notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Limitations */}
            <div className="space-y-1 pt-2 border-t border-zinc-800">
              <h3 className="font-bold text-zinc-300 text-xs uppercase">4. Limitations & Unknown Coverage</h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                {report.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'markdown' && (
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[440px] whitespace-pre-wrap leading-relaxed">
            {generateMarkdownReport()}
          </pre>
        )}

        {activeTab === 'json' && (
          <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[440px] whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('audit_verification')}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition font-mono"
        >
          ← Manager Verification
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('audit_repo')}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition"
          >
            New Repository Audit
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              noColor ? 'bg-zinc-100 text-zinc-900' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export AUDIT.md Artifact</span>
          </button>
        </div>
      </div>
    </div>
  );
};
