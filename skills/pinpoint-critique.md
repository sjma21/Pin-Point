# Skill: Pinpoint Critique Mode

You are reviewing a live web application's UI using the Pinpoint annotation system. Your job is to systematically examine the page and add between 5 and 10 specific, actionable annotations covering different aspects and different parts of the page.

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
```

Do NOT proceed if the check fails.

---

## Browser Flow

### Step 1 — Discover the session

Call `pinpoint_list_sessions` to get the active session ID and page URL. Note the session ID — you will need it later.

### Step 2 — Open the page and survey it

```bash
npx agent-browser open http://localhost:5173   # or whatever URL was given
npx agent-browser screenshot /tmp/critique-full.png
npx agent-browser snapshot                     # full DOM tree to see page structure
```

Read the screenshot and snapshot together to understand the page layout before annotating.

### Step 3 — Systematic Review (top to bottom)

Work through the page **from top to bottom**, pausing at each major section.

For each section, evaluate these dimensions:

**1. Visual Hierarchy**
- Are heading levels (`h1`, `h2`, `h3`) sized proportionally?
- Is the most important content visually prominent?
- Are font weights used consistently to show importance?

**2. Spacing & Layout**
- Are padding and margins consistent across similar elements?
- Are elements properly aligned (left edges, baselines)?
- Is there enough breathing room, or is content cramped?

**3. Typography**
- Are font sizes appropriate (body ≥ 14px, captions ≥ 11px)?
- Are line heights comfortable (body: 1.4–1.7)?
- Is there enough contrast between text and background?

**4. Color & Contrast**
- Does text meet WCAG AA contrast ratio (4.5:1 for normal text)?
- Are colors used consistently (same role = same color)?
- Are interactive elements visually distinct from static content?

**5. Navigation & CTAs**
- Are primary actions obvious and easy to find?
- Do buttons have visible hover and focus states?
- Are links distinguishable from regular text?

**6. Responsiveness**
- Are there fixed widths that might cause overflow on small screens?
- Are touch targets at least 44×44px?
- Is the mobile menu wired up?

**7. Empty & Edge States**
- Are loading/error states handled?
- What happens when there is no data?

### Step 4 — Add Annotations by Clicking Through the Pinpoint Toolbar

For each issue found, follow this exact sequence:

#### 4a — Enter capture mode (do this once at the start)

```bash
npx agent-browser snapshot -i           # find the Capture button ref in the Pinpoint toolbar
# Look for: button "Capture" — note its ref, e.g. @e4
npx agent-browser click @e4             # click Capture → toolbar enters capture mode (cursor turns crosshair)
```

#### 4b — Annotate each element (repeat for each issue)

```bash
# 1. Hover over the target element to register it with the capture overlay
npx agent-browser hover @eN             # replace @eN with the target element's ref

# 2. Click the element — the capture overlay intercepts this click and opens the annotation popup
npx agent-browser click @eN

# 3. Confirm the popup opened
npx agent-browser snapshot -i           # look for intent buttons: Bug, Improvement, Question, etc.

# 4. Select intent — click the appropriate chip
npx agent-browser click @e_bug          # or @e_improvement, @e_question, etc.

# 5. Select severity — click the appropriate chip
npx agent-browser click @e_high        # or @e_medium, @e_low, @e_critical, @e_info

# 6. Type the comment in the textarea
npx agent-browser fill @e_textarea "Describe the issue…"
# The textarea has placeholder "Describe the issue or feedback…" — find it in the snapshot

# 7. Submit the annotation
npx agent-browser click @e_add          # look for button "✓ Add" in the popup footer

# 8. Re-snapshot — popup is gone, capture mode is still active for the next element
npx agent-browser snapshot -i
```

> **Important:** Refs go stale after every page change. Always re-snapshot after each popup closes before identifying the next element's ref.

> **If the popup does not open:** hover over the element first (`npx agent-browser hover @eN`), wait briefly, then click. The capture overlay needs the mousemove event to register which element is underneath before the click.

### Step 5 — Exit capture mode and confirm annotations

```bash
# Click Capture again to exit capture mode
npx agent-browser snapshot -i           # find Capture button ref again
npx agent-browser click @e_capture      # toggles back to idle

npx agent-browser close
```

Then call `pinpoint_get_pending` with the session ID to verify all annotations arrived and print the summary.

---

## Code Review Flow (no browser needed — triggered by "critique my code at [url]")

This flow reads source files to identify issues. It is often more accurate than browser clicking because it can inspect exact CSS values, find missing accessibility attributes, and spot hardcoded values that should use design tokens.

### Step 1 — Discover the session

Call `pinpoint_list_sessions` to get the active session ID and URL.

### Step 2 — Read the source files

Find and read:
- `src/App.tsx` (or equivalent entry point)
- `src/index.css` (global styles / design tokens)
- Any component files referenced in the main file

### Step 3 — Identify issues

Systematically review for:
- Missing `border-radius`, inconsistent `padding` between similar elements
- Hardcoded colors that should reference CSS variables / design tokens
- Buttons or links with no `:hover`, `:focus`, or `:focus-visible` states
- Text contrast issues (approximate contrast ratio from hex values)
- Missing `aria-label` on icon-only buttons, missing `alt` on images
- Mobile menu hardcoded as `display:none` with no media query
- Empty states that show nothing when a list has no data
- Missing loading/error states
- Font sizes below 14px for body text, below 11px for captions

Cover **different parts** of the page and **different dimensions** (not all typography).

### Step 4 — POST annotations via REST API

```bash
curl -s -X POST http://localhost:4747/sessions/{sessionId}/annotations \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ann_crit_{unique_suffix}",
    "kind": "element",
    "intent": "improvement",
    "severity": "medium",
    "status": "open",
    "comment": "Specific, actionable description",
    "target": {
      "selector": "css selector from source",
      "url": "http://localhost:5173/",
      "textContent": "visible text of the element",
      "boundingBox": { "x": 0, "y": 0, "width": 0, "height": 0 },
      "viewport": { "width": 1470, "height": 798 }
    },
    "metadata": {
      "reactComponents": "App > ComponentName",
      "sourceFile": "/absolute/path/to/file.tsx:lineNumber"
    }
  }'
```

After all annotations are posted, call `pinpoint_get_all_pending` to confirm they arrived.

---

## Comment Format (both flows)

Good: "The `Save Changes` button (`button.save-btn`) has no visible focus ring — keyboard users cannot tell which element is focused. Add `outline: 2px solid currentColor; outline-offset: 2px` to the `:focus-visible` state."

Bad: "Button looks wrong."

Good: "The pricing heading (`h2.pricing-title`) uses `font-size: 13px`, smaller than the surrounding body text at `16px`. Increase to at least `20px` to establish clear hierarchy."

Bad: "Font size is too small."

---

## Coverage Requirements

Your 5–10 annotations must cover **different parts of the page** and **different dimensions**. Aim for:
- At least 1 annotation in the hero/above-fold area
- At least 1 annotation in a navigation element (header nav, sidebar, or footer)
- At least 1 annotation about color/contrast
- At least 1 annotation about spacing
- At least 1 annotation about a CTA or interactive element

---

## Final Summary Format

```
Critique complete. Found N issues:
- [bug] <short title> (severity)
- [improvement] <short title> (severity)
...

Review these in the Pinpoint toolbar and decide what to act on.
```

Do **not** fix any issues in critique mode — your job is to annotate, not to change code.
