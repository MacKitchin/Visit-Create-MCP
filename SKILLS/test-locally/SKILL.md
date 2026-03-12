# Skill: Test Server Locally

## Purpose
Build, run, and manually test the MCP server locally to verify tools work before deployment.

## When to Use
- After implementing new tools
- Before creating a pull request
- To verify tool changes work correctly
- To test error handling and edge cases
- To validate integration with MCP client

## Required Inputs
- **API key**: `VISIT_API_KEY` environment variable must be set
- **MCP client**: Claude Desktop, Cursor, or other MCP-compatible client
- **Test expo/resource ID**: Real ID from Visit Create API for testing

## Step-by-Step Procedure

### Step 1: Set API Key
```bash
export VISIT_API_KEY="your-visit-create-api-key"
```
Verify it's set:
```bash
echo $VISIT_API_KEY
```
Should output your key (first few chars visible).

### Step 2: Build the Server
```bash
npm run build
```
Must succeed with zero errors. If not, use `SKILLS/debug-build/SKILL.md`.

### Step 3: Start Server in Development Mode
```bash
npm run dev
```
You should see:
```
[tsx] watching for file changes...
✨ Successfully compiled X files with TypeScript
```
Server is now running in watch mode. Leave this terminal open.

### Step 4: Connect MCP Client

#### Option A: Claude Desktop
1. Stop Claude Desktop if running
2. Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
3. Add or update MCP server config:
   ```json
   {
     "mcpServers": {
       "visit-create-local": {
         "command": "node",
         "args": ["/path/to/Visit-Create-MCP/dist/index.js"],
         "env": {
           "VISIT_API_KEY": "your-api-key"
         }
       }
     }
   }
   ```
4. Restart Claude Desktop
5. Should show "visit-create-local" in tool list

#### Option B: Cursor
Similar to Claude Desktop. Check Cursor documentation for MCP server configuration.

### Step 5: Test a Simple Tool

In your MCP client (Claude, Cursor, etc.):

**List expos** (should work with any valid API key):
```
Use the visit_list_expos tool with default parameters
```

Expected: JSON list of expos or error message about API key.

### Step 6: Test Your New Tool

If you implemented a new tool:
1. In MCP client, look for your tool in the tool list
2. Call it with required parameters
3. Verify response is correct JSON or helpful error

Example - test a visitor tool:
```
Call visit_list_visitors with expoId="[real-expo-id]" and limit=5
```

### Step 7: Test Error Paths

**Test invalid parameters**:
- Call tool with wrong expoId → should get error message
- Call tool with invalid limit (e.g., 1000) → should reject via Zod

**Test auth error**:
- Stop server
- Set wrong `VISIT_API_KEY`
- Restart server
- Call any tool → should return 401 error message

**Test API limit**:
- Visit API allows 2 concurrent requests
- Server should handle gracefully (no parallelization)

### Step 8: Check Logs

While testing, check server terminal output:
```
[2026-03-12] Tool call: visit_list_visitors
[2026-03-12] Request: GET /visitors/[expoId]?limit=5
[2026-03-12] Response: 200 (5 visitors)
```

Look for any errors or warnings.

### Step 9: Modify Code (Optional)

Code changes are auto-recompiled in watch mode:
1. Edit `src/tools/[resource].ts` or other source
2. Server auto-rebuilds
3. No need to restart client (usually)
4. Test the updated tool again

### Step 10: Stop Server
Press `Ctrl+C` in the server terminal when done.

## Validation Steps

- [ ] API key is set and valid
- [ ] `npm run build` succeeds
- [ ] Server starts without errors
- [ ] MCP client connects to server
- [ ] Tool appears in client's tool list
- [ ] Simple GET tool (list) works
- [ ] Tool returns JSON response
- [ ] Error cases are handled gracefully
- [ ] Multiple tools can be called sequentially

## Common Issues & Fixes

**Error: "VISIT_API_KEY environment variable is required"**
- API key not set or lost in new terminal
- Run: `export VISIT_API_KEY="your-key"` again
- Verify: `echo $VISIT_API_KEY` shows key

**Error: "Cannot find module"**
- Rebuild hasn't run
- Run: `npm run build`
- Check `dist/` directory exists

**Tool doesn't appear in client**
- MCP client not connected
- Server crashed (check terminal)
- Restart client after server starts

**Tool call returns "unauthorized"**
- API key is invalid
- Get new key from Visit Create
- Update environment variable
- Restart server

**Tool call is slow**
- Visit API may be slow
- Network latency
- Normal behavior, not a code issue

**Server crashes after code edit**
- TypeScript error in edited file
- Check server terminal for error message
- Fix the error, wait for auto-rebuild
- Restart server (usually auto-restarts in watch mode)

## Manual Testing Checklist

For each new tool:
- [ ] Tool is listed in MCP client
- [ ] Tool call with valid parameters succeeds
- [ ] Tool response is valid JSON
- [ ] Tool call with invalid parameters fails gracefully
- [ ] Error message is helpful
- [ ] No errors in server logs
- [ ] Server continues running after error

## Tips

1. **Use real data**: Test with real expo/visitor IDs from your Visit Create account
2. **Test happy path first**: Get success case working before testing errors
3. **Check logs**: Server terminal shows request/response details
4. **Restart carefully**: Some clients cache tool list (may need restart)
5. **Environment variables**: Changes to env vars require server restart
6. **Watch mode helps**: Code edits auto-rebuild without restart

## Example Test Session

```bash
# Terminal 1: Start server
export VISIT_API_KEY="sk_test_..."
npm run dev
# → Server running

# Terminal 2: Use client
# In Claude Desktop, test visit_list_expos
# Success: See list of expos

# Back to Terminal 1: Edit src/tools/visitors.ts
# → Auto-rebuild happens

# Terminal 2: Call updated tool
# Success: New feature works

# Terminal 1: Ctrl+C to stop
```

## Time Estimate
5-20 minutes depending on what you're testing

## Next Steps
- Document findings in tool comments if behavior is non-obvious
- Update README if tool constraints discovered during testing
- Create PR with working, tested code
