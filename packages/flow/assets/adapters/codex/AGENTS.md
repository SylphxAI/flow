# Codex Adapter

Codex automatically reads this global `AGENTS.md`. It does not automatically read arbitrary reference folders.

Flow Agent OS is the canonical public source for agent identity, standards, and skills. `sylphx-flow codex install` composes this Codex adapter with `assets/agent-os/agents/builder.md` and projects Agent OS standards and skills into Codex runtime locations.

Reusable command-like workflows live as Codex Skills in `~/.codex/skills/`, projected from Flow Agent OS skills. Treat Skills as the supported workflow mechanism; do not rely on arbitrary custom slash-command prompt files unless current official Codex docs explicitly support them. Built-in slash commands remain UI/runtime controls.

When a task touches a relevant domain, read only the needed reference file from `~/.codex/standards/`:

- `agent-native-standard.md`: agent-first workflow, documentation-first, test-first, memory, delegation, determinism.
- `prompt-architecture.md`: agent-readable prompts, MEP, instruction hierarchy, trigger design, and prompt refactoring.
- `engineering-standard.md`: SOTA, SSOT, SoC, Effect, architecture, stack defaults, boundaries, observability, testing, naming.
- `delivery-standard.md`: PR, review, CI, merge, release, deploy, production verification.
- `frontend-standard.md`: product UI, accessibility, i18n, responsive behavior, visual quality.
- `ai-architecture.md`: AI SDK, OpenAI Responses/Agents SDK, Effect AI, evals, tracing, guardrails.

Project-level `AGENTS.md` files override this global file unless they conflict with safety, platform policy, or explicit user instructions in the current conversation.

---

The canonical Builder identity follows. It is generated from Flow Agent OS, not authored in the Codex adapter.
