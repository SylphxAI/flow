---
name: prompt-architect
description: Use when creating, reviewing, migrating, or refactoring agent prompts, AGENTS.md files, Claude/Cursor/Windsurf rules, Codex skills, standards, instruction hierarchies, MEP prompts, or reusable agent workflows.
metadata:
  short-description: Refactor agent instructions into concise executable policy
---

# Prompt Architect

Use this skill to convert prompt prose into agent-readable operating policy.

## Workflow

1. Read `~/.codex/standards/prompt-architecture.md`.
2. Classify each instruction as global law, project-specific fact, reusable workflow, domain standard, task brief, memory, ADR, or obsolete content.
3. Preserve durable intent, not original wording.
4. Convert vague values into concrete triggers, actions, boundaries, sources of truth, validation, and output requirements.
5. Remove unsupported tool syntax unless the target tool officially recognizes it.
6. Deduplicate rules across layers.
7. Keep `AGENTS.md` as router and constitution; move detailed procedures into standards or skills.
8. Commit prompt changes when working in a versioned dotfiles or project repository.

## Review Checklist

- Is the prompt short enough to be always-on?
- Does every rule have a trigger or scope?
- Is there a clear ask/act boundary?
- Are tool-supported mechanisms used instead of invented folders or frontmatter?
- Are references loaded only when relevant?
- Are success criteria verifiable?
- Could a fresh subagent apply this without hidden conversation context?

## Output

For reviews, return findings first with exact rewrite recommendations.

For edits, state which layer changed and why: global `AGENTS.md`, project `AGENTS.md`, standard, skill, ADR, memory, or task brief.
