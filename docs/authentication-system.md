# Authentication System Documentation

## Overview

The W3KYC authentication system provides comprehensive user authentication with both Web2 (email/password) and Web3 (wallet) options. Users can seamlessly switch between authentication methods and connect additional authentication factors to their accounts.

## Architecture

### Components

1. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - Centralized authentication state management
   - Provides authentication methods and user data
   - Handles both Web2 and Web3 authentication flows

2. **NextAuth Integration** (`src/lib/auth.ts`)
   - JWT-based session management
   - Credentials provider for email/password authentication
   - Secure session handling with callbacks

3. **Wagmi/Rainbow Integration** (`src/lib/wagmi.ts`)
   - Web3 wallet connection management
   - Multi-chain support including Route07 testnet
   - WalletConnect integration

4. **API Endpoints**
   - `/api/auth/user` - User management and retrieval
   - `/api/auth/signup` - Web2 user registration
   - `/api/auth/connect-email` - Email connection for Web3 users
   - `/api/auth/profile` - Profile management
   - `/api/auth/[...nextauth]` - NextAuth handlers

## Authentication Methods

### Web2 Authentication (Email/Password)

**Features:**
- Traditional email and password authentication
- Secure password hashing with bcrypt
- JWT-based session management
- Profile management with personal information

**User Flow:**
1. User enters email and password
2. Credentials are validated against stored hash
3. JWT session is created
4. User is redirected to dashboard

**API Endpoints:**
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/user` - Validate credentials (NextAuth)

### Web3 Authentication (Wallet)

**Features:**
- Wallet connection via Rainbow
- Support for multiple wallet types (MetaMask, WalletConnect, etc.)
- Multi-chain support including Route07 testnet
- Non-custodial authentication

**User Flow:**
1. User clicks "Connect Wallet"
2. Rainbow modal opens for wallet selection
3. User approves connection
4. Wallet address is used as user identifier
5. Optional email connection for enhanced features

**Supported Wallets:**
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And more via Rainbow integration

### Hybrid Authentication

**Features:**
- Users can connect both email and wallet
- Seamless switching between authentication methods
- Enhanced security with multiple authentication factors
- Unified user experience

**User Flow:**
1. User starts with either Web2 or Web3 authentication
2. Can add additional authentication method later
3. Both methods work independently
4. Profile data is shared between methods

## User Interface Components

### Login Form (`src/components/auth/LoginForm.tsx`)
- Email and password input fields
- Form validation and error handling
- Links to signup and wallet connection
- Responsive design with Tailwind CSS

### Signup Form (`src/components/auth/SignupForm.tsx`)
- Complete registration form with validation
- Password confirmation
- Personal information collection
- Error handling and success feedback

### Wallet Connect (`src/components/auth/WalletConnect.tsx`)
- Rainbow wallet connection interface
- Connection status display
- Wallet address display
- Disconnect functionality

### Connect Email Form (`src/components/auth/ConnectEmailForm.tsx`)
- Email connection for Web3 users
- Password creation
- Optional email addition
- Skip option for later connection

## Pages and Routing

### Authentication Page (`/auth`)
**Features:**
- Unified authentication interface
- Mode switching (login, signup, wallet, connect-email)
- Responsive design
- Visual mode indicators

**URL Parameters:**
- `?mode=login` - Direct to login form
- `?mode=signup` - Direct to signup form
- `?mode=wallet` - Direct to wallet connection
- `?mode=connect-email` - Direct to email connection

### Dashboard (`/dashboard`)
**Features:**
- Personalized user dashboard
- Account information display
- KYC status overview
- Quick action buttons
- Recent activity feed

**Access Control:**
- Requires authentication
- Redirects to `/auth` if not authenticated
- Displays user-specific information

### Profile Management (`/profile`)
**Features:**
- Profile information editing
- Account type display
- Wallet information
- KYC status management
- Email connection for Web3 users

## Security Features

### Password Security
- bcrypt hashing with salt rounds
- Minimum 8 character requirement
- Password confirmation validation
- Secure password storage

### Session Management
- JWT-based sessions
- Secure session cookies
- Automatic session validation
- Session timeout handling

### Wallet Security
- Non-custodial wallet connection
- Address validation
- Secure wallet interaction
- No private key storage

### Data Validation
- Input sanitization
- Email format validation
- Wallet address validation
- Required field validation

## API Documentation

### User Management

#### GET /api/auth/user
**Purpose:** Retrieve user information
**Parameters:**
- `email` - User email address
- `walletAddress` - User wallet address

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "walletAddress": "0x...",
    "kycStatus": "PENDING",
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

#### POST /api/auth/signup
**Purpose:** Create new Web2 user account
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "kycStatus": "NONE",
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

#### POST /api/auth/connect-email
**Purpose:** Connect email to Web3 user account
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email connected successfully",
  "user": {
    "id": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "email": "user@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "kycStatus": "NONE",
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  }
}
```

#### PUT /api/auth/profile
**Purpose:** Update user profile information
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "newemail@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "kycStatus": "PENDING",
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T11:00:00.000Z"
  }
}
```

## Error Handling

### Common Errors
1. **Validation Errors (400)**
   - Missing required fields
   - Invalid email format
   - Invalid wallet address format
   - Password too short

2. **Authentication Errors (401)**
   - Invalid credentials
   - Session expired
   - Unauthorized access

3. **Conflict Errors (409)**
   - Email already exists
   - Wallet already connected
   - Duplicate account creation

4. **Server Errors (500)**
   - Database connection issues
   - Internal server errors
   - Unexpected failures

### Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Integration with KYC System

### User Identification
- Web2 users: Email-based identification
- Web3 users: Wallet address-based identification
- Hybrid users: Both email and wallet address available

### KYC Integration
- KYC status linked to user account
- Wallet address used for blockchain KYC submission
- Email used for notifications and communication
- Unified KYC status across authentication methods

### Data Flow
1. User authenticates (Web2 or Web3)
2. User data is stored/retrieved
3. KYC process uses appropriate identifier
4. KYC status is linked to user account
5. Dashboard displays unified information

## Configuration

### Environment Variables
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Database Configuration (if using external database)
DATABASE_URL=your-database-url
```

### Rainbow Configuration
- Project ID from WalletConnect
- Supported chains configuration
- Custom styling options
- Wallet connection preferences

## Testing

### Test Cases
1. **Web2 Authentication**
   - Valid login with correct credentials
   - Invalid login with wrong credentials
   - User registration with valid data
   - User registration with invalid data
   - Profile updates

2. **Web3 Authentication**
   - Wallet connection success
   - Wallet disconnection
   - Multiple wallet support
   - Chain switching

3. **Hybrid Authentication**
   - Email connection to Web3 account
   - Switching between authentication methods
   - Unified profile management
   - Data consistency

4. **Security Testing**
   - Password validation
   - Session management
   - Input sanitization
   - Error handling

### Demo Accounts
- **Web2 Demo:** `demo@w3kyc.com` / `password`
- **Web3 Demo:** Connect any wallet for testing

## Future Enhancements

### Planned Features
1. **Multi-Factor Authentication**
   - SMS verification
   - Email verification
   - Authenticator app support

2. **Advanced Security**
   - Rate limiting
   - Account lockout
   - Suspicious activity detection

3. **Social Authentication**
   - Google OAuth
   - GitHub OAuth
   - Discord OAuth

4. **Enhanced Web3 Features**
   - ENS name resolution
   - Avatar support
   - Wallet activity tracking

### Performance Optimizations
- Session caching
- Database query optimization
- CDN integration
- Lazy loading

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Check WalletConnect project ID
   - Verify network configuration
   - Ensure wallet is unlocked

2. **Session Expires Quickly**
   - Check NEXTAUTH_SECRET configuration
   - Verify session timeout settings
   - Check browser cookie settings

3. **Email Validation Errors**
   - Verify email format
   - Check for duplicate accounts
   - Ensure proper error handling

4. **Profile Update Failures**
   - Check authentication status
   - Verify input validation
   - Check database connectivity

### Debug Mode
Enable debug logging by setting:
```bash
NEXTAUTH_DEBUG=true
```

## Conclusion

The authentication system provides a robust, secure, and user-friendly solution for both Web2 and Web3 users. It seamlessly integrates with the existing KYC system and provides a foundation for future enhancements.

**Key Benefits:**
- ✅ **Dual Authentication** - Support for both Web2 and Web3
- ✅ **Seamless Integration** - Works with existing KYC system
- ✅ **Security First** - Secure password handling and session management
- ✅ **User Friendly** - Intuitive interface and smooth user experience
- ✅ **Extensible** - Easy to add new authentication methods
- ✅ **Production Ready** - Comprehensive error handling and validation

The system is ready for production use and can be easily extended with additional features as needed.