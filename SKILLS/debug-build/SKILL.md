# Skill: Debug Build Failures

## Purpose
Systematically diagnose and fix TypeScript, import, or build errors.

## When to Use
- `npm run build` fails with errors
- TypeScript type errors block progress
- Module resolution errors (import failures)
- Compilation errors after code changes

## Required Inputs
- **Error message** from `npm run build`
- **Recent code changes** that caused the failure
- **Affected files** (if known)

## Step-by-Step Procedure

### Step 1: Capture Full Error
```bash
npm run build 2>&1 | tee build-error.log
```
Save full output for analysis.

### Step 2: Identify Error Category

**Error Type: Type Mismatch**
```
error TS2322: Type 'string' is not assignable to type 'number'
```
→ Go to Step 3 (Type Mismatch)

**Error Type: Module Not Found**
```
error TS2307: Cannot find module '../services/api-client'
```
→ Go to Step 4 (Module Not Found)

**Error Type: Syntax Error**
```
error TS1005: ',' expected
```
→ Go to Step 5 (Syntax Error)

**Error Type: Unknown Error**
→ Go to Step 6 (Deep Dive)

### Step 3: Fix Type Mismatch
1. Open the file and line number from error
2. Check variable type definition
3. Check assignment or parameter type
4. Compare: declared type vs actual value
5. Options:
   - Change variable type to match value
   - Change value to match type
   - Use type assertion if deliberate: `const x = value as TypeName`
6. Rebuild: `npm run build`

**Example**:
```typescript
// Error: Type 'string' not assignable to 'number'
const limit = "100";  // Wrong: string
const limit = 100;    // Correct: number
```

### Step 4: Fix Module Not Found
1. Check import statement:
   ```typescript
   import { makeApiRequest } from "../services/api-client.js";  // ✅ Correct
   import { makeApiRequest } from "../services/api-client";    // ❌ Missing .js
   ```
2. **ESM Rule**: Relative imports MUST include `.js` extension
3. Fix all affected imports
4. Verify path exists:
   ```bash
   ls -la src/services/api-client.ts
   ```
5. Rebuild: `npm run build`

**Common fixes**:
- Add `.js` extension to relative imports
- Check spelling of module names
- Verify file exists in expected location

### Step 5: Fix Syntax Error
1. Open file at error location
2. Check for common issues:
   - Missing closing brace `}`
   - Missing comma in object/array
   - Mismatched parentheses
   - Invalid JSDoc syntax
3. Compare surrounding code to see pattern
4. Fix and rebuild

**Example**:
```typescript
// Error: ',' expected
{
  title: "Tool Name"
  description: "..."  // ← Missing comma
}

// Fixed:
{
  title: "Tool Name",
  description: "..."
}
```

### Step 6: Deep Dive for Complex Errors
1. Check recent git changes:
   ```bash
   git diff src/ | head -50
   ```
2. Identify what changed around error location
3. Review tsconfig.json for strict mode settings:
   ```bash
   cat tsconfig.json | grep -A5 compilerOptions
   ```
4. Try type-check only (without emit):
   ```bash
   npx tsc --noEmit
   ```
5. Look for cascading errors (first error may cause others)
6. If stuck, revert recent changes:
   ```bash
   git checkout -- src/[file].ts
   ```
   Then rebuild to confirm it was that file.

## Validation Steps

- [ ] Error message fully understood
- [ ] Error location identified in source
- [ ] Root cause identified (type, import, syntax)
- [ ] Fix applied
- [ ] `npm run build` succeeds with zero errors
- [ ] No new errors introduced

## Failure Handling

**Still getting errors after fix**:
- Run `npm clean` then `npm run build` (clean rebuild)
- Check for multiple errors (fix first one, then rebuild)
- Verify changes were actually saved to file

**Build succeeds but types still wrong**:
- Run `npx tsc --noEmit` to double-check
- May have unrelated type issues not caught by build

**Import error persists**:
- Verify ESM: relative imports must have `.js`
- Verify file exists: `ls -la [path]`
- Verify export is named (not default)

## Expected Output

Build succeeds cleanly:
```
✨ Successfully compiled 18 files with TypeScript
dist/
  ├── index.js
  ├── services/
  ├── tools/
  └── (all other files)
```

## Tips

1. **Read error messages carefully**: TypeScript messages are usually accurate
2. **Fix one error at a time**: Cascading errors disappear after first fix
3. **Use `--noEmit`**: Faster type-checking without output
4. **Check git diff**: See what changed since last successful build
5. **Don't ignore warnings**: Fix them before they become errors

## Time Estimate
2-10 minutes depending on error complexity
