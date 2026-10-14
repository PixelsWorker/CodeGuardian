# CodeGuardian - Development Manager Handoff

**Product/group:** CodeGuardian / architecture and setup review (PRE-G00)  
**Date:** 2026-10-14  
**Status:** DRAFT - preparation completed; scope and Git actions still awaiting explicit approval

## 1. Project goal and scope

Build a CLI-first multi-agent GitHub PR review product: deterministic CodeGuardian Manager orchestrates specialist CodeGuardianMini Codex CLI/SDK workers, validates consolidated findings, and delegates all GitHub writes to an approval-gated publisher. PR-Agent A2A and webhooks are subsequent optional groups, not MVP prerequisites.

ChatGPT account login is a supported possible Codex local auth method without an OpenAI Platform API key. If a key becomes available later, keep the CLI/SDK adapter. Workspace Agent API tokens are not required for this Docker-based project.

## 2. Repository identity / current state

- Repo: https://github.com/PixelsWorker/CodeGuardian
- Owner: PixelsWorker, public, connected account has admin/write capabilities.
- Default branch setting: `main`; actual branches: NONE, initial commit/SHA: NONE.
- Canonical local checkout: UNKNOWN; host OS/available Docker binaries: NOT VERIFIED.
- Branch for G00: `feat/g00-cli-ux-demo` (PROPOSED ONLY).
- Git status/commit/push/PR: NONE performed in this work.

## 3. Documents delivered (local packet only)

`README.md`, `PROJECT-BRIEF.md`, `ARCHITECTURE.md`, `TECH-RESEARCH.md`, `API-CONTRACT.md`, `SETUP.md`, `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md`, `REPO-INITIALIZATION.md`, and this handoff.

## 4. Open decisions and blockers

| ID | Stage | Decision needed | Effect |
|---|---|---|---|
| B01 | Setup | Accept Codex-first scope, component isolation, and proposed stack | Architecture can't be marked approved |
| B02 | Repository init | Approve exact initial commit to `PixelsWorker/CodeGuardian:main` with selected files; confirm license | Repo remains empty |
| B03 | G00 | Approve complete CLI mock UX scope and command vocabulary | Do not issue executable G00 TODO |
| B04 | G00 setup | Confirm host OS/project root, available Docker, package tool, and environment | Cannot verify local commands |
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

Ask Rockson to confirm (a) acceptance of architecture and MVP/G00 scope, and (b) whether to initialize **only** the approved documentation on `PixelsWorker/CodeGuardian:main`. These are separate approvals. After acceptance, perform ONLY the specifically authorized GitHub operation and report commit SHA. Then prepare a short, bounded G00 executable TODO per `sprint-code.md` and embed the risk-based test plan from `sprint-test.md` into the same TODO; STOP before G00 implementation until authorized.

## 7. Evidence standard

- Verified now: GitHub repository metadata/empty branches; cited upstream releases and documentation.
- NOT verified: actual local checkout, Docker image builds, package installations, Codex or gh logins, PR calls, tests, code execution, CI, or publication.
- No code was committed, pushed, merged, or deployed.

**Requested response from Rockson:** accept or request revisions to architecture/G00 scope; decide license; then separately authorize initial documentation commit and later G00 work.
