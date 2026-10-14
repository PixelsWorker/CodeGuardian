# CodeGuardian - Development Manager Handoff

**Product/group:** CodeGuardian / architecture and setup review (PRE-G00)  
**Date:** 2026-10-14  
**Status:** Documentation delivered to `dev`; architecture/G00 acceptance pending. DOC-01 local documentation corrections authorized; further Git actions not authorized.

## 1. Project goal and scope

Build a CLI-first multi-agent GitHub PR review product: deterministic CodeGuardian Manager orchestrates specialist CodeGuardianMini Codex CLI/SDK workers, validates consolidated findings, and delegates all GitHub writes to an approval-gated publisher. PR-Agent A2A and webhooks are subsequent optional groups, not MVP prerequisites.

ChatGPT account login is a supported possible Codex local auth method without an OpenAI Platform API key. If a key becomes available later, keep the CLI/SDK adapter. Workspace Agent API tokens are not required for this Docker-based project.

## 2. Repository identity / current state

- Repo: https://github.com/PixelsWorker/CodeGuardian (public; owner PixelsWorker).
- Canonical checkout: `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`.
- Local `dev` / `origin/dev`: `1b9f8bd7422548e0f05cdd7d445b9ea4a8be6ff7`.
- Local `main`: `1bb57572f3c1a544c71bb6e519f4428db22e3086`, an ancestor of `dev`.
- Remote `origin/main`: `dfe6daa7190a24215ccfc5537e5780fe56b2909d`; no common ancestor with `dev`. Integration remains unresolved.
- DOC-01 preflight: clean working tree on `dev`; no unfinished merge, rebase, or cherry-pick. Authorized local edits remain uncommitted.
- No application implementation, configured build system, or test runner exists. Host runtime/Docker/authentication remain unverified.
- G00 branch `feat/g00-cli-ux-demo`: PROPOSED ONLY, not authorized.

## 3. Documentation delivery completed on `dev`

The ten packet files (`README.md`, `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `TECH-RESEARCH.md`, `API-CONTRACT.md`, `SETUP.md`, `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`, `REPO-INITIALIZATION.md`, and `HANDOFF.md`) were created, committed, and pushed at `1b9f8bd`. Repository `AGENTS.md` was introduced at `1bb5757`.

Initial documentation delivery is resolved **for `dev` only**. It neither integrates the packet into remote `main` nor approves architecture, technologies, or G00. DOC-01 permits local corrections to five specified files only; staging, commits, pushes, merges, and PR operations remain prohibited.

## 4. Open decisions and blockers

| ID | Stage | Decision needed | Effect |
|---|---|---|---|
| B01 | Setup | Accept Codex-first scope, component isolation, and proposed stack | Architecture can't be marked approved |
| B02 | Git integration | Approve a plan preserving independent remote `main` and `dev` histories | Packet remains on `dev`; no main integration authorized |
| B08 | License/protection | Select license and repository rules/status checks | No license or protection change authorized |
| B03 | G00 | Approve complete CLI mock UX scope and command vocabulary | Do not issue executable G00 TODO |
| B04 | G00 setup | Project root verified; confirm runtime environment, available Docker, and package tool | Cannot verify local commands |
| B05 | G02 real AI | Verify allowed ChatGPT Codex login (and device-code permissions where needed) OR later independent API auth | G02 may become blocked, not G00 |
| B06 | G04 | Choose and configure supported PR-Agent model provider | PR-Agent later integration blocked until solved |
| B07 | G05 | Approve unattended identity/webhook/sandbox design | No automation until then |

Do not loop on B05/B06 while G00 mock demo can proceed after its independent approvals.

## 5. Scope exclusion and security policy

- G00 is a full **simulated terminal experience**, NOT real Codex or GitHub integration.
- Don't add web dashboard, server, PR-Agent dependencies, or persistent production services to G00.
- No destructive Git actions, unapproved package additions, credentials in docs, real GitHub posting, merge, push, deployment, or changes to protected governance files.
- Dirty canonical checkout or uncertain base => STOP, report a safe Git plan rather than creating/switching branches.
- Worker containers are read-only and must not get arbitrary GitHub write credentials; ChatGPT session-credential isolation is an explicit unresolved security gate.

## 6. Immediate next action (approval gate)

Review the five-file DOC-01 local diff. Stop after verification; do not stage, commit, push, create/switch branches or worktrees, merge, pull, reset, or open a PR. A future documentation commit/PR process and a separate history integration plan need explicit authorization.

Architecture and MVP/G00 scope acceptance, license selection, and G00 branch/TODO approval remain pending. After those approvals, prepare a bounded TODO per `sprint-code.md` with the `sprint-test.md` plan, then stop before implementation until specifically authorized.

## 7. Evidence standard

- Verified baseline: canonical checkout, branch references above, clean preflight, documentation delivery to remote `dev`, and unrelated remote histories.
- NOT verified: Docker builds, dependency installation/compatibility, Codex or gh login, PR review calls, application builds/tests, CI, runtime integration, or review publication.
- Documentation commits and push to `dev` occurred; no application implementation, main integration, or deployment is established.
- Untouched packet files retain preparation-time repository claims; current repository evidence in this handoff and `SETUP.md` supersedes them. Proposed architecture and API-contract decisions are unchanged.

**Next requested decision:** Review the local documentation diff. Further Git actions, history integration, and G00 implementation require new explicit authorization.
