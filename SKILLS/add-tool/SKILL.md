# Skill: Add a New Tool

## Purpose
Quickly add a single new MCP tool to an existing resource file, following established patterns.

## When to Use
- Adding a new tool like `visit_update_visitor_notes` to existing resource
- Tool operation is not yet in the resource file
- You have API endpoint details and parameter/response specifications

## Required Inputs
- **Resource name** (e.g., "visitor", "partner")
- **Operation name** (e.g., "create", "update", "list")
- **HTTP method** (GET, POST, PUT, DELETE)
- **API endpoint** (e.g., `/visitors/{expoId}`)
- **Parameters** (with types and descriptions)
- **Response type** (with shape/schema)

## Step-by-Step Procedure

### Step 1: Verify Tool Doesn't Exist
```bash
grep -r "visit_[resource]_[operation]" src/
```
If tool exists, stop—don't duplicate.

### Step 2: Locate Resource File
Open `src/tools/[resource].ts` (e.g., `src/tools/visitors.ts`)

### Step 3: Write Tool Registration
Inside the `register[Resource]Tools()` function, add:
```typescript
server.registerTool(
  "visit_[resource]_[operation]",  // Tool name
  {
    title: "Human Title",
    description: "What this does. Constraints here.",
    inputSchema: {
      // Zod validators
    },
    annotations: {
      readOnlyHint: true/false,
      destructiveHint: true/false,
      idempotentHint: true/false,
      openWorldHint: true/false,
    },
  },
  async (params) => {
    try {
      const data = await makeApiRequest<ResponseType>(
        `/endpoint/path`,
        "HTTP_METHOD",
        body,  // if POST/PUT
        query  // if GET
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: handleApiError(error) }], isError: true };
    }
  }
);
```

### Step 4: Write Zod Schema
For `inputSchema`, create validators for all parameters:
```typescript
inputSchema: {
  expoId: z.string().describe("Alphanumeric Expo ID"),
  visitorId: z.string().describe("Alphanumeric Visitor ID"),
  notes: z.string().max(500).describe("Update notes (max 500 chars)"),
},
```

**Rules**:
- Every parameter must have `.describe()`
- Use `.optional()` for optional parameters
- Use `.max()`, `.min()` for constraints
- Use `.email()`, `.uuid()` for special formats

### Step 5: Handle Request Method

**GET**: Query parameters
```typescript
const data = await makeApiRequest<ResponseType>(
  `/visitors/${params.expoId}/${params.visitorId}`,
  "GET",
  undefined,
  { limit: params.limit, offset: params.offset }  // query
);
```

**POST/PUT**: Request body
```typescript
const data = await makeApiRequest<ResponseType>(
  `/visitors/${params.expoId}`,
  "POST",
  {  // body
    firstName: params.firstName,
    lastName: params.lastName,
  }
);
```

**DELETE**: No body
```typescript
const data = await makeApiRequest<ResponseType>(
  `/visitors/${params.expoId}/${params.visitorId}`,
  "DELETE"
);
```

### Step 6: Set Annotations Correctly

| Operation | readOnlyHint | destructiveHint | idempotentHint |
|-----------|--------------|-----------------|----------------|
| GET (list, get) | true | false | true |
| POST (create) | false | true | false |
| PUT (update) | false | true | true |
| DELETE | false | true | true |

### Step 7: Build & Verify
```bash
npm run build
```
Must succeed with no TypeScript errors.

### Step 8: Update README
Find the resource row in "Available Tools" table in `README.md`:
```markdown
| Visitors | `visit_list_visitors`, `visit_get_visitor`, `visit_create_visitor`, `visit_update_visitor`, `visit_delete_visitor` |
```
Add your new tool to the list (alphabetical order within the resource).

### Step 9: Final Check
Run:
```bash
npm run build && grep "visit_[resource]_[operation]" dist/tools/[resource].js
```
Tool name should appear in compiled output.

## Validation Steps

- [ ] Tool name follows `visit_[resource]_[operation]` format
- [ ] Zod schema has descriptions for all parameters
- [ ] All parameters are validated (no `z.any()`)
- [ ] Error handling uses `handleApiError()`
- [ ] Annotations match operation type
- [ ] `npm run build` succeeds
- [ ] Tool appears in compiled `dist/`
- [ ] README updated
- [ ] No duplicate tool names in codebase

## Failure Handling

**TypeScript errors**:
- Check parameter types in Zod schema
- Verify generic type `ResponseType` matches API response
- Ensure imports use `.js` extension

**Build fails**:
- Run `npm run build` to see full error
- Check for missing imports or syntax errors
- Verify endpoint paths don't have typos

**Tool not working**:
- Verify `inputSchema` matches API requirements
- Check HTTP method (GET vs POST)
- Verify query vs body parameters are in correct place

## Expected Output

Successfully added tool:
1. Tool registered in resource file
2. Tool appears in compiled output
3. Tool listed in README
4. Build succeeds with zero errors
5. Tool ready to use in MCP client

## Time Estimate
5-15 minutes for experienced agent
