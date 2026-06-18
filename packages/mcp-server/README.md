# @sajalmishra/markpin-mcp

MCP server for Markpin visual feedback tool. Stores browser annotations and exposes 9 MCP tools your AI coding agent can call to read, acknowledge, fix, and resolve UI feedback.

## Install

```bash
# Run directly (no global install needed)
npx @sajalmishra/markpin-mcp init    # configure Claude Code
npx @sajalmishra/markpin-mcp server  # start the server

# Or install globally
npm install -g @sajalmishra/markpin-mcp
markpin-mcp init
markpin-mcp server
```

## Quick start

```bash
# 1. Add to Claude Code config automatically
markpin-mcp init

# 2. Start the server
markpin-mcp server
# [markpin] HTTP  → http://localhost:4747
# [markpin] MCP   → stdio
# [markpin] Ready — annotate in browser, Claude fixes it.

# 3. Verify everything is working
markpin-mcp doctor
```

Then add the toolbar to your React app:

```bash
npm install @sajalmishra/markpin -D
```

```tsx
import { Pinpoint } from '@sajalmishra/markpin';
// Add <Pinpoint /> to your app — dev only
```

## CLI commands

| Command | Description |
|---------|-------------|
| `markpin-mcp server` | Start the HTTP + MCP server |
| `markpin-mcp init` | Write MCP config to `.mcp.json` in the current directory |
| `markpin-mcp doctor` | Check Node.js version, MCP config, and port availability |

All commands accept `--port PORT` to override the default port (4747).

## Environment variables

| Variable | Description |
|----------|-------------|
| `PINPOINT_PORT` | Override the default port (4747). Lower priority than `--port` flag. |

Example: `PINPOINT_PORT=8080 markpin-mcp server`

## MCP tools

| Tool | Description |
|------|-------------|
| `pinpoint_list_sessions` | List all active sessions and their pending annotation count |
| `pinpoint_get_session` | Get a session with all its annotations |
| `pinpoint_get_pending` | Get unresolved annotations for one session |
| `pinpoint_get_all_pending` | Get all unresolved annotations across all sessions |
| `pinpoint_watch_annotations` | Block until new annotations arrive (for hands-free loops) |
| `pinpoint_acknowledge` | Mark an annotation `in_progress` — turns the marker pin yellow |
| `pinpoint_resolve` | Mark an annotation resolved — marker pin flashes green and disappears |
| `pinpoint_dismiss` | Mark an annotation you won't address, with a reason |
| `pinpoint_reply` | Post a message to the annotation thread |

## REST API

The server also exposes a REST API at `http://localhost:4747`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sessions` | List all sessions |
| `POST` | `/sessions` | Create a session |
| `GET` | `/sessions/:id` | Get one session |
| `DELETE` | `/sessions/:id` | Delete a session |
| `GET` | `/sessions/:id/annotations` | List annotations |
| `POST` | `/sessions/:id/annotations` | Create an annotation |
| `PATCH` | `/sessions/:id/annotations/:annId` | Update annotation status |
| `DELETE` | `/sessions/:id/annotations/:annId` | Delete an annotation |
| `GET` | `/sessions/:id/events` | SSE event stream |

## Requirements

- Node.js 18+

## Full docs

See the [Markpin documentation](https://github.com/pinpoint-dev/pinpoint) for watch mode, critique mode, and agent integration guides.
