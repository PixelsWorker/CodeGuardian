# CodeGuardian

**Status:** Architecture/setup and mock UX review; proposed CLI-first multi-agent GitHub PR reviewer.
**Repository:** https://github.com/PixelsWorker/CodeGuardian
**GitHub source inspected:** `main` `3c9db33177e7ee8e2c6310ac05af21839f0cac08`, 2026-10-15 (pre-governance-update checkpoint).

## What exists

A **React/Vite browser-based nine-screen G00 reference** exists on `main`, with synthetic scenarios, TypeScript source, `package.json`, `bun.lock` and tests. It is a UX prototype, **not a native terminal CLI**, not a completed Codex/GitHub integration and not independently verified to pass local builds or tests in this documentation work. `dev` at `a39a37525ba5a5645dec8e382be0f47c735d1d0e` remains a separate documentation baseline. Git histories were reconciled through `e3e6b281`.

The intended system accepts an authorized PR URL, uses bounded CodeGuardianMini Codex specialists and a deterministic Manager to validate evidence, and eventually allows a separately gated publisher to submit a human-approved GitHub `COMMENT` review. No automatic write/publish privilege is granted to AI workers.

## Source-of-truth documents

| Document | Purpose |
|---|---|
| `PROJECT-BRIEF.md` | Product intent, roles, G00-G05 groups and proposed optional G06 |
| `ROADMAP.md` | Dependencies, estimates and stage exit gates |
| `ARCHITECTURE.md` | Proposed D-01–D-08, plus proposed Jules D-09 |
| `API-CONTRACT.md` | PR-diff review schema and separate proposed repository-audit schema |
| `G00-SCOPE.md`, `G00-CLI-WIREFRAMES.md` | Complete native terminal G00 UX target |
| `SETUP.md` and `HANDOFF.md` | Verified remote setup and next Development Manager gate |
| `TECH-RESEARCH.md` | Dated external evidence, versions, uncertainties and risks |
| `REPO-INITIALIZATION.md` | Initial history and resolved Git integration |
| `AGENTS.md` | Repository contribution and permission boundaries |

## Roadmap separation

- **G00:** Complete mock-only **native CLI** UX, using the browser prototype strictly as design reference. Acceptance is pending.
- **G01–G03:** Real authenticated PR inspection; bounded Codex specialist review; human-approved GitHub publication.
- **G04–G05:** Optional PR-Agent adapter and future GitHub event automation with separate authorization.
- **G06 (PROPOSED, OPTIONAL):** Jules-assisted **repository-wide** architecture/coverage audit. Jules produces untrusted candidate findings; the CodeGuardian Manager independently checks source claims at a verified commit and generates an evidence-labeled `AUDIT.md`. No G00–G05 schedule expansion or Jules API execution is implied.

## Approval and execution

The existing browser prototype is not proof of native CLI UX acceptance, real GitHub integration, published reviews, or a working Jules adapter. The documented canonical local path is `/home/rockson/Projects/PixelsWorker/CodeGuardian/CodeGuardian`; its working tree and runtime were not accessed in this remote review.

The next gate is **Development Manager setup/architecture and native G00 design review**, not unapproved implementation. Branches, dependency changes, tests requiring a live environment, Jules/GitHub external operations, commits, PRs, merges and deployments each require the applicable Rockson approval. Do not copy credentials into models or docs.
