# SETUP - CodeGuardian

**Updated:** 2026-10-27 (post-PR #6 governance reconciliation; historical setup evidence retained).
**State:** G00 implementation merged through PRs #1, #4, #5 and #6; formal nine-screen UX acceptance remains pending. G01 is not authorized. G06 remains optional and unapproved.

## Repository evidence

| Item | State |
|---|---|
| Repository | https://github.com/PixelsWorker/CodeGuardian (public) |
| PR #1 merge to `main` | `ee9575e62a7687ccf0e2803432c2ddc9c3beb36f` |
| PR #4 merge to `dev` | `0e5e95c74b32bfc6228a65a160f341bf49b0c34e` |
| PR #5 merge to `dev` | `cf39f19e946d102cc2e4adc2c06b80963b890215` |
| PR #6 merge to `dev` / current HEAD | `9d8e7d6e8876b3a78e0fc1e623a5d50220898987` |
| Git history | Reconciled through historical two-parent merge `e3e6b281e517a2d884309d527650ba9329e76d8e` |
| Browser reference | React/Vite nine-screen G00 mock, source/test files and `package.json` on `main` |
| Native terminal CLI | Implemented and merged in PRs #1/#4/#5/#6; PR #6 local receipts report 281/281 full tests, focused L4 47/47, 14/14 snapshots and build PASS; formal nine-screen UX acceptance remains pending. No independent hosted CI is evidenced. |
| Canonical checkout snapshot (2026-10-27) | `/home/rockson/Projects/Projects/CodeGuardian/CodeGuardian`, branch `dev`, HEAD `9d8e7d6e8876b3a78e0fc1e623a5d50220898987`; the six original governance modifications remain unstaged there, separately from the published reconciliation. |
| Pre-closeout worktree snapshot (2026-10-27) | At the earlier snapshot, only canonical `dev` was registered. PR #4/#5/#6 feature worktree paths are absent; archive-before-retirement compliance is unverified. |
| Current governance publication | Branch `docs/g00-closeout`, worktree `/home/rockson/Projects/Projects/CodeGuardian/worktree/g00-closeout-governance`, commit `1ba340732f84cba9a25ee5c7b9f5bfd6b35f436e`; PR #11 is open and unmerged, targeting `dev`. |
| G00 tracking issues | #7 operator acceptance, #8 archive/worktree reconciliation, #9 dependency/security, and #10 Windows/CI are open. Issue creation does not signify closure or acceptance. |
| Verification runtime in PR #6 receipts | Node.js `v24.21.0`, npm `11.19.0` (receipt-reported) |
| `.coderabbit.yaml` history | An earlier report said the user-reported path was absent from remote `main`; the date of that observation is not established here. The file is present in current `origin/main` (checked 2026-10-27). |

Unlike old setup records, remote `main` is no longer an empty documentation repository, and reconciliation is not pending. The checked-in `bun.lock` and React/Vite packages belong to the browser reference and do not authorize migration or select the native CLI stack.

## Historical browser reference verification (2026-10-15)

At the 2026-10-15 remote-only review, the root `package.json` declared `dev`, `build`, `lint`, `test` and `preview` scripts for the browser mock, with a Vitest suite. No install, build, lint, browser walkthrough or test was run in that historical review. A prior commit had added centralized Vite host validation; runtime behavior was untested at that time. This historical note does not describe the later native Ink PR #6 local verification recorded above.

## Proposed future stack and gates

| Stage | Technology and purpose | State |
|---|---|---|
| G00 native CLI | Supported Node.js/TypeScript terminal UI (Ink), controlled commands, mock fixtures | Implemented and merged; formal nine-screen UX acceptance pending. Candidate/version notes are historical planning material; Windows compatibility remains DEFERRED / NOT RUN / NOT WAIVED. |
| G01 | `gh` / GitHub API, read-only PR inspection | Later |
| G02 | Official Codex CLI/TypeScript SDK, bounded analysis workers | Later |
| G03 | Separate human-confirmed GitHub `COMMENT` publisher | Later |
| G04 | Optional PR-Agent A2A adapter | Later |
| G05 | Separately authorized GitHub App/webhooks | Later |
| G06 | Optional Google Jules `v1alpha` full-repository audit + independent Manager verification | Proposed only; pilot first |

G00 remains mock-only: no real API/AI worker or GitHub publication was introduced. PTY evidence is from a Linux kernel with Freedesktop SDK/Flatpak userspace; Windows verification is DEFERRED / NOT RUN, NOT WAIVED. The 2026-10-23 archive SHA verifies, but it predates later PR #4/#5/#6 correction work. A complete final archive manifest, append-only register and retirement receipts were not found in the inspected workspace; preserve the lifecycle exception and do not infer authorized retirement from absent paths.

The G00 PR #5 audit and later PR #6 review receipts record an unresolved high-severity npm audit warning. The user-provided PR #6 install transcript separately warns that lifecycle scripts for esbuild 0.28.2 and 0.25.12 are not covered by npm `allowScripts`. No audit fix, dependency update or script approval was performed. The test/build receipts are local-agent evidence; no independent hosted CI is evidenced.

## Security and permissions

Read parent workspace guidance and `AGENTS.md` before local work. Verify the current local Git branch, cleanliness, actual runtime, container/sandbox permissions and `bwrap` behavior; stop on unexpected divergence. No worker should obtain publisher credentials. Jules uses separate API credentials and a GitHub App; a prompt asking for read-only analysis cannot enforce a non-writing cloud environment.

Do not broaden G00 for G06. A G06 pilot needs independently approved repository/mirror identity, API/App access, cloud plan approval, cost/timeout bounds, snapshot proof and data-retention policy. Never store credentials in repo, prompt, fixture or browser bundle.

## Next manager gate

Rockson must personally accept or identify deficiencies in the full nine-screen native G00 UX. Keep Windows explicitly unverified and deferred. G01 requires a separate focused architecture/API-contract review, scope, dependency and Git approval. This file grants no authority for code changes, installation, commit/push/PR/merge, Jules sessions, or live publication. Refer to `HANDOFF.md`.
