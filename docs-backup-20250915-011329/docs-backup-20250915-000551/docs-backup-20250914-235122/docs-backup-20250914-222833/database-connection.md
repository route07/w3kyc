# Database Connection Guide

## Overview

This document outlines the standardized database connection logic and patterns used in the Web3 KYC platform. The application uses MongoDB with Mongoose ODM for data persistence.

## Connection Architecture

### Connection Utility (`src/lib/mongodb.ts`)

The database connection is managed through a centralized utility that implements:

- **Connection Caching**: Prevents multiple connections during hot reloads
- **Error Handling**: Graceful error management and reconnection logic
- **TypeScript Support**: Full type safety with proper interfaces
- **Environment Configuration**: Environment-based connection settings

### Key Features

1. **Global Connection Caching**
   ```typescript
   let cached = global.mongoose || { conn: null, promise: null };
   ```

2. **Connection Reuse**
   - Prevents connection pool exhaustion
   - Optimizes performance in development
   - Handles Next.js hot reloads efficiently

3. **Error Recovery**
   - Automatic reconnection attempts
   - Graceful error handling
   - Connection state management

## Environment Configuration

### Required Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/kyc_db

# Optional: MongoDB Authentication
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
MONGODB_AUTH_SOURCE=admin

# Optional: MongoDB SSL/TLS
MONGODB_SSL=true
MONGODB_SSL_CA_PATH=/path/to/ca.pem
```

### Connection String Formats

#### Local Development
```
mongodb://localhost:27017/kyc_db
```

#### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/kyc_db?retryWrites=true&w=majority
```

#### Docker MongoDB
```
mongodb://mongo:27017/kyc_db
```

## Database Models

### 1. User Model (`src/lib/models/User.ts`)

**Purpose**: Store individual user information and KYC data

**Key Features**:
- Password hashing with bcrypt
- Email validation
- Wallet address validation
- KYC status tracking
- Risk score management

**Indexes**:
- `email` (unique)
- `walletAddress`
- `kycStatus`
- `riskScore`
- `createdAt` (descending)

**Methods**:
- `comparePassword()`: Verify user password
- `fullName`: Virtual property for complete name

### 2. Institution Model (`src/lib/models/Institution.ts`)

**Purpose**: Store corporate entity information

**Key Features**:
- Director management
- Ultimate Beneficial Owner (UBO) tracking
- Ownership percentage validation
- Corporate structure management

**Indexes**:
- `name`
- `registrationNumber` (unique)
- `country`
- `kycStatus`
- `riskScore`

**Methods**:
- `totalOwnershipPercentage`: Virtual property
- Ownership validation middleware

### 3. KYC Document Model (`src/lib/models/KYCDocument.ts`)

**Purpose**: Manage document uploads and verification

**Key Features**:
- IPFS hash storage
- Document type categorization
- OCR data storage
- Verification status tracking

**Indexes**:
- `userId`
- `documentType`
- `verificationStatus`
- `ipfsHash`
- Compound: `userId + documentType`
- Compound: `userId + verificationStatus`

**Methods**:
- `markAsVerified()`: Update verification status
- `markAsRejected()`: Reject document
- `findByUserAndType()`: Static query method
- `findPendingDocuments()`: Static query method

### 4. Risk Profile Model (`src/lib/models/RiskProfile.ts`)

**Purpose**: Store and manage risk assessment data

**Key Features**:
- Multi-dimensional risk scoring
- Risk factor tracking
- Automated risk calculation
- Historical risk data

**Indexes**:
- `userId` (unique)
- `overallRisk.score` (descending)
- `overallRisk.level`
- `lastUpdated` (descending)

**Methods**:
- `addRiskFactor()`: Add new risk factor
- `recalculateOverallRisk()`: Update overall score
- `findHighRiskProfiles()`: Static query method
- `findByRiskLevel()`: Static query method

### 5. Audit Log Model (`src/lib/models/AuditLog.ts`)

**Purpose**: Track all system activities for compliance

**Key Features**:
- Comprehensive action logging
- IP address tracking
- User agent logging
- Blockchain sync status
- Severity levels

**Indexes**:
- `userId`
- `action`
- `timestamp` (descending)
- `severity`
- `ipAddress`
- `onChainHash`

**Methods**:
- `markAsSynced()`: Update blockchain sync status
- `findByUser()`: Static query method
- `findByAction()`: Static query method
- `findByDateRange()`: Static query method

### 6. Admin User Model (`src/lib/models/AdminUser.ts`)

**Purpose**: Manage administrative users and permissions

**Key Features**:
- Role-based access control
- Permission management
- Login attempt tracking
- Account locking
- Two-factor authentication support

**Indexes**:
- `email` (unique)
- `role`
- `isActive`
- `permissions`
- `lastLogin` (descending)

**Methods**:
- `hasPermission()`: Check specific permission
- `hasAnyPermission()`: Check multiple permissions
- `addPermission()`: Grant permission
- `removePermission()`: Revoke permission
- `recordFailedLogin()`: Track failed attempts
- `recordSuccessfulLogin()`: Update login stats

## Connection Usage Patterns

### 1. API Route Usage

```typescript
// src/app/api/users/route.ts
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).limit(10);
    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
```

### 2. Server-Side Usage

```typescript
// src/lib/services/userService.ts
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function createUser(userData: any) {
  await dbConnect();
  const user = new User(userData);
  return await user.save();
}
```

### 3. Error Handling

```typescript
import dbConnect from '@/lib/mongodb';

export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await dbConnect();
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error('Database operation failed');
  }
}
```

## Performance Optimization

### 1. Index Strategy

- **Single Field Indexes**: For frequently queried fields
- **Compound Indexes**: For multi-field queries
- **Text Indexes**: For search functionality
- **TTL Indexes**: For automatic data expiration

### 2. Query Optimization

```typescript
// Good: Use projection to limit fields
const users = await User.find({}, 'firstName lastName email');

// Good: Use lean() for read-only operations
const users = await User.find({}).lean();

// Good: Use pagination
const users = await User.find({})
  .skip(page * limit)
  .limit(limit)
  .sort({ createdAt: -1 });
```

### 3. Connection Pool Management

```typescript
// Configure connection pool size
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

## Security Considerations

### 1. Data Encryption

- **At Rest**: MongoDB Enterprise encryption
- **In Transit**: TLS/SSL connections
- **Application Level**: Sensitive field hashing

### 2. Access Control

- **Database Users**: Role-based access
- **Network Security**: IP whitelisting
- **Application Security**: Input validation

### 3. Audit Trail

- **All Operations**: Logged in AuditLog collection
- **Sensitive Actions**: Blockchain sync
- **Access Monitoring**: Failed login tracking

## Monitoring and Maintenance

### 1. Health Checks

```typescript
export async function checkDatabaseHealth() {
  try {
    await dbConnect();
    const result = await mongoose.connection.db.admin().ping();
    return result.ok === 1;
  } catch (error) {
    return false;
  }
}
```

### 2. Backup Strategy

- **Automated Backups**: Daily snapshots
- **Point-in-Time Recovery**: Oplog-based
- **Cross-Region Replication**: Disaster recovery

### 3. Performance Monitoring

- **Query Performance**: MongoDB profiler
- **Connection Metrics**: Pool utilization
- **Index Usage**: Query plan analysis

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network connectivity
   - Verify connection string
   - Review firewall settings

2. **Authentication Errors**
   - Verify credentials
   - Check authentication database
   - Review user permissions

3. **Performance Issues**
   - Analyze query performance
   - Review index usage
   - Check connection pool size

### Debug Mode

```typescript
// Enable Mongoose debug mode
mongoose.set('debug', process.env.NODE_ENV === 'development');
```

## Best Practices

1. **Always use connection utility**: Never create direct connections
2. **Handle errors gracefully**: Implement proper error handling
3. **Use transactions**: For multi-document operations
4. **Monitor performance**: Regular query analysis
5. **Backup regularly**: Automated backup procedures
6. **Version control**: Schema changes in migrations
7. **Test thoroughly**: Database operations in tests

## Migration Strategy

### Schema Changes

1. **Backward Compatibility**: Maintain old field support
2. **Gradual Migration**: Update data in batches
3. **Rollback Plan**: Revert changes if needed
4. **Testing**: Validate in staging environment

### Data Migration

```typescript
// Example migration script
export async function migrateUserData() {
  await dbConnect();
  
  const users = await User.find({});
  for (const user of users) {
    // Migration logic
    await user.save();
  }
}
```

This standardized approach ensures consistent, reliable, and secure database operations across the Web3 KYC platform. 