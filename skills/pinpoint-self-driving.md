# Skill: Pinpoint Self-Driving Mode

You are running a fully autonomous UI review-and-fix session. You will find UI issues, annotate them, fix the code, verify the fix, and resolve the annotation — all without human intervention. Target 5–8 issues per run.

## Step 0 — Verify agent-browser is available

Run this check first:

```bash
npx agent-browser --version 2>&1
```

If the command fails with "not found" or a network error, tell the user:
```
agent-browser is not installed. Install it with:
  npm i -g agent-browser && agent-browser install
Then try again.

If you want fixes without visual verification, use Hands-Free Mode instead:
add annotations manually in the browser, then say "watch mode".
```

Do NOT proceed without agent-browser.

---

## Before You Start

1. Call `pinpoint_list_sessions` to get the active session ID
2. Confirm the dev server is running (port 5173 or similar)
3. Open the browser:
   ```bash
   npx agent-browser open http://localhost:5173
   npx agent-browser screenshot /tmp/self-driving-start.png
   npx agent-browser snapshot
   ```

## The 4-Step Loop

Repeat for each issue (5–8 total):

---

### Step 1 — Annotate (Browser → MCP)

Use the Pinpoint toolbar to click the element and add an annotation:

```bash
# 1. Get a fresh snapshot — find the Capture button in the Pinpoint toolbar
npx agent-browser snapshot -i
# Look for: button "Capture" — note its ref

# 2. Enter capture mode
npx agent-browser click @e_capture

# 3. Hover over the element you want to annotate (registers it with the capture overlay)
npx agent-browser hover @e_target

# 4. Click to open the annotation popup
npx agent-browser click @e_target

# 5. Confirm popup is open — look for intent chips: Bug, Improvement, Question…
npx agent-browser snapshot -i

# 6. Select intent
npx agent-browser click @e_improvement   # or @e_bug, @e_question, etc.

# 7. Select severity
npx agent-browser click @e_medium        # or @e_high, @e_low, @e_critical, @e_info

# 8. Type a specific, actionable comment
npx agent-browser fill @e_textarea "Describe the exact issue and the intended fix"

# 9. Submit
npx agent-browser click @e_add           # button "✓ Add"

# 10. Re-snapshot to confirm the popup closed and the marker pin appeared
npx agent-browser snapshot -i
```

> **Refs go stale** after every page change. Always re-snapshot before finding new refs.

> **If the popup does not open:** hover over the element first, wait briefly, then click. The capture overlay must receive the mousemove event before the click to register which element to annotate.

---

### Step 2 — Fix (MCP → Code)

1. Call `pinpoint_get_pending` with the session ID
2. Find the annotation you just created
3. Call `pinpoint_acknowledge(annotationId)` — user sees a yellow "noticed" state
4. Read from the annotation:
   - `metadata.sourceFile` — open this file directly
   - `target.selector` — find the element in the code
   - `comment` — understand the intended fix
5. Make the targeted change:
   - Fix the specific issue described in the comment
   - Do not refactor surrounding code
   - Keep the fix to 1–10 lines where possible

---

### Step 3 — Verify (Code → Browser)

Wait for hot reload (HMR), then visually confirm the fix:

```bash
npx agent-browser wait --load networkidle  # wait for HMR to settle
npx agent-browser screenshot /tmp/self-driving-verify.png
npx agent-browser snapshot -i              # check the specific element
```

- Does it look correct?
- Did the fix address what was described in the annotation?
- Did it break anything nearby?

If the fix looks wrong:
- Adjust the code and wait for hot reload again
- Re-screenshot and check (max 2 iterations)
- If still wrong after 2 iterations: revert the change, call `pinpoint_reply` explaining what you tried, and move to the next issue

---

### Step 4 — Resolve (MCP → Done)

```
pinpoint_resolve(annotationId, "Changed `padding: 8px` to `padding: 8px 16px` in Button.tsx:34 to fix cramped horizontal spacing")
```

Include: what file was changed, what the change was. The annotation disappears from the browser toolbar.

---

## What to Fix vs Skip

### Fix confidently:
- CSS/spacing/padding/margin issues
- Typography: font sizes, weights, line heights
- Color and contrast adjustments (not redesigning)
- Missing hover/focus states
- Broken flex/grid layouts
- Icon sizes and positioning
- Button/link styling

### Skip (use `pinpoint_reply` and explain why):
- Design decisions requiring human judgment ("which color scheme?")
- Changes touching more than 3 files
- Changes to data fetching, auth, or business logic
- Changes requiring new dependencies
- Anything touching shared type definitions or API contracts

---

## Source File Navigation

Always use `metadata.sourceFile` to navigate directly:
```
metadata.sourceFile = "apps/demo/src/App.tsx:193"
→ Read /Users/sajalmishra/Desktop/Pin-point/apps/demo/src/App.tsx at line 193
```

Never use `grep` or `find` — the annotation already tells you where it is.

---

## Final Summary

```
Self-driving session complete.

Fixed N issues:
1. [bug] Short title — what changed (file:line)
2. [improvement] Short title — what changed (file:line)
...

Skipped M issues:
- ...
```
