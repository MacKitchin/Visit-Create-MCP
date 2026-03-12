# Agent Instruction System Summary

## Complete System Generated

A **recursive agent instruction architecture** has been created for the Visit Create MCP Server. This document provides a high-level overview of all files and their purposes.

## Files Created

### Root-Level Guidance (4 files)

1. **`AGENTS.md`** (258 lines)
   - Global rules for all development
   - Repository map and architecture overview
   - Coding standards (TypeScript strict mode, ESM imports, naming conventions)
   - Testing expectations and code review checklist
   - Security & safety constraints
   - Instructions for using PLANS.md and Skills
   - Global git workflow

2. **`PLANS.md`** (469 lines)
   - Multi-phase implementation plan templates
   - Plans for common tasks:
     - Adding a new tool to existing resource
     - Adding a completely new resource type
     - Refactoring API client error handling
     - Fixing multi-file bugs
     - Adding test infrastructure
     - Updating to new API version
   - Each plan includes: goal, scope, assumptions, phases, risks, success criteria
   - General principles for planning and validation

3. **`SUBAGENTS.md`** (393 lines)
   - Specialized sub-agent role definitions:
     - Tool Implementer (add tools, follow patterns)
     - API Client Engineer (maintain HTTP layer)
     - Test Engineer (testing infrastructure)
     - Documentation Engineer (keep docs accurate)
     - Debugger (investigate and fix issues)
     - Dependency Manager (maintain package.json)
   - When to invoke each sub-agent
   - Inputs, deliverables, and success metrics
   - Collaboration rules between sub-agents

4. **`ARCHITECTURE.md`** (270 lines)
   - System overview and file placement map
   - Instruction precedence and hierarchy
   - How agents navigate the system
   - File update rules and maintenance checklist
   - Contradiction avoidance guidelines
   - Expected outcomes and known limitations

### Source Directory Guidance (3 files)

5. **`/src/AGENTS.md`** (162 lines)
   - Source code organization and structure
   - Key files and their responsibilities
   - ESM import patterns (with `.js` extensions)
   - How to add new tool files
   - Modifying existing tools
   - Shared dependencies and imports
   - Type safety standards
   - Naming conventions (TypeScript, functions, constants, tools)
   - What agents should avoid in /src

6. **`/src/tools/AGENTS.md`** (361 lines)
   - Tool registration pattern (required structure)
   - Anatomy of a tool (name, title, description, schema, annotations)
   - Zod validation guidelines (strings, numbers, optionals)
   - Error handling (centralized via handleApiError)
   - Query parameter vs request body patterns
   - Tool organization by resource (read-only vs CRUD)
   - Common patterns (filtering, pagination, creation, update, delete)
   - File naming conventions
   - Documentation expectations
   - What agents should avoid in /tools

7. **`/src/services/AGENTS.md`** (302 lines)
   - API client responsibility and exports
   - `makeApiRequest<T>()` function signature and usage
   - `handleApiError()` error conversion
   - Axios client configuration
   - Error handling scenarios (429, 401, 403, 4xx, 5xx, network)
   - When to modify vs when not to modify
   - Anatomy of the client (getApiKey, getClient, makeApiRequest, handleApiError)
   - Usage constraints (rate limiting, auth, timeouts)
   - Common usage patterns from tools
   - Debugging tips

### Skills (3 reusable procedures)

8. **`/SKILLS/add-tool/SKILL.md`** (181 lines)
   - Purpose: Quickly add a single new MCP tool
   - Step-by-step procedure (9 steps):
     1. Verify tool doesn't exist
     2. Locate resource file
     3. Write tool registration
     4. Write Zod schema
     5. Handle request method (GET/POST/PUT/DELETE)
     6. Set annotations correctly
     7. Build & verify
     8. Update README
     9. Final check
   - Validation checklist
   - Failure handling
   - Expected output and time estimate (5-15 min)

9. **`/SKILLS/debug-build/SKILL.md`** (178 lines)
   - Purpose: Diagnose and fix TypeScript/build errors
   - Systematic error categorization:
     - Type mismatch
     - Module not found (ESM imports)
     - Syntax errors
     - Complex/unknown errors
   - Step-by-step fixes for each error type
   - Common issues & solutions
   - Tips for effective debugging
   - Time estimate (2-10 min)

10. **`/SKILLS/test-locally/SKILL.md`** (227 lines)
    - Purpose: Run and test server locally
    - Prerequisites (API key setup)
    - Step-by-step (10 steps):
      1. Set API key
      2. Build server
      3. Start in dev mode
      4. Connect MCP client (Claude Desktop or Cursor)
      5. Test simple tool
      6. Test new tool
      7. Test error paths
      8. Check logs
      9. Modify code (auto-rebuild in watch mode)
      10. Stop server
    - Common issues & fixes
    - Manual testing checklist
    - Example test session
    - Time estimate (5-20 min)

## System Architecture

### Hierarchy

```
┌─ Global Rules (AGENTS.md)
│  └─ Source Organization (/src/AGENTS.md)
│     ├─ Tool Patterns (/src/tools/AGENTS.md)
│     ├─ Service Patterns (/src/services/AGENTS.md)
│     └─ Schema Patterns (/src/schemas/AGENTS.md) [prepared]
│
├─ Multi-Step Work (PLANS.md)
├─ Parallel Work (SUBAGENTS.md)
├─ Skills (SKILLS/*/SKILL.md)
└─ System Documentation (ARCHITECTURE.md)
```

### Key Principles

1. **Hierarchical**: Root rules → Nested rules → Skills → Plans
2. **Recursive**: Each nested file refines guidance for its scope
3. **Non-contradictory**: Nested rules clarify root rules, never contradict
4. **Operational**: Every file is actionable, not theoretical
5. **Discoverable**: Agents know what to read when entering a directory

## How Agents Use the System

### Entry Point
1. Read `/AGENTS.md` (global overview)
2. Identify task type
3. Navigate to relevant nested file
4. Reference Skills for detailed procedures
5. Use Plans for multi-step work

### Tool Implementation Example
Agent tasks: "Add a new visitor tool"
1. Consult `/AGENTS.md` (understand global rules)
2. Consult `/src/tools/AGENTS.md` (tool patterns)
3. Use `SKILLS/add-tool/SKILL.md` (checklist)
4. Reference `PLANS.md` "Adding a New Tool" section if needed
5. Build, test, create PR

### Debugging Example
Agent tasks: "Build is failing with TypeScript error"
1. Consult `/AGENTS.md` (understand code review process)
2. Use `SKILLS/debug-build/SKILL.md` (systematic debugging)
3. Fix error and rebuild
4. Verify no regressions

### Parallel Work Example
Agent tasks: "Add 3 new resources in parallel"
1. Consult `/SUBAGENTS.md` (sub-agent definitions)
2. Dispatch 3 Tool Implementer sub-agents (one per resource)
3. Each follows `SKILLS/add-tool/SKILL.md`
4. Coordinate via shared patterns
5. Merge when complete

## Coverage Matrix

| Aspect | Coverage | File |
|--------|----------|------|
| **Repository structure** | Root + all files | AGENTS.md |
| **Build & compilation** | Root + debug skill | AGENTS.md, debug-build SKILL |
| **Tool implementation** | /src/tools + skill | /src/tools/AGENTS.md, add-tool SKILL |
| **API communication** | /src/services | /src/services/AGENTS.md |
| **Error handling** | /src/tools + /src/services | Both AGENTS.md files |
| **Testing** | Root + PLANS.md | AGENTS.md, PLANS.md |
| **Multi-step work** | PLANS.md | PLANS.md (6 templates) |
| **Parallel work** | SUBAGENTS.md | SUBAGENTS.md (6 roles) |
| **Repetitive procedures** | SKILLS/ | 3 skills provided |
| **System maintenance** | ARCHITECTURE.md | ARCHITECTURE.md |

## System Properties

### Completeness
- ✅ Every major subsystem has guidance
- ✅ Common workflows have procedure (Skills)
- ✅ Multi-step work has template (Plans)
- ✅ Parallel work has role definitions (Sub-agents)

### Conciseness
- Root AGENTS.md: 258 lines (readable in 15 min)
- Nested AGENTS.md files: 160-361 lines each (readable in 10-20 min)
- Skills: 180-230 lines each (used while working, not read cover-to-cover)

### Operationality
- ✅ Every instruction is actionable
- ✅ All procedures have step-by-step format
- ✅ Success criteria are objective
- ✅ No hypothetical or "should" language

### Clarity
- ✅ File purposes are explicit
- ✅ Scope boundaries are clear
- ✅ Precedence rules are defined
- ✅ Example workflows are documented

## Quick Reference

### When you need...

| Need | File to Read |
|------|--------------|
| Global project overview | AGENTS.md |
| How to organize /src code | /src/AGENTS.md |
| Tool implementation patterns | /src/tools/AGENTS.md |
| API client patterns | /src/services/AGENTS.md |
| Checklist to add a tool | SKILLS/add-tool/SKILL.md |
| Help with build errors | SKILLS/debug-build/SKILL.md |
| How to test locally | SKILLS/test-locally/SKILL.md |
| Template for big task | PLANS.md |
| Sub-agent definitions | SUBAGENTS.md |
| System architecture docs | ARCHITECTURE.md |
| Maintenance rules | ARCHITECTURE.md |

## Files Not Included

This system does NOT include:

- ❌ Git workflow details (beyond root guidelines)
- ❌ Deployment procedures
- ❌ PR template or issue templates
- ❌ CI/CD configuration guidance
- ❌ Performance optimization strategies
- ❌ API contract evolution guidelines

These can be added as:
- `/infra/AGENTS.md` for deployment/CI/CD
- `/docs/AGENTS.md` for documentation standards
- `DEPLOYMENT.md` for release procedures
- `.github/PULL_REQUEST_TEMPLATE.md` for PR process

## Maintenance & Evolution

### Quarterly Updates
- [ ] Review all AGENTS.md files for accuracy
- [ ] Check for new patterns not documented
- [ ] Retire obsolete Skills
- [ ] Update PLANS.md templates if workflow changed

### Immediate Updates (when code patterns change)
- Update relevant nested AGENTS.md
- Create/update Skill if procedure is new
- Brief team on changed guidance
- Update ARCHITECTURE.md if system structure changed

### Long-Term
- Add new nested AGENTS.md as subsystems grow
- Create new Skills as procedures stabilize
- Retire AGENTS.md files when subsystems are removed
- Keep root AGENTS.md as stable, long-term reference

## Validation

This system was designed to pass these tests:

✅ **Discoverability**: Agent entering `/src/tools/` knows to read `/src/tools/AGENTS.md`
✅ **Completeness**: All major workflows have documented patterns
✅ **Clarity**: Instructions are unambiguous and testable
✅ **Consistency**: No contradictions between levels
✅ **Scalability**: Adding new subsystems doesn't require rewriting existing files
✅ **Operationality**: Every instruction is actionable, not theoretical
✅ **Conciseness**: No repetition across files; patterns are DRY

## Getting Started (For New Agents)

1. **First-time entry** (5 min)
   - Read `/AGENTS.md`
   - Understand repository map and global rules

2. **Specific task** (5-10 min)
   - Find relevant nested `AGENTS.md`
   - Understand patterns for your task

3. **Implementation** (varies)
   - Use appropriate Skill for detailed steps
   - Reference Plan if multi-step
   - Build and validate
   - Create PR

---

**System Version**: 1.0 (complete recursive architecture)
**Generated**: 2026-03-12
**Total Files**: 10 (1 root + 3 nested + 3 skills + 3 system docs)
**Total Lines**: ~2,500 lines of guidance
**Readability**: Complete system reviewable in 1-2 hours
