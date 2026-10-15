# CodeGuardian - Project Brief

**Product:** CodeGuardian, multi-agent AI pull request review platform  
**Repository:** `PixelsWorker/CodeGuardian` (public)  
**Architecture-review date:** 2026-10-14  
**Approval:** PROPOSED - scope and stack acceptance pending explicit confirmation.

## 1. Outcome

A developer submits a GitHub pull request URL, sees understandable review progress in the terminal, receives one consolidated and evidence-grounded review, previews any proposed GitHub publication, and can explicitly authorize posting a `COMMENT` review. CodeGuardian manages the lifecycle, while specialist AI workers analyze changes. Only a separate deterministic publisher may write the review to GitHub.

The first real implementation uses Codex CLI through the official TypeScript SDK. Account-based ChatGPT sign-in may be used for trusted local development; acquiring a key later must not cause replacement of the CLI/SDK path.

## 2. Product actors

- **Developer / operator (Rockson initially):** requests review, manages supported CLI sign-in, previews findings, approves GitHub publication.
- **CodeGuardian Manager:** deterministic TypeScript orchestration, job state, scheduling, cleanup, verification; AI synthesis is a separate, bounded Codex task.
- **CodeGuardianMini:** specialist Codex review workers with distinct security, logic, architecture, and quality instructions.
- **PR-Agent worker (later):** optional independently configured, version-pinned A2A review source.
- **Jules audit worker (proposed G06):** independently verified, repository-wide architecture/defect audit candidates, distinct from PR-diff specialists; no GitHub publisher authority.
- **Publisher:** isolated GitHub writing boundary, limited to validated `COMMENT` reviews and approved PRs.

## 3. Functional MVP scope (G01-G03, after G00 approval)

1. Accept and validate a GitHub PR URL and clearly show its repository, number, refs, and changed-file summary.
2. Provide useful authentication preflight diagnostics for `gh` and `codex`; do not request or print tokens.
3. Review developer-controlled repositories using Codex CLI/SDK, structured output, and limited worker concurrency.
4. Separate worker concerns: security, correctness, architecture, and tests/performance. Run only relevant specialists.
5. Validate schema, severity, evidence, file path, and changed-line placement; report missing/partial evidence.
6. Deduplicate findings, produce one Markdown and one JSON report, and show review metadata.
7. Provide a dry-run preview and a clear, explicit, per-PR/per-head-SHA confirmation before the publisher posts one GitHub `COMMENT` review.
8. Preserve run metadata sufficiently to diagnose failures and prevent immediate duplicate publication.
9. Report failed/skipped actions accurately. No promises of finding all defects.

## 4. Out of scope for the Codex-first MVP

- Real webhook automation, unattended CI credentials or public-facing service.
- Web management dashboard and multi-user tenancy.
- PR-Agent A2A model/provider operation (G04), unless separately approved.
- Automatic approvals, change requests, merges, commits, pushes, code fixes, or deployments.
- Running untrusted PR instructions, tests, scripts, dependency installs, or arbitrary shell commands automatically.
- Arbitrary forks or hostile repositories before sandbox/auth isolation is validated.

## 5. Complete group roadmap (proposed)

One group is one unit of acceptance. Tests and real integrations are part of the SAME group and PR. Estimates are forecasts, not guarantees.

| Group | One observable outcome | Prerequisite | Forecast | State |
|---|---|---|---|---|
| **G00 - Complete CLI UX Demo** | Full CLI experience demonstrated with explicitly simulated inputs, authentication prompts, progress, reports, confirmations, and failure states | Accepted architecture, setup, G00 scope approval | 2-3 working days | DRAFT |
| **G01 - Authentication & PR Inspection** | Real `gh` authentication preflight and real authenticated PR metadata/diff inspection displayed through approved CLI | G00 UI/UX approval | 3-5 working days | BLOCKED ON G00 |
| **G02 - Multi-Agent Review** | Codex specialists produce a validated consolidated report with real structured results | G01 | 5-8 working days | FUTURE |
| **G03 - Controlled Publication** | Human previews and authorizes exactly one GitHub review for the verified head SHA | G02 | 3-5 working days | FUTURE |
| **G04 - PR-Agent Integration** | Optional A2A review worker returns normalized findings alongside Codex workers | G03 plus model provider connection | 3-5 working days | LATER |
| **G05 - GitHub Automation** | Signed/authorized events trigger safely deduplicated unattended reviews, with separate service auth | Independently accepted automation/security design; G04 optional | 5-8 working days | LATER |
| **G06 - Repository-Wide Audit (Jules)** | Optional pinned-snapshot audit with evidence-backed coverage and independently verified `AUDIT.md` | Separate approved pilot, access/contract/security gates; not a G00-G05 prerequisite | TBD | PROPOSED ONLY |

The provisional Codex-first MVP forecast is approximately four weeks of developer work, subject to validated environment, credentials, and security gates.

## 6. G00 special rule

For this CLI-first application, **G00 is the entire agreed CLI/terminal UX demo**, not a future browser dashboard. A nine-screen React/Vite browser mock exists on remote `main` as a *visual reference*, not proof of a native CLI or acceptance. It covers all MVP terminal flows with safe mock PR data, simulated workers, simulated authentication outcomes, representative progress and error states, report display, and **mock-only** publication confirmation. It is delivered in one branch and one PR when separately approved. No real GitHub API calls or Codex model calls are required for G00 acceptance.

Rockson must explicitly approve the complete G00 demo before G01 can begin. This packet does not create a G00 TODO or approve any local branch or push.

## 7. Acceptance and reporting

For G01+: check actual BN/CLI integration, canonical contract behavior, failure/permission paths, tests, actual diff and execution evidence. Final group statuses: `PASS`, `CHANGES REQUIRED`, `BLOCKED`, `PASS WITH EXCEPTION` (only with named accepted risk).

Track scope, dependencies, estimated versus actual effort, repository branch and SHAs, tests (passed/failed/skipped), remaining risks, and concrete approval sought. No implied merge, release, or deployment authority.

## 8. Pending decisions

- Accept this Codex-first scope and the manager/worker/publisher split.
- Accept Node.js 24 LTS + TypeScript + official Codex SDK/CLI as proposed G01-G03 foundation.
- Confirm first-target platform: Fedora/Linux with Docker (preferred for initial validation), or another verified host.
- Select repository license and intended visibility policy (currently public; MIT suggested, not approved).
- Approve proposed G00 terminal screens, workflows, and mock scenarios in `G00-SCOPE.md`.
- Historical reconciliation of remote `main` and `dev` is COMPLETE; recheck live refs and authorize each future operation separately.
- Separately decide whether a Google Jules G06 pilot is worthwhile; do not expand G00-G05 scope or forecasts automatically.
