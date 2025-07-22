# Capcode Generation API

Backend API for generating capcodes with DynamoDB storage.

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

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to generate capcode",
  "error": "Error details"
}
```

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