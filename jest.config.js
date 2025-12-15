module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // testMatch: ['**/userServiceTest.ts', '**/authServiceTest.ts', '**/transactionServiceTest.ts', '**/summarizerServiceTest.ts'],
  testMatch: ['**/tests/*.ts'],

// collectCoverageFrom: ['src/services/userService.ts','src/services/authService.ts', 'src/services/transactionService.ts', 'src/services/summarizerService.ts'],
collectCoverageFrom: ['src/services/*.ts', 'src/controllers/*.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
  collectCoverage: true,
};
