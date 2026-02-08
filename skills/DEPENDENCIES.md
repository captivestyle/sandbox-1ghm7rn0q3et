# Skill Dependencies

This file tracks dependencies between skills to prevent circular references and maintain a clean dependency graph.

## Rules

1. **No Circular Dependencies**: Skill A → Skill B → Skill A is forbidden
2. **Explicit References**: Use `fetchSkill({ skillName: "...", mcpUrl })` when a skill requires code/implementation from another
3. **Soft References**: Use "Related Skills" section for suggestions only (not hard dependencies)
4. **Meta Skills Can Reference Operational**: Meta skills can reference operational skills as examples
5. **Operational Skills Minimize Cross-References**: Operational skills should be self-contained when possible

## Dependency Graph

```
Legend:
  → Hard dependency (requires fetching the referenced skill)
  ⇢ Soft reference (mentioned in "Related Skills" section)

Meta Skills:
  building-3d-games
    (no dependencies - top-level overview)

  creating-agentic-tools
    ⇢ 3d-game-defaults (example)

  editing-code-via-mcp
    (no dependencies - tool patterns)

  syntax-verification-before-completion
    (no dependencies - verification pattern)

  verifying-agent-work
    ⇢ 3d-game-defaults (mentions local testing example)

Operational Skills:
  3d-game-defaults
    (no dependencies - foundational reference)

  loading-3d-assets
    → 3d-game-defaults (requires useNormalizedModel hook implementation)
    ⇢ sourcing-3d-assets
    ⇢ creating-platformer-mechanics

  sourcing-3d-assets
    ⇢ creating-agentic-tools (for understanding getPolyPizzaAsset tool)

  creating-platformer-mechanics
    ⇢ 3d-game-defaults (for default values)
```

## Hard Dependencies (→)

These require `fetchSkill()` to function correctly:

| Skill | Depends On | Reason |
|-------|------------|--------|
| loading-3d-assets | 3d-game-defaults | Needs useNormalizedModel hook implementation |

## Soft References (⇢)

These are suggestions in "Related Skills" sections - not required for functionality:

| Skill | References | Purpose |
|-------|------------|---------|
| loading-3d-assets | sourcing-3d-assets | Shows where to get models |
| loading-3d-assets | creating-platformer-mechanics | Example of usage context |
| sourcing-3d-assets | creating-agentic-tools | Understanding tool design |
| creating-platformer-mechanics | 3d-game-defaults | Reference for default values |
| verifying-agent-work | 3d-game-defaults | Example in local testing section |
| creating-agentic-tools | 3d-game-defaults | Example of operational skill |

## Circular Dependency Check

✅ **No circular dependencies detected**

Current dependency chains:
- `loading-3d-assets → 3d-game-defaults` (terminates)

All other references are soft (⇢) and do not create cycles.

## Adding New Skills

When creating a new skill:

1. **Check for cycles**: Ensure the new dependency doesn't create a circular reference
2. **Minimize hard dependencies**: Use `→` only when you need code implementation
3. **Document here**: Add to the dependency graph above
4. **Update this file**: Run the validation check below

## Validation

To check for circular dependencies:

```bash
# List all hard dependencies (fetchSkill calls)
grep -r "fetchSkill" skills/*/SKILL.md skills/*/*/SKILL.md | grep -o "skillName: \"[^\"]*\"" | cut -d'"' -f2 | sort | uniq

# Check dependency depth (should be ≤ 2 levels)
# If A → B → C, that's okay
# If A → B → C → D, consider restructuring
```

## Dependency Levels

**Level 0 (Foundational)** - No dependencies:
- 3d-game-defaults
- editing-code-via-mcp
- syntax-verification-before-completion
- building-3d-games

**Level 1** - Depends on Level 0:
- loading-3d-assets → 3d-game-defaults
- sourcing-3d-assets (soft references only)
- creating-platformer-mechanics (soft references only)
- creating-agentic-tools (soft references only)
- verifying-agent-work (soft references only)

**Max Depth**: 1 (healthy)

## Future Considerations

If we add more operational skills that need common utilities:

1. Consider creating a "utils" skill with shared hooks/functions
2. Keep it at Level 0 (no dependencies)
3. Have other skills reference it as needed
4. Example: `3d-game-utils` could contain:
   - useNormalizedModel
   - usePhysics
   - useCollision
   - etc.

This would allow `3d-game-defaults` to focus on default VALUES while `3d-game-utils` provides IMPLEMENTATIONS.
