# Recursive Agent Instruction Architecture

This document describes the complete agent instruction system for the Visit Create MCP Server and how it governs agent behavior across the codebase.

## System Overview

The agent instruction system is **recursive and hierarchical**, with guidance layered from global rules (root) down to specific subsystems (nested):

```
┌─ AGENTS.md (root)          ← Global rules, repository overview
│
├─ /src/AGENTS.md            ← Source code organization
│  ├─ /src/tools/AGENTS.md   ← Tool implementation patterns
│  ├─ /src/services/AGENTS.md← API client patterns
│  └─ /src/schemas/AGENTS.md (prepared for future use)
│
├─ PLANS.md                  ← Multi-step work templates
├─ SUBAGENTS.md              ← Specialized agent roles
│
├─ SKILLS/
│  ├─ add-tool/SKILL.md
│  ├─ debug-build/SKILL.md
│  └─ test-locally/SKILL.md
│
└─ This file (ARCHITECTURE.md)← System documentation
```

## File Placement Map

```
Visit-Create-MCP/
├── AGENTS.md                          # Root agent guidance
├── PLANS.md                           # Multi-step implementation plans
├── SUBAGENTS.md                       # Specialized sub-agent definitions
├── ARCHITECTURE.md                    # This file
│
├── src/
│   ├── AGENTS.md                      # Source directory guidance
│   ├── tools/
│   │   └── AGENTS.md                  # Tool-specific patterns
│   ├── services/
│   │   └── AGENTS.md                  # API client patterns
│   └── schemas/
│       └── AGENTS.md                  # Schema organization (optional)
│
├── SKILLS/
│   ├── add-tool/
│   │   └── SKILL.md                   # Skill: Add new tool
│   ├── debug-build/
│   │   └── SKILL.md                   # Skill: Debug build failures
│   └── test-locally/
│       └── SKILL.md                   # Skill: Test server locally
│
├── package.json
├── tsconfig.json
├── README.md
└── ... (source files, dist/, etc.)
```

## File Purposes

### Root Level

| File | Purpose | Owner | Frequency |
|------|---------|-------|-----------|
| `AGENTS.md` | Global rules, project overview, repo map, when to use nested files | All agents | Consult first |
| `PLANS.md` | Templates for multi-step work (adding tool, refactoring, etc.) | Implementers | Use for complex tasks |
| `SUBAGENTS.md` | Definitions of specialized agent roles and dispatch rules | Coordinators | Use for parallel work |
| `ARCHITECTURE.md` | This system description and maintenance rules | Maintainers | Update when system changes |

### Source Directory (/src)

| File | Purpose | Scope | Applies To |
|------|---------|-------|-----------|
| `/src/AGENTS.md` | Source organization, imports, module patterns | Everything in `/src/` | All source files |
| `/src/tools/AGENTS.md` | Tool implementation patterns, Zod validation, error handling | `/src/tools/*.ts` files | Tool implementers |
| `/src/services/AGENTS.md` | API client patterns, rate limiting, request/response handling | `/src/services/*.ts` files | API client engineers |
| `/src/schemas/AGENTS.md` | Zod schema organization (future) | `/src/schemas/` | Schema designers |

### Skills (/SKILLS)

| Skill | Purpose | Audience | Time |
|-------|---------|----------|------|
| `/SKILLS/add-tool/SKILL.md` | Step-by-step checklist for adding a single tool | Tool implementers | 5-15 min |
| `/SKILLS/debug-build/SKILL.md` | Systematic debugging of build/TypeScript errors | All agents | 2-10 min |
| `/SKILLS/test-locally/SKILL.md` | How to run and test server locally | QA, implementers | 5-20 min |

## Instruction Precedence

When an agent works in a directory, instructions are applied in this order (highest to lowest priority):

1. **Nested AGENTS.md** in that directory (most specific)
2. **Root AGENTS.md** (global defaults)
3. **Skill** invoked for the task (operational procedure)
4. **Plan** template followed (if applicable)

**Example**: An agent adding a tool in `/src/tools/visitors.ts` consults:
1. `/src/tools/AGENTS.md` (tool patterns) — highest priority
2. `/src/AGENTS.md` (import/organization rules) 
3. `/AGENTS.md` (global TypeScript rules)
4. Optionally: `SKILLS/add-tool/SKILL.md` (checklist)
5. Optionally: `PLANS.md` section "Adding a New Tool"

If a nested file contradicts root guidance within its scope, the nested file wins.

## How Agents Navigate the System

### Phase 1: Initial Orientation
1. Read `/AGENTS.md` (root) — 5 min
2. Understand project scope, repo map, global rules
3. Know when to consult nested files

### Phase 2: Task-Specific Preparation
1. Identify task type (add tool? fix bug? refactor?)
2. Find relevant nested `AGENTS.md` if applicable
3. If multi-step work, find template in `PLANS.md`
4. If repetitive procedure, find matching Skill

### Phase 3: Execution
1. Follow patterns from nested `AGENTS.md`
2. Reference Skill for detailed step-by-step guidance
3. Use Plan template to manage multi-phase work
4. Use Sub-agent definitions to parallelize work

### Phase 4: Validation
1. Run `npm run build` to verify compilation
2. Check success criteria from Skill or Plan
3. Create PR with description
4. Await code review

## Instruction Update Rules

### When to Update Root AGENTS.md
- Global rules changed (e.g., "no destructive operations")
- Build/dev commands changed
- New required environment variables
- Major architectural shift
- Testing strategy changed

**Change frequency**: ~1-2 times per quarter (major changes only)

### When to Update Nested AGENTS.md
- Patterns within that subsystem changed
- New conventions established for that area
- Rules within that scope got stricter or looser
- Documentation of recent learnings

**Change frequency**: ~1 time per month (as patterns stabilize)

### When to Add a New Nested AGENTS.md
- New major subsystem created (e.g., `/infra/`, `/tests/`)
- Existing directory has conflicting patterns from root
- Specialized rules needed for growing subsystem
- Multiple agents confused about how to work in that area

**Decision gate**: "Would 3+ agents benefit from specific guidance here?"

### When to Create a New Skill
- Same procedure repeated 2+ times across different tasks
- Procedure is 5+ steps and error-prone
- Procedure saves 10+ minutes when followed

**Decision gate**: "Would this save time and prevent mistakes?"

### When to Create a New Plan Template
- Multi-phase work repeated 2+ times
- Plan helps manage complex dependencies
- Plan reduces mistakes on that type of work

**Decision gate**: "Would this task be risky or unclear without a plan?"

## Avoiding Contradictions

### Rule 1: Nested Files Only Add, Never Contradict
```
✅ Root: "Use makeApiRequest for all HTTP"
✅ Nested: "In tools, use makeApiRequest via this pattern..."
   (nested clarifies, doesn't contradict)

❌ Root: "All tools must be GET operations"
❌ Nested: "Tools here can be POST"
   (contradiction — don't do this)
```

### Rule 2: Supersede Explicitly
If a nested rule must differ from root, document explicitly:
```markdown
## Override: API Client Patterns

**Root rule**: Axios timeout is 30 seconds
**This subsystem**: Webhooks have 60-second timeout because...
```

### Rule 3: Keep Root Stable
Don't update root AGENTS.md for every little change. Root should reflect stable, long-term guidelines.

### Rule 4: Review Before Merging
Significant instruction changes should be in PR description for visibility.

## System Maintenance Checklist

### Quarterly Review (every 3 months)
- [ ] Is root AGENTS.md still accurate?
- [ ] Have new patterns emerged not documented?
- [ ] Are agents confused about any rules?
- [ ] Should any Skills be added/updated?

### After Major Refactor
- [ ] Update relevant nested AGENTS.md
- [ ] Confirm no contradictions with root
- [ ] Document new patterns in Skills
- [ ] Brief team on changed guidance

### When Adding Major Feature
- [ ] Create nested AGENTS.md if new subsystem
- [ ] Document patterns in appropriate Skill
- [ ] Update PLANS.md if new multi-step process
- [ ] Add section to root AGENTS.md if global impact

### When Removing/Deprecating Code
- [ ] Remove obsolete guidance from AGENTS.md files
- [ ] Mark Skills as deprecated if no longer relevant
- [ ] Update PLANS.md templates that reference old patterns

## Expected Outcomes

When this system is working well:

✅ **Agents enter repository** and immediately understand structure and expectations
✅ **New implementers** can add tools without asking questions
✅ **Debugging is systematic** because agents have reliable troubleshooting guidance
✅ **Code is consistent** because patterns are documented and enforced
✅ **Onboarding is fast** because guidance is hierarchical and clear
✅ **Decisions are clear** because process is in Plans
✅ **Collaboration scales** because Sub-agents know their roles

## Known Limitations

This system works well for:
- Single TypeScript package (not monorepo)
- Feature-based organization (by resource)
- Deterministic, repeatable workflows
- Small to medium teams (1-5 concurrent developers)

This system may need extension for:
- Multi-package monorepo (add `/packages/[name]/AGENTS.md`)
- Complex CI/CD workflows (extend PLANS.md or create `/infra/AGENTS.md`)
- Large teams (add more Sub-agent roles)
- Multiple languages (adapt import/build rules per language)

## Contact & Evolution

This system is living documentation. If you find gaps or contradictions:
1. Document the issue (what rule is missing or wrong?)
2. Update the relevant AGENTS.md file
3. Brief the team on the change
4. Update this ARCHITECTURE.md if system structure changed

Questions:
- **"What should I do?"** → Consult the appropriate AGENTS.md file
- **"How do I add a tool?"** → Use SKILLS/add-tool or PLANS.md
- **"Can I work in parallel?"** → See SUBAGENTS.md
- **"Is this the right approach?"** → Check nested AGENTS.md for your scope

---

**Last updated**: Generated as part of agent instruction architecture design
**Version**: 1.0 (initial system)
**Maintainers**: All agents (distributed responsibility)
