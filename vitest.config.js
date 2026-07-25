import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ne collecter que les tests unitaires : les tests d'intégration
    // Playwright (e2e/) sont lancés séparément via `npm run test:e2e`.
    include: ['tests/**/*.test.js'],
  },
});
