# CodeGuardian - Technical Research and Verification

**Original research as of:** 2026-10-14; **current Git/Jules addendum:** 2026-10-15  
**Scope:** Source-level checks and planning; NOT running CodeGuardian  
**Caution:** Earlier empty-repository and independent-history entries are dated historical research, superseded by the 2026-10-15 Git checkpoint below. Version tags may change; no dependency or Docker compatibility test has run in this documentation update.

## Verified sources

| Topic | Verified fact | Evidence (upstream URL) | Project implication |
|---|---|---|---|
| Target repository | `PixelsWorker/CodeGuardian` exists, public, size=0; `main` configured as default; API listed no branches on 2026-10-14 | https://github.com/PixelsWorker/CodeGuardian ; https://api.github.com/repos/PixelsWorker/CodeGuardian/branches | Initial commit needed before regular branching/PR workflow; no existing SHA |
| Node.js runtime | Node 24 is LTS in October 2026; Node 26 is Current | https://nodejs.org/en/about/previous-releases | Node 24 proposed as baseline |
| Codex CLI release | Latest stable returned by GitHub `releases/latest`: `rust-v0.162.1`, published 2026-10-09 | https://github.com/openai/codex/releases/tag/rust-v0.162.1 | Pin/test compatible CLI release; do not default to floating `latest` |
| Codex SDK | `sdk/typescript/README.md` describes `@openai/codex-sdk` spawning the Codex CLI, threads, event streaming, structured output schema, and working-directory controls | https://github.com/openai/codex/blob/main/sdk/typescript/README.md | Adapter with explicit runtime validation |
| Codex auth | Local Codex can sign in with ChatGPT or API key; documented headless device auth `codex login --device-auth` when enabled; programmatic CI favors API auth | https://developers.openai.com/codex/auth | ChatGPT login viable initial path, not unattended guarantee |
| PR-Agent release | Latest stable returned: `v0.47.0`, published 2026-10-02 | https://github.com/The-PR-Agent/pr-agent/releases/tag/v0.47.0 | Version-pinned later integration |
| PR-Agent A2A | MOSAICO solution-agent server ships as versioned Docker image and supports A2A agent card, JSON-RPC, health, bearer authentication | https://github.com/The-PR-Agent/pr-agent/tree/main/docker/mosaico | Wrapper instead of fork |
| PR-Agent license | MIT license | https://github.com/The-PR-Agent/pr-agent/blob/main/LICENSE | Reuse permitted subject to license conditions; CodeGuardian's license remains a separate decision |
| PR-Agent model | A2A deployment template documents `API_BASE`, `API_KEY`, `MODEL_NAME` | https://github.com/The-PR-Agent/pr-agent/blob/main/docker/mosaico/pr-agent.env.example | PR-Agent cannot reuse Codex ChatGPT login implicitly |

## Authentication distinctions

1. **Codex CLI ChatGPT login:** subscriber/workspace-authenticated local interaction; eligible accounts may use browser sign-in or device-code flow where enabled.
2. **OpenAI Platform API key:** usage-billed API route that can authenticate Codex CLI for programmatic work and other API clients.
3. **ChatGPT Workspace Agent access token:** authorizes Workspace Agents API calls; not required by a standalone Docker manager and not a substitute for the first two without documented support.
4. **GitHub CLI login:** independent GitHub OAuth/device account authorization; publication uses a separate permission gate.
5. **PR-Agent provider key:** independent model endpoint credential, if using a provider that requires it.

A key acquired later does NOT mean dropping CLI. The Codex adapter can remain the CLI/SDK and select the supported credential mode through explicit configuration.

## Implementation claims NOT verified

- Building Docker images in the eventual development environment.
- Host architecture, kernel, Docker Engine, credential-store and device-auth permissions.
- Installation of both Codex packages together and compatible pinned versions.
- OAuth login within a Docker worker and persistence/rotation of sessions.
- Real PR retrieval or comment publication with `gh`.
- Codex SDK streaming, multiple workers, isolation, review quality, costs, latency, and concurrency behavior.
- PR-Agent A2A worker connectivity, authentication, structured normalization, and upgrade compatibility in CodeGuardian.
- License selection and CodeGuardian repo security/ruleset configuration.
- Specific upstream commit SHA claims in the user-provided architecture review were not independently revalidated during this packet preparation.

## Technical risks needing tests

- ChatGPT-based session credentials can be read by a process that has them mounted. Read-only workspaces alone do not make hostile repositories safe.
- Codex may require writable run/sessions directories; design scratch separately from read-only PR sources.
- SDK schema output is only a model response format; always run independent data validation.
- GitHub changed-line anchoring has edge cases (deletions, renames, multiline suggestions, stale SHA).
- PR-Agent's A2A output is primarily rendered text and requires normalization rather than direct trust.
- `main` is configured as a default branch of an empty repository but no actual branch exists yet.

## Proposed dependency posture

Use exact tested versions and a lockfile when implementing G00/G01; do not bake authentication files into images or commit them. Research verifies upstream availability only, not compatibility with CodeGuardian.

## Addendum - 2026-10-15 source research

**Repository:** `PixelsWorker/CodeGuardian` remote `main` `3c9db33177e7ee8e2c6310ac05af21839f0cac08`, remote `dev` `a39a37525ba5a5645dec8e382be0f47c735d1d0e`. Inspected Git tree and `AGENTS.md`, `API-CONTRACT.md`, `ARCHITECTURE.md`, `G00-CLI-WIREFRAMES.md`, `G00-SCOPE.md`, `HANDOFF.md`, `PROJECT-BRIEF.md`, `README.md`, `REPO-INITIALIZATION.md`, `ROADMAP.md`, `SETUP.md`, `TECH-RESEARCH.md`, `package.json` and `vite.config.ts`. Current remote `main` includes a browser mock and tests; no accepted native CLI or passing local tests were established. `.coderabbit.yaml` was absent from remote `main`.

| Topic | Official / repository evidence, checked 2026-10-15 | Planning consequence |
|---|---|---|
| Jules API | https://developers.google.com/jules/api — experimental `v1alpha`, Sources/Sessions/Activities, separate API key via `X-Goog-Api-Key` and Jules GitHub App connection | Adapter optional and version-isolated; not a turnkey full-codebase audit |
| Jules plans | https://developers.google.com/jules/api — plans automatically approved unless `requirePlanApproval: true` | Require human plan approval during a separately approved audit pilot |
| Jules PR creation | https://developers.google.com/jules/api — `AUTO_CREATE_PR` optional; default does not automatically open a PR | Never enable automatic PR creation in the pilot, but this alone does **not** enforce no writes |
| Jules source identity | https://developers.google.com/jules/api/reference/rest/v1alpha/sessions — `githubRepoContext.startingBranch`, no documented immutable SHA pin field | Independent exact-source/SHA identity gate; abort verified claim if ambiguous |
| Jules activity evidence | https://developers.google.com/jules/api/reference/rest/v1alpha/sessions.activities — agent messages/progress/artifacts | No guaranteed full-file inspection ledger; file coverage needs separate evidence |
| Current browser prototype | Verified `package.json` and React/Vite screen/test source on GitHub `main` at stated SHA | Browser reference ≠ native CLI; test scripts present ≠ executed/pass |
| Native stack | Prior Node/TypeScript/Ink candidates in planning documents, not installed/verified here | Recheck exact runtime, security and compatibility before any new dependency authorization |

**Risks to resolve before G06:** external source/code exposure, least-privileged disposable mirror, cloud command execution, prompt injection, credential handling, plan approval semantics, snapshot verification, API alpha compatibility, bounded usage/latency/rate limits, reporting and retention. Jules output is untrusted; CodeGuardian Manager independently verifies claims before a `verified` label.

**Execution status:** NO Jules API session, account connection, GitHub App installation, mirror, audit, model call, report publication, application build, test, dependency installation or deployment was performed by this research/documentation update. G00–G05 forecast unchanged; G06 estimate TBD.
