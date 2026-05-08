# Prompt Architecture Standard

## Purpose

Prompts for agents are operating policy, not motivational prose. Optimize them for deterministic execution, conflict resolution, delegation, future sessions, and machine parsing.

## Minimum Effective Policy

Use the smallest prompt that reliably changes behavior.

- Put always-on law in `AGENTS.md`.
- Put detailed standards in `~/.codex/standards/`.
- Put repeatable command-like workflows in `~/.codex/skills/`.
- Put repo facts in project `AGENTS.md`.
- Put task decisions in specs, ADRs, tests, evals, changelogs, or memory.

Do not duplicate the same rule across layers. A higher layer should route to lower-detail references, not restate them.

## Agent-Readable Shape

Prefer this structure:

- Scope: where this applies.
- Role: what the agent owns.
- Triggers: when to apply the rule.
- Action: what to do.
- Boundaries: when to stop or ask.
- Source of truth: where durable facts live.
- Validation: how success is proven.
- Output: what the user or next agent receives.

Use short headings, direct verbs, stable vocabulary, and concrete conditions. Avoid relying on tone, vibes, or implicit human context.

## Good Rules

Good prompt rules are:

- Actionable: "For non-trivial API changes, write or update an ADR before implementation."
- Triggered: "When reviewing code, findings come first."
- Bounded: "Ask before destructive VCS, database, or infrastructure changes."
- Verifiable: "Report validation run and skipped checks."
- Composable: "Read the relevant standard only when the task touches that domain."

## Bad Rules

Avoid rules that are:

- Aspirational only: "Be perfect" without execution criteria.
- Absolute without risk boundary: "Never ask questions."
- Duplicated across files.
- Tool-specific when the tool does not officially support the mechanism.
- Contradictory: "Always act autonomously" plus "Ask whenever uncertain" without a decision boundary.
- Overloaded: one prompt trying to be constitution, handbook, workflow, memory, and task brief.

## Refactoring Existing Prompts

When migrating instructions from Claude, Cursor, Windsurf, project templates, or old dotfiles:

1. Extract durable intent before preserving wording.
2. Remove unsupported frontmatter or tool-specific syntax unless the target tool recognizes it.
3. Convert values into behavior: "craftsmanship" becomes naming, tests, observability, root-cause closure, and delivery criteria.
4. Convert broad rules into triggers and boundaries.
5. Move details to standards or skills when they are not always needed.
6. Delete stale, duplicate, or conflicting rules.
7. Commit the prompt change like code.

## MEP Check

Before keeping a prompt line, ask:

- Does this change behavior in a future session?
- Is this the highest-correct source of truth for the rule?
- Is the trigger clear enough for an agent to apply without hidden context?
- Does it conflict with autonomy, safety, delivery, or project instructions?
- Can success or failure be observed?

If the answer is no, rewrite it, move it, or delete it.
