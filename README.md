# CodeGuardian - Architecture and Setup Packet

**Prepared:** 2026-10-14  
**Target repository:** https://github.com/PixelsWorker/CodeGuardian  
**Status:** Planning packet committed and pushed to `dev` at `1b9f8bd`. Architecture acceptance and G00 scope approval remain pending. Application implementation has not started; the packet is not merged into remote `main`.

## Project overview and repository status

CodeGuardian is a proposed CLI-first GitHub PR review platform. A deterministic manager orchestrates specialist Codex workers, validates consolidated findings, and delegates GitHub writes to a separate publisher requiring explicit confirmation.

Canonical checkout: `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`. Run repository commands from this directory and read `AGENTS.md` and the parent workspace guide before contributing. The repository contains documentation only; no build system or application test runner is configured.

Verified baseline on 2026-10-14: local `dev` and `origin/dev` are at `1b9f8bd`; local `main` is at `1bb5757`; `origin/main` is at `dfe6daa`. Local `main` is an ancestor of `dev`, while remote `main` and `dev` have no common ancestor. Git integration requires separate authorization.

G00 is a **draft, awaiting approval** for a complete simulated terminal experience. Publishing planning documents does not approve architecture decisions, dependencies, implementation, or deployment.

## Start here

1. `PROJECT-BRIEF.md` - project goal, MVP scope, group roadmap, and acceptance gates.
2. `ARCHITECTURE.md` - manager-worker-publisher boundaries, execution, security, and upgrade design.
3. `TECH-RESEARCH.md` - source links, verified upstream releases, decisions and caveats.
4. `API-CONTRACT.md` - proposed internal TypeScript/JSON data structures, validation, and publishing rules.
5. `SETUP.md` - exact observed repository status, pending environment details, and readiness gate.
6. `G00-SCOPE.md` - one complete terminal/CLI UX demo group with simulated behavior only.
7. `G00-CLI-WIREFRAMES.md` - the proposed complete terminal user journey and mock states.
8. `REPO-INITIALIZATION.md` - completed initialization record, pending Git integration plan, and license/security decisions.
9. `HANDOFF.md` - development manager status, blockers, decisions required, and no-action boundary.

## Operating rules

- These files are **planning drafts**, not evidence that CodeGuardian has been built, tested, or deployed.
- Documentation delivery to `dev` is complete. Further commits, pushes, PRs, and merges require explicit authorization identifying the repository and operation.
- The user's governance material (`FULLSTACK-MANAGER.md`, `Instructions.md`, `SETUP.template.md`, `sprint-code.md`, `sprint-test.md`) defines the group model and approvals. These external references are not included in this repository; their contents were not verified by DOC-01.
- The project's approved stack is not established by drafting this packet. All significant choices marked PROPOSED require confirmation.
- Reconcile remote `main` and `dev` only through a separately approved integration plan. Separately approve architecture, G00 scope, its branch, and its executable TODO before implementation.

## API key policy

The MVP can begin without an OpenAI Platform API key. It will target Codex CLI/SDK authenticated through a supported ChatGPT sign-in in a trusted, developer-controlled environment. If a suitable API key becomes available later, the underlying Codex CLI/SDK adapter is retained; only the supported authentication mode and deployment policy may change. A ChatGPT Workspace Agent trigger token is a different credential and is not required for this Docker-first application. PR-Agent Phase 2 needs its own LLM provider connection.

## Evidence freshness

`SETUP.md`, `HANDOFF.md`, and `REPO-INITIALIZATION.md` record the updated Git baseline. Untouched planning files retain preparation-time statements about an empty repository; those historical statements are superseded by this baseline and do not change their proposed architecture or scope.
