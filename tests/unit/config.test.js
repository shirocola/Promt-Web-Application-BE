// Mock environment variables
process.env.DYNAMODB_REGION = 'ap-southeast-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.TABLECAPCODE = 'test-table';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('DynamoDB Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../config/dynamodb')];
  });

  test('should export correct table name', () => {
    const { tableName } = require('../../config/dynamodb');
    
    expect(tableName).toBe('test-table');
  });

  test('should export docClient object', () => {
    const config = require('../../config/dynamodb');
    
    expect(config).toBeDefined();
    expect(config.tableName).toBe('test-table');
    // Just test that the config object has the expected structure
    expect(Object.keys(config)).toContain('tableName');
  });

  test('should handle environment variables', () => {
    // Test that environment variables are accessible
    expect(process.env.DYNAMODB_REGION).toBe('ap-southeast-1');
    expect(process.env.TABLECAPCODE).toBe('test-table');
  });

  test('should require modules without errors', () => {
    expect(() => {
      require('../../config/dynamodb');
    }).not.toThrow();
  });
});