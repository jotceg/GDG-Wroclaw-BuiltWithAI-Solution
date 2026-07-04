module.exports = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // Unit target: exclude anything that needs live infra (Postgres/Ollama/MCP).
  // Integration specs (*.integration.spec.ts) run via the separate `test-integration`
  // target (jest.integration.config.cts) so `nx test backend` is green without infra.
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
  coverageDirectory: '../../coverage/apps/backend'
};
