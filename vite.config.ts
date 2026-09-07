import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/sing-read-play/',
  build: { target: 'es2022' },
  test: { environment: 'node', include: ['src/**/*.test.ts'], passWithNoTests: true },
});
