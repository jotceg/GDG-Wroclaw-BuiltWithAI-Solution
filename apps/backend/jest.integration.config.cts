/**
 * Integration test config for the backend.
 *
 * Runs ONLY *.integration.spec.ts files, which require live infrastructure:
 *   - Postgres  (DB_* in root .env)          -> models + pipeline persistence
 *   - Ollama    (OLLAMA_BASE_URL)            -> LLM fallback behaviour
 *   - MCP daemon (MCP_SERVER_URL, :8123)     -> pytriz / agent tools
 *
 * Invoke with:  npx nx test-integration backend
 * These are intentionally separate from `nx test backend` (unit) so the unit
 * suite stays green on machines/CI without infra.
 */
module.exports = {
  displayName: 'backend-integration',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['<rootDir>/src/**/*.integration.spec.ts'],
  coverageDirectory: '../../coverage/apps/backend-integration',
};
