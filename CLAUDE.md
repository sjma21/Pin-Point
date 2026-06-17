# Pinpoint — AI Agent Instructions

Pinpoint is a browser annotation tool that lets users click any element on a web page to leave feedback. It has a React toolbar UI injected into the page, an MCP server that stores annotations, and an SSE stream that keeps the toolbar in sync.

The MCP server runs on `http://localhost:4747`. The toolbar is injected into any page that imports `@pinpoint/toolbar`.

The HTTP REST API is also available at `http://localhost:4747` — use it to POST annotations directly when browser control is not available:
```
POST http://localhost:4747/sessions/{sessionId}/annotations
Content-Type: application/json
```

## MCP Tools Reference

| Tool | When to use |
|------|-------------|
| `pinpoint_list_sessions` | Discover which pages have feedback waiting |
| `pinpoint_get_session` | Read all annotations for a specific page |
| `pinpoint_get_pending` | Get unresolved annotations for one session |
| `pinpoint_get_all_pending` | Get all unresolved annotations across all pages |
| `pinpoint_watch_annotations` | Block until new annotations arrive (hands-free loop) |
| `pinpoint_acknowledge` | Mark an annotation `in_progress` — user sees you noticed |
| `pinpoint_resolve` | Mark an annotation resolved after the fix is committed |
| `pinpoint_dismiss` | Mark an annotation you will not address, with a reason |
| `pinpoint_reply` | Post a message to the annotation thread (ask a question) |

Every annotation contains:
- `id` — unique identifier
- `sessionId` — which browser session it belongs to
- `intent` — `bug` | `improvement` | `question` | `praise` | `task` | `note`
- `severity` — `critical` | `high` | `medium` | `low` | `info`
- `status` — `open` | `in_progress` | `resolved` | `dismissed`
- `comment` — human-written description of the issue
- `target.selector` — CSS selector for the targeted element
- `target.url` — page URL
- `target.boundingBox` — pixel coordinates of the element
- `target.textContent` — visible text in the element
- `metadata.sourceFile` — source file path detected from React fiber tree
- `metadata.reactComponents` — React component hierarchy
- `metadata.thread` — array of `{ id, role, content, createdAt }` messages

---

## Mode 1 — Hands-Free (Watch Mode)

**Trigger phrases:** "watch mode", "hands-free mode", "start watching"

When the user says any of these, enter the following loop:

```
LOOP:
  1. Call pinpoint_watch_annotations (blocks until new annotations arrive)
  2. For each annotation in the batch, sort by severity: critical → high → medium → low → info
  3. For each annotation (highest priority first):
     a. Call pinpoint_acknowledge(annotationId)
        → User sees the marker pin turn yellow with an eye icon
     b. Read: intent, severity, comment, target.selector, metadata.sourceFile
     c. If intent === "question":
           Call pinpoint_reply(annotationId, "your clarifying question or answer")
           → Do NOT make code changes, wait for human response
           Continue to next annotation
     d. If intent === "approve" or comment says "looks good" / "approved":
           Call pinpoint_resolve(annotationId, "Approved — no changes needed")
           Continue to next annotation
     e. Use metadata.sourceFile to open the file directly (no searching needed)
     f. Use target.selector to find the exact element in the code
     g. Make the fix described in the comment
     h. Call pinpoint_resolve(annotationId, "Brief summary of what changed")
        → User sees the marker pin flash green then disappear
  4. After processing all annotations, go back to step 1
  5. Continue until user says "stop watching" or you receive no annotations for 5 minutes
```

**Priority order for fixes:** blocking/critical → high → medium → low → suggestion/info

**When to ask vs fix:**
- `question` intent → always reply, never guess
- Design decisions ("which color?", "prefer A or B?") → reply with options, never pick
- `improvement` with clear direction → fix it
- `bug` with clear cause → fix it

---

## Mode 2 — Critique Mode

**Trigger phrases:**
- `"critique [url]"`, `"critique the UI at [url]"`, `"review the UI at [url]"` → browser-based critique
- `"critique my code at [url]"`, `"code review critique [url]"` → code review critique (no browser needed, always works)

When triggered, read and follow `skills/pinpoint-critique.md`.

If no URL is given, use the session URL from `pinpoint_list_sessions`.

**Browser critique** uses `npx agent-browser` bash commands directly (NOT as a Claude Code skill invocation):
```bash
npx agent-browser open <url>         # open the page
npx agent-browser screenshot <path>  # capture visual state
npx agent-browser snapshot           # get DOM tree with element refs (@eN)
npx agent-browser snapshot -i        # interactive elements only (preferred)
npx agent-browser scroll 0 <y>       # scroll down the page
npx agent-browser hover @eN          # hover to register element with capture overlay
npx agent-browser click @eN          # click element (opens annotation popup when in capture mode)
npx agent-browser fill @eN "text"    # type into a field
npx agent-browser close              # close browser when done
```

The Pinpoint annotation flow via agent-browser:
1. Click the **Capture** button in the Pinpoint toolbar → enters capture mode
2. `hover @eN` over the target element → capture overlay registers which element is underneath
3. `click @eN` → capture overlay intercepts, opens annotation popup
4. Click intent chip, severity chip, fill textarea, click **✓ Add**

**Code review critique** (no browser needed):
1. Read the source files of the running app
2. Identify issues from the code: missing a11y attrs, inconsistent spacing, hardcoded colors, missing hover/focus states, contrast problems, broken mobile layout, missing empty/loading states
3. For each issue, POST to `http://localhost:4747/sessions/{sessionId}/annotations` with a properly-formed annotation object (see REST API section above)
4. Call `pinpoint_get_all_pending` to confirm annotations arrived
5. Print the critique summary

**Annotation style for both critique approaches:**
- Be specific: "The `h2` heading on the pricing card has `font-size: 14px`, smaller than the body text at `16px`" not "text is too small"
- Reference the exact element and its CSS selector
- Choose `improvement` for suggestions, `bug` for broken things, `question` for unclear UX choices
- Add 5–10 annotations covering different parts of the page hierarchy

---

## Mode 3 — Self-Driving Mode

**Trigger phrases:** `"self-driving mode on [url]"`, `"self-driving mode"`, `"fix the UI automatically"`

Uses `npx agent-browser` bash commands directly. When triggered, read and follow `skills/pinpoint-self-driving.md`.

**The 4-step loop per issue:**
1. **Annotate** — `npx agent-browser` to click through the Pinpoint toolbar and add an annotation
2. **Fix** — call `pinpoint_get_pending`, acknowledge, fix the code
3. **Verify** — `npx agent-browser screenshot` after hot reload to confirm the fix looks right
4. **Resolve** — call `pinpoint_resolve` with a summary

**When to skip (use `pinpoint_reply` instead):**
- Anything requiring a design decision ("which font?", "what color?")
- Changes that touch more than 3 files
- Changes to authentication, payments, or data persistence logic
- Anything involving API contracts or shared types

---

## General Rules

1. **Always acknowledge before fixing** — call `pinpoint_acknowledge` first so the user sees you noticed
2. **Always resolve after fixing** — call `pinpoint_resolve` with a meaningful summary, not "fixed"
3. **Never guess on design decisions** — call `pinpoint_reply` to ask
4. **Process critical/blocking before important before suggestion** — respect severity ordering
5. **Use source file paths to navigate directly** — `metadata.sourceFile` gives you the exact file
6. **Use CSS selector to locate the element** — `target.selector` is more reliable than searching
7. **After resolving, check for more pending** — call `pinpoint_get_all_pending` before stopping
8. **Never make destructive changes** — no deleting files, dropping tables, or removing auth
9. **If a fix would break TypeScript types**, fix the types too — don't cast with `as any`
10. **Prefer small targeted fixes** — one annotation = one focused change, not a refactor

---

## Keyboard Shortcuts (toolbar)

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+Shift+F` | Toggle capture mode |
| `Esc` | Close popup / exit mode |
| `P` | Pause/resume animations |
| `H` | Toggle marker visibility |
| `C` | Copy annotations as markdown |
| `X` | Clear all annotations |
| `L` | Toggle layout mode |
