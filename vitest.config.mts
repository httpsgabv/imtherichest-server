import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
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
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    exclude: ['**/*.e2e-spec.ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
