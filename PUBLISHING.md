# Publishing Guide

This document explains how to publish the `@sajalmishra/markpin` and `@sajalmishra/markpin-mcp` npm packages.

## Packages

| Package | npm name | Directory |
|---------|----------|-----------|
| React toolbar | `@sajalmishra/markpin` | `packages/toolbar` |
| MCP server | `@sajalmishra/markpin-mcp` | `packages/mcp-server` |

`@pinpoint/shared` is an internal workspace package — it is bundled into each published package and never published separately.

---

## Publishing a new version

### 1. Update versions

Edit both package.json files to bump the version:

```bash
# packages/toolbar/package.json
# packages/mcp-server/package.json
```

Follow the versioning policy below. Both packages should use the same version number.

### 2. Build both packages

```bash
pnpm build
```

This runs `tsup` in each package, outputting to `dist/`.

### 3. Verify types

```bash
pnpm typecheck
```

Fix any TypeScript errors before continuing.

### 4. Publish toolbar

```bash
cd packages/toolbar
npm publish
```

### 5. Publish MCP server

```bash
cd packages/mcp-server
npm publish
```

---

## Testing locally before publishing

### Inspect what gets published

```bash
cd packages/toolbar
npm pack --dry-run
# or create a tarball:
npm pack
```

Check the tarball contents — only `dist/` and `README.md` should be included (controlled by `"files"` in package.json).

### Test in another local project

```bash
# In packages/toolbar
npm link

# In your test project
npm link pinpoint
```

### Checklist

- [ ] Does `<Pinpoint />` render without errors?
- [ ] Does `markpin-mcp server` start correctly?
- [ ] Do TypeScript types resolve in the test project?
- [ ] Does `dist/cli.js` start with `#!/usr/bin/env node`?
- [ ] Does `npx @sajalmishra/markpin-mcp doctor` pass all checks?

---

## Versioning policy

| Type | When | Example |
|------|------|---------|
| Patch `0.1.x` | Bug fixes, no API changes | `0.1.0` → `0.1.1` |
| Minor `0.x.0` | New features, backwards compatible | `0.1.0` → `0.2.0` |
| Major `x.0.0` | Breaking API changes | `0.1.0` → `1.0.0` |

---

## Notes

- Both packages use `"prepublishOnly"` scripts that run build + typecheck automatically before `npm publish`.
- The toolbar bundles `@pinpoint/shared` at build time — end users do not need to install it separately.
- The mcp-server also bundles `@pinpoint/shared` — the only runtime dependencies are the packages listed in `dependencies` (hono, @hono/node-server, @modelcontextprotocol/sdk, zod).
