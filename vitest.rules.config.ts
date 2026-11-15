import { defineConfig } from 'vitest/config'

// Rules tests talk to the Firestore emulator over the network, so they run in a
// Node environment and are kept out of the default unit-test run.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
})
