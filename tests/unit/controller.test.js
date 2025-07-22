const argon2 = require('argon2');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');

// Set up environment variables
process.env.HASH_SALT = 'test-salt';
process.env.TABLECAPCODE = 'test-table';

// Mock modules
jest.mock('argon2');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('../../config/dynamodb', () => ({
  docClient: {
    send: jest.fn()
  },
  tableName: 'test-table'
}));

const { generateCapcode } = require('../../controllers/capcodeController');
const { docClient } = require('../../config/dynamodb');

describe('Capcode Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('generateCapcode', () => {
    test('should generate capcode successfully', async () => {
      // Mock successful operations
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockResolvedValue({});

      await generateCapcode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Capcode generated and saved successfully',
        data: expect.objectContaining({
          originalNumber: expect.stringMatching(/^\d{7}$/),
          hashedCapcode: '$mocked$hash$value',
          timestamp: expect.any(String)
        })
      });
    });

    test('should hash capcode with correct parameters', async () => {
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockResolvedValue({});

      await generateCapcode(req, res);

      expect(argon2.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{7}$/),
        {
          salt: Buffer.from('test-salt'),
          timeCost: 3,
          memoryCost: 4096,
          parallelism: 1,
          type: argon2.argon2id
        }
      );
    });

    test('should save to database with correct parameters', async () => {
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockResolvedValue({});

      await generateCapcode(req, res);

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'test-table',
        Item: {
          capcode: '$mocked$hash$value',
          timestamp: expect.any(String)
        }
      });
      expect(docClient.send).toHaveBeenCalled();
    });

    test('should handle hashing error', async () => {
      argon2.hash.mockRejectedValue(new Error('Hashing failed'));

      await generateCapcode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to generate capcode',
        error: 'Failed to hash capcode: Hashing failed'
      });
    });

    test('should handle database save error but return generated data', async () => {
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockRejectedValue(new Error('Database error'));

      await generateCapcode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Capcode generated but failed to save to database',
        error: 'Failed to save to database: Database error',
        testData: expect.objectContaining({
          originalNumber: expect.stringMatching(/^\d{7}$/),
          hashedCapcode: '$mocked$hash$value',
          timestamp: expect.any(String)
        })
      });
    });

    test('should use default salt if HASH_SALT not provided', async () => {
      delete process.env.HASH_SALT;
      
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockResolvedValue({});

      await generateCapcode(req, res);

      expect(argon2.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{7}$/),
        expect.objectContaining({
          salt: Buffer.from('defaultsalt')
        })
      );

      // Restore environment variable
      process.env.HASH_SALT = 'test-salt';
    });

    test('should generate 7-digit random number', async () => {
      argon2.hash.mockResolvedValue('$mocked$hash$value');
      docClient.send.mockResolvedValue({});

      await generateCapcode(req, res);

      const response = res.json.mock.calls[0][0];
      const originalNumber = response.data.originalNumber;
      
      expect(originalNumber).toMatch(/^\d{7}$/);
      expect(parseInt(originalNumber)).toBeGreaterThanOrEqual(1000000);
      expect(parseInt(originalNumber)).toBeLessThanOrEqual(9999999);
    });
  });
});