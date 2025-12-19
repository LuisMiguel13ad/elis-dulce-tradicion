module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.{js,ts}', '**/?(*.)+(spec|test).{js,ts}'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'routes/**/*.{js,ts}',
    'middleware/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  testTimeout: 10000,
};
