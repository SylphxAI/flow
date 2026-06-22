# Flow Repository Instructions

Engineering doctrine: https://github.com/SylphxAI/doctrine

Before changing behavior, read `PROJECT.md`, `.doctrine/project.json`, this
file, and the triggered standards in `SylphxAI/doctrine`.

Flow is the public source of truth for Sylphx agent assets and runtime projections.

Canonical agent behavior lives in `packages/flow/assets/`:

- `agents/` contains agent identity and always-on operating policy.
- `standards/` contains reusable domain standards.
- `skills/` contains repeatable command-like workflows.

Runtime-specific files are projections only. Do not add project-local prompt islands such as `.claude/agents`, `.claude/skills`, `.codex/skills`, copied Builder prompts, or duplicated standards in this repository.

When adding support for an AI tool, implement a projection from the canonical assets into that tool's supported runtime layout. The projection may rename files, strip unsupported metadata, transform frontmatter, and copy assets, but it must not create a second source of truth for Builder identity, standards, or skills.

For architecture decisions, update `docs/adr/`. For durable product direction, update `PRODUCT.md` or `ARCHITECTURE.md`. For implementation history, use commits.
