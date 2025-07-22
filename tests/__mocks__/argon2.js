// Mock for argon2
const argon2 = {
  hash: jest.fn().mockResolvedValue('$mocked$hash$value'),
  verify: jest.fn().mockResolvedValue(true),
  argon2id: 'mock-argon2id'
};

module.exports = argon2;