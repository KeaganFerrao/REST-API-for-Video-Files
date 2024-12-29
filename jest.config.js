module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/src/**/*.test.ts'],
  moduleDirectories: ['node_modules', 'dist'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '\\.js$',
  ],
  testTimeout: 120000
};
