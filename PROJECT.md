# Flow Project

Flow is a production agent-tooling repository for Sylphx agent assets and
runtime projections. It owns canonical agent identities, standards, skills, and
the `@sylphx/flow` CLI that projects those assets into supported AI coding
tools.

## Goals

- Own canonical agent assets under `packages/flow/assets/`.
- Own the Flow CLI, runtime projection logic, docs, package release workflow,
  and admission workflow.
- Keep agent identity, standards, and skills single-sourced and projected into
  runtime-specific layouts without creating prompt islands.

## Non-Goals

- Do not own individual product repos' local project facts, deployment paths,
  or customer-specific behavior.
- Do not duplicate Builder identity, standards, or skills in runtime-specific
  directories.
- Do not treat source revert as complete recovery after package publish or
  agent-runtime projection behavior is released.

## Boundaries

Owned contexts are canonical Flow assets, runtime projections, Flow CLI,
package release, docs, and ADR-29 admission workflow. Product repos consume Flow
through package exports, CLI commands, generated projections, and documented
assets.

Public surfaces:

- Canonical assets under `packages/flow/assets/`.
- CLI package `@sylphx/flow` in `packages/flow/package.json`.
- Existing root agent adapter `AGENTS.md`.
- Required contexts `risk-classification/pass` and `trunk-admission/pass`.

## Delivery

Current CI model: `adr29-admission`. Required branch contexts are
`risk-classification/pass` and `trunk-admission/pass`.

Release path: `.github/workflows/release.yml` calls the central reusable
release workflow. Production proof must include admission contexts, CI
fan-in/postsubmit proof, npm package readback, projection smoke tests, and docs
readback.

Recovery class: `forward-fix-only`, because published package versions and
agent projection behavior cannot be fully undone by source revert.

## References

- Machine manifest: `.doctrine/project.json`
- Root agent adapter: `AGENTS.md`
- Canonical assets: `packages/flow/assets/`
- Package: `packages/flow/package.json`
- CI/admission: `.github/workflows/ci.yml`
- Release: `.github/workflows/release.yml`
- Doctrine: https://github.com/SylphxAI/doctrine
