# /src Directory - Agent Instructions

## Scope

This directory contains all TypeScript source code for the Visit Create MCP server. Agents working here should understand the relationship between the entry point, tool registration, API communication, and type definitions.

## Directory Structure

```
src/
├── index.ts                      # MCP server init & tool registration
├── constants.ts                  # Configuration constants
├── types.ts                      # Shared type definitions
├── services/
│   └── api-client.ts             # HTTP client for Visit Create API
├── tools/                        # 18 tool implementation files
│   ├── (18 resource files)
│   └── AGENTS.md                 # Tool-specific guidance
├── schemas/                      # (May contain Zod schemas)
│   └── AGENTS.md                 # Schema patterns (if used)
└── AGENTS.md                     # This file
```

## Key Files & Responsibilities

### src/index.ts
- **Responsibility**: Instantiate MCP server, register all tool groups, set up stdio transport
- **Pattern**: Import `register*Tools` from each tool file, call each with server instance
- **When modifying**: 
  - Adding a new tool file? Add import + registration call here
  - Changing server metadata? Edit the McpServer constructor config
  - Never edit tool implementation from this file
- **Constraints**: Keep this file short—it's only orchestration

### src/constants.ts
- **Responsibility**: Store configuration that doesn't change per request
- **Contents**: API_BASE_URL, REQUEST_TIMEOUT, version info
- **When modifying**:
  - Changing timeout or base URL? Edit constants.ts
  - Adding a new config constant? Go here first
- **Constraint**: No environment-specific logic; values are stable

### src/types.ts
- **Responsibility**: Shared TypeScript interfaces and types used across modules
- **When modifying**:
  - Adding a type that multiple tools use? Define it here
  - Changing a type used in 3+ places? Edit here, update all usages
- **Constraint**: Keep types minimal; prefer Zod schemas for validation

### src/services/api-client.ts
- **Responsibility**: All HTTP communication with Visit Create API
- **Key exports**: `makeApiRequest()`, `handleApiError()`
- **When modifying**: Very carefully—all tools depend on this
- **See also**: `/src/services/AGENTS.md` for detailed API client guidance

## Import Patterns (ESM)

All imports must use the `.js` extension for relative imports (required by Node16 module resolution):

```typescript
// ✅ Correct
import { registerVisitorTools } from "./tools/visitors.js";
import { makeApiRequest } from "./services/api-client.js";

// ❌ Wrong
import { registerVisitorTools } from "./tools/visitors";
import { makeApiRequest } from "./services/api-client";
```

## Adding a New Tool File

1. Create `tools/[resource].ts` in this directory
2. Export `register[Resource]Tools(server: McpServer)` function
3. In `index.ts`, add:
   - Import statement (with `.js` extension)
   - Call to `register[Resource]Tools(server)` in main()
4. See `PLANS.md` "Adding a New Tool" for detailed walkthrough

## Modifying Existing Tools

1. Open the appropriate tool file under `/tools/`
2. Follow patterns in `/src/tools/AGENTS.md`
3. Rebuild: `npm run build`
4. Verify tool is still registered in `index.ts`

## Shared Dependencies & Imports

- **MCP SDK**: `@modelcontextprotocol/sdk/...`
- **HTTP Client**: `axios` (via `api-client.ts`)
- **Validation**: `zod` (in tool files)
- **Never import**: External non-listed dependencies without updating package.json

## Type Safety Standards

All source files must:
- **Compile with no errors**: `npm run build` must succeed
- **Pass strict TypeScript**: All strict flags enabled in tsconfig.json
- **Use explicit types**: No `any`, no implicit `unknown`
- **Handle optional fields**: Mark optional with `?`, never assume presence

## Testing Modules in /src

Currently, no test files live in `/src/`. If adding tests:
- Use a dedicated `test/` directory at repo root (not in src)
- Keep test files separate from source
- Mock the API client for unit tests

## Conventions in This Directory

### Naming
- **Type names**: PascalCase (e.g., `VisitorResponse`, `ApiError`)
- **Function names**: camelCase (e.g., `makeApiRequest`, `handleApiError`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `REQUEST_TIMEOUT`)
- **Tool names**: `visit_[resource]_[operation]` (e.g., `visit_list_visitors`)

### File Organization
- One major responsibility per file
- One resource per tool file (e.g., all visitor tools in `visitors.ts`)
- All tool files grouped in `/tools/` directory
- All service files grouped in `/services/` directory

### Exports
- **Named exports only**: No default exports (except maybe index.ts if needed)
- **Clean API**: Export only what's needed by other modules
- **Document exports**: Add JSDoc comments to public functions

## What Agents Should Avoid in /src

- ❌ Modifying `index.ts` to add business logic (it's orchestration only)
- ❌ Importing from `dist/` (always import from `src/`)
- ❌ Hardcoding API endpoints in tool files (use `makeApiRequest`)
- ❌ Duplicating error handling logic (centralize in `api-client.ts`)
- ❌ Adding production configuration to source (use environment variables)
- ❌ Modifying TypeScript strict mode settings without consensus

## Debugging & Development

### Local Development
- Use `npm run dev` to run with tsx watch mode
- Changes to `.ts` files auto-recompile
- Restart the server manually if needed (not hot-reload)

### Type Checking Without Building
```bash
npx tsc --noEmit
```

### Checking What's Exported
```bash
npm run build && ls -la dist/
```

## Module Resolution Behavior

- **tsconfig.json**: `moduleResolution: "Node16"` requires `.js` extensions in relative imports
- **Compiled output**: `dist/` mirrors `src/` structure
- **Source maps**: `.js.map` files help debugging (tsconfig enables them)

---

**Next**: See `/src/tools/AGENTS.md` for tool implementation patterns.
