# /src/services Directory - Agent Instructions

## Scope

This directory contains the **API client layer** — all HTTP communication with the Visit Create API. Currently contains only `api-client.ts`, which is critical to every tool operation.

## Single File: api-client.ts

### Responsibility
- **Central HTTP client** for all API calls
- **Authentication** (basic auth with API key)
- **Error handling** (descriptive, actionable messages)
- **Rate limiting awareness** (max 2 concurrent requests)
- **Consistent request/response format**

### Key Exports

#### `makeApiRequest<T>(endpoint, method, data?, params?): Promise<T>`

Universal function for all API calls:

```typescript
// GET with query params
const data = await makeApiRequest<VisitorList>(
  "/visitors/{expoId}",
  "GET",
  undefined,
  { limit: 100, offset: 0 }
);

// POST with body
const newVisitor = await makeApiRequest<Visitor>(
  "/visitors/{expoId}",
  "POST",
  { firstName: "John", lastName: "Doe" }
);

// DELETE
const result = await makeApiRequest<void>(
  "/visitors/{expoId}/{visitorId}",
  "DELETE"
);
```

**Parameters**:
- `endpoint` (string): API path (e.g., `/visitors/{expoId}`)
- `method` (string): HTTP verb—only `"GET" | "POST" | "PUT" | "DELETE"`
- `data` (optional): Request body object (for POST/PUT)
- `params` (optional): Query parameters as object (for GET)

**Returns**: Generic type `T` matching the API response schema

#### `handleApiError(error: unknown): string`

Converts any error into a human-readable, actionable message:

```typescript
const message = handleApiError(error);
// Returns something like:
// "HTTP 429: Rate limit exceeded. Wait 60 seconds before retrying."
// "HTTP 401: Unauthorized. Check your VISIT_API_KEY environment variable."
// "Network error: Connection timeout after 30 seconds."
```

**Always use this** in tool catch blocks—never throw or return raw errors.

### Axios Client Configuration

Internal singleton `apiClient` created by `getClient()`:
- **Base URL**: From `constants.API_BASE_URL`
- **Timeout**: From `constants.REQUEST_TIMEOUT` (usually 30 seconds)
- **Headers**: `Content-Type: application/json`, `Accept: application/json`
- **Auth**: Basic auth with API key as username, empty password
- **Reuse**: Single instance cached across all tool calls

### Error Handling Patterns

The function handles these error scenarios:

**HTTP 429 (Rate Limit)**:
```
"HTTP 429: Rate limit exceeded. Visit allows 2 concurrent requests. 
Wait 60 seconds before retrying."
```

**HTTP 401 (Unauthorized)**:
```
"HTTP 401: Unauthorized. Check your VISIT_API_KEY environment variable. 
Key must be valid and have permissions for this resource."
```

**HTTP 403 (Forbidden)**:
```
"HTTP 403: Forbidden. Your API key lacks permissions for this operation."
```

**HTTP 4xx (Client Error)**:
```
"HTTP 400: Bad Request. Parameter validation failed. 
Check that all required fields are provided and formats match the spec."
```

**HTTP 5xx (Server Error)**:
```
"HTTP 502: Bad Gateway. Visit Create service is temporarily unavailable. 
Retry after a brief delay."
```

**Network Timeout**:
```
"Network error: Connection timeout after 30 seconds. 
Check your network connection and the API service status."
```

**No Response**:
```
"Network error: No response from Visit Create API. 
Check your VISIT_API_KEY and network connectivity."
```

## When to Modify This File

### ✅ Legitimate Reasons

1. **Changing timeout behavior** (if API is slower than expected):
   - Edit `REQUEST_TIMEOUT` in constants.ts, not here
   - If complex logic needed, modify `getClient()`

2. **Adding new error handling** (if new status codes appear):
   - Extend `handleApiError()` with new case
   - Example: Rate limit headers changed, need new parsing logic

3. **Changing authentication** (if API key auth changes):
   - Modify `getApiKey()` function
   - Coordinate with all tool files

4. **Adding request/response logging** (for debugging):
   - Add Axios interceptors in `getClient()`
   - **Never log API keys or user data**

### ❌ Don't Modify For

- ❌ Tool-specific business logic (goes in tool files)
- ❌ Individual endpoint handling (each tool handles its own URL)
- ❌ Feature-specific error messages (tool can add context via catch block)

## Anatomy of the Client

### getApiKey(): string
- **Purpose**: Retrieve API key from environment
- **Throws**: Error if `VISIT_API_KEY` not set
- **Called by**: `getClient()` on first request

### getClient(): AxiosInstance
- **Purpose**: Create and cache Axios instance
- **Singleton**: Returns same instance on all calls
- **Configures**: Headers, auth, timeout, base URL
- **Called by**: `makeApiRequest()` and `handleApiError()`

### makeApiRequest<T>(...)
- **Purpose**: Unified request handler
- **Parameter validation**: Method must be valid HTTP verb
- **Endpoint handling**: Paths can include {placeholders}
- **Response typing**: Generic type ensures type safety
- **Error delegation**: Throws (caught by handleApiError)

### handleApiError(error: unknown): string
- **Purpose**: Convert errors to user-friendly messages
- **Detects**: AxiosError vs network vs unknown errors
- **Provides context**: HTTP status, likely cause, next steps
- **Safe**: Never logs sensitive data
- **Returns**: Single string, safe to display to LLM

## Usage Constraints

**Rate Limiting**: Visit API allows **2 concurrent requests** max
- MCP server doesn't parallelize tools (each runs sequentially)
- If future code adds parallel execution, add queue logic here
- 429 errors are handled and returned to caller (no retry loop)

**Authentication**:
- API key must be present at startup (checked in `getClient()`)
- Credentials are passed via Authorization header
- 401/403 errors indicate auth failure, not transient issues

**Timeouts**:
- Default 30 seconds (configurable in constants.ts)
- If API is slow, increase REQUEST_TIMEOUT, don't add retry logic
- Network timeouts are errors; MCP caller decides retry strategy

## Testing the API Client

No unit tests exist, but manual testing:

```typescript
// Test connection
const test = await makeApiRequest("/expos", "GET", undefined, { limit: 1 });
// If successful, API key is valid

// Test error handling
try {
  await makeApiRequest("/invalid", "GET");
} catch (e) {
  console.log(handleApiError(e));
  // Should print helpful error message
}
```

## Common Usage Patterns from Tools

### Pattern 1: Simple GET
```typescript
const data = await makeApiRequest<Visitor[]>(
  `/visitors/${params.expoId}`,
  "GET",
  undefined,
  { limit: params.limit }
);
```

### Pattern 2: GET by ID
```typescript
const data = await makeApiRequest<Visitor>(
  `/visitors/${params.expoId}/${params.visitorId}`,
  "GET"
);
```

### Pattern 3: POST Create
```typescript
const data = await makeApiRequest<Visitor>(
  `/visitors/${params.expoId}`,
  "POST",
  {
    firstName: params.firstName,
    lastName: params.lastName,
  }
);
```

### Pattern 4: PUT Update
```typescript
const body: Record<string, unknown> = {};
if (params.firstName) body.firstName = params.firstName;
const data = await makeApiRequest<Visitor>(
  `/visitors/${params.expoId}/${params.visitorId}`,
  "PUT",
  body
);
```

### Pattern 5: DELETE
```typescript
const data = await makeApiRequest<void>(
  `/visitors/${params.expoId}/${params.visitorId}`,
  "DELETE"
);
```

## What Agents Should Avoid

- ❌ Adding retry logic (caller decides retry strategy)
- ❌ Hardcoding endpoints (keep them generic `/path`)
- ❌ Catching and suppressing errors (always propagate)
- ❌ Logging API keys or sensitive data
- ❌ Modifying Axios config per-request (use constructor)
- ❌ Handling tool-specific business logic here

## Debugging Tips

**If requests fail**:
1. Check `VISIT_API_KEY` environment variable is set
2. Verify API key has permissions for the endpoint
3. Check network connectivity
4. Look at HTTP status code in error message

**If error messages are unclear**:
1. Add more detail to `handleApiError()` for that status code
2. Example: Add Visit API documentation link to 400 errors

**If requests are slow**:
1. Check `REQUEST_TIMEOUT` in constants.ts
2. Profile with `console.time()` / `console.timeEnd()`
3. May be API-side delay, not client issue

## Interface with Index & Tools

```
index.ts (imports api-client.js)
  └─> api-client.ts (exports makeApiRequest, handleApiError)
        ├─> used by visitors.ts
        ├─> used by partners.ts
        ├─> used by activities.ts
        └─> used by all other tool files
```

Every tool file imports and uses `makeApiRequest` and `handleApiError`. This file is the single point of change for all API communication.

---

**Rarely modified**: Only touch this file when adding API client features, not for individual tool changes.
