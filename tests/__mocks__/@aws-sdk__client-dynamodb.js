// Mock for @aws-sdk/client-dynamodb
const DynamoDBClient = jest.fn().mockImplementation(() => ({
  config: {},
  region: 'mock-region'
}));

module.exports = {
  DynamoDBClient
};