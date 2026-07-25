import { defineConfig } from 'vitest/config'

// Les tests unitaires (Vitest) vivent dans lib/ ;
// les tests d'intégration Playwright dans e2e/ (lancés via `npm run test:e2e`).
export default defineConfig({
  test: {
    include: ['lib/**/*.test.js'],
  },
})
