# Tenant-Based UI Integration Guide

## Overview

This document outlines how the comprehensive tenant-based features from our smart contracts are effectively reflected in the UI components. The system provides a multi-tenant KYC platform where different organizations can have their own configurations, users, and verification processes.

## Smart Contract Features Mapped to UI

### 1. **KYCManager Contract Features**

#### Core Functions → UI Components

| Contract Function | UI Implementation | Location |
|------------------|-------------------|----------|
| `verifyKYC()` | KYC Workflow Component | `src/components/KYCWorkflow.tsx` |
| `getKYCStatus()` | Dashboard Status Cards | `src/app/dashboard/page.tsx` |
| `isKYCValid()` | Real-time Status Indicators | Multiple components |
| `updateKYCStatus()` | Admin Action Buttons | `src/components/TenantManagement.tsx` |
| `linkWallet()` | Wallet Connection Flow | `src/components/KYCWorkflow.tsx` |
| `unlinkWallet()` | Wallet Management | `src/components/TenantManagement.tsx` |
| `getLinkedWallets()` | Wallet List Display | `src/app/tenant-dashboard/page.tsx` |
| `getTenantUsers()` | User Management Table | `src/app/tenant-dashboard/page.tsx` |
| `getRecentUserAuditLogs()` | Audit Trail Display | `src/components/TenantManagement.tsx` |

#### Events → UI Notifications

| Contract Event | UI Implementation |
|---------------|-------------------|
| `KYCVerified` | Success notifications with risk score display |
| `KYCStatusUpdated` | Status change alerts and history |
| `WalletLinked` | Wallet connection confirmations |
| `WalletUnlinked` | Wallet removal notifications |
| `AuthorizedWriterUpdated` | Permission change alerts |

### 2. **TenantConfigStorage Contract Features**

#### Tenant Management → UI Components

| Contract Function | UI Implementation | Features |
|------------------|-------------------|----------|
| `registerTenant()` | Tenant Creation Form | Multi-step tenant setup |
| `getTenantConfig()` | Tenant Dashboard | Configuration display |
| `updateTenantSetting()` | Settings Panel | Dynamic configuration updates |
| `getTenantStats()` | Statistics Dashboard | Real-time metrics |
| `getTenantLimits()` | Limits Management | Usage monitoring |
| `isTenantActive()` | Status Indicators | Active/inactive states |
| `getAllTenants()` | Tenant Selection | Dropdown lists |

#### Tenant Configuration Structure

```typescript
interface TenantConfig {
  tenantId: string                    // → Tenant ID display
  name: string                       // → Tenant name in UI
  requiredCredentials: string[]      // → Credential requirements
  maxRiskScore: number              // → Risk threshold settings
  allowedJurisdictions: string[]    // → Geographic restrictions
  isActive: boolean                 // → Status indicators
  createdAt: number                 // → Creation date display
  admin: string                     // → Admin address display
  customFields: string[]            // → Custom form fields
}
```

### 3. **CredentialTypeManager Contract Features**

#### Credential Management → UI Components

| Contract Function | UI Implementation | Features |
|------------------|-------------------|----------|
| `createCredentialType()` | Credential Creation Form | Dynamic credential setup |
| `getCredentialType()` | Credential Display Cards | Detailed credential info |
| `updateCredentialType()` | Credential Editing | In-place updates |
| `getCredentialTypesByCategory()` | Categorized Display | Filtered views |
| `isCredentialTypeActive()` | Status Indicators | Active/inactive states |

#### Credential Categories → UI Icons

| Category | Icon | Color Scheme |
|----------|------|--------------|
| IDENTITY | UserIcon | Blue |
| FINANCIAL | BanknotesIcon | Green |
| PROFESSIONAL | BuildingOfficeIcon | Purple |
| COMPLIANCE | ShieldCheckIcon | Orange |
| CUSTOM | KeyIcon | Gray |

### 4. **AuditLogStorage Contract Features**

#### Audit Trail → UI Components

| Contract Function | UI Implementation | Features |
|------------------|-------------------|----------|
| `createAuditLog()` | Automatic Logging | Background audit trail |
| `getUserAuditLogs()` | User History | Individual audit views |
| `getTenantAuditLogs()` | Tenant Audit Table | Comprehensive audit logs |
| `getRecentAuditLogs()` | Recent Activity | Dashboard widgets |

## UI Architecture for Tenant Features

### 1. **Multi-Tenant Dashboard** (`src/app/tenant-dashboard/page.tsx`)

**Features Implemented:**
- ✅ Tenant selection sidebar
- ✅ Real-time statistics display
- ✅ User management table
- ✅ KYC status monitoring
- ✅ Blockchain connection status
- ✅ Tenant configuration display

**Contract Integration:**
```typescript
// Real-time KYC status from blockchain
const kycStatus = await KYCService.getKYCStatus(userAddress)

// Tenant statistics from smart contracts
const tenantStats = await getTenantStats(tenantId)

// User list from tenant storage
const tenantUsers = await getTenantUsers(tenantId)
```

### 2. **Tenant Management Component** (`src/components/TenantManagement.tsx`)

**Features Implemented:**
- ✅ Tabbed interface (Overview, Users, Credentials, Audit, Settings)
- ✅ Credential type management
- ✅ Audit log display
- ✅ Tenant configuration editing
- ✅ Real-time status updates

**Contract Integration:**
```typescript
// Credential type management
const credentialTypes = await getCredentialTypes()

// Audit log retrieval
const auditLogs = await getTenantAuditLogs(tenantId)

// Tenant configuration updates
await updateTenantSetting(tenantId, key, value)
```

### 3. **KYC Workflow Component** (`src/components/KYCWorkflow.tsx`)

**Features Implemented:**
- ✅ Step-by-step verification process
- ✅ Dynamic credential requirements
- ✅ Tenant-specific configurations
- ✅ Real-time status tracking
- ✅ Wallet integration
- ✅ Document upload interface

**Contract Integration:**
```typescript
// Dynamic workflow based on tenant requirements
const tenantConfig = await getTenantConfig(tenantId)
const requiredCredentials = tenantConfig.requiredCredentials

// KYC verification process
await verifyKYC(userAddress, verificationHash, riskScore, jurisdiction, tenantId)

// Wallet linking
await linkWallet(userAddress, walletAddress, tenantId)
```

## Key UI Features Reflecting Contract Capabilities

### 1. **Dynamic Configuration**

The UI dynamically adapts based on tenant configurations:

```typescript
// UI adapts to tenant's required credentials
tenant.requiredCredentials.forEach(credentialId => {
  const credential = credentialTypes.find(c => c.credentialTypeId === credentialId)
  // Generate UI step for this credential
})

// UI respects tenant's risk score limits
if (riskScore > tenant.maxRiskScore) {
  // Show warning or rejection
}
```

### 2. **Real-Time Blockchain Integration**

All UI components show real-time blockchain data:

```typescript
// Real-time KYC status
const kycStatus = await KYCService.getKYCStatus(userAddress)

// Live audit trail
const auditLogs = await getRecentUserAuditLogs(userAddress, 10)

// Current wallet connections
const linkedWallets = await getLinkedWallets(userAddress)
```

### 3. **Multi-Tenant Isolation**

Each tenant sees only their data:

```typescript
// Tenant-specific user lists
const tenantUsers = await getTenantUsers(tenantId)

// Tenant-specific audit logs
const tenantAuditLogs = await getTenantAuditLogs(tenantId)

// Tenant-specific statistics
const tenantStats = await getTenantStats(tenantId)
```

### 4. **Comprehensive Audit Trail**

Every action is logged and displayed:

```typescript
// Automatic audit logging
await createAuditLog(userAddress, action, details, tenantId, jurisdiction)

// UI displays audit trail
auditLogs.map(log => (
  <AuditLogEntry 
    timestamp={log.timestamp}
    action={log.action}
    details={log.details}
    user={log.user}
  />
))
```

## Advanced Features Implementation

### 1. **Risk Assessment Integration**

```typescript
// AI-powered risk scoring
const riskScore = await calculateRiskScore(userData, tenantConfig)

// Risk-based UI decisions
if (riskScore > tenant.maxRiskScore) {
  // Show high-risk warning
  // Require additional verification
  // Notify compliance team
}
```

### 2. **Jurisdiction Compliance**

```typescript
// Jurisdiction-based restrictions
const allowedJurisdictions = tenant.allowedJurisdictions
if (!allowedJurisdictions.includes(userJurisdiction)) {
  // Show jurisdiction restriction
  // Block verification process
}
```

### 3. **Credential Type Management**

```typescript
// Dynamic credential requirements
const requiredFields = credential.requiredFields
const optionalFields = credential.optionalFields

// Generate dynamic forms
requiredFields.forEach(field => {
  // Create required input field
})

optionalFields.forEach(field => {
  // Create optional input field
})
```

### 4. **Wallet Integration**

```typescript
// Multi-wallet support
const linkedWallets = await getLinkedWallets(userAddress)

// Wallet verification
await linkWallet(userAddress, walletAddress, tenantId)

// Wallet management
await unlinkWallet(userAddress, walletAddress)
```

## Security Features in UI

### 1. **Access Control**

```typescript
// Role-based access
const isAuthorized = await checkAuthorization(userAddress, action)

// Tenant isolation
const userTenants = await getAdminTenants(adminAddress)
```

### 2. **Data Validation**

```typescript
// Input validation
InputValidator.validateAddress(userAddress)
InputValidator.validateString(tenantId)

// Bounds checking
BoundsChecker.checkRiskScore(riskScore, 0, 100)
```

### 3. **Audit Compliance**

```typescript
// Comprehensive logging
await createAuditLog(userAddress, 'KYC_VERIFIED', details, tenantId, jurisdiction)

// Immutable audit trail
const auditHistory = await getUserAuditLogs(userAddress)
```

## Performance Optimizations

### 1. **Caching Strategy**

```typescript
// Cache tenant configurations
const tenantConfig = await getCachedTenantConfig(tenantId)

// Cache credential types
const credentialTypes = await getCachedCredentialTypes()
```

### 2. **Batch Operations**

```typescript
// Batch user operations
await batchUpdateKYCStatus(userAddresses, isActive, reason)

// Batch audit log creation
await batchCreateAuditLogs(auditEntries)
```

### 3. **Real-Time Updates**

```typescript
// WebSocket integration for real-time updates
const ws = new WebSocket('ws://localhost:3000/audit')
ws.onmessage = (event) => {
  const auditLog = JSON.parse(event.data)
  updateAuditDisplay(auditLog)
}
```

## Conclusion

The UI effectively reflects all major smart contract features through:

1. **Comprehensive Dashboard**: Real-time tenant management and monitoring
2. **Dynamic Workflows**: Tenant-specific KYC processes
3. **Audit Trail**: Complete action logging and display
4. **Multi-Tenant Support**: Isolated tenant environments
5. **Blockchain Integration**: Real-time smart contract interaction
6. **Security Features**: Access control and data validation
7. **Performance Optimization**: Caching and batch operations

The system provides a complete multi-tenant KYC platform that leverages all the advanced features available in the smart contracts while maintaining a user-friendly interface for both administrators and end users.
