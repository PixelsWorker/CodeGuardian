# CodeGuardian - Architecture and Setup Packet

**Prepared:** 2026-10-14  
**Target repository:** https://github.com/PixelsWorker/CodeGuardian  
**Status:** Draft for scope and initial repository-write approval. NO implementation or GitHub writes performed.

## Start here

1. `PROJECT-BRIEF.md` - project goal, MVP scope, group roadmap, and acceptance gates.
2. `ARCHITECTURE.md` - manager-worker-publisher boundaries, execution, security, and upgrade design.
3. `TECH-RESEARCH.md` - source links, verified upstream releases, decisions and caveats.
4. `API-CONTRACT.md` - proposed internal TypeScript/JSON data structures, validation, and publishing rules.
5. `SETUP.md` - exact observed repository status, pending environment details, and readiness gate.
6. `G00-SCOPE.md` - one complete terminal/CLI UX demo group with simulated behavior only.
7. `G00-CLI-WIREFRAMES.md` - the proposed complete terminal user journey and mock states.
8. `REPO-INITIALIZATION.md` - controlled initial commit plan and license/security decisions.
9. `HANDOFF.md` - development manager status, blockers, decisions required, and no-action boundary.

## Operating rules

- These files are **planning drafts**, not evidence that CodeGuardian has been built, tested, or deployed.
- This packet is **not** an initial GitHub commit. Uploading or committing it requires approval identifying the repo and operation.
- The user's governance material (`FULLSTACK-MANAGER.md`, `Instructions.md`, `SETUP.template.md`, `sprint-code.md`, `sprint-test.md`) defines the group model and approvals.
- The project's approved stack is not established by drafting this packet. All significant choices marked PROPOSED require confirmation.
- After approval: initialize `main` with accepted setup/architecture only; separately approve a G00 branch and its executable TODO.

## API key policy

The MVP can begin without an OpenAI Platform API key. It will target Codex CLI/SDK authenticated through a supported ChatGPT sign-in in a trusted, developer-controlled environment. If a suitable API key becomes available later, the underlying Codex CLI/SDK adapter is retained; only the supported authentication mode and deployment policy may change. A ChatGPT Workspace Agent trigger token is a different credential and is not required for this Docker-first application. PR-Agent Phase 2 needs its own LLM provider connection.
