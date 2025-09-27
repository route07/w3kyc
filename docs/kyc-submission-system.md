# KYC Submission System Documentation

## Overview

The KYC (Know Your Customer) submission system provides a complete backend API for handling user onboarding and KYC verification processes. The system integrates with our deployed smart contracts on the Route07 testnet to provide secure, decentralized KYC management.

## Architecture

### Components

1. **KYC Submission Service** (`src/lib/kyc-submission.ts`)
   - Core service class for handling KYC operations
   - Validates submission data
   - Integrates with smart contracts
   - Manages transaction preparation

2. **API Endpoints**
   - `/api/kyc/submit` - Main KYC submission endpoint
   - `/api/kyc/transaction` - Transaction data preparation
   - `/api/kyc/status` - KYC status checking

3. **Smart Contract Integration**
   - Uses `contractFunctions` service
   - Connects to deployed contracts on Route07
   - Validates against blockchain data

## API Endpoints

### POST /api/kyc/submit

Submits KYC data for verification.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "jurisdiction": "US",
  "documents": [],
  "kycStatus": "PENDING"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "KYC submitted successfully",
  "data": {
    "kycId": "kyc_1703123456789",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "status": "PENDING",
    "jurisdiction": "US",
    "submittedAt": "2023-12-21T10:30:00.000Z",
    "transactionHash": "0x1234567890abcdef...",
    "estimatedProcessingTime": "24-48 hours",
    "blockchainConfirmed": true
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "User already has KYC status"
}
```

### GET /api/kyc/submit?walletAddress=0x...

Retrieves KYC status for a wallet address.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "kycData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "jurisdiction": "US",
      "status": "APPROVED",
      "riskScore": 85,
      "tenantId": "default"
    },
    "status": "APPROVED",
    "lastChecked": "2023-12-21T10:30:00.000Z"
  }
}
```

### POST /api/kyc/transaction

Prepares transaction data for user signing.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "jurisdiction": "US"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction data prepared for signing",
  "data": {
    "transaction": {
      "to": "0x1234567890123456789012345678901234567890",
      "data": "0x",
      "value": "0x0",
      "gasLimit": "0x5208",
      "gasPrice": "0x0"
    },
    "message": "Please sign this transaction to submit your KYC",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "jurisdiction": "US",
    "estimatedGasCost": "0.001 ETH"
  }
}
```

## Validation Rules

### Required Fields
- `firstName` - User's first name
- `lastName` - User's last name
- `email` - Valid email address
- `walletAddress` - Valid Ethereum address (0x format)
- `jurisdiction` - Supported jurisdiction code

### Wallet Address Validation
- Must start with `0x`
- Must be 42 characters long
- Must contain only valid hexadecimal characters

### Jurisdiction Validation
- Must be one of the supported jurisdictions from the smart contract
- Retrieved dynamically from `ComplianceChecker.getSupportedJurisdictions()`

### Duplicate Prevention
- Checks if user already has KYC status
- Prevents duplicate submissions
- Returns error if user already exists

## Smart Contract Integration

### Contracts Used
- **KYCManager** - Main KYC management contract
- **KYCDataStorage** - Data storage contract
- **ComplianceChecker** - Jurisdiction validation
- **AuditLogStorage** - Audit logging

### Functions Called
- `getKYCData(walletAddress)` - Retrieve user KYC data
- `getKYCStatus(walletAddress)` - Get current status
- `getSupportedJurisdictions()` - Get valid jurisdictions
- `submitKYC(data)` - Submit new KYC (future implementation)

## Error Handling

### Common Errors
1. **Missing Required Fields** (400)
   - Missing firstName, lastName, email, walletAddress, or jurisdiction

2. **Invalid Wallet Address** (400)
   - Malformed Ethereum address

3. **Unsupported Jurisdiction** (400)
   - Jurisdiction not supported by smart contract

4. **Duplicate User** (409)
   - User already has KYC status

5. **Smart Contract Error** (500)
   - Blockchain interaction failure

6. **Internal Server Error** (500)
   - Unexpected server error

## Security Considerations

### Data Validation
- All input data is validated before processing
- Wallet addresses are verified for format
- Jurisdictions are validated against smart contract

### Audit Logging
- All submissions are logged with timestamps
- Transaction hashes are recorded
- User actions are tracked for compliance

### Privacy
- Personal data is handled securely
- Only necessary data is stored
- Compliance with data protection regulations

## Future Enhancements

### Blockchain Integration
- Real transaction signing and submission
- Gas estimation and optimization
- Transaction confirmation handling

### Advanced Features
- Document verification
- Risk scoring integration
- Multi-signature approval
- Automated compliance checking

### Performance
- Caching for frequently accessed data
- Batch processing for multiple submissions
- Async processing for heavy operations

## Usage Examples

### Frontend Integration
```typescript
// Submit KYC data
const response = await fetch('/api/kyc/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    jurisdiction: 'US'
  })
});

const result = await response.json();
if (result.success) {
  console.log('KYC submitted:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Status Checking
```typescript
// Check KYC status
const response = await fetch('/api/kyc/submit?walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
const result = await response.json();
if (result.success) {
  console.log('KYC Status:', result.data.status);
} else {
  console.error('Error:', result.error);
}
```

## Testing

### Test Cases
1. Valid KYC submission
2. Invalid wallet address
3. Unsupported jurisdiction
4. Duplicate user submission
5. Missing required fields
6. Smart contract integration
7. Error handling scenarios

### Test Data
- Valid wallet addresses
- Invalid wallet addresses
- Supported jurisdictions
- Unsupported jurisdictions
- Complete user data
- Incomplete user data

## Monitoring and Logging

### Logs
- KYC submissions with timestamps
- Transaction hashes
- Error messages
- Performance metrics

### Metrics
- Submission success rate
- Average processing time
- Error frequency
- User activity patterns

## Conclusion

The KYC submission system provides a robust, secure, and scalable solution for handling user onboarding and verification. It integrates seamlessly with our deployed smart contracts and provides comprehensive validation, error handling, and audit capabilities.

The system is designed to be easily extensible and can be enhanced with additional features as needed. It follows best practices for security, validation, and error handling while maintaining high performance and reliability.
