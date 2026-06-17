# @pinpoint/mcp-server

The Pinpoint MCP server stores browser annotations and exposes 9 MCP tools your AI coding agent can call to read, acknowledge, fix, and resolve UI feedback.

## Install & run

```bash
# Run directly (no install needed)
npx pinpoint server

# Or install globally
npm install -g @pinpoint/mcp-server
pinpoint server

# Custom port
pinpoint server --port 4747
```

The server starts at `http://localhost:4747`.

## Connect to Claude Code

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

## Hands-free mode

Add this to your `CLAUDE.md` to enable watch-mode:

```markdown
When the user says "watch mode":
1. Call pinpoint_watch_annotations (blocks until annotations arrive)
2. For each annotation: call pinpoint_acknowledge
3. Read metadata.sourceFile to find the file
4. Fix the issue described in the comment
5. Call pinpoint_resolve with a summary of what changed
6. Repeat
```

## REST API

The server also exposes a REST API at `http://localhost:4747`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/sessions` | List all sessions |
| `GET` | `/sessions/:id` | Get one session |
| `POST` | `/sessions` | Create a session |
| `DELETE` | `/sessions/:id` | Delete a session |
| `GET` | `/sessions/:id/annotations` | List annotations |
| `POST` | `/sessions/:id/annotations` | Create an annotation |
| `PATCH` | `/sessions/:id/annotations/:annId` | Update annotation status |
| `DELETE` | `/sessions/:id/annotations/:annId` | Delete an annotation |
| `GET` | `/sessions/:id/events` | SSE event stream |

## Requirements

- Node.js 18+
