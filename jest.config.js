module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'server.js',
    '!node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
};
