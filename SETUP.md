# SETUP - CodeGuardian

> Planning record derived from `SETUP.template.md`, not a claim of a working local environment.

## 1. Product and handoff

| Field | Verified / proposed value |
|---|---|
| Product / owner | CodeGuardian / PixelsWorker, operator Rockson |
| Type | New product |
| Phase / readiness | Architecture/setup review; **NOT READY to execute G00** until approval gates |
| Architecture provider / source | User-supplied "CodeGuardian - Architecture Review" (2026-10-14), proposed; supporting upstream checks in `TECH-RESEARCH.md` |
| Product goal | CLI-first multi-agent PR review with deterministic manager, Codex workers and separate GitHub publisher |
| Approved scope | PENDING approval; candidate in `PROJECT-BRIEF.md` |
| Exclusions | No dashboard, real webhooks, PR-Agent requirement, unattended public PR automation, auto-merge or code modification in MVP |
| Material decisions | Proposed in `ARCHITECTURE.md` D-01 to D-08; acceptance pending |
| Open blockers | License; initial repository commit authority; G00 scope; host environment; credential/sandbox evidence |
| Updated | 2026-10-14 |

## 2. Repositories and environment

| Area | Repository/URL | Canonical checkout | Base / SHA | Status |
|---|---|---|---|---|
| CLI, manager, workers, shared contract (proposed monorepo) | https://github.com/PixelsWorker/CodeGuardian | UNKNOWN - not inspected on user device | `main` configured but **no actual branch/commit** | Repo accessible, empty |
| UI | Same repository, terminal-only | UNKNOWN | N/A | G00 planned, no code |
| GitHub account | PixelsWorker connector | N/A | N/A | Admin/write access observed (NOT used) |

- Preferred host root if Fedora: `/home/rockson/Projects/PixelsWorker/CodeGuardian` **PROPOSED ONLY; NOT VERIFIED**. Do not infer actual clone path.
- Alternate preferred canonical Windows root: `D:\Projects\PixelsWorker\CodeGuardian` (only if Windows host verified).
- Branch convention (proposed): `feat/g00-cli-ux-demo`, then `feat/g01-auth-pr-inspection`, etc. Do not create before branch/init approval.
- Git safety: if a canonical checkout is dirty/diverged or in the middle of an operation, STOP. No branch switching, worktree creation, reset, or automatic pull without an approved safe plan.
- Evidence directory: TBD only if useful during implementation; outside source repository.

## 3. Proposed stack (NOT installed)

| Concern | Candidate / stage | Acceptance state |
|---|---|---|
| CLI UX | TypeScript terminal UI; exact CLI framework undecided | PROPOSED |
| Runtime | Node.js 24 LTS, TypeScript; pnpm candidate | PROPOSED |
| Codex analysis | Official `@openai/codex-sdk`, Codex CLI, read-only worker adapter | PROPOSED |
| GitHub integration | `gh` CLI and GitHub API | PROPOSED |
| Docker | Reproducible non-root worker image and Compose for later adapters | PROPOSED |
| Validation | Runtime JSON schema or Zod candidate | PROPOSED |
| Data storage | Local run artifact files for initial manual flow; SQLite decision deferred | OPEN |
| HTTP server | N/A for G00-G03; potential G05 only | DEFERRED |
| PR-Agent | Official pinned MOSAICO A2A image G04 | DEFERRED |
| Tests | Risk-based tests, test runner selected with G00 approved setup | NOT VERIFIED |

## 4. Source documents and contract

| Item | Path (in architecture packet, not yet in GitHub) | Status |
|---|---|---|
| Full proposed architecture | `ARCHITECTURE.md` | Draft |
| Research and versions | `TECH-RESEARCH.md` | Source-verified claims only |
| Security | Architecture security sections; separate repo `SECURITY.md` optional initialization decision | Draft |
| Repository structure | `REPO-INITIALIZATION.md` | Proposed; GitHub repo empty |
| Canonical internal review contract | `API-CONTRACT.md` | Draft, not implemented |
| Group roadmap | `PROJECT-BRIEF.md` | Draft |
| Active executable TODO | NONE | Deliberately not created: G00 not authorized |

## 5. Environment and checks

| Area | Exact command / working directory | Verified result |
|---|---|---|
| Git checkout/status | Not available: no local checkout inspected | NOT VERIFIED |
| Docker build | No Dockerfile created; no command run | NOT RUN |
| Codex installation/login | Not attempted; device auth may need workspace enablement | NOT RUN |
| GitHub CLI login | Not attempted | NOT RUN |
| CLI start/build | No package manifest exists yet | N/A - NOT IMPLEMENTED |
| Lint/types/tests | No commands/manifests exist yet | N/A - NOT IMPLEMENTED |
| Real PR review and publication | No PR run performed | NOT RUN |

Secret handling proposal: protected user authentication store/volume outside source repo, no token values in `.env.example` or logs, no untrusted worker access to GitHub publishing credentials. Test environments use mock PRs until G01.

## 6. Roadmap and approval gates

See `PROJECT-BRIEF.md` for dependency-ordered G00-G05 roadmap and draft time estimates.

| Gate | State / evidence |
|---|---|
| Architecture/setup review | Draft packet prepared; pending Rockson acceptance |
| Initial GitHub commit to `PixelsWorker/CodeGuardian` | NOT AUTHORIZED / NOT EXECUTED |
| G00 CLI demo scope | Pending explicit approval |
| G00 local branch and code execution | NOT AUTHORIZED |
| G00 complete terminal UI/UX demo approval | PENDING, must occur after demo |
| G01 functional execution | BLOCKED ON G00 approval |
| Push/merge/deployment | NOT AUTHORIZED |

**Next handoff:** Review `HANDOFF.md`. Confirm architecture/G00 scope and separately approve any initial GitHub commit; then prepare a bounded G00 executable TODO for subsequent approval. STOP before executing implementation.
