# CodeGuardian - Initial Repository Setup Plan

**Target:** https://github.com/PixelsWorker/CodeGuardian  
**Verified 2026-10-14:** Public, `size=0`, default branch configured as `main`, no branch returned by API, and no commit exists. GitHub write access is available through the linked PixelsWorker account; **not used**.

## Initial commit candidate (pending specific authorization)

Proposed first commit should contain only approved planning documents and a short README. Do not conflate this initial setup with G00 implementation.

Suggested paths after approval:

```text
README.md
PROJECT-BRIEF.md
ARCHITECTURE.md
TECH-RESEARCH.md
API-CONTRACT.md
SETUP.md
HANDOFF.md
G00-SCOPE.md
G00-CLI-WIREFRAMES.md
REPO-INITIALIZATION.md
.gitignore                    # proposal; only add when exact approved contents known
LICENSE                       # only after license explicitly selected
```

## Preconditions for initial GitHub write

1. Rockson approves exact repository `PixelsWorker/CodeGuardian`, target `main`, and creating the initial commit containing identified files.
2. Rockson accepts the architecture and exact planning doc content (or requests edits).
3. Decide code license (`MIT` suggested, **not automatically chosen**). The repo is public, so avoid secrets/private customer information even in examples.
4. Confirm repo still has no branch/initial commit immediately before writing. If status differs, reconcile without overwriting.
5. Confirm no local canonical checkout with uncommitted changes is being overridden.
6. Capture resulting commit SHA, exact files and any error, and provide a truthful Git status/evidence handoff.

## After initialization

- Review the proposed G00 scope; require separate approval for branch creation (`feat/g00-cli-ux-demo`).
- Create an executable `TODO.md` only after setup and G00 scope approval.
- Develop all agreed mock CLI screens/flows under one G00 group branch/PR, with tests in the same group.
- Obtain explicit authorization before pushing/merging any implementation branch and before any security/ruleset changes.

## Configuration decisions deliberately open

- MIT versus another license.
- Branch protection/ruleset and status check requirements (repository settings changes need approval).
- README wording for public visibility.
- Developer host path, Docker/CLI install policy and future release process.

**Nothing here is a GitHub operation or proof of an initialized branch.**
