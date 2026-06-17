# @pinpoint/toolbar

A React toolbar that lets you click any element on your dev app to leave structured feedback. Annotations are sent to the Pinpoint MCP server so your AI coding agent can read them, find the source file, and fix the issue.

## Install

```bash
npm install @pinpoint/toolbar
# or
pnpm add @pinpoint/toolbar
```

## Usage

```tsx
import { Pinpoint } from '@pinpoint/toolbar';

export function App() {
  return (
    <>
      <YourApp />

      {/* Dev only — never ships to production */}
      {import.meta.env.DEV && (
        <Pinpoint endpoint="http://localhost:4747" />
      )}
    </>
  );
}
```

The toolbar renders into a portal at the bottom of `<body>` so it won't affect your app's layout.

### Next.js

```tsx
// app/layout.tsx
import dynamic from 'next/dynamic';

const Pinpoint = dynamic(
  () => import('@pinpoint/toolbar').then(m => m.Pinpoint),
  { ssr: false }
);

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <Pinpoint endpoint="http://localhost:4747" />
      )}
    </body></html>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `endpoint` | `string` | MCP server URL. Required for agent sync. |
| `sessionId` | `string` | Override the session ID (auto-generated if omitted). |
| `onAnnotationAdd` | `(ann: Annotation) => void` | Called when an annotation is created. |
| `onAnnotationDelete` | `(ann: Annotation) => void` | Called when an annotation is deleted. |
| `onAnnotationsClear` | `() => void` | Called when all annotations are cleared. |
| `onCopy` | `(markdown: string) => void` | Called when annotations are copied as markdown. |
| `onSessionCreated` | `(sessionId: string) => void` | Called when the session is established. |

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

## Requirements

- React 18+
- Development build with source maps (for source file detection)

## Full docs

See [the full documentation](http://localhost:5173) when running the demo locally.
