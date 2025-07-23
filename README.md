# Capcode Generation API

Backend API for generating capcodes with DynamoDB storage.

## Test Coverage & Results

### 🧪 Test Coverage Summary
```
--------------------------------------|---------|----------|---------|---------|-------------------
File                                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------------|---------|----------|---------|---------|-------------------
All files                             |   98.48 |     92.3 |     100 |   98.48 |                   
 Promt-Web-Application-BE             |      96 |    83.33 |     100 |      96 |                   
  app.js                              |      96 |    83.33 |     100 |      96 | 65                
 Promt-Web-Application-BE/config      |     100 |      100 |     100 |     100 |                   
  dynamodb.js                         |     100 |      100 |     100 |     100 |                   
 Promt-Web-Application-BE/controllers |     100 |      100 |     100 |     100 |                   
  capcodeController.js                |     100 |      100 |     100 |     100 |                   
 Promt-Web-Application-BE/routes      |     100 |      100 |     100 |     100 |                   
  capcode.js                          |     100 |      100 |     100 |     100 |                   
--------------------------------------|---------|----------|---------|---------|-------------------
```

**Key Metrics:**
- **Statements**: 98.48%
- **Branches**: 92.3% 
- **Functions**: 100% ✅ (Target: 90%+)
- **Lines**: 98.48%
- **Total Tests**: 49 passing across 7 test suites

## 📋 API Specification

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-07-23T04:17:16.762Z"
}
```

#### 2. API Information
**GET** `/`

**Response:**
```json
{
  "success": true,
  "message": "Capcode API Server",
  "endpoints": {
    "health": "/health",
    "generateCapcode": "/api/capcode/generate"
  }
}
```

#### 3. Generate Capcode
**GET** `/api/capcode/generate`

**Success Response:**
```json
{
  "success": true,
  "message": "Capcode generated and saved successfully",
  "data": {
    "originalNumber": "1234567",
    "hashedCapcode": "$argon2id$v=19$m=4096,t=3,p=1$...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (Database Issue):**
```json
{
  "success": false,
  "message": "Capcode generated but failed to save to database",
  "error": "Failed to save to database: Region is missing",
  "testData": {
    "originalNumber": "4633836",
    "hashedCapcode": "$argon2id$v=19$m=4096,t=3,p=1$ZGVmYXVsdHNhbHQ$N9lMF6dxgAnu+P5OKZyXCnkh3fiYyY9NqqEFhONRAaM",
    "timestamp": "2025-07-23T04:17:36.301Z"
  }
}
```

**Error Response (General):**
```json
{
  "success": false,
  "message": "Failed to generate capcode",
  "error": "Error details"
}
```

## Features

- Generate random 7-digit numbers
- Hash capcodes using Argon2 with configurable parameters
- Store hashed capcodes in AWS DynamoDB
- RESTful API interface with Express.js

## Requirements

- Node.js 18+ 
- AWS DynamoDB access
- Environment variables configuration

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   DYNAMODB_REGION=ap-southeast-1
   TABLECAPCODE=osotspa-dynamo-mpoint-nonprod
   HASH_SALT=your_random_salt_string
   PORT=3000
   ```

## Usage

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Watch mode
npm run test:watch
```

### Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### API Endpoints

#### Health Check
```
GET /health
```

#### Root Information
```
GET /
```

#### Generate Capcode
```
GET /api/capcode/generate
```

*See detailed API specification above for request/response examples.*

## Testing

Comprehensive test suite with 100% function coverage including:
- Unit tests for controllers, routes, configuration
- End-to-end integration tests  
- Edge case and error scenario testing
- Mocked external dependencies (AWS SDK, Argon2)

Test files located in `/tests` directory:
- `/tests/unit/` - Unit tests
- `/tests/e2e/` - End-to-end tests
- `/tests/__mocks__/` - Mock configurations

## Project Structure

```
├── app.js                 # Main application file
├── routes/
│   └── capcode.js        # Capcode routes
├── controllers/
│   └── capcodeController.js  # Capcode business logic
├── config/
│   └── dynamodb.js       # DynamoDB configuration
├── .env.example          # Environment variables template
└── package.json
```

## Technical Details

### Capcode Generation Process

1. **Random Number Generation**: Creates a 7-digit random number (1000000-9999999)
2. **Hashing**: Uses Argon2id algorithm with parameters:
   - Salt: From `HASH_SALT` environment variable
   - Time cost: 3
   - Memory cost: 4096
   - Parallelism: 1
   - Type: argon2id
3. **Storage**: Saves the hashed capcode to DynamoDB table

### DynamoDB Table Schema

Table: `TABLECAPCODE` (configurable via environment variable)

Fields:
- `capcode` (String, Not Null): The hashed capcode
- `timestamp` (String): ISO timestamp of creation

## Dependencies

- **express**: Web framework
- **@aws-sdk/client-dynamodb**: AWS DynamoDB client
- **@aws-sdk/lib-dynamodb**: DynamoDB document client
- **argon2**: Password hashing library
- **dotenv**: Environment variable loader