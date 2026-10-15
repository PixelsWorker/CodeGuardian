import { 
  RepositorySnapshot, 
  RepositoryAuditFinding, 
  RepositoryAuditCoverage, 
  RepositoryAuditReport, 
  JulesActivity,
  JulesActivityState,
  AuditScenarioDefinition 
} from '../types/auditContract';

export const DEFAULT_REPOSITORY_SNAPSHOT: RepositorySnapshot = {
  owner: 'PixelsWorker',
  repo: 'CodeGuardian',
  requested_branch: 'main',
  intended_commit_sha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
  verified_audit_commit_sha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
  tracked_file_manifest_digest: 'sha256:7f99b1a0e883e4a938c11e3b5e408d29b28a49c6d3fe1f78e0789bc4e3b12345',
  total_files_count: 38,
  tracked_files: [
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'src/types/contract.ts',
    'src/types/auditContract.ts',
    'src/utils/serverConfig.ts',
    'src/utils/workerFactory.ts',
    'src/utils/urlValidator.ts',
    'src/components/TerminalChrome.tsx',
    'src/components/screens/ScreenAWelcome.tsx',
    'src/components/screens/ScreenBAuth.tsx',
    'src/components/screens/ScreenCPullRequest.tsx',
    'src/components/screens/ScreenDInspection.tsx',
    'src/components/screens/ScreenEMultiAgent.tsx',
    'src/components/screens/ScreenFFindingsValidation.tsx',
    'src/components/screens/ScreenGReport.tsx',
    'src/components/screens/ScreenHPublish.tsx',
    'src/components/screens/ScreenIScenarios.tsx',
    'src/components/modals/HandoffDocsModal.tsx',
    'src/data/scenarios.ts',
    'src/data/auditScenarios.ts',
    'vite.config.ts',
    'package.json',
    'tsconfig.json',
    'ARCHITECTURE.md',
    'API-CONTRACT.md',
    'G00-SCOPE.md',
    'G00-CLI-WIREFRAMES.md',
    'ROADMAP.md',
    'PROJECT-BRIEF.md',
    'AGENTS.md',
    'README.md',
    'bun.lock',
    'dist/assets/index.js',
  ],
  exclusion_patterns: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'bun.lock',
    '**/*.min.js',
  ],
};

export const EXTERNAL_REACT_SNAPSHOT: RepositorySnapshot = {
  owner: 'facebook',
  repo: 'react',
  requested_branch: 'main',
  intended_commit_sha: 'a28189c17758380e227a69b765b21008745341cd',
  verified_audit_commit_sha: null,
  tracked_file_manifest_digest: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  total_files_count: 5,
  tracked_files: [
    'packages/react/index.js',
    'packages/react/src/React.js',
    'packages/react-dom/index.js',
    'package.json',
    'README.md',
  ],
  exclusion_patterns: ['build/**', 'node_modules/**', 'fixtures/**'],
};

export const EXTERNAL_REACT_COVERAGE: RepositoryAuditCoverage[] = [
  {
    path: 'packages/react/index.js',
    module: 'packages/react',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'External repository snapshot: Pending independent fact-checking audit.',
    line_count: 42,
  },
  {
    path: 'packages/react/src/React.js',
    module: 'packages/react',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'External repository snapshot: Pending independent fact-checking audit.',
    line_count: 120,
  },
  {
    path: 'packages/react-dom/index.js',
    module: 'packages/react-dom',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'External repository snapshot: Pending independent fact-checking audit.',
    line_count: 55,
  },
  {
    path: 'package.json',
    module: 'root',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'External repository snapshot: Pending independent fact-checking audit.',
    line_count: 85,
  },
  {
    path: 'README.md',
    module: 'root',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Documentation root only.',
    line_count: 150,
  },
];

export const DEFAULT_JULES_ACTIVITIES: JulesActivity[] = [
  {
    id: 'act_arch',
    name: 'Architecture & Trust Boundaries',
    targetScope: 'src/core, ARCHITECTURE.md, src/utils',
    state: 'complete',
    progress: 100,
    candidateFindingsCount: 2,
    currentAction: 'Boundaries validated against D-01 through D-08 isolation invariants',
    logs: [
      '[00:01.20] Session jules-sess-2026-88a4 initialized with source snapshot 3c9db33177',
      '[00:02.40] Parsing module dependency tree across 38 tracked files',
      '[00:04.10] Analyzing manager orchestrator versus worker isolation boundaries',
      '[00:06.80] Flagged candidate finding: log buffer sizing in TerminalChrome',
      '[00:08.50] Completed architecture boundary analysis',
    ],
    durationMs: 8500,
  },
  {
    id: 'act_sec',
    name: 'Security & Credential Boundaries',
    targetScope: 'src/auth, src/crypto, token storage',
    state: 'complete',
    progress: 100,
    candidateFindingsCount: 3,
    currentAction: 'Checked host allowlist, secret leak prevention, and OAuth scopes',
    logs: [
      '[00:01.50] Inspecting network binding logic in serverConfig.ts',
      '[00:03.20] Verified: regional wildcard removed from trusted host allowlist',
      '[00:05.10] Analyzing potential hardcoded PAT tokens in source trees',
      '[00:07.30] Candidate claim generated: unencrypted token in synthetic fixture',
      '[00:09.10] Checking DNS rebinding attack vectors on non-standard dev ports',
      '[00:11.40] Completed security audit across all tracked endpoints',
    ],
    durationMs: 11400,
  },
  {
    id: 'act_correct',
    name: 'State Machine & Lifecycle Isolation',
    targetScope: 'src/lifecycle, ScreenEMultiAgent.tsx, App.tsx',
    state: 'complete',
    progress: 100,
    candidateFindingsCount: 2,
    currentAction: 'Inspected generation tokens, StrictMode timers, and clean unmounts',
    logs: [
      '[00:01.10] Tracing worker state ownership between App.tsx and ScreenEMultiAgent.tsx',
      '[00:03.80] Verified generation token invalidation upon child unmount',
      '[00:06.20] Simulated parent re-renders during active worker execution',
      '[00:08.40] Flagged candidate finding: child unmount race condition handling',
      '[00:10.00] Completed lifecycle correctness audit',
    ],
    durationMs: 10000,
  },
  {
    id: 'act_deps',
    name: 'Dependency & Sandbox Vulnerabilities',
    targetScope: 'package.json, vite.config.ts, build tooling',
    state: 'complete',
    progress: 100,
    candidateFindingsCount: 1,
    currentAction: 'Validated Vitest/Vite peer versions and package scripts',
    logs: [
      '[00:01.00] Analyzing package.json dependencies and pinned version constraints',
      '[00:02.50] Confirmed Vitest 5.0.4 + Vite 6.4.0 peer alignment',
      '[00:04.10] Checked dev server proxy configurations for unauthorized bypasses',
      '[00:06.00] Flagged candidate finding: narrow terminal wrap on report table',
      '[00:07.20] Completed supply chain and sandbox analysis',
    ],
    durationMs: 7200,
  },
];

export const DEFAULT_COVERAGE_LEDGER: RepositoryAuditCoverage[] = [
  {
    path: 'src/utils/serverConfig.ts',
    module: 'src/utils',
    level: 'independently_verified',
    evidence_references: [
      'AST check verified host allowlist enforcement without regional wildcards',
      'Caller trace: vite.config.ts line 14 binds strictly to serverConfig.allowedHosts',
      'Passed Vitest suite regression tests R6, R7, and R8',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 94,
  },
  {
    path: 'src/components/screens/ScreenEMultiAgent.tsx',
    module: 'src/components',
    level: 'independently_verified',
    evidence_references: [
      'Component integration tests confirm worker generation isolation under React StrictMode',
      'Caller trace: App.tsx line 74 invokes handleLaunchReview without self-cancellation',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 248,
  },
  {
    path: 'src/utils/workerFactory.ts',
    module: 'src/utils',
    level: 'independently_verified',
    evidence_references: [
      'Deterministic mock factory verified with 100% test branch coverage',
      'Caller trace: App.tsx line 25 initializes isolated worker telemetry',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 82,
  },
  {
    path: 'src/components/TerminalChrome.tsx',
    module: 'src/components',
    level: 'context_analyzed',
    evidence_references: [
      'Terminal layout and accessibility contracts analyzed across 60/80/100/120 col profiles',
      'Caller trace: App.tsx root wrapper',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 280,
  },
  {
    path: 'src/data/scenarios.ts',
    module: 'src/data',
    level: 'context_analyzed',
    evidence_references: [
      'All 11 PR review scenarios cross-referenced against API-CONTRACT.md and G00-SCOPE.md',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 185,
  },
  {
    path: 'src/types/contract.ts',
    module: 'src/types',
    level: 'context_analyzed',
    evidence_references: [
      'Contract types validated against canonical API-CONTRACT.md Section 7',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 155,
  },
  {
    path: 'src/index.css',
    module: 'src',
    level: 'inspected',
    evidence_references: [
      'Syntax and Tailwind v4 import directives inspected by AST parser',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 42,
  },
  {
    path: 'src/main.tsx',
    module: 'src',
    level: 'inspected',
    evidence_references: [
      'React 19 root container initialization inspected',
    ],
    exclusion_or_unknown_reason: null,
    line_count: 18,
  },
  {
    path: 'src/components/modals/HandoffDocsModal.tsx',
    module: 'src/components',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Tracked in Git manifest; scheduled for subsequent verification pass',
    line_count: 110,
  },
  {
    path: 'src/utils/urlValidator.ts',
    module: 'src/utils',
    level: 'inventoried',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Tracked in Git manifest; Regex backtracking safety check pending',
    line_count: 65,
  },
  {
    path: 'bun.lock',
    module: 'root',
    level: 'excluded',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Excluded by pattern: bun.lock (Binary lockfile; audited via package.json)',
    line_count: 1200,
  },
  {
    path: 'dist/assets/index.js',
    module: 'dist',
    level: 'excluded',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Excluded by pattern: dist/** (Compiled distribution artifact)',
    line_count: 0,
  },
  {
    path: 'src/native/ink-bridge.ts',
    module: 'src/native',
    level: 'unknown',
    evidence_references: [],
    exclusion_or_unknown_reason: 'Proposed native Ink bridge file not found on pinned snapshot branch 3c9db33177; coverage unknown',
    line_count: 0,
  },
];

export const DEFAULT_AUDIT_FINDINGS: RepositoryAuditFinding[] = [
  {
    id: 'AUDIT-FIND-001',
    severity: 'P1',
    category: 'security',
    title: 'Missing Host header validation on non-standard preview proxy ports',
    path: 'src/utils/serverConfig.ts',
    line_start: 35,
    line_end: 48,
    affected_symbol: 'resolveServerNetworkConfig',
    claim: 'Jules detected that if host bindings default to 0.0.0.0 without explicit AIS_APPLET_HOST matching, DNS rebinding attacks are feasible.',
    source_evidence: "const host = isAiStudioPreview ? '0.0.0.0' : '127.0.0.1'; if (!isValidPreviewHost(envHost)) return DEFAULT_TRUSTED_HOSTS;",
    affected_callers: ['vite.config.ts:14', 'server.ts:32'],
    impact: 'Untrusted local network clients could theoretically mount cross-origin requests to local dev server.',
    recommendation: 'Enforce exact string match against allowedHosts without wildcards; fail-closed to 127.0.0.1.',
    source_worker: 'jules',
    source_activity_id: 'act_sec',
    confidence: 'high',
    verification: 'verified',
    independent_verification_notes: 'Manager independently confirmed: serverConfig.ts enforces exact allowlist without regional wildcards. Verified against test R6.',
    remediation_priority: 'Immediate (P1)',
  },
  {
    id: 'AUDIT-FIND-002',
    severity: 'P2',
    category: 'architecture',
    title: 'Direct worker mutation in child lifecycle violates unidirectional state flow',
    path: 'src/components/screens/ScreenEMultiAgent.tsx',
    line_start: 112,
    line_end: 128,
    affected_symbol: 'handleCancel',
    claim: 'Unstable parent callbacks in cleanup effects previously triggered phantom worker cancellations during state updates.',
    source_evidence: 'useEffect(() => { return () => { if (runTokenRef.current) cancelScheduledTimers(); }; }, []);',
    affected_callers: ['App.tsx:78', 'ScreenEMultiAgent.tsx:45'],
    impact: 'Workers could prematurely terminate during normal parent state re-renders without user interaction.',
    recommendation: 'Maintain generation token in child ref; only invoke parent state changes on deliberate user action.',
    source_worker: 'jules',
    source_activity_id: 'act_correct',
    confidence: 'high',
    verification: 'verified',
    independent_verification_notes: 'Manager verified: App.tsx owns worker state while ScreenEMultiAgent owns timers and token. Verified by Vitest integration tests.',
    remediation_priority: 'Standard (P2)',
  },
  {
    id: 'AUDIT-FIND-003',
    severity: 'P0',
    category: 'security',
    title: 'Hardcoded GitHub Personal Access Token leaked in client bundle',
    path: 'src/auth/secret_tokens.ts',
    line_start: 12,
    line_end: 14,
    affected_symbol: 'GITHUB_API_BEARER_TOKEN',
    claim: 'Jules reported finding an unencrypted PAT ghp_xxxx in source file src/auth/secret_tokens.ts.',
    source_evidence: 'const GITHUB_API_BEARER_TOKEN = "ghp_mockFabricated1234567890";',
    affected_callers: ['src/auth/githubClient.ts:5'],
    impact: 'Unauthorized access to GitHub repositories with developer token privileges.',
    recommendation: 'Rotate leaked secret immediately and remove file from Git history.',
    source_worker: 'jules',
    source_activity_id: 'act_sec',
    confidence: 'low',
    verification: 'rejected',
    independent_verification_notes: 'REJECTED BY MANAGER: File "src/auth/secret_tokens.ts" does NOT exist in verified snapshot 3c9db33177. Jules model fabricated this file and claim. No credentials found in codebase.',
    remediation_priority: 'None (Fabricated Finding Rejected)',
    conflicting_evidence: 'Git manifest digest verification failed: path not found in snapshot.',
  },
  {
    id: 'AUDIT-FIND-004',
    severity: 'P1',
    category: 'correctness',
    title: 'Quantum cryptographic signature missing rollback protection',
    path: 'src/crypto/quantum_signer.ts',
    line_start: 45,
    line_end: 58,
    affected_symbol: 'verifyQuantumSig',
    claim: 'Jules claimed lattice-based signature implementation lacks replay counter.',
    source_evidence: 'function verifyQuantumSig(payload) { return crypto.subtle.verify(...); }',
    affected_callers: ['src/crypto/orchestrator.ts:22'],
    impact: 'Potential signature replay under speculative quantum attacks.',
    recommendation: 'Implement monotonic nonce sequence validation.',
    source_worker: 'jules',
    source_activity_id: 'act_sec',
    confidence: 'low',
    verification: 'rejected',
    independent_verification_notes: 'REJECTED BY MANAGER: Hallucinated module. CodeGuardian is a TypeScript terminal CLI, not a quantum cryptography library. No such symbol exists in repository.',
    remediation_priority: 'None (Hallucination Discarded)',
    conflicting_evidence: 'Symbol search returned 0 occurrences across all 38 tracked files.',
  },
  {
    id: 'AUDIT-FIND-005',
    severity: 'P2',
    category: 'performance',
    title: 'Unbounded memory accumulation in long-running terminal stream buffer',
    path: 'src/components/TerminalChrome.tsx',
    line_start: 85,
    line_end: 95,
    affected_symbol: 'TerminalChrome',
    claim: 'Jules hypothesizes that rendering high-frequency log updates causes DOM tree bloat without virtual windowing.',
    source_evidence: '<main className="p-3 sm:p-5 flex-1 min-h-[460px] overflow-y-auto">{children}</main>',
    affected_callers: ['App.tsx:174'],
    impact: 'Degraded frame rate on constrained mobile or low-memory devices during extended 1000+ line worker logs.',
    recommendation: 'Evaluate react-window or Ink virtual row rendering before G01 native terminal rollout.',
    source_worker: 'jules',
    source_activity_id: 'act_arch',
    confidence: 'medium',
    verification: 'inconclusive',
    independent_verification_notes: 'INCONCLUSIVE: Log array is currently capped at 10 items in mock worker factory; benchmark evidence lacking. Requires real memory profiling under native Ink.',
    remediation_priority: 'Deferred to PRE-G01 profiling (P2)',
  },
  {
    id: 'AUDIT-FIND-006',
    severity: 'P3',
    category: 'compatibility',
    title: 'Hardcoded 80-column terminal wrap assumption in markdown report renderer',
    path: 'src/components/screens/ScreenGReport.tsx',
    line_start: 64,
    line_end: 72,
    affected_symbol: 'renderMarkdownReport',
    claim: 'Jules noted tabular output wraps awkwardly when terminal width is set to very-narrow (60 cols).',
    source_evidence: '<div className="overflow-x-auto whitespace-pre font-mono text-xs">...</div>',
    affected_callers: ['App.tsx:244'],
    impact: 'Table columns shift to second lines on 60x24 terminals.',
    recommendation: 'Use responsive block-stacked layouts instead of wide tables in narrow terminal profiles.',
    source_worker: 'jules',
    source_activity_id: 'act_deps',
    confidence: 'high',
    verification: 'verified',
    independent_verification_notes: 'Manager verified: Tested on 60-col terminal profile. Verified finding.',
    remediation_priority: 'Low (P3)',
  },
];

export const DEFAULT_AUDIT_REPORT: RepositoryAuditReport = {
  schema_version: '1.0.0',
  audit_id: 'audit-run-20261015-88a4',
  repository: DEFAULT_REPOSITORY_SNAPSHOT,
  status: 'ready',
  findings: DEFAULT_AUDIT_FINDINGS,
  coverage: DEFAULT_COVERAGE_LEDGER,
  architecture_summary: 'Modular TypeScript terminal architecture separating deterministic Manager orchestration from sandboxed workers and an isolated publication boundary. Aligns with D-01 through D-08.',
  limitations: [
    'Static AST analysis cannot capture runtime dynamic code evaluation or external bash toolchains.',
    'Jules API experimental v1alpha requires immutable commit pinning; startingBranch is not immutable.',
    'Test execution evidence is synthetic; real automated test coverage requires approved sandbox runner.',
  ],
  executed_checks: [
    'git rev-parse HEAD (pinned commit verification: 3c9db33177e7ee8e2c6310ac05af21839f0cac08)',
    'git ls-files -s (manifest digest verification)',
    'npm run lint (TypeScript compiler validation)',
    'npm test (41 vitest unit and component integration tests passing)',
  ],
  jules_session_ids: ['jules-sess-2026-88a4'],
  generated_at: '2026-10-15T04:30:00.000Z',
  report_digest: 'sha256:4d60e71ab8735fbc249870196238bcde2489c091d3e867b31278eabcf0012345',
};

export const AUDIT_SCENARIOS: AuditScenarioDefinition[] = [
  {
    id: 'audit_standard_success',
    name: '1. Standard Full Repository Audit (Ready / Verified)',
    tag: 'SUCCESS',
    description: 'Complete Jules audit on pinned snapshot 3c9db33177. 4 activities complete, 3 verified findings, 2 rejected hallucinations, 1 inconclusive.',
    initialScreen: 'audit_report',
    expectedOutcome: 'AUDIT.md report ready with 3 verified findings, 2 manager-rejected hallucinations, and full coverage ledger.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'authenticated',
      planApproved: true,
      activitiesState: {
        act_arch: 'complete',
        act_sec: 'complete',
        act_correct: 'complete',
        act_deps: 'complete',
      },
      status: 'ready',
    },
  },
  {
    id: 'audit_partial_timeout',
    name: '2. Timeout on Dependency Analysis (Partial Report)',
    tag: 'PARTIAL',
    description: 'Dependency activity hits 15m timeout cap. Report marked PARTIAL with unknown coverage flags for unresolved files.',
    initialScreen: 'audit_activity',
    expectedOutcome: '3 activities complete, 1 timed out. Coverage ledger marks dependency modules as unknown; report status is PARTIAL.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'authenticated',
      planApproved: true,
      activitiesState: {
        act_arch: 'complete',
        act_sec: 'complete',
        act_correct: 'complete',
        act_deps: 'timed_out',
      },
      isTimeout: true,
      status: 'partial',
    },
  },
  {
    id: 'audit_operator_cancelled',
    name: '3. Operator Abort Mid-Run (Cancellation Safety)',
    tag: 'CANCELLED',
    description: 'Operator triggers explicit Cancel during active Jules analysis. Timers clear, running activities enter cancelled state.',
    initialScreen: 'audit_activity',
    expectedOutcome: 'All active activities transition immediately to [CANCELLED]; no pending background callbacks.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'authenticated',
      planApproved: true,
      activitiesState: {
        act_arch: 'cancelled',
        act_sec: 'cancelled',
        act_correct: 'cancelled',
        act_deps: 'cancelled',
      },
      isCancelled: true,
      status: 'failed',
    },
  },
  {
    id: 'audit_missing_auth',
    name: '4. Jules Authentication Failure (Preflight Blocked)',
    tag: 'AUTH_BLOCKED',
    description: 'Google Jules API key is missing or session expired. Preflight fails closed before creating a remote cloud session.',
    initialScreen: 'audit_preflight',
    expectedOutcome: 'Audit Preflight reports [AUTH_ERROR] Missing GCP Credentials. Preflight is blocked before cloud execution.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'unauthenticated',
      planApproved: false,
      activitiesState: {
        act_arch: 'queued',
        act_sec: 'queued',
        act_correct: 'queued',
        act_deps: 'queued',
      },
      status: 'blocked',
    },
  },
  {
    id: 'audit_stale_commit',
    name: '5. Branch Advanced Beyond Intended SHA (Stale Commit Refusal)',
    tag: 'STALE_SHA',
    description: 'Remote main branch points to 5d88ab210e, mismatching intended 3c9db33177. Preflight blocks unpinned execution.',
    initialScreen: 'audit_preflight',
    expectedOutcome: 'Snapshot verification refuses to launch Jules on drifting branch without an explicit pinned SHA re-acknowledgement.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: false,
      julesAuth: 'authenticated',
      planApproved: false,
      activitiesState: {
        act_arch: 'queued',
        act_sec: 'queued',
        act_correct: 'queued',
        act_deps: 'queued',
      },
      status: 'blocked',
    },
  },
  {
    id: 'audit_invalid_repo',
    name: '6. Invalid Repository Identity (Validation Error)',
    tag: 'INVALID_REPO',
    description: 'Repository name contains invalid characters or does not exist on GitHub.',
    initialScreen: 'audit_repo',
    expectedOutcome: 'Repository selection displays clear error banner and disables Preflight advancement.',
    snapshotState: {
      owner: 'UnknownOrg',
      repo: 'NonExistent$Repo',
      branch: 'main',
      intendedSha: '0000000000000000000000000000000000000000',
      isShaVerified: false,
      julesAuth: 'authenticated',
      planApproved: false,
      activitiesState: {
        act_arch: 'queued',
        act_sec: 'queued',
        act_correct: 'queued',
        act_deps: 'queued',
      },
      status: 'failed',
    },
  },
  {
    id: 'audit_fabricated_claims',
    name: '7. Fabricated Paths & Hallucinated Symbols (Manager Rejection)',
    tag: 'HALLUCINATIONS',
    description: 'Jules reports 2 hallucinated security vulnerabilities in nonexistent files. CodeGuardian Manager catches and rejects both.',
    initialScreen: 'audit_verification',
    expectedOutcome: 'Manager verification screen highlights the 2 rejected findings with explicit verification failure notes.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'authenticated',
      planApproved: true,
      activitiesState: {
        act_arch: 'complete',
        act_sec: 'complete',
        act_correct: 'complete',
        act_deps: 'complete',
      },
      hasFabricatedClaims: true,
      status: 'ready',
    },
  },
  {
    id: 'audit_plan_rejected',
    name: '8. Operator Rejects Audit Plan (Safe Abort)',
    tag: 'PLAN_REJECTED',
    description: 'Operator inspects Jules proposed plan in preflight and clicks Reject Plan due to excessive token quote.',
    initialScreen: 'audit_preflight',
    expectedOutcome: 'Audit session cleanly aborted without initiating any cloud activities or consuming quota.',
    snapshotState: {
      owner: 'PixelsWorker',
      repo: 'CodeGuardian',
      branch: 'main',
      intendedSha: '3c9db33177e7ee8e2c6310ac05af21839f0cac08',
      isShaVerified: true,
      julesAuth: 'authenticated',
      planApproved: false,
      activitiesState: {
        act_arch: 'queued',
        act_sec: 'queued',
        act_correct: 'queued',
        act_deps: 'queued',
      },
      status: 'blocked',
    },
  },
];

export interface SynchronizedAuditData {
  snapshot: RepositorySnapshot;
  activities: JulesActivity[];
  coverage: RepositoryAuditCoverage[];
  findings: RepositoryAuditFinding[];
  report: RepositoryAuditReport;
}
export interface AuditContextParams {
  owner: string;
  repo: string;
  branch?: string;
  intendedSha?: string;
  isShaVerified?: boolean;
  exclusionPatterns?: string[];
  scenario?: AuditScenarioDefinition;
}

export function createActivitiesForTarget(
  owner: string,
  repo: string,
  activitiesState?: Record<string, JulesActivityState>,
  customScope?: string
): JulesActivity[] {
  const isCodeGuardian = owner === "PixelsWorker" && repo === "CodeGuardian";
  const isReact = owner === "facebook" && repo === "react";

  return DEFAULT_JULES_ACTIVITIES.map((base) => {
    const targetState = activitiesState ? activitiesState[base.id] || "queued" : "queued";
    let targetScope = base.targetScope;
    let logs: string[] = [];
    let candidateFindingsCount = 0;
    let currentAction = "Waiting for preflight authorization";
    let progress = 0;
    let durationMs = 0;

    if (!isCodeGuardian) {
      if (isReact) {
        if (base.id === "act_arch") targetScope = "packages/react, packages/react-dom";
        else if (base.id === "act_sec") targetScope = "packages/react, security policies";
        else if (base.id === "act_correct") targetScope = "packages/react-reconciler";
        else if (base.id === "act_deps") targetScope = "package.json, build scripts";
      } else {
        targetScope = customScope || (owner + "/" + repo);
      }
      logs = ["[00:00.00] Queued for repository: " + owner + "/" + repo];
      candidateFindingsCount = 0;
      currentAction = "Waiting for preflight authorization";
      if (activitiesState) {
        if (targetState === "complete") progress = 100;
        else if (targetState === "running") progress = 45;
        else if (targetState === "cancelled") progress = 30;
      }
    } else {
      // CodeGuardian
      if (activitiesState) {
        candidateFindingsCount = base.candidateFindingsCount;
        currentAction = base.currentAction;
        logs = [...base.logs];
        if (targetState === "complete") {
          progress = 100;
          durationMs = base.durationMs;
        } else if (targetState === "running") {
          progress = 45;
          durationMs = 2500;
          currentAction = "Analyzing AST and caller dependencies...";
          logs = [
            "[00:01.00] Session initialized for " + base.name,
            "[00:02.50] Parsing syntax tree and extracting symbols...",
          ];
        } else if (targetState === "cancelled") {
          progress = 30;
          durationMs = 1500;
          currentAction = "Cancelled by operator signal";
          logs = [
            "[00:01.00] Session initialized for " + base.name,
            "[00:01.50] CANCELLED: Operator abort signal received.",
          ];
        } else if (targetState === "timed_out") {
          progress = 80;
          durationMs = 15000;
          currentAction = "Hard timeout exceeded (15m cap)";
          logs = [
            "[00:01.00] Session initialized for " + base.name,
            "[05:00.00] Large dependency traversal in progress...",
            "[15:00.00] ERROR: Operation timed out after 15m hard cap.",
          ];
        } else if (targetState === "queued") {
          progress = 0;
          durationMs = 0;
          candidateFindingsCount = 0;
          currentAction = "Waiting for preflight authorization";
          logs = [];
        } else if (targetState === "failed") {
          progress = 10;
          durationMs = 1000;
          currentAction = "Preflight failed or rejected";
          logs = ["[00:00.50] Preflight failed closed."];
        }
      } else {
        logs = ["[00:00.00] Queued for CodeGuardian (unverified)"];
      }
    }

    return {
      ...base,
      targetScope,
      state: targetState,
      progress,
      durationMs,
      candidateFindingsCount,
      currentAction,
      logs,
    };
  });
}

export function synchronizeAuditContext(params: AuditContextParams): SynchronizedAuditData {
  const {
    owner,
    repo,
    branch = "main",
    intendedSha = "",
    isShaVerified = false,
    exclusionPatterns,
    scenario,
  } = params;

  if (scenario) {
    const { owner: sOwner, repo: sRepo, intendedSha: sSha, isShaVerified: sVerified, status, activitiesState, isTimeout } = scenario.snapshotState;
    if (sOwner === "PixelsWorker" && sRepo === "CodeGuardian") {
      const snapshot: RepositorySnapshot = {
        ...DEFAULT_REPOSITORY_SNAPSHOT,
        requested_branch: scenario.snapshotState.branch || "main",
        intended_commit_sha: sSha,
        verified_audit_commit_sha: sVerified ? sSha : null,
      };

      const activities = createActivitiesForTarget(sOwner, sRepo, activitiesState);

      if (scenario.id === "audit_partial_timeout" || isTimeout) {
        const coverage = DEFAULT_COVERAGE_LEDGER.map((c) =>
          c.module === "package.json" || c.path.includes("vite.config")
            ? {
                ...c,
                level: "unknown" as const,
                evidence_references: [],
                exclusion_or_unknown_reason: "15m timeout exceeded during dependency traversal.",
              }
            : c
        );
        const findings = DEFAULT_AUDIT_FINDINGS.filter((f) => f.source_activity_id !== "act_deps");
        return {
          snapshot,
          activities,
          coverage,
          findings,
          report: {
            ...DEFAULT_AUDIT_REPORT,
            repository: snapshot,
            status: "partial",
            findings,
            coverage,
            limitations: [
              ...DEFAULT_AUDIT_REPORT.limitations,
              "Dependency activity timed out; supply chain coverage remains partial.",
            ],
            report_digest: "sha256:4d60e71ab8735fbc249870196238bcde2489c091d3e867b31278eabcf0012345-partial",
          },
        };
      }

      if (
        scenario.id === "audit_operator_cancelled" ||
        scenario.id === "audit_missing_auth" ||
        scenario.id === "audit_stale_commit" ||
        scenario.id === "audit_plan_rejected"
      ) {
        const coverage = DEFAULT_COVERAGE_LEDGER.map((c) => ({
          ...c,
          level: "inventoried" as const,
          evidence_references: [],
        }));
        return {
          snapshot,
          activities,
          coverage,
          findings: [],
          report: {
            schema_version: "1.0.0",
            audit_id: "audit-run-aborted",
            repository: snapshot,
            status,
            findings: [],
            coverage,
            architecture_summary: "Audit session did not complete. No verified systemic findings exist.",
            limitations: [
              "Audit was interrupted, unauthenticated, or blocked by preflight invariants.",
              "No source evidence or manager fact-checked claims collected.",
            ],
            executed_checks: ["git rev-parse HEAD (pinned commit check)"],
            jules_session_ids: [],
            generated_at: "2026-10-15T04:30:00.000Z",
            report_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
          },
        };
      }

      return {
        snapshot,
        activities,
        coverage: DEFAULT_COVERAGE_LEDGER,
        findings: DEFAULT_AUDIT_FINDINGS,
        report: {
          ...DEFAULT_AUDIT_REPORT,
          repository: snapshot,
          status,
          findings: DEFAULT_AUDIT_FINDINGS,
          coverage: DEFAULT_COVERAGE_LEDGER,
        },
      };
    }

    // External scenario (e.g. audit_invalid_repo with UnknownOrg/NonExistent$Repo)
    return synchronizeAuditContext({
      owner: sOwner,
      repo: sRepo,
      branch: scenario.snapshotState.branch,
      intendedSha: sSha,
      isShaVerified: sVerified,
    });
  }

  // No scenario: Context-based synchronization (manual edits, preset clicks, etc.)
  const isCodeGuardian = owner === "PixelsWorker" && repo === "CodeGuardian";
  const isReact = owner === "facebook" && repo === "react";

  const defaultExclusions = DEFAULT_REPOSITORY_SNAPSHOT.exclusion_patterns;
  const isDefaultExclusions =
    !exclusionPatterns ||
    (exclusionPatterns.length === defaultExclusions.length &&
      exclusionPatterns.every((p, idx) => p.trim() === defaultExclusions[idx]));

  // Check if CodeGuardian matches verified baseline (main branch, verified baseline SHA, AND default exclusions)
  const isCodeGuardianBaseline =
    isCodeGuardian &&
    (branch === "main" || !branch) &&
    (intendedSha === DEFAULT_REPOSITORY_SNAPSHOT.intended_commit_sha || !intendedSha) &&
    isShaVerified &&
    isDefaultExclusions;

  if (isCodeGuardianBaseline) {
    const snapshot: RepositorySnapshot = {
      ...DEFAULT_REPOSITORY_SNAPSHOT,
      requested_branch: branch || "main",
      intended_commit_sha: intendedSha || DEFAULT_REPOSITORY_SNAPSHOT.intended_commit_sha,
      verified_audit_commit_sha: isShaVerified ? (intendedSha || DEFAULT_REPOSITORY_SNAPSHOT.intended_commit_sha) : null,
      exclusion_patterns: exclusionPatterns || DEFAULT_REPOSITORY_SNAPSHOT.exclusion_patterns,
    };
    return {
      snapshot,
      activities: DEFAULT_JULES_ACTIVITIES,
      coverage: DEFAULT_COVERAGE_LEDGER,
      findings: DEFAULT_AUDIT_FINDINGS,
      report: {
        ...DEFAULT_AUDIT_REPORT,
        repository: snapshot,
      },
    };
  }

  if (isCodeGuardian) {
    // Same repository (CodeGuardian), but DIFFERENT SHA, branch, exclusion scope, or unverified!
    // Must invalidate previous findings and report readiness!
    const effectiveSha = intendedSha || DEFAULT_REPOSITORY_SNAPSHOT.intended_commit_sha;
    const snapshot: RepositorySnapshot = {
      owner: "PixelsWorker",
      repo: "CodeGuardian",
      requested_branch: branch,
      intended_commit_sha: effectiveSha,
      verified_audit_commit_sha: isShaVerified ? effectiveSha : null,
      tracked_files: DEFAULT_REPOSITORY_SNAPSHOT.tracked_files,
      total_files_count: DEFAULT_REPOSITORY_SNAPSHOT.total_files_count,
      tracked_file_manifest_digest: "sha256:unverified-drift-manifest-digest-0000000000000000000000",
      exclusion_patterns: exclusionPatterns || DEFAULT_REPOSITORY_SNAPSHOT.exclusion_patterns,
    };

    const unverifiedCoverage: RepositoryAuditCoverage[] = DEFAULT_COVERAGE_LEDGER.map((c) => ({
      ...c,
      level: "inventoried",
      evidence_references: [],
      exclusion_or_unknown_reason: "Unverified commit snapshot or scope drift: pending independent verification.",
    }));

    const activities = createActivitiesForTarget("PixelsWorker", "CodeGuardian", undefined, "src/core, ARCHITECTURE.md");

    return {
      snapshot,
      activities,
      coverage: unverifiedCoverage,
      findings: [],
      report: {
        schema_version: "1.0.0",
        audit_id: "audit-run-unverified-codeguardian",
        repository: snapshot,
        status: "blocked",
        findings: [],
        coverage: unverifiedCoverage,
        architecture_summary: "Repository snapshot (PixelsWorker/CodeGuardian @ " + branch + ":" + effectiveSha.slice(0, 10) + "). Unverified commit SHA or branch drift detected (or scope modification); previous audit findings and report readiness invalidated.",
        limitations: [
          "Intended commit SHA or exclusion scope has not completed independent source verification.",
          "Previous audit findings and report readiness invalidated due to snapshot or scope drift.",
        ],
        executed_checks: ["git rev-parse HEAD (unverified commit check)"],
        jules_session_ids: [],
        generated_at: "2026-10-15T04:30:00.000Z",
        report_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
  }

  if (isReact) {
    const effectiveSha = intendedSha || EXTERNAL_REACT_SNAPSHOT.intended_commit_sha;
    const snapshot: RepositorySnapshot = {
      ...EXTERNAL_REACT_SNAPSHOT,
      requested_branch: branch || EXTERNAL_REACT_SNAPSHOT.requested_branch,
      intended_commit_sha: effectiveSha,
      verified_audit_commit_sha: isShaVerified ? effectiveSha : null,
      exclusion_patterns: exclusionPatterns || EXTERNAL_REACT_SNAPSHOT.exclusion_patterns,
    };
    const activities = createActivitiesForTarget("facebook", "react", undefined, "packages/react, packages/react-dom");
    return {
      snapshot,
      activities,
      coverage: EXTERNAL_REACT_COVERAGE,
      findings: [],
      report: {
        schema_version: "1.0.0",
        audit_id: "audit-run-external-react",
        repository: snapshot,
        status: "blocked",
        findings: [],
        coverage: EXTERNAL_REACT_COVERAGE,
        architecture_summary: "External repository snapshot (facebook/react). No CodeGuardian audit evidence has been asserted or verified.",
        limitations: [
          "External repository snapshot has not completed CodeGuardian Manager independent verification.",
          "No baseline findings or coverage evidence exist for this external repository.",
        ],
        executed_checks: [
          "git rev-parse HEAD (external repository snapshot: unverified)",
          "git ls-files -s (manifest check)",
        ],
        jules_session_ids: [],
        generated_at: "2026-10-15T04:30:00.000Z",
        report_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
    };
  }

  // Generic external / unknown repository
  const effectiveSha = intendedSha || "0000000000000000000000000000000000000000";
  const snapshot: RepositorySnapshot = {
    owner,
    repo,
    requested_branch: branch,
    intended_commit_sha: effectiveSha,
    verified_audit_commit_sha: isShaVerified ? effectiveSha : null,
    tracked_file_manifest_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    total_files_count: 0,
    tracked_files: [],
    exclusion_patterns: exclusionPatterns || [],
  };

  const activities = createActivitiesForTarget(owner, repo, undefined, owner + "/" + repo);

  return {
    snapshot,
    activities,
    coverage: [],
    findings: [],
    report: {
      schema_version: "1.0.0",
      audit_id: "audit-run-" + owner.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + repo.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      repository: snapshot,
      status: "failed",
      findings: [],
      coverage: [],
      architecture_summary: "External repository snapshot (" + owner + "/" + repo + "). No source files inventoried or verified.",
      limitations: [
        "External repository snapshot has not completed CodeGuardian Manager independent verification.",
        "No source evidence or independent caller verifications available.",
      ],
      executed_checks: ["git rev-parse HEAD (pinned commit check)"],
      jules_session_ids: [],
      generated_at: "2026-10-15T04:30:00.000Z",
      report_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    },
  };
}

export function getAuditDataForRepository(
  owner: string,
  repo: string,
  intendedSha: string = "",
  isVerified: boolean = false,
  branch: string = "main",
  exclusionPatterns?: string[]
): SynchronizedAuditData {
  return synchronizeAuditContext({
    owner,
    repo,
    branch,
    intendedSha,
    isShaVerified: isVerified,
    exclusionPatterns,
  });
}

export function getAuditDataForScenario(scenario: AuditScenarioDefinition): SynchronizedAuditData {
  return synchronizeAuditContext({
    owner: scenario.snapshotState.owner,
    repo: scenario.snapshotState.repo,
    branch: scenario.snapshotState.branch,
    intendedSha: scenario.snapshotState.intendedSha,
    isShaVerified: scenario.snapshotState.isShaVerified,
    scenario,
  });
}
