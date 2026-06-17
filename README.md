# Pinpoint

Visual feedback for AI coding agents. Click any element in your running app to leave a structured annotation — your agent reads it, finds the source file, and fixes the issue.

```
┌────────────────────────────────────────────────────────────┐
│  📍 Pinpoint  [3]                                        ⚙  │
│  ● Capture   ⏸  👁  ⧉ Copy  ✕ Clear  ⬜ Layout          │
└────────────────────────────────────────────────────────────┘
```

## Quick start

**1. Add the toolbar to your app**

```bash
npm install @pinpoint/toolbar
```

```tsx
import { Pinpoint } from '@pinpoint/toolbar';

export function App() {
  return (
    <>
      <YourApp />
      {import.meta.env.DEV && <Pinpoint endpoint="http://localhost:4747" />}
    </>
  );
}
```

**2. Start the MCP server**

```bash
npx pinpoint server
```

**3. Connect your agent**

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "pinpoint": {
      "command": "npx",
      "args": ["pinpoint", "server"]
    }
  }
}
```

Then tell your agent: **"watch mode"** — it will wait for annotations and fix them automatically.

## How it works

1. Click **Capture** in the Pinpoint toolbar → cursor becomes a crosshair
2. Click any element → a popup opens with intent, severity, and comment fields
3. Submit the annotation → it's POSTed to the MCP server
4. Your agent calls `pinpoint_get_pending` and gets the CSS selector, React component tree, source file path, and bounding box
5. The agent fixes the code and calls `pinpoint_resolve` → the marker pin disappears

## Monorepo structure

```
packages/
  toolbar/      @pinpoint/toolbar    — React toolbar component
  mcp-server/   @pinpoint/mcp-server — MCP server + REST API + SSE
  shared/       @pinpoint/shared     — AFS types shared between packages

apps/
  demo/                              — Docs site (this README's sibling)
```

## Run locally

```bash
# Install dependencies
pnpm install

# Start the docs/demo app
pnpm dev

# In a separate terminal — start the MCP server
npx pinpoint server
```

The demo app runs at `http://localhost:5173`. The MCP server runs at `http://localhost:4747`.

## Agent modes

| Command | What happens |
|---------|--------------|
| `"watch mode"` | Agent enters a watch loop — fixes each annotation as it arrives |
| `"critique the UI at localhost:5173"` | Agent reads source code and posts 5–10 specific annotations |
| `"self-driving mode on localhost:5173"` | Agent finds issues, annotates, fixes, verifies, resolves — fully autonomous |

## Packages

- [`packages/toolbar`](packages/toolbar/README.md) — React toolbar component
- [`packages/mcp-server`](packages/mcp-server/README.md) — MCP server with 9 tools

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-change`
3. Make your changes, run `pnpm typecheck` to verify TypeScript
4. Open a PR

## License

MIT
