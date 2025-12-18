---
name: init
description: Initialize project docs - create PRODUCT.md and ARCHITECTURE.md
---

# Init Project Docs

Create project documentation if missing:

1. **Check** if `PRODUCT.md` exists in project root
   - If missing → Create with structure:
     - Vision / Mission
     - Success Metrics (revenue, users, growth)
     - Target Users
     - Value Propositions
     - Key Features
     - Competitive Landscape
     - Roadmap (Now / Next / Later)

2. **Check** if `ARCHITECTURE.md` exists in project root
   - If missing → Create with structure:
     - Tech Stack (with rationale)
     - System Design
     - Key Patterns
     - Data Models
     - Integrations
     - Technical Decisions
     - Known Limitations

3. **If files exist**, read them and suggest improvements based on current codebase.

**Fill in details** based on what you can learn from the codebase. Ask user for what you can't infer.

Product = WHAT and WHY. Architecture = HOW.
