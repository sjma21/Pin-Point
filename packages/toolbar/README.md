# @sajalmishra/markpin

Visual feedback tool for AI coding agents. Click any element on your dev app to leave structured annotations — bugs, improvements, questions. Your AI agent reads them via MCP and fixes the code directly.

## Install

```bash
npm install @sajalmishra/markpin -D
# or
pnpm add @sajalmishra/markpin -D
# or
yarn add @sajalmishra/markpin --dev
```

> **Requirements:** React 18+, development builds only (never ship to production)

## Quick start

```tsx
// src/App.tsx
import { Pinpoint } from '@sajalmishra/markpin';

export function App() {
  return (
    <>
      <MyRoutes />

      {/* Dev only — never ships to production */}
      {import.meta.env.DEV && (
        <Pinpoint />
      )}
    </>
  );
}
```

The toolbar renders into a portal at the bottom of `<body>` so it won't affect your app's layout or styles.

You also need the MCP server running so your agent can read the annotations:

```bash
npx @sajalmishra/markpin-mcp server
```

## Next.js

```tsx
// app/layout.tsx
import dynamic from 'next/dynamic';

const Pinpoint = dynamic(
  () => import('@sajalmishra/markpin').then(m => m.Pinpoint),
  { ssr: false }
);

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <Pinpoint />
      )}
    </body></html>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `endpoint` | `string` | `"http://localhost:4747"` | MCP server URL. Override if you changed the port. |
| `sessionId` | `string` | auto | Override the session ID (auto-generated if omitted). |
| `onAnnotationAdd` | `(ann: Annotation) => void` | — | Called when an annotation is created. |
| `onAnnotationDelete` | `(ann: Annotation) => void` | — | Called when an annotation is deleted. |
| `onAnnotationsClear` | `() => void` | — | Called when all annotations are cleared. |
| `onCopy` | `(markdown: string) => void` | — | Called when annotations are copied as markdown. |
| `onSessionCreated` | `(sessionId: string) => void` | — | Called once when the session is established. |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+Shift+F` | Toggle capture mode |
| `Esc` | Close popup / exit current mode |
| `P` | Pause / resume CSS animations |
| `H` | Toggle marker pin visibility |
| `C` | Copy annotations as markdown |
| `X` | Clear all annotations |
| `L` | Toggle layout mode |

## Changing the port

If you start the MCP server on a different port, pass it explicitly:

```tsx
<Pinpoint endpoint="http://localhost:8080" />
```

On the server side: `markpin-mcp server --port 8080` or `PINPOINT_PORT=8080 markpin-mcp server`.

## Full docs

See the [Markpin documentation](https://github.com/pinpoint-dev/pinpoint) for guides on watch mode, critique mode, and all MCP tools.
