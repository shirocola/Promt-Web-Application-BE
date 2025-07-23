// Mock for @aws-sdk/lib-dynamodb
const mockPutCommand = jest.fn();
const mockSend = jest.fn();

const PutCommand = jest.fn().mockImplementation((params) => {
  mockPutCommand(params);
  return { params };
});

const DynamoDBDocumentClient = {
  from: jest.fn().mockReturnValue({
    send: mockSend
  })
};

module.exports = {
  PutCommand,
  DynamoDBDocumentClient,
  __mocks: {
    putCommand: mockPutCommand,
    send: mockSend
  }
};