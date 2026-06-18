import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      // Resolve workspace packages from TypeScript source — no pre-build needed
      '@sajalmishra/markpin': resolve(__dirname, '../../packages/toolbar/src/index.ts'),
      '@sajalmishra/markpin-shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
