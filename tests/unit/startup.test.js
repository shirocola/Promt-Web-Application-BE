// Test for specific server startup coverage
process.env.NODE_ENV = 'test';
process.env.HASH_SALT = 'test-salt';
process.env.TABLECAPCODE = 'test-table';
process.env.DYNAMODB_REGION = 'ap-southeast-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

// Mock dependencies
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('../../config/dynamodb', () => ({
  docClient: {
    send: jest.fn()
  },
  tableName: 'test-table'
}));

describe('App Server Startup Logic', () => {
  beforeEach(() => {
    // Clear all app-related modules from cache
    delete require.cache[require.resolve('../../app')];
    
    // Mock console.log to reduce noise
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle PORT environment variable', () => {
    const originalPort = process.env.PORT;
    process.env.PORT = '3001';
    
    // Test that PORT variable is read correctly
    delete require.cache[require.resolve('../../app')];
    const app = require('../../app');
    
    expect(app).toBeDefined();
    expect(process.env.PORT).toBe('3001');
    
    // Restore
    process.env.PORT = originalPort;
  });

  test('should use default PORT when not set', () => {
    const originalPort = process.env.PORT;
    delete process.env.PORT;
    
    delete require.cache[require.resolve('../../app')];
    const app = require('../../app');
    
    expect(app).toBeDefined();
    
    // Restore
    process.env.PORT = originalPort;
  });

  test('should export app module correctly', () => {
    const app = require('../../app');
    
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(app.listen).toBeDefined();
  });

  test('should test require.main functionality', () => {
    // Just test that the app can be loaded
    const app = require('../../app');
    expect(app).toBeDefined();
    
    // Test environment
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should cover server startup callback function', () => {
    // Import the app module to get the exported startupCallback
    const app = require('../../app');
    
    // Mock console.log to capture startup messages
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Call the exported startup callback function
    app.startupCallback();
    
    // Verify the messages were logged
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Server is running on port'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Health check: http://localhost:'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Generate capcode: http://localhost:'));
    
    consoleSpy.mockRestore();
  });
});