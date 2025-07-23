const express = require('express');
const request = require('supertest');

// Mock the controller
const mockGenerateCapcode = jest.fn();
jest.mock('../../controllers/capcodeController', () => ({
  generateCapcode: mockGenerateCapcode
}));

const capcodeRoutes = require('../../routes/capcode');

describe('Capcode Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/capcode', capcodeRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/capcode/generate', () => {
    test('should call generateCapcode controller', async () => {
      mockGenerateCapcode.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(200);

      expect(mockGenerateCapcode).toHaveBeenCalledTimes(1);
      // The mock is being called but with additional middleware arguments
      expect(mockGenerateCapcode.mock.calls[0]).toHaveLength(3); // req, res, next
      expect(response.body).toEqual({ success: true });
    });

    test('should handle controller errors', async () => {
      mockGenerateCapcode.mockImplementation((req, res) => {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      });

      const response = await request(app)
        .get('/api/capcode/generate')
        .expect(500);

      expect(mockGenerateCapcode).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });

    test('should not accept POST requests', async () => {
      await request(app)
        .post('/api/capcode/generate')
        .expect(404);

      expect(mockGenerateCapcode).not.toHaveBeenCalled();
    });

    test('should not accept PUT requests', async () => {
      await request(app)
        .put('/api/capcode/generate')
        .expect(404);

      expect(mockGenerateCapcode).not.toHaveBeenCalled();
    });

    test('should not accept DELETE requests', async () => {
      await request(app)
        .delete('/api/capcode/generate')
        .expect(404);

      expect(mockGenerateCapcode).not.toHaveBeenCalled();
    });
  });

  describe('Route module exports', () => {
    test('should export express router', () => {
      expect(capcodeRoutes).toBeDefined();
      expect(typeof capcodeRoutes).toBe('function');
      expect(capcodeRoutes.stack).toBeDefined(); // Express router has a stack property
    });
  });
});