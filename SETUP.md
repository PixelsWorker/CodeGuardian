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
| Open blockers | License; architecture/G00 acceptance; main integration authority; runtime environment; credential/sandbox evidence |
| Updated | 2026-10-14 |

## 2. Repositories and environment

Canonical checkout verified on 2026-10-14: `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`. Repository: https://github.com/PixelsWorker/CodeGuardian; current documentation branch: `dev`.

| Reference | Verified commit | Relationship |
|---|---|---|
| Local `dev` | `1b9f8bd7422548e0f05cdd7d445b9ea4a8be6ff7` | Current HEAD; synchronized with `origin/dev` |
| `origin/dev` | `1b9f8bd7422548e0f05cdd7d445b9ea4a8be6ff7` | Architecture packet committed and pushed |
| Local `main` | `1bb57572f3c1a544c71bb6e519f4428db22e3086` | Ancestor of `dev`; differs from remote `main` |
| `origin/main` | `dfe6daa7190a24215ccfc5537e5780fe56b2909d` | Independent history; no common ancestor with `dev` |

Both remote branches exist. Git history integration remains unresolved and NOT AUTHORIZED. The repository contains `AGENTS.md` and ten planning documents, with no application source or configured build/test runner. DOC-01 preflight confirmed a clean working tree and no unfinished Git operation; local documentation edits will make it dirty until separately approved for commit.

- Parent workspace: `/home/rockson/Projects/PixelsWorker/CodeGuardian`; evidence: `../evidence/`; reserved worktree location: `../worktree/`.
- Host runtime, Docker availability, package tooling, and authentication remain NOT VERIFIED by this task.
- Future branch names such as `feat/g00-cli-ux-demo` are proposals, requiring separate authorization.
- Git safety: stop on an unexpected dirty/diverged checkout or unfinished operation. No branch switching, worktree creation, reset, pull, or merge without an approved safe plan. DOC-01 authorizes only five local documentation edits on the verified baseline.

## 3. Proposed stack (installation NOT VERIFIED)

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

| Item | Repository path (packet committed on `dev`) | Status |
|---|---|---|
| Full proposed architecture | `ARCHITECTURE.md` | Draft |
| Research and versions | `TECH-RESEARCH.md` | Source-verified claims only |
| Security | Architecture security sections; separate repo `SECURITY.md` optional initialization decision | Draft |
| Repository structure | `REPO-INITIALIZATION.md` | Completed initialization record; integration pending |
| Canonical internal review contract | `API-CONTRACT.md` | Draft, not implemented |
| Group roadmap | `PROJECT-BRIEF.md` | Draft |
| Active executable TODO | NONE | Deliberately not created: G00 not authorized |

## 5. Environment and checks

| Area | Exact command / working directory | Verified result |
|---|---|---|
| Git checkout/status | `git status -sb`, `git status --porcelain=v1`, `git rev-parse`, `git remote -v` from canonical checkout | Baseline verified above; clean before DOC-01 edits |
| Docker build | No Dockerfile created; no command run | NOT RUN |
| Codex installation/login | NOT VERIFIED by DOC-01; device auth may need workspace enablement | NOT RUN |
| GitHub CLI login | Not checked by DOC-01 | NOT VERIFIED |
| CLI start/build | No package manifest exists yet | N/A - NOT IMPLEMENTED |
| Lint/types/tests | No commands/manifests exist yet | N/A - NOT IMPLEMENTED |
| Real PR review and publication | No PR run performed | NOT RUN |

Secret handling proposal: protected user authentication store/volume outside source repo, no token values in `.env.example` or logs, no untrusted worker access to GitHub publishing credentials. Test environments use mock PRs until G01.

## 6. Roadmap and approval gates

See `PROJECT-BRIEF.md` for dependency-ordered G00-G05 roadmap and draft time estimates.

| Gate | State / evidence |
|---|---|
| Architecture/setup review | Draft packet prepared; pending Rockson acceptance |
| Initial documentation delivery to `dev` | COMPLETED: committed and pushed at `1b9f8bd` |
| DOC-01 documentation correction | AUTHORIZED: local edits to five named files only |
| Integration into remote `main` | NOT AUTHORIZED; unrelated histories remain |
| G00 CLI demo scope | Pending explicit approval |
| G00 local branch and code execution | NOT AUTHORIZED |
| G00 complete terminal UI/UX demo approval | PENDING, must occur after demo |
| G01 functional execution | BLOCKED ON G00 approval |
| Further staging/commits/pushes/merges/packages/deployment | NOT AUTHORIZED |

**Next handoff:** Review the DOC-01 local diff and `HANDOFF.md`. Documentation commit/PR steps, Git integration, architecture acceptance, and G00 scope/execution require separate authorization. STOP before implementation. Untouched planning documents may retain preparation-time repository statements; the verified baseline here supersedes those historical claims.
