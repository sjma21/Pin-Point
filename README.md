# Pinpoint (Markpin)

Visual feedback for AI coding agents. Click any element in your running app to leave a structured annotation — your agent reads it, finds the source file, and fixes the issue.

**Live demo:** [pin-point-demo.vercel.app](https://pin-point-demo.vercel.app/)

```
┌────────────────────────────────────────────────────────────┐
│  📍 Pinpoint  [3]                                        ⚙  │
│  ● Capture   ⏸  👁  ⧉ Copy  ✕ Clear  ⬜ Layout          │
└────────────────────────────────────────────────────────────┘
```

## Packages on npm

| Package | Description | npm |
|---------|-------------|-----|
| `@sajalmishra/markpin` | React toolbar component | [npm](https://www.npmjs.com/package/@sajalmishra/markpin) |
| `@sajalmishra/markpin-mcp` | MCP server + REST API + SSE | [npm](https://www.npmjs.com/package/@sajalmishra/markpin-mcp) |
| `@sajalmishra/markpin-shared` | Shared AFS types | [npm](https://www.npmjs.com/package/@sajalmishra/markpin-shared) |

## Quick start

**1. Add the toolbar to your app**

```bash
npm install @sajalmishra/markpin -D
```

```tsx
import { Pinpoint } from '@sajalmishra/markpin';

export function App() {
  return (
    <>
      <YourApp />
      {import.meta.env.DEV && <Pinpoint />}
    </>
  );
}
```

**2. Start the MCP server**

```bash
npx @sajalmishra/markpin-mcp init    # configure Claude Code
npx @sajalmishra/markpin-mcp server  # start the server
```

**3. Connect your agent**

Add to `.mcp.json` (or run `markpin-mcp init` to do it automatically):

```json
{
  "mcpServers": {
    "markpin": {
      "command": "npx",
      "args": ["@sajalmishra/markpin-mcp", "server"]
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
  toolbar/      @sajalmishra/markpin        — React toolbar component
  mcp-server/   @sajalmishra/markpin-mcp   — MCP server + REST API + SSE
  shared/       @sajalmishra/markpin-shared — AFS types shared between packages

apps/
  demo/                                     — Docs + demo site
```

## Run locally

```bash
# Install dependencies
pnpm install

# Start the docs/demo app
pnpm dev

# In a separate terminal — start the MCP server
npx @sajalmishra/markpin-mcp server
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
- [`packages/shared`](packages/shared/README.md) — Shared types

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-change`
3. Make your changes, run `pnpm typecheck` to verify TypeScript
4. Open a PR

## License

MIT
