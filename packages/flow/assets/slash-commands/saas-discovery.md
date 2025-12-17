---
name: saas-discovery
description: SaaS strategic discovery - features, pricing, competitive research
agent: coder
---

# Strategic Discovery & Opportunities

## Scope

Cross-domain strategic exploration: identify new feature opportunities, optimize pricing/packaging, and conduct competitive research. This is NOT compliance checking — it's creative/strategic work to improve the product.

## Mandate

* **Exploration required**: identify improvements for competitiveness, completeness, usability, reliability, and monetization within fixed constraints.
* Think beyond current implementation — what's missing? What would make users love this product?
* Convert insights into **testable acceptance criteria**, not vague suggestions.

## Feature Discovery

### Process

1. **Audit current capabilities**: What does the product do today?
2. **Identify gaps**: What's missing that users expect?
3. **Prioritize by impact**: What would move the needle most?
4. **Define success criteria**: How would we know the feature works?

### Areas to Explore

* **User workflows**: Are there manual steps that could be automated?
* **Integrations**: What third-party services should we connect to?
* **Data/insights**: What data do we have that users would value seeing?
* **Collaboration**: Are there multi-user/team features missing?
* **Mobile**: Is the mobile experience feature-complete or degraded?
* **API/Developer**: Should there be a public API? Webhooks for users?
* **AI/Automation**: Where could AI add value without being gimmicky?

### Output Format

For each feature opportunity:
```markdown
**Feature**: [Name]
**Problem**: [What user problem does this solve?]
**Impact**: [High/Medium/Low] — [Why?]
**Effort**: [High/Medium/Low] — [Why?]
**Success Criteria**: [How do we measure success?]
**Acceptance Criteria**:
- [ ] [Specific, testable requirement]
- [ ] [Another requirement]
```

## Pricing & Monetization Discovery

### Process

1. **Audit current pricing**: Tiers, features per tier, price points
2. **Analyze value alignment**: Does pricing match perceived value?
3. **Identify friction**: Where do users hesitate to pay?
4. **Explore models**: Subscription, usage-based, hybrid, freemium

### Areas to Explore

* **Tier differentiation**: Are tiers clearly differentiated? Is there a "trapped middle"?
* **Feature gating**: Are the right features gated? Too much in free? Too little?
* **Price anchoring**: Is there a decoy tier? Is the recommended tier obvious?
* **Trial optimization**: Is trial length optimal? What converts?
* **Upgrade triggers**: What signals readiness to upgrade? Are we acting on them?
* **Annual discounts**: Is annual pricing compelling enough?
* **Add-ons**: Are there features that should be add-ons rather than tier-gated?
* **Usage-based**: Would pay-per-use work for any features?

### Output Format

For each pricing opportunity:
```markdown
**Change**: [What to change]
**Rationale**: [Why this improves monetization]
**Expected Impact**: [Conversion? ARPU? Retention?]
**Risk**: [What could go wrong?]
**Test Plan**: [How to validate before full rollout]
```

## Competitive Research

### Process

1. **Identify competitors**: Direct and indirect (alternative solutions)
2. **Analyze features**: What do they have that we don't?
3. **Analyze pricing**: How do they package and price?
4. **Analyze UX**: What do they do better? Worse?
5. **Synthesize insights**: What should we adopt? Avoid? Differentiate on?

### Areas to Explore

* **Feature parity**: What table-stakes features are we missing?
* **Differentiation**: What do we do uniquely well? How to amplify?
* **Pricing position**: Are we premium, mid-market, or budget? Is that intentional?
* **UX patterns**: What onboarding/guidance patterns work well elsewhere?
* **Growth tactics**: How do competitors acquire and retain users?
* **Market gaps**: What's everyone missing that we could own?

### Output Format

For each competitive insight:
```markdown
**Competitor**: [Name]
**Observation**: [What we learned]
**Implication**: [What this means for us]
**Action**: [Specific recommendation]
**Priority**: [High/Medium/Low]
```

## Synthesis

After exploring all areas, produce a prioritized roadmap:

### Immediate Wins (Do Now)
High impact + Low effort opportunities

### Strategic Investments (Plan Carefully)
High impact + High effort opportunities

### Quick Wins (When Available)
Low impact + Low effort opportunities

### Deprioritized (Defer/Skip)
Low impact + High effort — document why not pursuing

## Exit Criteria

* [ ] Feature gaps identified with acceptance criteria
* [ ] Pricing optimization opportunities documented
* [ ] Competitive landscape analyzed
* [ ] Prioritized roadmap produced
* [ ] All recommendations have testable success criteria
