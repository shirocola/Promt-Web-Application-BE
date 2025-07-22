const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Create DynamoDB client
const dynamoDBClient = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create DynamoDB Document client for easier operations
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

module.exports = {
  docClient,
  tableName: process.env.TABLECAPCODE,
};