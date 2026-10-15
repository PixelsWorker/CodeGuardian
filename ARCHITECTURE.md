# CodeGuardian - Architecture

**Status:** Architecture candidate — accepted direction decisions applied 2026-10-16  
**Version:** 0.1.0-planning  
**Target:** `PixelsWorker/CodeGuardian`  
**Date:** 2026-10-14 / **Updated:** 2026-10-16

## 1. Architectural principle

**The manager orchestrates; CodeGuardianMini workers analyze; only a separate, explicitly authorized publisher writes to GitHub.** Infrastructure decisions, job scheduling, credentials, validation, cleanup, and publication must remain deterministic TypeScript operations. Model output is untrusted analysis, not permission to run infrastructure commands.

## 2. Component boundaries

| Component | Responsibilities | Explicitly forbidden |
|---|---|---|
| CLI UX | Parse user intent; show auth diagnostics, progress, findings and confirmation | Own secrets or call GitHub write endpoints directly |
| Manager | Validate PR request, orchestrate jobs, check policies/SHAs, collect results, control retries | Treat model text as infrastructure commands or silently publish |
| GitHub reader | `gh`/API authenticated metadata and diff retrieval | GitHub mutations; handing GitHub credentials to review workers |
| Workspace preparer | Create isolated, bounded, read-only review input; check refs | Modify canonical checkout, run arbitrary PR scripts |
| Codex worker adapter | Call official Codex TypeScript SDK / CLI; emit structured read-only findings | Publish, push, merge, or mutate PR; use Docker daemon socket |
| Synthesis/validation | Validate schemas and diff locations; review evidence; merge duplicates | Treat AI confidence alone as proof |
| Publisher | Re-fetch head SHA, validate targets and one-time approval, post `COMMENT` review | Approve, merge, push commits, change permissions |
| PR-Agent adapter (G04) | Version-pinned A2A client, text normalization, independent provider errors | Direct write to GitHub or dependency on PR-Agent's internal Python classes |

The manager may request a bounded Codex synthesis pass; this does not change the trusted/privileged boundaries.

## 3. Data flow

1. `codeguardian review <url>` receives an operator-controlled GitHub PR URL and selected optional policies.
2. Deterministic parser checks canonical GitHub host, owner/repo/number, repository allowlist and operation permissions.
3. GitHub reader obtains PR metadata, base/head SHA, changed file list, and diff; rejects incomplete/unsafe input.
4. Workspace preparer builds a per-run workspace, never reusing a dirty canonical checkout. On a dirty/diverged canonical checkout, STOP and request a safe Git plan; do not reset or switch branches.
5. Manager chooses worker roles based on changed files/risks and creates bounded jobs. Parallelism is configurable, initially low and tested against credential storage constraints.
6. Codex worker adapter runs specialist reviews with explicit read-only policy. The SDK supports structured outputs; adapter independently validates the result.
7. Manager accepts only findings tied to known changed files, examines line/diff evidence, and uses additional bounded synthesis as useful.
8. Final report records findings plus partial/unknown coverage, worker failures, tested versus untested assertions, and SHA identity.
9. CLI previews Markdown, JSON, and a dry-run GitHub review. No publication occurs without explicit authorization (G03).
10. Publisher fetches the current PR state again, refuses a changed head SHA, checks approval and diff positions, and posts a single `COMMENT` review.
11. Run metadata and error details are recorded without secrets. Workspaces are cleaned only after checking safe disposition of artifacts.

## 4. GitHub and authorization design

**Phase 1 (manual development):** The operator authenticates `gh` through a supported browser/device flow. `gh` may use persisted login data in a protected developer-controlled area. The GitHub reader runs with read permissions. G03 publisher is a separate process/module with narrowly scoped access available only after user confirmation.

**Unattended future (G05):** Prefer a GitHub App installation with repository allowlist and short-lived installation tokens. Webhooks must validate `X-Hub-Signature-256`, reject replays, check event/actor/repo identities, and dedupe `(installation, repo, PR number, head SHA, review-policy revision)`.

The CLI sign-in data must not be embedded in images, committed to Git, passed into PR-Agent's worker, or exposed through logs. A worker with mounted Codex credentials can potentially read those credentials; for the early trusted-local phase, this is a **known residual risk**, not full isolation. Review arbitrary public/fork PRs only after a stronger boundary and network policy have been tested.

## 5. Codex execution and auth modes

- The `@openai/codex-sdk` TypeScript SDK wraps/spawns Codex CLI. Build an adapter rather than parsing free-form terminal output.
- The worker produces structured JSON. Schema compliance requested from a model is not sufficient; apply independent runtime validation.
- **No API key required for initial supported local ChatGPT account login**, if the user's account/workspace permits Codex and, if needed, device-code auth. This does not imply unlimited usage or unattended reliability.
- If an **OpenAI Platform API key** later becomes available, the adapter remains Codex CLI/SDK while supported auth configuration changes. API-key usage may be billed separately.
- A **ChatGPT Workspace Agent API access token** is separate and is not necessary for this Docker architecture.
- PR-Agent A2A requires its own OpenAI-compatible or other supported model provider connection. Do not assume it inherits Codex login.

## 6. Docker/host topology (proposed)

- One development host runs the CLI/manager.
- `codeguardian-codex` image supplies Node.js 24, official Codex SDK/CLI and optional `gh` for diagnostics. Version pinning and dependency validation are mandatory before using it.
- Worker runs use a unique run ID, bounded CPU/memory/time, read-only PR inputs and separate temporary scratch paths.
- Run non-root; no `--privileged`, no unrestricted Docker socket, no unnecessary capabilities, and no automatic PR package install/test execution.
- Keep authentication in a separate restricted persistence location; do not mount the same developer login volume indiscriminately into arbitrary containers.
- Any required network access should be explicitly limited to authentication/model endpoints and separately mediated GitHub reader access; verify feasibility in the selected runtime.
- Prefer orchestrator-owned container launch, not worker-driven Docker commands.

**Unresolved security gate:** ChatGPT account-authenticated worker containers necessarily need some Codex credential access; full protection from malicious source content cannot be asserted merely because the filesystem is read-only. Until tested, restrict to trusted, developer-controlled repos and do not enable unattended public PR review.

## 7. Reliability and cancellation

Manager maintains explicit states: `queued -> inspecting -> running -> validating -> ready`, or `blocked`, `failed`, `cancelled`. G03 adds `awaiting_approval -> publishing -> published`.

Record input refs, worker roles, deadlines, structured results, failure reasons, schema-version, and report fingerprints. Use bounded retries only for errors likely to be transient. Check before each publish that the validated report still matches current head SHA and policy revision. A partial review is clearly labeled and never silently presented as full coverage.

## 8. Review policy

- Primary severities: P0 critical, P1 high, P2 medium, P3 low.
- Prioritize concrete correctness/security regressions; avoid style-only noise.
- Every finding must include file path, changed-side line/range where available, reproducible evidence, impact, and proposed resolution.
- Preserve uncertainty; reject fabricated context, missing file evidence, or invalid diff comments.
- Deduplication identity = normalized file/range + category + defect signature; preserve references to contributing workers.
- Publication always uses `COMMENT`, not `APPROVE` or `REQUEST_CHANGES` in the MVP.

## 9. Integration boundaries for future PR-Agent

`pragent/pr-agent:<pinned-version>-mosaico_agent` can expose A2A 1.0 JSON-RPC with `/.well-known/agent-card.json`, `POST /`, and `/health`. The wrapper normalizes `review/improve/describe/ask` results into the `ReviewFinding` contract. For private repositories provide an allowed diff; public URL fetch is not sufficient. Require explicit bearer authentication on the A2A service, and prevent direct GitHub publication from the worker.

Upgrades follow: bump pinned version/digest -> run smoke and contract tests -> validate review output -> deploy only with release approval -> rollback when needed. No permanent fork is planned.

## 10. Technology decisions (D-01–D-08 accepted direction; D-09 proposed)

**Accepted product direction (2026-10-16):** CodeGuardian is a native terminal application, not a standalone desktop application. The browser prototype (`src/`) is frozen at `e8e5844` as the accepted UX design reference only.

**Repository layout (target):**
```
E:\Projects\CodeGuardian\
├── src\          Browser UX reference — FROZEN at e8e5844 (design reference only)
├── ink\          Native terminal application package
│   ├── package.json
│   └── src\cli.tsx  src\App.tsx  src\components\  src\screens\  src\core\
├── integrations\
│   └── pr-agent\   Future G04 plain-diff adapter (isolated, no GitHub access)
```

| Decision | Proposal | Why | Trade-off/approval needed |
|---|---|---|---|
| D-01 Runtime | Node.js 24 LTS + TypeScript | Stable, matches manager and SDK | Accept exact pin/upgrade policy |
| D-02 Frontend | **Native Ink CLI inside `ink/`** — browser prototype frozen at `e8e5844` as design reference | Delivers initial product workflow in terminal | G00 complete Ink terminal UX acceptance required; browser prototype must not be extended |
| D-03 Codex | `@openai/codex-sdk` + Codex CLI | Structured events/output | Validate actual version and login |
| D-04 PR-Agent | Optional, external Docker A2A adapter in G04 — inside `integrations/pr-agent/`, isolated behind CodeGuardian adapter; no direct GitHub access | Independently upgradable | Plain-diff mode avoids GitHub token but runner must isolate filesystem/env/credentials; provider API access and external diff sending need separate approval |
| D-05 HTTP | No Fastify server for G00-G03 | No API trigger needed yet | Revisit at G05 |
| D-06 Persistence | Local run artifacts first; decide SQLite at G02/G03 | Keep initial setup lean | Approve durable-state scope |
| D-07 Publication | Separate, confirmation-gated `COMMENT` publisher | Secure GitHub boundary | Approve actual operation G03 |
| D-08 Security | Trusted developer-controlled repositories initially | Credential isolation not yet demonstrated | Mandatory threat review before forks/webhooks |
| D-09 Repository audit | Optional Google Jules full-repo evidence producer in G06 | Complement PR-specific Codex specialists | Requires separate pilot, cloud permissions, snapshot proof, versioning and cost controls; does not delay G00–G03 |

## 11. Exit gates

- **Architecture/setup**: decisions accepted (D-01–D-08 direction decisions applied 2026-10-16), Windows repository and environment identified, G00 Ink CLI boundaries confirmed. Browser prototype frozen at `e8e5844`.
- **G00**: complete mock Ink terminal demo shown and explicitly approved.
- **G01+**: real CLI/business-function integration, actual test results and diff review, and group PR-specific authorization.

No Docker build, Codex login, or PR review was performed while producing this document.


## 12. Optional Jules G06 architecture (PROPOSED, NOT APPROVED)

G06 is a **separate repository-wide audit workflow**. It does not change G00's complete native terminal UX, G01-G03 PR review responsibilities, G03's publication boundary, or G04-G05 estimates.

**Proposed data path:** trusted GitHub reader inventories all tracked files and records `owner/repo + intended full SHA + manifest digest` -> isolated Jules audit worker proposes candidate findings and coverage evidence -> independent evidence reader fetches source at verified SHA and traces dependencies -> deterministic CodeGuardian Manager fact-checks, rejects or marks inconclusive -> preliminary `JULES-AUDIT.md` and approval-gated final `AUDIT.md`.

Jules integration uses Google's experimental `v1alpha` Sources, Sessions and Activities API (https://developers.google.com/jules/api). Jules requires its own key and approved GitHub App connection. Set `requirePlanApproval: true` and require explicit human plan review. Do not enable `AUTO_CREATE_PR`. Neither an audit-only prompt nor those flags make a coding agent technically read-only. Its hosted environment can execute commands and modify its workspace; prefer a separately approved disposable audit mirror and least-privileged access instead of granting write authority to active product branches.

**Snapshot identity:** Google sessions use `githubRepoContext.startingBranch`, not a fixed SHA parameter. Independently establish which revision Jules inspected; otherwise the report must be marked partial/inconclusive and must not advertise full-codebase verification.

**Coverage:** distinguish inventoried, inspected, context-analyzed, independently verified, excluded and unknown files. Activity messages alone cannot prove every file was examined. Require direct source/line/symbol and cross-module/callsite evidence for each verified defect; Jules confidence is never proof.

**Reporting / validation:** `API-CONTRACT.md` section 8 defines a separately proposed audit payload. Do not reuse PR changed-hunk constraints for repo-wide findings or weaken the canonical PR contract to accommodate them. External activity content is untrusted and cannot control Docker, manager policy, credentials, approval or publishing.

**Six-stage G06 mock UX proposal:** repository selection; Jules/permissions/plan preflight; coverage; audit activity; Manager fact-checking; final audit preview. This may be explored in a separate synthetic UI prototype. It is **not a G00 requirement**, and no Jules session or backend is approved by its presence.

**Decision gate:** D-09 and a G06 group acceptance require a cost/rate/security/retention threat review, mirrored-source access decision, end-to-end failure testing, snapshot proof and an approved report-publishing policy. G06 effort estimate remains TBD until a controlled pilot.
