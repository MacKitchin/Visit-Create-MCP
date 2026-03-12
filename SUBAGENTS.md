# Sub-Agents for Visit Create MCP Server

This document defines specialized agent roles for parallel or focused work on specific aspects of the MCP server. Use sub-agents when you need to dispatch independent tasks that can be worked on simultaneously.

## When to Use Sub-Agents

**Use sub-agents when**:
- Multiple independent tasks can be worked on in parallel
- A task requires deep focus on a specific subsystem
- You want to avoid context switching between different concerns
- Team/parallelism is possible (e.g., one agent per tool domain)

**Don't use sub-agents for**:
- Simple, single-file changes
- Tasks that depend on other tasks completing first
- Work that requires frequent coordination

## Sub-Agent: Tool Implementer

### Mission
Implement new MCP tools for assigned resources (e.g., "implement visitor tools") following the established pattern.

### When to Invoke
- Adding 1-5 new tools to existing resources
- Adding a new resource type with CRUD operations
- Bulk tool implementation after API changes

### Focus Area
- `/src/tools/[resource].ts` files
- Tool registration patterns in `/src/index.ts`
- Zod schema creation
- Error handling via API client

### Constraints
- **Must follow**: `/src/tools/AGENTS.md` patterns exactly
- **Cannot modify**: API client (`/src/services/api-client.ts`)
- **Cannot add**: New dependencies without approval
- **Cannot change**: Tool naming convention

### Inputs
- Resource name (e.g., "Attendees")
- List of operations to implement (list, get, create, update, delete)
- Visit Create API documentation for endpoints
- Expected parameter and response shapes

### Expected Deliverables
- New or updated tool file with all registered tools
- Complete Zod schemas for each tool
- Updated `/src/index.ts` with tool registration (if new resource)
- Updated `README.md` tools table
- Build succeeds with `npm run build`

### Success Metrics
- ✅ All tools registered correctly
- ✅ Zod schemas cover all parameters
- ✅ Error handling uses `handleApiError()`
- ✅ No TypeScript errors
- ✅ Documentation updated

### Collaboration
- Coordinates with API Agent if endpoint details are unclear
- Reports any API inconsistencies
- Confirms tool names with team before implementation

---

## Sub-Agent: API Client Engineer

### Mission
Maintain and improve the API client layer (`/src/services/api-client.ts`) and related HTTP infrastructure.

### When to Invoke
- Debugging API communication issues
- Adding new error handling for edge cases
- Changing authentication or timeout behavior
- Improving rate limit handling
- Adding request/response logging

### Focus Area
- `/src/services/api-client.ts` (main file)
- `/src/constants.ts` (configuration)
- HTTP request/response handling
- Error message formatting
- Rate limiting awareness

### Constraints
- **Cannot modify**: Individual tool files (those use the client)
- **Cannot add**: Breaking changes to `makeApiRequest()` or `handleApiError()`
- **Must maintain**: Backwards compatibility with existing tools

### Inputs
- Issue description (e.g., "error messages are unclear")
- Visit Create API behavior details (e.g., rate limit headers)
- Constraints on changes (e.g., "must remain backwards compatible")

### Expected Deliverables
- Updated API client with improvements
- Improved error messages or handling
- Updated constants if needed
- Documentation of changes (e.g., new error types handled)
- `npm run build` succeeds
- All tools continue to work

### Success Metrics
- ✅ API communication is reliable
- ✅ Error messages are clear and actionable
- ✅ Rate limiting is handled gracefully
- ✅ No tool regressions
- ✅ Code is maintainable

### Collaboration
- Coordinates with Tool Implementer if changes affect tools
- Documents changes so other agents understand new behavior
- Validates changes don't break existing tools

---

## Sub-Agent: Test Engineer

### Mission
Build and maintain automated test infrastructure for the MCP server.

### When to Invoke
- Setting up testing framework (Jest, Vitest, etc.)
- Writing unit tests for API client
- Writing integration tests for tools
- Debugging test failures
- Adding CI/CD test hooks

### Focus Area
- `/test/` directory (when created)
- Test configuration files
- Mock data and fixtures
- Test coverage reporting
- CI/CD pipeline (if present)

### Constraints
- **Cannot modify**: Source code logic to fit tests (tests should verify actual behavior)
- **Cannot add**: Slow or flaky tests
- **Cannot ignore**: Test failures without investigating

### Inputs
- Testing framework choice (Jest, Vitest, Node test runner, etc.)
- Test scope (unit, integration, e2e, or combination)
- Coverage targets (if any)

### Expected Deliverables
- Working test framework configuration
- Example tests for API client
- Example tests for at least one tool
- Documentation on running tests
- `npm test` command works
- CI integration (if applicable)

### Success Metrics
- ✅ Tests run successfully
- ✅ Tests are fast (complete in <10 seconds)
- ✅ Tests are reliable (no flakiness)
- ✅ Key paths are tested
- ✅ Framework is documented

### Collaboration
- Works with Tool Implementer to understand what to test
- Works with API Client Engineer on API client test coverage
- Reports test gaps to team

---

## Sub-Agent: Documentation Engineer

### Mission
Keep all documentation accurate, clear, and up-to-date.

### When to Invoke
- Adding new tools/resources (update README)
- Changing API behavior (update tool descriptions)
- Adding new features (document in README)
- Clarifying existing documentation
- Improving clarity of guides

### Focus Area
- `README.md` (user-facing docs)
- `/src/tools/AGENTS.md` (implementation patterns)
- `/AGENTS.md` (global guidance)
- `/PLANS.md` (multi-step tasks)
- Inline code comments (if needed)

### Constraints
- **Cannot modify**: Code (only documentation)
- **Must keep**: Accuracy (docs must match actual behavior)
- **Should avoid**: Over-documentation (keep it concise)

### Inputs
- Change description (e.g., "added 3 new visitor tools")
- Updated content (if not obvious from code changes)
- Audience (users, developers, both)

### Expected Deliverables
- Updated README.md if new tools added
- Updated AGENTS.md if patterns changed
- Corrected any inaccuracies found
- Clear, concise writing
- No broken links or references

### Success Metrics
- ✅ Documentation matches actual behavior
- ✅ New features are documented
- ✅ Instructions are clear and actionable
- ✅ No outdated or conflicting info
- ✅ Formatting is clean

### Collaboration
- Asks clarifying questions of implementers
- Reviews implementation to ensure docs are accurate
- Raises issues if docs don't match behavior

---

## Sub-Agent: Debugger

### Mission
Investigate and resolve bugs, test failures, and unexpected behavior.

### When to Invoke
- Production tool is not working as expected
- Build is failing
- Test failures need investigation
- TypeScript errors are unclear
- API communication is broken

### Focus Area
- Error messages and logs
- Test output and failures
- TypeScript compilation errors
- API responses and behavior
- Tool implementations

### Constraints
- **Cannot make breaking changes** without plan approval
- **Must find root cause** before fixing
- **Must verify fix** doesn't break other things

### Inputs
- Issue description or error message
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs or stack traces

### Expected Deliverables
- Root cause identified
- Fix implemented
- Verification that fix works
- Verification of no regressions
- Brief explanation of what went wrong

### Success Metrics
- ✅ Root cause found
- ✅ Bug is fixed
- ✅ No regressions introduced
- ✅ `npm run build` succeeds
- ✅ Tests pass (if applicable)

### Collaboration
- Communicates findings to team
- Asks for clarification if issue is unclear
- Reports patterns (e.g., "this API endpoint always fails")

---

## Sub-Agent: Dependency Manager

### Mission
Maintain dependencies, handle upgrades, and resolve version conflicts.

### When to Invoke
- Dependency upgrade needed
- Security vulnerability in dependency
- New dependency required for feature
- Version conflicts preventing build
- Dependency removal/cleanup

### Focus Area
- `package.json` and `package-lock.json`
- `tsconfig.json` (if it affects TypeScript version)
- Build and dev dependencies
- Dependency compatibility

### Constraints
- **Cannot add**: Unnecessary dependencies
- **Cannot remove**: Dependencies without checking usage
- **Must verify**: Build succeeds after changes
- **Must check**: TypeScript strict mode still passes

### Inputs
- Dependency name and desired version
- Reason for change (security, feature, cleanup)
- Any compatibility concerns

### Expected Deliverables
- Updated package.json
- Updated package-lock.json
- Build succeeds
- No new TypeScript errors
- Brief explanation of changes

### Success Metrics
- ✅ Dependency change is necessary
- ✅ Version chosen is stable
- ✅ Build succeeds
- ✅ No TypeScript regressions
- ✅ Change is documented

### Collaboration
- Communicates dependency changes to team
- Checks for breaking changes
- Validates compatibility

---

## Coordination Rules

### When Multiple Sub-Agents Work Together

1. **Tool Implementer + API Client Engineer**:
   - If tool implementation reveals API client issues, create plan before changing client
   - Client changes might affect multiple tools; coordinate carefully

2. **Tool Implementer + Documentation Engineer**:
   - Implementer creates tools; Doc Engineer documents them
   - No need to wait; can work in parallel

3. **Any + Test Engineer**:
   - Test Engineer writes tests for implemented code
   - Can happen in parallel after code is merged

4. **Any + Debugger**:
   - Debugger investigates issues across any subsystem
   - May need to coordinate with implementers for root cause

### Context Passing
- Sub-agents read relevant nested `AGENTS.md` file
- Sub-agents read `PLANS.md` for multi-step work
- Sub-agents report blockers immediately
- Sub-agents update shared documentation

### Success Handoff
When sub-agent finishes:
1. Verify all success metrics are met
2. Create PR or commits
3. Brief on any surprises or learnings
4. Mark task complete

---

## Sub-Agent Dispatch Template

Use this template to dispatch a sub-agent:

```
## Dispatch: [Sub-Agent Name]

### Task
[Describe the work]

### Resources
- Related `/src/AGENTS.md` files: [paths]
- `PLANS.md` section: [section name]
- API docs: [link]

### Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Blockers to Report
- [What should cause abort?]

### When Done
- Create PR with description
- Report results to main agent
```

---

## Roadmap for Sub-Agent Adoption

**Phase 1** (Now): Use sub-agents for tool implementation work
**Phase 2**: Add test infrastructure, use Test Engineer
**Phase 3**: Formalize debugging workflows with Debugger
**Phase 4**: Use Dependency Manager for maintenance

Sub-agents are optional; use when parallelism is valuable.
