import React, { useState } from 'react';
import { 
  INK_COMPONENT_MAPPINGS, 
  DESIGN_DECISIONS_FOR_APPROVAL, 
  CODEX_HANDOFF_CHECKLIST 
} from '../../data/inkMapping';
import { X, FileCode2, CheckSquare, Layers, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';

interface HandoffDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandoffDocsModal: React.FC<HandoffDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ink' | 'decisions' | 'handoff' | 'screens'>('ink');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0c0e14] border border-cyan-800/80 rounded-xl flex flex-col shadow-2xl overflow-hidden font-mono text-zinc-200">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs sm:text-sm text-zinc-100">
              CodeGuardian G00 — Ink Terminal Specifications & Codex Handoff
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'ink', label: '1. Ink Component Mapping' },
            { id: 'decisions', label: '2. Design Decisions For Approval' },
            { id: 'handoff', label: '3. Codex Implementation Guide' },
            { id: 'screens', label: '4. Screen-by-Screen UX Specs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Tab 1: Ink Mapping */}
          {activeTab === 'ink' && (
            <div className="space-y-4">
              <div className="text-zinc-300">
                This table defines how every visual element in this browser prototype maps to <strong>native terminal primitives</strong> in <code className="text-cyan-300">Ink 5</code> (React for Interactive CLIs):
              </div>

              <div className="space-y-3">
                {INK_COMPONENT_MAPPINGS.map((item, idx) => (
                  <div key={idx} className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <strong className="text-zinc-100">{item.prototypeComponent}</strong>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        Deps: {item.inkPackages.join(', ')}
                      </span>
                    </div>
                    <div className="text-cyan-300 font-mono bg-zinc-950 p-2 rounded border border-zinc-900 text-[11px] overflow-x-auto">
                      {item.inkEquivalent}
                    </div>
                    <div className="text-[11px] text-zinc-400 space-y-1">
                      <div><strong className="text-zinc-500">Terminal Considerations:</strong> {item.terminalConsiderations}</div>
                      <div><strong className="text-zinc-500">Keyboard Handling:</strong> {item.keyboardHandling}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Decisions for Approval */}
          {activeTab === 'decisions' && (
            <div className="space-y-3">
              <div className="text-zinc-300">
                Design and architectural decisions requiring operator or product manager approval prior to G01 implementation:
              </div>

              {DESIGN_DECISIONS_FOR_APPROVAL.map((dec) => (
                <div key={dec.id} className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-[11px]">{dec.id}: {dec.title}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      [{dec.status}]
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-200">
                    <strong>Proposal:</strong> {dec.proposal}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    <strong>Impact & Rationale:</strong> {dec.impact}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Codex Handoff Checklist */}
          {activeTab === 'handoff' && (
            <div className="space-y-4">
              <div className="text-zinc-300">
                Implementation checklist for Codex when building the native TypeScript/Ink CLI package:
              </div>

              <div className="space-y-2">
                {CODEX_HANDOFF_CHECKLIST.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex items-start gap-2 text-[11px]">
                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-cyan-900/50 space-y-2 text-[11px]">
                <div className="font-bold text-cyan-300">Target Native CLI Command Structure:</div>
                <pre className="text-zinc-300 text-[10px] leading-relaxed">
{`package.json bin definition:
{
  "bin": {
    "codeguardian": "./dist/cli.js"
  }
}

CLI Entry point invocation:
$ npx codeguardian review https://github.com/example/demo/pull/42 --demo
$ npx codeguardian auth status
$ npx codeguardian report demo-0042 --format json
$ npx codeguardian publish demo-0042 --dry-run`}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: Screen-by-Screen UX Specs */}
          {activeTab === 'screens' && (
            <div className="space-y-3">
              <div className="text-zinc-300">
                Detailed UI/UX specifications for each of the 9 simulated screens:
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen A (Welcome)</strong>
                  Command discovery table, recent run history, authentication preflight banner, persistent DEMO ONLY badge.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen B (Auth Preflight)</strong>
                  Independent status checks for GitHub CLI (`gh`) and Codex CLI (`codex`). Explains operator commands (`gh auth login`, `codex login --device-auth`).
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen C (PR Input)</strong>
                  Validates regex syntax, repository existence, authorization, closed PRs, draft PRs, and rate limits.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen D (Inspection)</strong>
                  Full 40-char commit SHAs, file tree, changed line hunks, surface risk indicators.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen E (Specialists)</strong>
                  Security, Logic, Architecture, Quality lanes. State badges, live logs, elapsed times, cancel and retry controls.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen F (Validation)</strong>
                  Manager deduplication by fingerprint, filtering out-of-diff lines, assigning P0-P3 severity.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen G (Report)</strong>
                  Terminal view, Markdown render, and strict API-CONTRACT v1 JSON export with cryptographic report digest.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen H (Publish Preview)</strong>
                  Re-verifies head SHA, COMMENT action only, explicit confirmation prompt, and explicit NO GITHUB WRITE guarantee.
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <strong className="text-cyan-300 block mb-0.5">Screen I (Scenarios)</strong>
                  One-click runner for all 11 failure/recovery/edge cases with immediate state inspection.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            CodeGuardian Architecture Packet • 2026-10-14
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
