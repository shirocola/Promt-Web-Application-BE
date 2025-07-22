const argon2 = require('argon2');
const { docClient, tableName } = require('../config/dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Generate a random 7-digit number
const generateRandomNumber = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Hash the capcode using argon2
const hashCapcode = async (capcode) => {
  try {
    const hash = await argon2.hash(capcode, {
      salt: Buffer.from(process.env.HASH_SALT || 'defaultsalt'),
      timeCost: 3,
      memoryCost: 4096,
      parallelism: 1,
      type: argon2.argon2id,
    });
    return hash;
  } catch (error) {
    throw new Error('Failed to hash capcode: ' + error.message);
  }
};

// Save hashed capcode to DynamoDB
const saveToDatabase = async (hashedCapcode) => {
  try {
    const params = {
      TableName: tableName,
      Item: {
        capcode: hashedCapcode,
        timestamp: new Date().toISOString(),
      },
    };

    await docClient.send(new PutCommand(params));
    return true;
  } catch (error) {
    throw new Error('Failed to save to database: ' + error.message);
  }
};

// Main controller function to generate capcode
const generateCapcode = async (req, res) => {
  let randomNumber, hashedCapcode;
  
  try {
    // Step 1: Generate random 7-digit number
    randomNumber = generateRandomNumber();
    console.log('Generated random number:', randomNumber);
    
    // Step 2: Hash the capcode using argon2
    hashedCapcode = await hashCapcode(randomNumber);
    console.log('Hashed capcode generated successfully');
    
    // Step 3: Save to DynamoDB
    await saveToDatabase(hashedCapcode);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Capcode generated and saved successfully',
      data: {
        originalNumber: randomNumber,
        hashedCapcode: hashedCapcode,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating capcode:', error);
    
    // If error is in database saving, but generation and hashing worked,
    // still show the generated data for testing purposes
    if (error.message.includes('Failed to save to database') && randomNumber && hashedCapcode) {
      return res.status(500).json({
        success: false,
        message: 'Capcode generated but failed to save to database',
        error: error.message,
        testData: {
          originalNumber: randomNumber,
          hashedCapcode: hashedCapcode,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate capcode',
      error: error.message,
    });
  }
};

module.exports = {
  generateCapcode,
};