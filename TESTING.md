# Testing Documentation

## Overview
This project has comprehensive test coverage including unit tests and end-to-end tests using Jest and Supertest.

## Test Statistics
- **Total Tests**: 48 tests passing
- **Coverage**: 93.75% statements, 92.3% branches, 88.88% functions, 93.75% lines
- **Test Types**: Unit tests and E2E tests

## Test Structure
```
tests/
├── unit/           # Unit tests for individual modules
│   ├── app.test.js        # Application module tests
│   ├── config.test.js     # Database configuration tests
│   ├── controller.test.js # Controller logic tests
│   ├── edge-cases.test.js # Edge cases and utilities
│   ├── routes.test.js     # Route handler tests
│   └── startup.test.js    # Server startup tests
├── e2e/            # End-to-end integration tests
│   └── app.test.js        # Full application API tests
└── __mocks__/      # Mock files for external dependencies
    ├── @aws-sdk__client-dynamodb.js
    ├── @aws-sdk__lib-dynamodb.js
    └── argon2.js
```

## Running Tests

### All tests
```bash
npm test
```

### Unit tests only
```bash
npm run test:unit
```

### E2E tests only
```bash
npm run test:e2e
```

### With coverage report
```bash
npm run test:coverage
```

### Watch mode
```bash
npm run test:watch
```

## Test Coverage
The project maintains high test coverage with the following thresholds:
- Statements: 90%
- Lines: 90%
- Functions: 85%
- Branches: 85%

## Excluded from Coverage
- `node_modules/`
- `coverage/`
- `jest.config.js`
- `.env.example`
- Test files (`**/*.test.js`, `**/*.spec.js`)

## Mock Strategy
External dependencies are mocked to ensure:
- Tests run without requiring AWS credentials
- Fast test execution
- Deterministic test results
- Isolation of units under test

## Test Categories

### Unit Tests
- **Controller Tests**: Test business logic in isolation
- **Route Tests**: Test route handlers with mocked controllers  
- **Config Tests**: Test configuration modules
- **Edge Case Tests**: Test utilities and edge scenarios

### E2E Tests
- **API Endpoint Tests**: Test full request/response cycles
- **Error Handling Tests**: Test error scenarios end-to-end
- **Integration Tests**: Test component interactions

## Key Test Features
- Comprehensive mocking of AWS SDK
- Isolated testing environment
- Error scenario coverage
- Environment variable testing
- HTTP method validation
- Content-type handling
- 404 error handling
- Middleware testing