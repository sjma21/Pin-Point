# @sajalmishra/markpin-shared

Shared TypeScript types and utilities for the Markpin visual feedback tool.

## What is this

This is the internal types package used by both [`@sajalmishra/markpin`](https://www.npmjs.com/package/@sajalmishra/markpin) (the React toolbar) and [`@sajalmishra/markpin-mcp`](https://www.npmjs.com/package/@sajalmishra/markpin-mcp) (the MCP server). It contains the full **AFS (Annotation Format Schema)** — the TypeScript type definitions that describe how annotations, sessions, and events are structured across the entire Markpin system.

## When to use this directly

Most users do **not** need to install this package. It is bundled into `@sajalmishra/markpin` and `@sajalmishra/markpin-mcp` at build time, so both packages are self-contained.

Install this directly only if you are building a **custom integration** with the Markpin REST API or SSE stream and need the TypeScript types in your own code — for example, a custom dashboard that reads annotations, or a server-side script that POSTs annotations programmatically.

## Install

```bash
npm install @sajalmishra/markpin-shared
# or
pnpm add @sajalmishra/markpin-shared
```

## What is included

### Core annotation types

| Type | Description |
|------|-------------|
| `Annotation` | The complete annotation object — all AFS fields combined |
| `AnnotationTarget` | Element selector, bounding box, URL, and viewport info |
| `AnnotationMetadata` | Arbitrary key/value pairs attached to an annotation |

### Session types

| Type | Description |
|------|-------------|
| `Session` | A browser session containing an array of annotations |

### Event types

| Type | Description |
|------|-------------|
| `AFSEvent` | Union type of all possible SSE events |
| `AFSEventType` | Enum of all event type strings (e.g. `annotation.created`) |

### Enums

| Enum | Values |
|------|--------|
| `AnnotationStatus` | `open` · `in_progress` · `resolved` · `dismissed` · `wont_fix` |
| `AnnotationIntent` | `bug` · `improvement` · `question` · `praise` · `task` · `note` |
| `AnnotationSeverity` | `critical` · `high` · `medium` · `low` · `info` |
| `AnnotationKind` | `element` · `region` · `page` · `freeform` · `placement` · `rearrange` |
| `SessionStatus` | `active` · `paused` · `ended` |
| `OutputFormat` | `json` · `markdown` · `xml` |

### Toolbar types

| Type | Description |
|------|-------------|
| `ToolbarSettings` | Theme, position, server URL, and default intent/severity |
| `ToolbarState` | Current session ID, annotation list, capture mode, and error state |

## Usage example

```ts
import type { Annotation } from '@sajalmishra/markpin-shared';
import { AnnotationStatus, AnnotationIntent } from '@sajalmishra/markpin-shared';

// Type a function that processes incoming annotations
function handleAnnotation(ann: Annotation): void {
  if (ann.intent === AnnotationIntent.Bug && ann.status === AnnotationStatus.Open) {
    console.log(`Bug at ${ann.target.selector}: ${ann.comment}`);
  }
}

// Type-safe status check
function isPending(ann: Annotation): boolean {
  return ann.status === AnnotationStatus.Open || ann.status === AnnotationStatus.InProgress;
}
```

## Links

- **Toolbar:** [`@sajalmishra/markpin`](https://www.npmjs.com/package/@sajalmishra/markpin) — React component, install into your dev app
- **MCP server:** [`@sajalmishra/markpin-mcp`](https://www.npmjs.com/package/@sajalmishra/markpin-mcp) — run alongside your agent
- **Documentation:** [github.com/pinpoint-dev/pinpoint](https://github.com/pinpoint-dev/pinpoint)

## License

MIT
