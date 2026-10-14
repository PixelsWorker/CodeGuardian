# Repository Guidelines

## Project Structure & Module Organization

The current working directory contains the Git repository in `CodeGuardian/`. Run repository commands from that directory. It currently contains only `README.md`, which introduces the project; no source code, tests, or assets are present yet.

As implementation begins, organize code by responsibility and document new directories in `CodeGuardian/README.md`. Keep tests close to their modules or in a dedicated test directory, and give assets a clearly named location.

## Build, Test, and Development Commands

No build system, package manifest, development server, or test runner is configured. Do not assume commands such as `npm test` or `make build` are available.

Useful commands from the current working directory:

- `cd CodeGuardian`: enter the Git repository.
- `git status --short`: inspect changed and untracked files after entering it.
- `git diff --check`: check staged or unstaged tracked changes for whitespace errors.

When adding tooling, document exact installation, development, build, and test commands in the README.

## Coding Style & Naming Conventions

No programming language, formatter, or linter has been established. Follow existing conventions as code is introduced, and use consistent indentation within each file. Choose descriptive module, function, and variable names. Keep Markdown headings descriptive and instructions actionable. Add formatting and lint configuration alongside the first implementation that needs it.

## Testing Guidelines

There is currently no testing framework or coverage threshold. New behavior should include appropriate automated tests once a runner is selected. Name tests after the behavior they verify, and document how contributors run them. Until then, review documentation changes for accuracy and check whitespace.

## Commit & Pull Request Guidelines

The Git repository has no commits, so no commit message convention can be inferred. Use concise, imperative subjects, such as `Add initial project structure`.

Pull requests should explain the change, its purpose, and validation performed. Link relevant issues when available; include screenshots for visible interface changes. Identify any tooling or configuration contributors must install.
