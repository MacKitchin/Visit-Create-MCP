# Visit Create MCP Server - Agent Instructions

## Project Overview

**Visit Create MCP Server** is a TypeScript-based Model Context Protocol (MCP) server that integrates with the Visit Create API v2. It provides 50+ tools organized by feature domain (visitors, partners, activities, etc.) enabling LLMs to manage events, registrations, and related workflows.

- **Type**: MCP Server
- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 18+
- **Package Manager**: npm
- **Build**: `npm run build` → TypeScript → ES2022
- **Dev**: `npm run dev` (tsx watch)
- **Main Entry**: `src/index.ts`
- **Compiled Output**: `dist/` (ES modules, source maps, declarations)

## Repository Map

```
Visit-Create-MCP/
├── src/                          # TypeScript source
│   ├── index.ts                  # MCP server entry point
│   ├── constants.ts              # Configuration & constants
│   ├── types.ts                  # Shared TypeScript types
│   ├── services/
│   │   └── api-client.ts         # Visit Create API HTTP client
│   ├── tools/                    # Feature-based tool implementations
│   │   ├── expos.ts
│   │   ├── visitors.ts
│   │   ├── partners.ts
│   │   ├── activities.ts
│   │   ├── contents.ts
│   │   ├── connections.ts
│   │   ├── actions.ts
│   │   ├── participants.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   ├── labels.ts
│   │   ├── licenses.ts
│   │   ├── webhooks.ts
│   │   ├── registration-types.ts
│   │   ├── send-email.ts
│   │   ├── touchpoints.ts
│   │   ├── upload.ts
│   │   └── list-all.ts           # Bulk pagination tool
│   └── schemas/                  # Zod schema definitions (if present)
├── dist/                         # Compiled JavaScript (generated)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # User-facing documentation
└── AGENTS.md                     # This file (agent guidance)
```

## Global Architecture Patterns

### Tool Registration Pattern
Each tool file exports a `register*Tools(server: McpServer)` function that:
1. Calls `server.registerTool()` for each endpoint operation
2. Defines Zod input schema for validation
3. Calls `makeApiRequest()` from the API client
4. Returns MCP ToolResult with JSON content or error

Example structure:
```typescript
export function registerVisitorTools(server: McpServer): void {
  server.registerTool("visit_tool_name", { ...schema }, async (params) => {
    // Zod validates params automatically
    const data = await makeApiRequest(...);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  });
}
```

### API Client Pattern
- Single `api-client.ts` handles all HTTP communication
- Uses Axios with basic auth (API key in Authorization header)
- Centralized error handling with `handleApiError()`
- Rate limit aware (max 2 parallel requests)
- All errors return descriptive messages with HTTP status

### Configuration Pattern
- Environment variable `VISIT_API_KEY` required at runtime
- Constants in `src/constants.ts`: API_BASE_URL, REQUEST_TIMEOUT
- No multi-environment config (dev uses same API as prod)

## Global Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript → JavaScript
npm run build

# Run in development mode (watch mode)
npm run dev

# Start compiled server
npm start

# Clean build artifacts
npm clean
```

## Global Coding Rules

### TypeScript Standards
- **Strict mode**: All `tsconfig.json` strict options enabled
- **No any**: Use explicit types throughout
- **No implicit undefined**: Always declare optional with `?`
- **Target**: ES2022 (supports modern syntax, BigInt, etc.)
- **Module**: Node16 (ESM, not CommonJS)
- **Declarations**: Always emit `.d.ts` files

### Code Organization
- **One resource per tool file** (e.g., `visitors.ts` handles all visitor operations)
- **Tool naming convention**: `visit_[resource]_[operation]`
  - Read: `visit_list_visitors`, `visit_get_visitor`
  - Write: `visit_create_visitor`, `visit_update_visitor`, `visit_delete_visitor`
- **Keep tools focused**: Each tool does one API operation
- **No tool orchestration**: Tools are atomic; LLM combines them

### Error Handling
- **Centralized**: All HTTP errors go through `handleApiError()`
- **Descriptive**: Include HTTP status, error message, guidance
- **Graceful degradation**: Return error as ToolResult with `isError: true`
- **No exceptions to caller**: Catch and format in tool handler

### Imports & Dependencies
- **ESM only**: Use `import { x } from "module.js"` (note `.js` extension)
- **No default exports**: Named exports for tools
- **Relative imports**: Use `../` for cross-module imports
- **External deps**: Axios (HTTP), Zod (validation), MCP SDK

## Testing Expectations

This project currently has **no automated tests**. If adding tests:
- Use a framework aligned with Node.js: Jest, Vitest, or Node test runner
- Test API client error handling (rate limits, auth failures, etc.)
- Test tool parameter validation (Zod schemas)
- Mock Visit Create API responses
- Do not test the MCP SDK itself (external dependency)

See `PLANS.md` for guidance if implementing test infrastructure.

## Code Review & Validation Checklist

Before merging any change to `main`:

1. **Build succeeds**: `npm run build` produces no errors
2. **Types are correct**: No TypeScript errors in `tsc` output
3. **Tool registration**: New tools are registered in `src/index.ts`
4. **API client usage**: All HTTP calls use `makeApiRequest()` and `handleApiError()`
5. **Zod validation**: Tool inputs have complete Zod schemas
6. **Error messages**: Errors are actionable and user-friendly
7. **Documentation**: README or comments updated if API surface changes
8. **Rate limiting awareness**: No concurrent tools spawn uncontrolled requests

## Agent Behavior Guidelines

### When Entering the Repository
1. Read `src/index.ts` to understand tool registration pattern
2. Identify which tool files need changes based on the task
3. Consult `/src/tools/AGENTS.md` for tool-specific patterns
4. Check `/src/services/AGENTS.md` for API client usage

### When Adding a New Tool
- Follow `PLANS.md` section "Adding a New Tool"
- Add tool in appropriate resource file (or create new file if new resource)
- Register tool in `src/index.ts`
- Update README.md tools table
- Ensure Zod schema covers all parameters

### When Modifying the API Client
- Edit `/src/services/api-client.ts` only via plan
- Coordinate with tool files that call it
- Preserve error handling guarantees
- Test rate limit behavior

### When Changing Dependencies
- Update package.json explicitly
- Check TypeScript strict mode compatibility
- Run `npm run build` to verify compilation
- Document why dependency was needed

## Nested AGENTS.md Files

This repository has domain-specific guidance in nested `AGENTS.md` files:

- **`/src/AGENTS.md`**: Source code organization, imports, structure
- **`/src/tools/AGENTS.md`**: Tool implementation patterns, validation, errors
- **`/src/services/AGENTS.md`**: API client usage, rate limiting, error handling
- **`/src/schemas/AGENTS.md`**: Zod schema patterns and organization (if schemas split into separate files)

**These nested files refine and override root guidance within their scope.** When working in `/src/tools/`, defer to `/src/tools/AGENTS.md` for tool-specific rules.

## Security & Safety Constraints

### API Key Handling
- **Never hardcode API keys** in source code
- **Always use environment variable** `VISIT_API_KEY`
- **Never log API keys** in error messages
- **Validate at startup** that key is present (done in `api-client.ts`)

### Rate Limiting
- **Visit Create API limit**: 2 concurrent requests max
- **Server respects limits**: Individual tools are serial, not parallelized by MCP server
- **Error handling**: HTTP 429 returns actionable error message, no retry loop

### Input Validation
- **Zod schemas are mandatory**: All tool inputs must validate
- **No direct API calls with user input**: Always validate first
- **Describe constraints**: Zod descriptions hint at valid values

### Output Safety
- **JSON stringify all responses**: No raw objects or functions
- **No sensitive data in descriptions**: Tool descriptions are visible to LLM
- **Error messages are informational**: Describe what failed, not internal state

## Instructions on Using PLANS.md

Refer to `PLANS.md` when:
- **Adding a new resource/tool group** (e.g., new Visit Create API endpoint)
- **Refactoring the tool architecture** (changing how tools are organized)
- **Adding infrastructure** (testing, logging, monitoring, CI/CD)
- **Significant API client changes** (auth, rate limiting, error handling)

Plans document the multi-step process, validation points, and decision gates. Use a plan if the change spans multiple files or depends on careful sequencing.

## Instructions on Using Skills

This repository has no Skills yet, but the `SKILLS/` directory can hold reusable patterns:
- `SKILLS/add-tool/` - Step-by-step checklist for adding a new tool
- `SKILLS/add-resource/` - Process for adding a new resource (domain)
- `SKILLS/test-locally/` - How to run and debug the server locally

Agents should consult Skills before attempting repetitive workflows. Skills are stored in `/SKILLS/[skill-name]/SKILL.md`.

## Git Workflow

- **Branch for changes**: Create feature branches off `main`
- **Commit message format**: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`
- **PR required**: All changes require a PR with description
- **CI should pass**: Build, type-check, format checks (when configured)
- **Review gates**: Code review before merge (when configured)

Current repo status: clean, main branch active, last commit is full OpenAPI coverage.

## Environment

- **Node.js version**: 18+
- **Operating system**: Darwin (development), Linux (production)
- **Package manager**: npm (no yarn, no pnpm constraints)
- **Editor**: VSCode recommended (tsconfig.json includes sourceMap for debugging)

---

**For more detailed guidance, see nested AGENTS.md files in `/src/` subdirectories.**
