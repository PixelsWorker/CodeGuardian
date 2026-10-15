export interface InkMappingItem {
  prototypeComponent: string;
  inkEquivalent: string;
  inkPackages: string[];
  terminalConsiderations: string;
  keyboardHandling: string;
}

export const INK_COMPONENT_MAPPINGS: InkMappingItem[] = [
  {
    prototypeComponent: "Terminal Frame & Viewport (Header/Chrome)",
    inkEquivalent: "<Box borderStyle=\"round\" borderColor=\"cyan\" flexDirection=\"column\">",
    inkPackages: ["ink"],
    terminalConsiderations: "Use process.stdout.columns and process.stdout.rows via useStdout(). Box borders must adapt when width < 80.",
    keyboardHandling: "Global shortcuts handled by Ink's `useInput((input, key) => { ... })` hook.",
  },
  {
    prototypeComponent: "Status Badges ([COMPLETE], [RUNNING], [FAILED])",
    inkEquivalent: "<Text color={color} bold>[{state.toUpperCase()}]</Text>",
    inkPackages: ["ink", "chalk"],
    terminalConsiderations: "In NO_COLOR mode, disable color styling and rely strictly on brackets and textual prefixes: [OK], [WARN], [FAIL], [WAIT].",
    keyboardHandling: "Read-only visual cue.",
  },
  {
    prototypeComponent: "Multi-Agent Progress Lanes (Screen E)",
    inkEquivalent: "<Box flexDirection=\"column\"><Spinner type=\"dots\" /><ProgressBar value={pct} /></Box>",
    inkPackages: ["ink-spinner", "ink-progress-bar"],
    terminalConsiderations: "Deterministic updates run through React state. Avoid ANSI clear-screen flicker; use Ink's virtual reconciler.",
    keyboardHandling: "[C] triggers cancellation via AbortController; [L] toggles lane logs; [R] retries failed lane.",
  },
  {
    prototypeComponent: "Interactive Command Prompt & Input (Screen C)",
    inkEquivalent: "<TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />",
    inkPackages: ["ink-text-input"],
    terminalConsiderations: "Handle paste events cleanly; truncate overly long URLs with ellipsis to avoid wrapping errors.",
    keyboardHandling: "[Enter] submit, [Esc] clear, [Up/Down] command history navigation.",
  },
  {
    prototypeComponent: "Interactive Menu & Options List (Screen A, G, H)",
    inkEquivalent: "<SelectInput items={options} onSelect={handleSelect} />",
    inkPackages: ["ink-select-input"],
    terminalConsiderations: "Limit visible window to 5-7 items if terminal row count is constrained; show indicator for scrollable overflow.",
    keyboardHandling: "[Up/Down] change selection, [Enter] activate, numeric hotkeys (1-9).",
  },
  {
    prototypeComponent: "Findings Accordion / Drilldown (Screen F & G)",
    inkEquivalent: "<Box flexDirection=\"column\"><Text underline>{title}</Text><Text color=\"dim\">{evidence}</Text></Box>",
    inkPackages: ["ink"],
    terminalConsiderations: "Word-wrap long evidence strings at (terminalWidth - 4). Do not let unbroken tokens cause terminal overflow.",
    keyboardHandling: "[Tab] next finding, [Space] expand/collapse, [M] toggle Markdown preview, [J] toggle JSON.",
  },
  {
    prototypeComponent: "Publication Confirmation Modal (Screen H)",
    inkEquivalent: "<ConfirmInput onConfirm={handleConfirm} onCancel={handleCancel} />",
    inkPackages: ["ink-confirm-input"],
    terminalConsiderations: "Explicit confirmation with default NO ('[y/N]'). Always print 'SIMULATED CONFIRMATION' banner.",
    keyboardHandling: "'y' / 'Y' confirms, 'n' / 'N' / [Esc] cancels safely.",
  },
];

export const DESIGN_DECISIONS_FOR_APPROVAL = [
  {
    id: "DEC-01",
    title: "Command Vocabulary Naming",
    proposal: "Use `codeguardian review <URL> --demo`, `auth status`, `report <ID> --format markdown|json`, `publish <ID> --dry-run`.",
    status: "PROPOSED",
    impact: "Standardizes developer muscle memory aligned with GitHub CLI (`gh`). Needs acceptance before G01.",
  },
  {
    id: "DEC-02",
    title: "Strict Manager-Publisher Boundary",
    proposal: "Manager generates and cryptographically signs `report_digest`. Separate publisher verifies head SHA matches before prompting.",
    status: "PROPOSED",
    impact: "Guarantees that workers never possess GitHub credentials or write permissions.",
  },
  {
    id: "DEC-03",
    title: "Comment-Only Publication (No Direct Code Edits / Merges)",
    proposal: "G00-G03 restricts all output to GitHub review comments. No automatic branch pushes, commits, or approvals.",
    status: "PROPOSED",
    impact: "Eliminates risk of unauthorized code modification by automated workers.",
  },
  {
    id: "DEC-04",
    title: "In-Hunk Diff Anchoring Policy",
    proposal: "Findings with file lines outside changed diff hunks are rejected from inline comments and demoted to report summary warnings.",
    status: "PROPOSED",
    impact: "Prevents posting broken inline GitHub review comments that fail API validation.",
  },
  {
    id: "DEC-05",
    title: "NO_COLOR Compliance (no-color.org)",
    proposal: "Respect `NO_COLOR=1` environment variable. Replace all color-coded badges with ASCII symbols: `[+]`, `[!]`, `[x]`, `[o]`.",
    status: "PROPOSED",
    impact: "Full accessibility for screen readers and monochrome terminal emulators.",
  },
];

export const CODEX_HANDOFF_CHECKLIST = [
  "1. Target runtime: Node.js 22 + TypeScript + Ink 5 + React 18/19.",
  "2. File structure: Separate CLI entry `src/cli.tsx` from state machine `src/state/` and mock fixtures `src/mocks/`.",
  "3. Zero external network calls in G00: Emulate all delay with deterministic `setTimeout()` promises.",
  "4. Implement graceful SIGINT / Ctrl+C handling via Ink's `useApp().exit()` with clean terminal state restoration.",
  "5. Provide CLI flags: `--no-color`, `--demo`, `--width=<cols>`, `--json` for non-interactive CI output.",
  "6. Write ink-testing-library test cases verifying all 11 failure/recovery scenarios.",
];
