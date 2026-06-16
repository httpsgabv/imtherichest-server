import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '#core': resolve(__dirname, 'src/core'),
      '#domain': resolve(__dirname, 'src/domain'),
      '#infra': resolve(__dirname, 'src/infra'),
      '#common': resolve(__dirname, 'src/common'),
      '#lib': resolve(__dirname, 'src/lib'),
      '#setup': resolve(__dirname, 'src/setup'),
      '#test': resolve(__dirname, 'test'),
      '#generated': resolve(__dirname, 'generated'),
    },
  },
  oxc: false,
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.e2e-spec.ts'],
    setupFiles: ['test/setup-e2e.ts'],
    testTimeout: 30000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
