# /src/tools Directory - Agent Instructions

## Scope

This directory contains **18 tool implementation files**, each exposing MCP tools for a specific Visit Create API resource (visitors, partners, activities, etc.). Every file follows the same registration and implementation pattern.

## Directory Contents

```
tools/
├── expos.ts                      # List/get expo (event) info
├── visitors.ts                   # CRUD for visitors
├── partners.ts                   # CRUD for partners (exhibitors)
├── activities.ts                 # CRUD for activities (sessions)
├── contents.ts                   # CRUD for contents
├── connections.ts                # List/get connections
├── actions.ts                    # List actions
├── participants.ts               # List/get participants
├── orders.ts                     # List/get orders
├── payments.ts                   # List/get/update payments
├── labels.ts                     # CRUD for labels
├── licenses.ts                   # CRUD for licenses
├── webhooks.ts                   # CRUD for webhooks
├── registration-types.ts         # List registration types
├── send-email.ts                 # Send emails to visitors
├── touchpoints.ts                # List touchpoints
├── upload.ts                     # Upload visitor files (photo/ID)
├── list-all.ts                   # Bulk paginate across any resource
└── AGENTS.md                     # This file
```

## Tool Registration Pattern (Required)

Every tool file must export a single function with this signature:

```typescript
export function register[Resource]Tools(server: McpServer): void {
  server.registerTool(
    "visit_[resource]_[operation]",
    {
      title: "Human-readable title",
      description: "What this tool does, any constraints (max 100 records, etc).",
      inputSchema: {
        // Zod validators for each parameter
        expoId: z.string().describe("The expo ID"),
        limit: z.number().int().max(100).optional(),
      },
      annotations: {
        readOnlyHint: true,          // if GET operation
        destructiveHint: false,       // if POST/PUT/DELETE
        idempotentHint: true,         // if operation is safe to retry
        openWorldHint: true,          // if outside Visit's domain
      },
    },
    async (params) => {
      try {
        const data = await makeApiRequest<T>("/endpoint", "GET", undefined, params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
      }
    }
  );
}
```

## Anatomy of a Tool

### Tool Name: `visit_[resource]_[operation]`

Format: `visit_` prefix + resource name + operation. Examples:
- `visit_list_visitors` - GET /visitors/{expoId}
- `visit_get_visitor` - GET /visitors/{expoId}/{visitorId}
- `visit_create_visitor` - POST /visitors/{expoId}
- `visit_update_visitor` - PUT /visitors/{expoId}/{visitorId}
- `visit_delete_visitor` - DELETE /visitors/{expoId}/{visitorId}

### Title Field
- Human-readable operation name
- Examples: "List Visitors", "Get Visitor", "Create Visitor"

### Description Field
- Plain English explanation of what the tool does
- **Include constraints** (e.g., "Max 100 per request", "Requires admin access")
- **Include hints** about filtering/pagination if applicable

### Input Schema (Zod)

**Required**: Every parameter must have a Zod validator:

```typescript
inputSchema: {
  expoId: z.string().describe("Alphanumeric Expo (event) ID"),
  visitorId: z.string().describe("Alphanumeric Visitor ID"),
  limit: z.number().int().min(1).max(100).default(100).optional().describe("Max 1-100"),
  webhookId: z.string().uuid().optional().describe("UUID of webhook"),
}
```

**Do not use `z.object()` wrapper**—the SDK handles that automatically.

### Annotations

```typescript
annotations: {
  readOnlyHint: true,      // ✅ true for GET operations
  destructiveHint: true,   // ✅ true for DELETE/PUT that mutate state
  idempotentHint: true,    // ✅ true if safe to retry (GET, PUT idempotent)
  openWorldHint: true,     // ✅ true if data is not internal-only
}
```

## Implementation Pattern

Every tool implementation follows this structure:

```typescript
async (params) => {
  try {
    // 1. Build query/body object with only non-empty values
    const q: Record<string, unknown> = {};
    if (params.limit) q.limit = params.limit;
    if (params.filter) q.filter = params.filter;

    // 2. Make API request
    const data = await makeApiRequest<ResponseType>(
      `/endpoint/${params.expoId}`,
      "GET",
      undefined,  // body (only for POST/PUT)
      q           // query params (only for GET)
    );

    // 3. Return formatted response
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    // 4. Handle errors centrally
    return {
      content: [{ type: "text", text: handleApiError(error) }],
      isError: true,
    };
  }
}
```

## Zod Validation Guidelines

### String Parameters
```typescript
expoId: z.string().describe("Alphanumeric Expo ID"),
email: z.string().email().describe("Email address"),
registrationStates: z.string().optional().describe("Comma-separated: registered,incomplete,denied"),
```

### Numeric Parameters
```typescript
limit: z.number().int().min(1).max(100).default(100),
offset: z.number().int().min(0),
revisionId: z.number().int().min(0).optional(),
```

### Optional vs Required
```typescript
expoId: z.string(),              // ✅ Required parameter
limit: z.number().optional(),    // ✅ Optional parameter
showDeleted: z.boolean().default(true).optional(),
```

### Descriptions (Required for All)
Every parameter must have a `.describe()`:
```typescript
z.string().describe("Alphanumeric Expo ID (required for all operations)")
```

## Error Handling

**All errors go through `handleApiError()`** in the API client:

```typescript
catch (error) {
  return {
    content: [{ type: "text", text: handleApiError(error) }],
    isError: true,
  };
}
```

This ensures:
- ✅ HTTP status codes are included
- ✅ Error messages are actionable
- ✅ Rate limit (429) errors are handled
- ✅ Auth (401/403) errors explain the issue
- ✅ Network errors give retry guidance

**Never**: Throw exceptions or return raw error objects.

## Query Parameter vs Request Body

### GET operations (parameters in query string)
```typescript
const data = await makeApiRequest<T>(
  `/visitors/${params.expoId}`,
  "GET",
  undefined,        // no body
  { limit: params.limit, offset: params.offset }  // query params
);
```

### POST/PUT operations (parameters in body)
```typescript
const data = await makeApiRequest<T>(
  `/visitors/${params.expoId}`,
  "POST",
  {                 // body object
    firstName: params.firstName,
    lastName: params.lastName,
  },
  undefined         // no query params
);
```

## Tool Organization by Resource

### Read-Only Resources (no CRUD)
- `expos.ts`: list_expos, get_expo
- `connections.ts`: list_connections, get_connection
- `actions.ts`: list_actions (read only)
- `participants.ts`: list_participants, get_participant
- `orders.ts`: list_orders, get_order
- `registration-types.ts`: list_registration_types
- `touchpoints.ts`: list_touchpoints

### CRUD Resources
- `visitors.ts`: list, get, create, update, delete
- `partners.ts`: list, get, create, update, delete
- `activities.ts`: list, get, create, update, delete
- `contents.ts`: list, get, create, update, delete
- `labels.ts`: list, get, create, update, delete
- `licenses.ts`: list, get, create, update, delete
- `webhooks.ts`: list, get, create, update, delete

### Special Tools
- `payments.ts`: list, get, update (no create/delete)
- `send-email.ts`: send_email only
- `upload.ts`: upload_file only
- `list-all.ts`: bulk pagination across resources

## When Adding a New Tool

1. Open or create the appropriate `.ts` file (e.g., `visitors.ts` for visitor operations)
2. Import required modules:
   ```typescript
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { z } from "zod";
   import { makeApiRequest, handleApiError } from "../services/api-client.js";
   ```
3. Export `register[Resource]Tools` function
4. Inside, call `server.registerTool()` for each operation
5. Add tool registration call to `/src/index.ts`
6. Update `README.md` tools table
7. Rebuild: `npm run build`

## Common Patterns

### Filtering
```typescript
const q: Record<string, unknown> = {};
if (params.status) q.status = params.status;
if (params.search) q.search = params.search;
const data = await makeApiRequest<T>(`/resource`, "GET", undefined, q);
```

### Pagination
```typescript
const q: Record<string, unknown> = {
  limit: params.limit || 100,
  offset: params.offset || 0,
};
const data = await makeApiRequest<T[]>(`/resource`, "GET", undefined, q);
```

### Creation
```typescript
const body = {
  name: params.name,
  email: params.email,
  // ... only non-empty fields
};
const data = await makeApiRequest<T>(`/resource`, "POST", body);
```

### Updating
```typescript
const body: Record<string, unknown> = {};
if (params.name) body.name = params.name;
if (params.email) body.email = params.email;
const data = await makeApiRequest<T>(
  `/resource/${params.id}`,
  "PUT",
  body
);
```

### Deletion
```typescript
const data = await makeApiRequest<T>(
  `/resource/${params.id}`,
  "DELETE"
);
```

## Documentation in Tool Files

- **JSDoc for functions** (optional but helpful):
  ```typescript
  /**
   * List visitors for an expo with optional filtering.
   * Max 100 per request; use visit_list_all for bulk.
   */
  export function registerVisitorTools(server: McpServer): void {
  ```
- **Inline comments for complex logic**: Keep sparse
- **Zod descriptions**: Every parameter must have one

## What Agents Should Avoid in /tools

- ❌ Modifying tool names (they're part of API contract)
- ❌ Removing annotations (they help LLM understand safety)
- ❌ Hardcoding pagination/filtering logic (use query params)
- ❌ Creating tools that aren't 1:1 with API endpoints
- ❌ Duplicating error handling (use handleApiError)
- ❌ Changing Zod schema validation (coordinate with API team)

## Testing Tools Locally

No automated tests exist yet. To test manually:
1. Set `VISIT_API_KEY` environment variable
2. Run `npm run dev` to start server in watch mode
3. Use an MCP client (Claude Desktop, Cursor, etc.) to call tools
4. Check console for errors and response data

## File Naming Convention

**One resource per file**:
- ✅ `visitors.ts` - all visitor tools
- ✅ `partnerships.ts` - all partnership tools
- ❌ `visitor-get.ts`, `visitor-create.ts` (split per operation)

## Imports Required in Every Tool File

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
```

---

**Next**: See `/src/services/AGENTS.md` for API client patterns.
