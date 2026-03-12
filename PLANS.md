# Plans for Visit Create MCP Server

This document guides agents through multi-step implementation tasks. Use a plan for work that spans multiple files or requires careful sequencing.

## When to Create a Plan

Create a plan when:
- **Adding a new tool** (touches src/index.ts, tool file, README.md)
- **Adding a new resource/domain** (new tool file + registration)
- **Refactoring tool architecture** (multiple files affected)
- **Changing API client behavior** (touches all tools, requires validation)
- **Adding infrastructure** (testing, CI/CD, logging)
- **Significant debugging** (multi-step investigation)

Do **not** create a plan for:
- Simple bugfixes in a single file
- Documentation updates
- Dependency version bumps
- One-off configuration changes

## How to Write a Plan

A plan has these sections:

1. **Goal** (1-2 sentences): What we're accomplishing
2. **Scope** (bullet list): Files affected, what's in/out
3. **Assumptions** (bullet list): Prerequisites, knowledge, constraints
4. **Phases** (numbered list): Sequential steps with validation
5. **Risks** (bullet list): What could go wrong, mitigation
6. **Success Criteria** (checklist): How to verify it worked

### Template

```markdown
## Plan: [Task Name]

### Goal
[What we're doing and why]

### Scope
- [File 1]
- [File 2]
- [Won't touch]: [excluded files]

### Assumptions
- [Prerequisite A]
- [Known behavior B]
- [Constraint C]

### Phases

**Phase 1: [Preparation]**
1. [Step A]
2. [Step B]
3. Validate: [How to verify phase 1 worked]

**Phase 2: [Implementation]**
1. [Step C]
2. [Step D]
3. Validate: [How to verify phase 2 worked]

**Phase 3: [Integration]**
1. [Step E]
2. Validate: Build succeeds, types check, tests pass

### Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

### Success Criteria
- [ ] [Criterion A]
- [ ] [Criterion B]
- [ ] [Criterion C]
```

## Common Plans

---

## Plan: Adding a New Tool to Existing Resource

### Goal
Add a single new MCP tool (e.g., `visit_update_visitor_notes`) to an existing resource file (e.g., `visitors.ts`).

### Scope
- **Touch**: `src/tools/visitors.ts` (add tool registration)
- **Touch**: `README.md` (update tools table)
- **Don't touch**: `src/index.ts` (already imports visitors.ts)

### Assumptions
- Visit Create API endpoint exists for this operation
- Tool name follows `visit_[resource]_[operation]` convention
- Zod schema covers all parameters

### Phases

**Phase 1: Implement Tool**
1. Open `src/tools/visitors.ts`
2. Locate the existing `registerVisitorTools()` function
3. Add new `server.registerTool()` call for the new operation
4. Write complete Zod input schema with descriptions
5. Implement try/catch with `makeApiRequest()` and `handleApiError()`
6. Validate: No TypeScript errors (`npm run build`)

**Phase 2: Update Documentation**
1. Open `README.md`
2. Find "Available Tools" section
3. Add new tool to Visitors row (or appropriate resource)
4. Validate: README syntax is correct (test locally if you can)

**Phase 3: Build & Test**
1. Run `npm run build` — must succeed with no errors
2. Verify compiled output exists: `dist/tools/visitors.js`
3. Validate: Tool signature is exported correctly

### Risks
- **Risk**: Tool name conflicts with existing tool
  - **Mitigation**: Search `src/tools/` for tool name before implementing
- **Risk**: Zod schema incomplete
  - **Mitigation**: Review README/API docs for all required parameters
- **Risk**: API response type is wrong
  - **Mitigation**: Consult Visit Create API v2 documentation

### Success Criteria
- [ ] Tool registration code added to `visitors.ts`
- [ ] Zod schema is complete with descriptions
- [ ] Error handling uses `handleApiError()`
- [ ] `npm run build` succeeds with no errors
- [ ] New tool listed in README.md
- [ ] Tool name follows naming convention

---

## Plan: Adding a New Resource Type

### Goal
Add a completely new resource type (e.g., "Attendees") with multiple tools (list, get, create, update, delete).

### Scope
- **Create**: `src/tools/attendees.ts` (new file)
- **Touch**: `src/index.ts` (add import + register call)
- **Touch**: `README.md` (add new resource section)
- **Don't touch**: API client, other tool files

### Assumptions
- Visit Create API has endpoints for all CRUD operations on this resource
- New resource fits MCP server's scope (not out of bounds)
- Resource name is settled (plural, matches API convention)

### Phases

**Phase 1: Plan Resource Coverage**
1. Review Visit Create API docs for the resource
2. Identify all endpoints: LIST, GET, CREATE, UPDATE, DELETE
3. Document required parameters for each operation
4. Write tool names: `visit_list_attendees`, `visit_get_attendee`, etc.
5. Validate: All operations are documentable with constraints

**Phase 2: Create Tool File**
1. Create `src/tools/attendees.ts`
2. Copy structure from existing tool file (e.g., `visitors.ts`)
3. Implement `registerAttendeeTools(server: McpServer)` function
4. Register all 5 tools (list, get, create, update, delete)
5. Write complete Zod schemas for each
6. Validate: No TypeScript errors (`npm run build`)

**Phase 3: Register in Index**
1. Open `src/index.ts`
2. Add import: `import { registerAttendeeTools } from "./tools/attendees.js";`
3. Add registration call in `main()`: `registerAttendeeTools(server);`
4. Validate: Import path is correct, no syntax errors

**Phase 4: Update Documentation**
1. Open `README.md`
2. Add new row to "Available Tools" table:
   ```markdown
   | Attendees | `visit_list_attendees`, `visit_get_attendee`, `visit_create_attendee`, `visit_update_attendee`, `visit_delete_attendee` |
   ```
3. Validate: Table formatting is correct

**Phase 5: Build & Verify**
1. Run `npm run build` — must succeed
2. Verify `dist/tools/attendees.js` exists
3. Verify `dist/index.js` imports the new tools
4. Validate: All types are correct, no warnings

### Risks
- **Risk**: API doesn't support all CRUD operations
  - **Mitigation**: Check API docs carefully, skip unsupported operations
- **Risk**: Resource naming conflicts
  - **Mitigation**: Search codebase for existing resource names
- **Risk**: Build fails after adding new file
  - **Mitigation**: Check import paths use `.js` extension

### Success Criteria
- [ ] New tool file created with all CRUD operations
- [ ] Tool names follow convention
- [ ] All tools registered in `index.ts`
- [ ] README updated with new resource
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors or warnings

---

## Plan: Refactoring API Client Error Handling

### Goal
Improve error messages returned by `handleApiError()` to include more context or support new error types.

### Scope
- **Touch**: `src/services/api-client.ts` (error handling function)
- **Touch**: `src/constants.ts` (if adding new constants)
- **Don't touch**: Tool files (they use the updated client automatically)
- **Don't touch**: Dependencies

### Assumptions
- New error handling doesn't change function signature
- Error messages remain actionable and user-friendly
- No breaking changes to tool behavior

### Phases

**Phase 1: Analyze Current Behavior**
1. Review existing `handleApiError()` implementation
2. Identify gaps or unclear messages
3. Document improvements needed
4. Validate: Agreement on changes

**Phase 2: Update Error Handler**
1. Modify `handleApiError()` to add new cases
2. Add new error status codes if needed
3. Include helpful recovery steps in each message
4. Keep messages concise (1-2 sentences)
5. Validate: No TypeScript errors

**Phase 3: Test Error Paths**
1. Build: `npm run build`
2. For each error type (401, 429, 500, etc.), verify message is helpful
3. Validate: Error messages are clear and actionable

**Phase 4: Update Documentation** (if public-facing)
1. If error messages change significantly, update README section on errors
2. Validate: Docs match new behavior

### Risks
- **Risk**: Breaking change to error message format
  - **Mitigation**: Keep structure consistent, only improve text
- **Risk**: Error handling becomes too verbose
  - **Mitigation**: Keep messages under 2 sentences

### Success Criteria
- [ ] New error cases handled in `handleApiError()`
- [ ] Error messages are clear and actionable
- [ ] `npm run build` succeeds
- [ ] No changes to function signature
- [ ] All tools still work correctly

---

## Plan: Fixing a Subtle Bug (Multi-File)

### Goal
Fix a bug that affects multiple tools or requires coordination (e.g., parameter not passed correctly to API).

### Scope
- **Identify**: Which tool files are affected
- **Root cause**: API client, tool registration, or validation issue
- **Fix**: Make minimal change to address root cause

### Assumptions
- Bug is reproducible
- Root cause is identified (don't start fixing without knowing why)
- Fix won't break other tools

### Phases

**Phase 1: Reproduce & Document**
1. Identify which tool(s) exhibit the bug
2. Document the error and expected behavior
3. Hypothesize root cause
4. Validate: Bug is reproducible

**Phase 2: Root Cause Analysis**
1. Trace execution flow for affected tool
2. Check Zod schema validation
3. Check API request formatting
4. Check error handling
5. Validate: Root cause identified

**Phase 3: Implement Fix**
1. Make minimal change to fix root cause
2. Don't over-engineer; only fix what's broken
3. Validate: TypeScript has no errors

**Phase 4: Verify Impact**
1. Build: `npm run build`
2. Check that affected tools still work
3. Check that unaffected tools are unchanged
4. Validate: Bug is fixed, no regressions

### Risks
- **Risk**: Fix affects multiple tools unintentionally
  - **Mitigation**: Understand full scope before implementing
- **Risk**: Incomplete fix addresses symptom, not root cause
  - **Mitigation**: Take time in phase 1 to understand the bug

### Success Criteria
- [ ] Root cause identified
- [ ] Minimal fix implemented
- [ ] Bug is resolved
- [ ] No regressions in other tools
- [ ] Build succeeds

---

## Plan: Adding Test Infrastructure

### Goal
Add automated testing framework (unit tests, integration tests, or both).

### Scope
- **Create**: `test/` directory (or add to existing)
- **Create**: Test configuration files (jest.config.js, etc.)
- **Touch**: `package.json` (add test script)
- **Don't touch**: Source code (yet)

### Assumptions
- Testing framework chosen (Jest, Vitest, Node test runner, etc.)
- Test strategy is defined (unit, integration, e2e)
- CI/CD system will run tests (or manual verification process)

### Phases

**Phase 1: Choose Framework & Configure**
1. Review available frameworks (Jest, Vitest, Node test runner)
2. Choose one based on project needs
3. Install dependencies: `npm install --save-dev [framework]`
4. Create config file (e.g., `jest.config.js`)
5. Add test script to `package.json`: `"test": "jest"`
6. Validate: `npm test` runs without errors (0 tests found is OK)

**Phase 2: Write Example Test**
1. Create `test/api-client.test.ts` with 1-2 example tests
2. Mock Axios responses
3. Test `makeApiRequest` success case
4. Test `handleApiError` error cases
5. Validate: Tests pass when run

**Phase 3: Document Test Strategy**
1. Update `README.md` with testing section
2. Document how to run tests
3. Document where tests live
4. Validate: Instructions are clear

**Phase 4: Integrate into Build**
1. Add test step to build process (if CI exists)
2. Document that tests should pass before merge
3. Validate: Testing is part of workflow

### Risks
- **Risk**: Framework adds too much overhead
  - **Mitigation**: Choose lightweight option, start small
- **Risk**: Mocking API calls is complex
  - **Mitigation**: Use mocking library (jest.mock, etc.)

### Success Criteria
- [ ] Testing framework installed and configured
- [ ] Example test written and passing
- [ ] `npm test` command works
- [ ] Documentation updated
- [ ] Process for running tests is clear

---

## Plan: Updating to New API Version

### Goal
Update MCP server to use a new version of Visit Create API (e.g., v3), with breaking changes.

### Scope
- **Touch**: All tool files (may change endpoints or parameters)
- **Touch**: API client (may change auth or base URL)
- **Touch**: `constants.ts` (API_BASE_URL, version info)
- **Touch**: `README.md` (document which API version is supported)

### Assumptions
- New API version is documented
- Breaking changes are identified and documented
- Backwards compatibility is not required

### Phases

**Phase 1: API Migration Analysis**
1. Review new API documentation
2. Document breaking changes by resource
3. Map old endpoints to new endpoints
4. Validate: All endpoints have a v3 equivalent

**Phase 2: Update Constants & Client**
1. Update `API_BASE_URL` in `constants.ts`
2. If auth changed, update `api-client.ts`
3. If response format changed, update `handleApiError()`
4. Validate: TypeScript compiles

**Phase 3: Update Tool Files**
1. For each tool file, review endpoint changes
2. Update API paths, parameters, response types
3. Update Zod schemas if parameters changed
4. Update tool descriptions if behavior changed
5. Validate: TypeScript compiles for each file

**Phase 4: Build & Test**
1. Build: `npm run build`
2. Verify all imports resolve correctly
3. Validate: No TypeScript errors

**Phase 5: Documentation**
1. Update `README.md` to reflect new API version
2. Document migration notes if helpful
3. Validate: README is accurate

### Risks
- **Risk**: Tool breakage during migration
  - **Mitigation**: Plan this carefully, test each tool
- **Risk**: Missing endpoints in new API
  - **Mitigation**: Check API docs thoroughly, may need to drop some tools
- **Risk**: Response formats changed
  - **Mitigation**: Update response types and error handling

### Success Criteria
- [ ] All tools updated for new API version
- [ ] All endpoints verified in new API
- [ ] `npm run build` succeeds
- [ ] README documents API version
- [ ] No TypeScript errors

---

## General Principles for Plans

### Break Into Phases
- Each phase should be completable in 30-60 minutes
- Phase outputs should be testable/validatable
- Don't lump unrelated work into one phase

### Validate Between Phases
- After each phase, verify the work before moving on
- Don't assume later phases will reveal earlier problems
- Validation prevents cascading failures

### Document Assumptions
- Plans should state what they assume to be true
- If assumptions change, revisit the plan
- Plans help clarify unknowns before coding

### Keep It Lightweight
- Plans are guides, not detailed specs
- 1-2 pages is ideal; 5+ pages is too much
- Focus on sequence, not minutiae

### Update as You Go
- If you learn something changes the plan, update it
- Capture decisions and learnings
- Help future readers understand what happened

---

**Start by choosing the appropriate plan above, or write a custom plan for your task.**
