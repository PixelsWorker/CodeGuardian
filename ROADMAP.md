# CodeGuardian — Full Development Roadmap

**Status:** PLANNING BASELINE — updated 2026-10-16 with accepted product direction decisions  
**Updated:** 2026-10-16  
**Product:** CLI-first, multi-agent GitHub pull-request review platform  
**Repository:** https://github.com/PixelsWorker/CodeGuardian  
**Active Windows checkout:** `E:\Projects\CodeGuardian\` (relocated 2026-10-16)  
**Active planned development branch:** `dev` (future G00 feature branch requires separate approval)  
**Delivery model:** One group = one independently reviewed acceptance unit, including its tests and integration checks.

> This document consolidates the existing proposed scope and estimates. It does not supersede approval rules in the parent workspace instructions, repository `AGENTS.md`, `ARCHITECTURE.md`, `API-CONTRACT.md`, or `G00-SCOPE.md`. A roadmap entry is not authority to change code, install packages, create branches, push, open PRs, merge, post GitHub reviews, or deploy.

## 1. Product vision and operating boundaries

A developer supplies a GitHub PR URL. CodeGuardian reads the approved PR context, runs bounded specialist reviews, validates and consolidates evidence-backed findings, shows a report and dry-run publication preview, and — only after separate explicit authorization — asks an isolated publisher to post a `COMMENT` review.

- **CLI:** Input, status, interactive review progress, findings, reports, and explicit operator confirmation.
- **CodeGuardian Manager:** Deterministic orchestration, policy and state control, worker selection, validation, retries, deadlines, and audit metadata.
- **CodeGuardianMini workers:** Security, logic/correctness, architecture, and quality/testing/performance analysis; read-only, bounded, and never supplied GitHub publisher authority.
- **GitHub reader:** Read-only PR metadata, diff and branch/SHA inspection.
- **Validator/synthesizer:** Schema, file and changed-line verification, deduplication, and coverage warnings.
- **Publisher:** Separate, one-time approval-gated GitHub writing component, implemented no earlier than G03.
- **PR-Agent worker:** Optional external, version-pinned A2A integration in G04; not a dependency for the Codex-first MVP. Isolated behind a CodeGuardian adapter; no direct GitHub access.

Real deployment, unsupervised publication, automated PR merges, direct model-controlled infrastructure commands, arbitrary-hostile PR execution, and a web dashboard are excluded from G00–G03.

## 2. Verified Git starting point

**2026-10-16 update (local governance patch baseline):** local `main` HEAD `e8e58443c9e13129bc2ee9459751c9944eef3da9`, zero divergence from `origin/main`. Browser prototype (`src/`) is **FROZEN at this SHA** as the accepted UX design reference. `dev` branch pre-patch: `a39a37525ba5a5645dec8e382be0f47c735d1d0e`. Git histories have been reconciled. `main` now contains a React/Vite browser UX reference, its manifest and tests, but the native CLI, local test results and G00 acceptance remain unverified.

At the start of this roadmap, the live GitHub references were:

| Ref | Verified SHA | Notes |
|---|---|---|
| `main` | `e3e6b281e517a2d884309d527650ba9329e76d8e` | Two-parent reconciliation commit, preserving original `main` and `dev` histories |
| `dev` | `f115f7d2e87b63a4d0ddf1aa70522fc9e7f1ab67` | Documentation baseline **before this roadmap addition** |

Prior comparison showed zero file differences between those two baselines. Creating this roadmap on `dev` intentionally makes `dev` ahead in documentation without changing `main`. Do not re-run historical Git-reconciliation tasks.

At this update's live remote checkpoint the repository contains browser prototype source, package manifest and tests, **not** a verified native CLI or working real PR review system. Some existing planning files retain historical Git descriptions from before reconciliation. Treat them as historical; use live Git references for new work. Do not edit protected documents incidentally.

## 3. Group roadmap and effort forecast

The day estimates for G00–G05 follow `PROJECT-BRIEF.md`. They are working-day forecasts after prerequisites, not guaranteed delivery dates. PRE-G00 is an additional planning allowance.

| Stage | Group outcome / acceptance | Estimate | Cumulative group time | Gate |
|---|---|---:|---:|---|
| PRE-G00 | Architecture, G00 design/scope, runtime and safe execution environment accepted | 0.5–2 days (planning allowance) | Before kickoff | Explicit architecture/setup/G00 approval |
| **G00** | Entire interactive CLI experience works with clearly marked mock data | **2–3 days** | 2–3 days | Human acceptance of full terminal UX |
| **G01** | Real GitHub authentication preflight and read-only PR inspection | **3–5 days** | 5–8 days | Auth, identity, diff, edge cases, integration tests |
| **G02** | Real Codex specialist workers yield validated consolidated findings | **5–8 days** | 10–16 days | Real bounded runs, trustworthy reports, partial/failure handling |
| **G03** | Separate publisher posts one verified, human-approved `COMMENT` review | **3–5 days** | **13–21 days** | Permission, stale-SHA, replay and duplicate safeguards |
| **G04** | Optional PR-Agent A2A adapter contributes normalized findings | **3–5 days** | 16–26 days if included | Provider configuration and integration contract tests |
| **G05** | Signed GitHub events trigger safe, deduplicated automated reviews | **5–8 days** | 21–34 days with G04 | Independent security/identity/webhook approval |
| **G06 (PROPOSED, OPTIONAL)** | Jules repository audit, verified coverage and `AUDIT.md` | **TBD after pilot** | Not included in G00-G05 estimates | Separate source access, pilot, security and human acceptance |

**Primary MVP:** G00–G03 = approximately 13–21 working days of implementation (around 3–5 work weeks), excluding PRE-G00, approval waits, sandbox repairs, and surprises.  
**Extended delivery:** G00–G05 = approximately 21–34 working days (around 4–7 work weeks) when G04 is included. G04 is optional, not a blocker for an independently approved G05.  
**Calendar dates:** Set only after the start date, environment readiness, dependency compatibility, and group approvals are confirmed.

Indicative progression: **Week 1:** PRE-G00/G00; **Weeks 1–2:** G01; **Weeks 2–4:** G02; **Weeks 4–5:** G03 MVP gate; **Weeks 5–7:** optional G04/G05. These windows can slide.

## 4. PRE-G00 — Architecture and execution-readiness gate

**Goal:** Establish what is approved before writing executable product code.

Decision checklist:
1. Accept/revise architectural decisions D-01 to D-08 in `ARCHITECTURE.md`, preserving the manager / read-only worker / isolated publisher split.
2. Accept `G00-SCOPE.md` and review the proposed command vocabulary and mock journeys in `G00-CLI-WIREFRAMES.md`.
3. Treat `API-CONTRACT.md` v1 as the proposed canonical internal schema; confirm any G00 fixture mapping before implementation.
4. Confirm Fedora/Linux toolchain, Node runtime, package manager and terminal capabilities. Resolve Codex's observed `bwrap: No permissions to create a new namespace` issue using an approved execution configuration; do not disable OS security controls merely to bypass it.
5. Approve exact dependency versions and the G00-specific worktree/branch/paths. No new protected-file edits without exact path approval.
6. Record remaining repo licensing, branch-protection, credential storage, and fork-review security decisions separately. Do not confuse those with permission to begin G00.

**Exit:** Accepted architecture and G00 brief; working approved Codex terminal execution; group TODO with integrated tests and explicit implementation authorization.

## 5. G00 — Complete simulated CLI UX demo

**One observable outcome:** A native terminal application demonstrates the COMPLETE CodeGuardian UX without contacting GitHub, an AI provider, a Docker service, or any publishing endpoint.

**Recommended implementation candidates (not installed or automatically approved):**

| Layer | Candidate | Rule |
|---|---|---|
| Runtime | Node.js 24 LTS | Confirm host version and exact pin |
| Language | TypeScript ESM (6.x/7.x candidate) | Verify compiler and dependency compatibility |
| Terminal UI | Ink 8.0.0 and React >=19.3 | Prototype redraw/resize/input behavior; freeze tested versions |
| Commands | Commander 15.x | Agree command vocabulary |
| Validation | Zod 4.x | Match accepted `API-CONTRACT.md` |
| Development runner | tsx 4.x | Pin compatible release |
| Tests | Vitest 5.0.4 + compatible Vite peer | Select patched versions, run local tests only |
| Package management | npm 11.17.0, exact lockfile | Preferred over pnpm for host compatibility |
| Data | Local JSON mock fixtures | No real secrets, tokens, authentication, or network access |

**Existing design track — Google AI Studio (visual reference only):** A nine-screen React/Vite browser mock with synthetic scenarios and test source now exists on remote `main`. This is a design reference, **not** accepted native CLI G00, and no tests were run by this governance review. Any further AI Studio sync/deployment still needs the applicable approval; Codex's native terminal implementation remains a separate accepted scope.

**Required G00 screens and flows:**
- Welcome/help, command discovery, invalid commands and terminal controls.
- Simulated GitHub and Codex auth status, missing access, expired sessions and suggested actions.
- PR URL entry/validation and synthetic owner/repo/number, base/head SHA, file/diff/risk overview.
- Four mock specialist lanes (Security, Logic/Correctness, Architecture, Quality/Testing/Performance), including queued/running/completed/skipped/failed/timed-out/cancelled states.
- Validation and synthesis, including accepted/rejected/duplicate findings, invalid changed lines, uncertain or partial worker coverage.
- Findings by P0/P1/P2/P3, Markdown and JSON report views, simulation warnings and `tests.executed=false` for analysis fixtures.
- Dry-run publication preview, proposed `COMMENT` action, explicit simulated yes/no confirmation, changed-head refusal, permission denial and duplicate protection.
- Retry, cancel, blocked, failed and partial states; keyboard navigation; narrow terminals and `NO_COLOR`.

**Proposed command contract:** `codeguardian --help`, `codeguardian auth status`, `codeguardian review <GITHUB_PR_URL> --demo`, `codeguardian report <RUN_ID> --format markdown|json`, `codeguardian publish <RUN_ID> --dry-run`. These names still require G00 acceptance.

**Suggested source layout:** `src/cli/`, `src/ui/`, `src/core/`, `src/contracts/`, `src/fixtures/`, `src/adapters/mock/`, and `tests/`, with separate UI, deterministic state machine, contracts, and mock adapters. Keep the G00 mock architecture replaceable rather than building real G01/G02/G03 integrations early.

**Test plan within the same G00 group:** CLI parsing, state transitions, PR URL rejection, worker timeout/cancellation, severity/evidence presentation, schema/fixture validation, fake publication never writing, report formatting, interaction smoke tests, small widths, redraw and non-color output. Report exact commands and pass/fail/skip counts. Do not claim real PR analysis or publication was tested.

**Exit:** Complete reproducible demo and tests in ONE scoped feature branch and ONE group PR, followed by explicit operator UX acceptance. No G01 work starts until that acceptance.

## 6. G01 — Authentication and real PR inspection

**Prerequisite:** G00 approved.

- Add real `gh` status/permission checks without printing secrets.
- Validate GitHub PR URLs, repository allowlist, PR state and owner/repo/number.
- Fetch real metadata, file lists, diffs and pinned base/head SHAs through a read-only GitHub reader.
- Show deleted/renamed files, invalid URLs, closed/draft PRs, rate limits, permission failures and truncated diff warnings.
- Preserve mock adapters for isolated regression tests; do not introduce model inference or GitHub writing.
- Verify authentication failures, access-denied conditions, diff correctness, CLI UX and relevant integration paths.

**Exit:** Real inspect-only review entry point, test evidence and separately approved group acceptance.

## 7. G02 — Real multi-agent Codex review

**Prerequisite:** G01 approved and supported Codex auth/SDK operation verified.

- Integrate the official Codex CLI/TypeScript SDK through a replaceable adapter; supported ChatGPT login can be used initially if permitted. A Platform API key is not inherently needed for G00/G01.
- Manager selects the relevant CodeGuardianMini specialists; constrain jobs, time, concurrency and PR context.
- Keep GitHub publisher credentials outside worker access; review trusted developer-controlled repos first until credential/sandbox isolation is proven.
- Independently validate model output against the accepted JSON schema; verify paths, diff-line placement, evidence and severity.
- Deduplicate findings, preserve source-worker attribution, output Markdown/JSON and record partial/unknown coverage and failed/skipped roles.
- Test schema failures, prompt injection resistance, missing context, worker timeouts, cancellation, resource caps, false findings and reproducibility limitations.

**Exit:** One tested and reviewable real, read-only PR report; NO publication.

## 8. G03 — Human-controlled GitHub review publication

**Prerequisite:** G02 accepted.

- Introduce a separate deterministic publisher; do not give manager AI prompts or read-only workers direct write tools.
- Present final report, exact target PR, head SHA, report digest, inline comment positions, and `COMMENT` action.
- Require an explicit per-PR/per-head-SHA one-time approval; validate freshness, nonce, permissions and identity immediately before writing.
- Reject stale heads, changed reports, invalid inline lines, unauthorized repositories, duplicate publication and replayed approvals.
- Submit only a permitted GitHub `COMMENT` review, never `APPROVE`, `REQUEST_CHANGES`, a commit, push, merge, or code fix.
- Verify post-submission receipt and audit metadata; test denial, retry and partial failure cases.

**Exit:** A real, specifically authorized test review is posted exactly once and confirmed. This is the Codex-first MVP gate.

## 9. G04 — Optional independent PR-Agent worker

**Prerequisite:** G03 and an independently accepted model-provider/A2A security setup. This group may be deferred.

**Accepted first-implementation approach (2026-10-16):** CodeGuardian passes a validated, pinned diff to an isolated PR-Agent process rather than granting PR-Agent direct GitHub access. PR-Agent lives outside `ink/` in `integrations/pr-agent/`, behind a thin CodeGuardian adapter. No GitHub platform token is handed to the PR-Agent process.

**Security correction (explicitly recorded):** Plain-diff mode avoids requiring a GitHub platform token, but **that alone does not guarantee the process has zero access to credentials**. The runner must also explicitly isolate filesystem access (mount only the prepared diff), strip all GitHub/Codex/SSH credential environment variables from the PR-Agent process, and block access to credential stores (`~/.config/gh`, `~/.ssh`, token files). These are separate explicit runner requirements, not implicit consequences of plain-diff mode.

- Add a thin adapter to an official pinned PR-Agent MOSAICO/A2A image rather than forking PR-Agent.
- Configure the provider separately; do not assume Codex's ChatGPT session authenticates PR-Agent.
- Normalize PR-Agent output to `ReviewFinding` and merge with Codex findings after independent validation.
- Do not give PR-Agent direct GitHub publishing authority at any point.
- Run A2A/auth, unavailable-provider, timeout, upgrade, compatibility and contract tests.

**Requires separate approval before any G04 execution:**
- Provider API access (PR-Agent's own model provider — separate from Codex).
- Sending source diffs externally to a provider endpoint.
- Any configuration granting PR-Agent access beyond the supplied validated diff.

**Exit:** Optional second engine contributes independently verifiable findings, with confirmed runner isolation.


## 10. G05 — Unattended GitHub automation

**Prerequisite:** Explicit new design and security approval, accepted earlier real review and publisher functionality. G04 is optional.

- Use an appropriately scoped GitHub App or other separately accepted service identity.
- Verify webhook signature, replay protection, repository/installation allowlists and event identity.
- Deduplicate by PR/head SHA/policy revision; bound concurrency, costs and retries.
- Enforce isolation for untrusted PR inputs and strict credential separation.
- Add tracing, failure alerts and safe rollback/disable controls.
- Obtain a separate decision on whether unattended *review generation* also permits *publication*. Do not imply auto-posting authority from webhook authorization alone.

**Exit:** Verified, safe event-triggered runs with approved publication policy and observability.

## 11. G06 — Optional Jules repository-wide audit (PROPOSED, NOT APPROVED)

**Outcome:** A developer requests a pinned-snapshot **repository-wide audit**, Jules proposes systemic findings, and the CodeGuardian Manager verifies source evidence and coverage independently before presenting a separately approved `AUDIT.md`. This is not PR-diff review and does not modify G00–G05 costs/estimates, dependencies or the PR publication contract. G06 effort is **TBD** until an authorized pilot. G04/G05 are not mandatory dependencies.

**Six proposed mock-only UX stages:**
1. Select repository, branch, intended full SHA and inventory/exclusions.
2. Jules API/App permission and rate/cost preflight, pending plan and explicit human plan approval.
3. Coverage ledger: inventoried, inspected, context-analyzed, independently verified, excluded, unknown.
4. Jules worker progress, partial output, errors, cancellation and timeouts.
5. Manager source verification of claims, callers and dependency impact; classify verified/rejected/inconclusive.
6. `JULES-AUDIT.md` preliminary view and `AUDIT.md` final draft, limits and remediation priorities.

**Architecture/security:** Google's Jules API is experimental `v1alpha` (Sources/Sessions/Activities). Use separately authorized credentials, `requirePlanApproval: true` and never enable `AUTO_CREATE_PR` for audit work. An audit-only prompt is **not** a read-only boundary. Prefer an approved disposable repository mirror, least privilege and bounded cloud execution. The API selects a `startingBranch` rather than an immutable SHA; independent source identity evidence is mandatory. Unknown inspection coverage must remain unknown. See `ARCHITECTURE.md` D-09/section 12 and `API-CONTRACT.md` section 8.

**Pilot acceptance (not executed):** Freeze a permitted snapshot/mirror, approve access, plan and spend; inspect activity outputs and source identity; independently fact-check findings and omissions; collect coverage, false-positive rates, failures and runtime/cost evidence; only then decide whether to implement G06. A repository-published `AUDIT.md` requires its own Git approval.

## 12. Explicitly deferred work / release decisions


- Web dashboard, team accounts, multi-tenancy, enterprise administration and reporting analytics: separate future groups, not counted in G00–G05.
- Code modifications, automatic approvals, automated PR merges, production service deployment and broad untrusted-fork execution: excluded until independently proposed and authorized.
- License, branch protection, mandatory CI checks, release artifacts, security policy and any public launch: require explicit project/governance decisions.

## 13. Standard group execution and release rules

For **every** group:
1. Read parent and repository `AGENTS.md`; inspect live branch SHAs, local worktrees, clean index and active Git operations.
2. Obtain approval for scope, design, exact allowed files (including protected files), new dependencies, execution environment, and branch/worktree.
3. Prepare a scoped group TODO following `sprint-code.md`, with the `sprint-test.md` test plan embedded in the same group.
4. Implement only the accepted outcome. No unrelated enhancements or automatic actions outside the group.
5. Run reproducible automated and manual acceptance checks; collect actual diff, commands, failures and security caveats.
6. Submit manager/reviewer evidence with PASS / CHANGES REQUIRED / BLOCKED / PASS WITH EXCEPTION status, named risks and exact Git SHAs.
7. Obtain distinct permission for **commit**, **push**, **PR creation**, **PR merge**, and **deployment** as applicable; do not infer one from another.
8. On an environmental blocker, stop and report evidence rather than bypass sandbox protections or re-run blindly.

**Branch approach proposed for G00:** create `feat/g00-cli-ux-demo` from a verified `dev` head in its own authorized worktree; develop and test there; target a G00 PR to `dev`. The branch, worktree and PR are NOT created or authorized by this roadmap. Do not mutate the canonical `main` checkout.

## 14. Immediate next group run

**NEXT: PRE-G00 approval/setup, then G00 — Native Ink CLI Demo.**

1. The **browser G00 mock UX** (nine screens, `src/`) is accepted as the walkthrough reference and is FROZEN at `e8e5844`. No further browser development is authorized.
2. Confirm architecture decisions, mock contract, complete G00 screen inventory in `G00-CLI-WIREFRAMES.md`, command names and precise framework/package versions for the Ink package (`ink/`).
3. Verify the Windows execution environment; confirm Node 24 LTS, pnpm, TypeScript, Ink 8.0 availability.
4. Draft and review one executable G00 TODO for the Ink CLI, including terminal test matrix and branch/dependency permissions.
5. Only after explicit authorization, let Codex implement the local terminal CLI with mock fixtures inside `ink/`.
6. Review actual G00 Ink implementation, tests and terminal demonstration; approve G01 only if the complete Ink CLI UX is accepted.

**G04 note:** PR-Agent integration goes inside `integrations/pr-agent/`, isolated behind a CodeGuardian adapter. No direct GitHub access. Plain-diff mode avoids a GitHub platform token but requires explicit runner filesystem/env/credential isolation. Separate approval needed before provider API access or external diff sending.

**Current release state (2026-10-16):** React/Vite browser UX prototype (`src/`) frozen at `e8e5844` as accepted design reference. Repository relocated to `E:\Projects\CodeGuardian\` (single clean checkout, no linked worktrees). Native Ink CLI implementation, local test outcomes, real GitHub/Codex/Jules calls and G00 Ink acceptance remain unverified. This document approves no implementation, new branch, live audit, publication or deployment.

## 15. Source-of-truth references

- `PROJECT-BRIEF.md` — accepted/proposed product definition, original G00–G05 groups and group estimates.
- `ARCHITECTURE.md` — D-01–D-08, trust boundaries, security and operational design.
- `API-CONTRACT.md` — proposed canonical internal JSON/schema and publication approval semantics.
- `G00-SCOPE.md` — complete mock-only terminal demo acceptance scope.
- `G00-CLI-WIREFRAMES.md` — command vocabulary and illustrative mock terminal states.
- `SETUP.md`, `HANDOFF.md`, `REPO-INITIALIZATION.md` — earlier setup/history records, potentially stale after reconciliation.
- `TECH-RESEARCH.md` — prior source checks and known unverified local integration claims.
- Parent workspace governance documents and repository `AGENTS.md` — approvals, protected paths and group process.

