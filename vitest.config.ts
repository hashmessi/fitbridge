import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'backend', 'mobile'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['components/**', 'services/**'],
      exclude: ['**/*.d.ts', '**/*.test.*'],
    },
  },
});


