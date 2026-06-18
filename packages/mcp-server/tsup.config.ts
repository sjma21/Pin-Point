import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    dts: true,
    external: [
      '@modelcontextprotocol/sdk',
      'hono',
      '@hono/node-server',
      'zod',
    ],
    banner: {
      js: '#!/usr/bin/env node',
    },
    target: 'node18',
    clean: true,
    sourcemap: true,
  },
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    external: [
      '@modelcontextprotocol/sdk',
      'hono',
      '@hono/node-server',
      'zod',
    ],
    target: 'node18',
    clean: false,
    sourcemap: true,
  },
]);
