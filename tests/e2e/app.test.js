const request = require('supertest');

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random available port
process.env.HASH_SALT = 'test-salt';
process.env.TABLECAPCODE = 'test-table';
process.env.DYNAMODB_REGION = 'ap-southeast-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

// Mock AWS SDK before importing app
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('argon2');

const argon2 = require('argon2');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');

// Mock DynamoDB client
const mockSend = jest.fn();
jest.mock('../../config/dynamodb', () => ({
  docClient: {
    send: mockSend
  },
  tableName: 'test-table'
}));

const app = require('../../app');

describe('E2E Tests - Application', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        success: true,
        message: 'Server is running',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        success: true,
        message: 'Capcode API Server',
        endpoints: {
          health: '/health',
          generateCapcode: '/api/capcode/generate'
        }
      });
    });
  });

  describe('Capcode Generation Endpoint', () => {
    test('GET /api/capcode/generate should generate capcode successfully', async () => {
      // Mock successful operations
      argon2.hash.mockResolvedValue('$hashed$capcode$value');
      mockSend.mockResolvedValue({});

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Capcode generated and saved successfully',
        data: {
          originalNumber: expect.stringMatching(/^\d{7}$/),
          hashedCapcode: '$hashed$capcode$value',
          timestamp: expect.any(String)
        }
      });
    });

    test('GET /api/capcode/generate should handle database errors gracefully', async () => {
      // Mock hash success but database failure
      argon2.hash.mockResolvedValue('$hashed$capcode$value');
      mockSend.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Capcode generated but failed to save to database',
        error: 'Failed to save to database: Database connection failed',
        testData: {
          originalNumber: expect.stringMatching(/^\d{7}$/),
          hashedCapcode: '$hashed$capcode$value',
          timestamp: expect.any(String)
        }
      });
    });

    test('GET /api/capcode/generate should handle hashing errors', async () => {
      // Mock hash failure
      argon2.hash.mockRejectedValue(new Error('Hashing failed'));

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to generate capcode',
        error: 'Failed to hash capcode: Hashing failed'
      });
    });
  });

  describe('404 Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        success: false,
        message: 'Route not found'
      });
    });

    test('should return 404 for POST to non-POST routes', async () => {
      const response = await request(app)
        .post('/health')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        success: false,
        message: 'Route not found'
      });
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle application errors in development', async () => {
      // Temporarily set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Force an error by mocking console.error to prevent noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock a controller that throws an error
      argon2.hash.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to generate capcode'
      });

      // Restore
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('Content-Type Handling', () => {
    test('should handle JSON requests properly', async () => {
      argon2.hash.mockResolvedValue('$hashed$capcode$value');
      mockSend.mockResolvedValue({});

      const response = await request(app)
        .get('/api/capcode/generate')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
    });
  });

  describe('HTTP Methods', () => {
    test('should only allow GET for capcode generation', async () => {
      // Test unsupported methods
      await request(app).post('/api/capcode/generate').expect(404);
      await request(app).put('/api/capcode/generate').expect(404);
      await request(app).delete('/api/capcode/generate').expect(404);
      await request(app).patch('/api/capcode/generate').expect(404);
    });
  });
});