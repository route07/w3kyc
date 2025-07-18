export interface MockKYCSubmission {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  walletAddress?: string
  institutionId?: string
  investorType: 'individual' | 'company' | 'family_office' | 'high_net_worth'
  status: 'pending' | 'approved' | 'rejected' | 'verified'
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  approvedBy?: string
  
  // Personal Information
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  
  // Document Information
  documentType: string
  documentNumber: string
  documents: Array<{
    id: string
    name: string
    type: string
    ipfsHash: string
    uploadedAt: string
    status: 'pending' | 'verified' | 'rejected'
    verificationNotes?: string
  }>
  
  // Business Information
  sourceOfFunds: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: string
  }
  
  // Connected Parties
  connectedParties: Array<{
    id: string
    name: string
    relationship: string
    kycStatus: string
  }>
  
  // Ultimate Beneficial Owners
  ultimateBeneficialOwners: Array<{
    id: string
    name: string
    ownershipPercentage: number
    nationality: string
  }>
  
  // Authorized Persons
  authorizedPersons: Array<{
    id: string
    name: string
    role: string
    email: string
  }>
  
  // Risk Assessment
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  
  // Blockchain Integration
  blockchainStatus: {
    onChainVerification: boolean
    verificationHash?: string
    blockNumber?: number
    transactionHash?: string
  }
  
  // Audit Information
  createdAt: string
  updatedAt: string
}

export const mockKYCSubmissions: MockKYCSubmission[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-03-15',
    nationality: 'US',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    investorType: 'individual',
    status: 'approved',
    submittedAt: '2024-01-15T10:30:00Z',
    approvedAt: '2024-01-18T14:20:00Z',
    approvedBy: 'admin-001',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    documentType: 'passport',
    documentNumber: 'US123456789',
    documents: [
      {
        id: 'doc-001',
        name: 'US_Passport_John_Smith.pdf',
        type: 'passport',
        ipfsHash: 'QmXzK9L2M1N8P7Q6R5S4T3U2V1W0X9Y8Z7A6B5C4D3E2F1',
        uploadedAt: '2024-01-15T10:30:00Z',
        status: 'verified',
        verificationNotes: 'Passport verified as authentic'
      },
      {
        id: 'doc-002',
        name: 'Utility_Bill_John_Smith.pdf',
        type: 'utility_bill',
        ipfsHash: 'QmF1E2D3C4B5A6Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4',
        uploadedAt: '2024-01-15T10:32:00Z',
        status: 'verified',
        verificationNotes: 'Address verification successful'
      }
    ],
    sourceOfFunds: 'Employment income and investment returns',
    bankDetails: {
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountType: 'Checking'
    },
    connectedParties: [
      {
        id: 'cp-001',
        name: 'Sarah Smith',
        relationship: 'Spouse',
        kycStatus: 'approved'
      }
    ],
    ultimateBeneficialOwners: [],
    authorizedPersons: [],
    riskScore: 15,
    riskLevel: 'low',
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 18475632,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  
  {
    id: 'kyc-002',
    userId: 'user-002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@techcorp.com',
    phone: '+1-555-0456',
    dateOfBirth: '1990-07-22',
    nationality: 'ES',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c772c3c3',
    institutionId: 'inst-001',
    investorType: 'company',
    status: 'pending',
    submittedAt: '2024-01-20T11:15:00Z',
    address: {
      street: '456 Business Ave',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US'
    },
    documentType: 'passport',
    documentNumber: 'ES987654321',
    documents: [
      {
        id: 'doc-003',
        name: 'ES_Passport_Maria_Garcia.pdf',
        type: 'passport',
        ipfsHash: 'QmG1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2',
        uploadedAt: '2024-01-20T11:15:00Z',
        status: 'verified',
        verificationNotes: 'Passport verified as authentic'
      },
      {
        id: 'doc-004',
        name: 'TechCorp_Articles_of_Incorporation.pdf',
        type: 'corporate_document',
        ipfsHash: 'QmC1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2',
        uploadedAt: '2024-01-20T11:18:00Z',
        status: 'pending',
        verificationNotes: 'Corporate documents under review'
      },
      {
        id: 'doc-005',
        name: 'TechCorp_Bank_Statement.pdf',
        type: 'bank_statement',
        ipfsHash: 'QmY1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2',
        uploadedAt: '2024-01-20T11:20:00Z',
        status: 'pending',
        verificationNotes: 'Bank statements under review'
      }
    ],
    sourceOfFunds: 'Business operations and investment portfolio',
    connectedParties: [
      {
        id: 'cp-002',
        name: 'TechCorp Holdings Ltd',
        relationship: 'Parent Company',
        kycStatus: 'pending'
      }
    ],
    ultimateBeneficialOwners: [
      {
        id: 'ubo-001',
        name: 'Maria Garcia',
        ownershipPercentage: 60,
        nationality: 'ES'
      },
      {
        id: 'ubo-002',
        name: 'Carlos Rodriguez',
        ownershipPercentage: 40,
        nationality: 'ES'
      }
    ],
    authorizedPersons: [
      {
        id: 'ap-001',
        name: 'Maria Garcia',
        role: 'CEO',
        email: 'maria.garcia@techcorp.com'
      },
      {
        id: 'ap-002',
        name: 'Carlos Rodriguez',
        role: 'CFO',
        email: 'carlos.rodriguez@techcorp.com'
      }
    ],
    riskScore: 65,
    riskLevel: 'medium',
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  
  {
    id: 'kyc-003',
    userId: 'user-003',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@familyoffice.com',
    phone: '+1-555-0789',
    dateOfBirth: '1975-11-08',
    nationality: 'SG',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    investorType: 'family_office',
    status: 'verified',
    submittedAt: '2024-01-05T08:45:00Z',
    approvedAt: '2024-01-08T16:30:00Z',
    approvedBy: 'admin-002',
    address: {
      street: '789 Wealth Street',
      city: 'Singapore',
      state: '',
      postalCode: '018956',
      country: 'SG'
    },
    documentType: 'passport',
    documentNumber: 'SG123456789',
    documents: [
      {
        id: 'doc-006',
        name: 'SG_Passport_David_Chen.pdf',
        type: 'passport',
        ipfsHash: 'QmU1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2',
        uploadedAt: '2024-01-05T08:45:00Z',
        status: 'verified',
        verificationNotes: 'Passport verified as authentic'
      },
      {
        id: 'doc-007',
        name: 'Chen_Family_Trust_Deed.pdf',
        type: 'trust_deed',
        ipfsHash: 'QmQ1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2',
        uploadedAt: '2024-01-05T08:48:00Z',
        status: 'verified',
        verificationNotes: 'Trust deed verified and authenticated'
      },
      {
        id: 'doc-008',
        name: 'DBS_Bank_Statement.pdf',
        type: 'bank_statement',
        ipfsHash: 'QmM1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2',
        uploadedAt: '2024-01-05T08:50:00Z',
        status: 'verified',
        verificationNotes: 'Bank statements verified'
      }
    ],
    sourceOfFunds: 'Family wealth management and investment returns',
    bankDetails: {
      bankName: 'DBS Bank',
      accountNumber: '****5678',
      routingNumber: '7171-0000',
      accountType: 'Corporate'
    },
    connectedParties: [
      {
        id: 'cp-003',
        name: 'Chen Family Trust',
        relationship: 'Family Trust',
        kycStatus: 'approved'
      }
    ],
    ultimateBeneficialOwners: [
      {
        id: 'ubo-003',
        name: 'David Chen',
        ownershipPercentage: 100,
        nationality: 'SG'
      }
    ],
    authorizedPersons: [
      {
        id: 'ap-003',
        name: 'David Chen',
        role: 'Managing Director',
        email: 'david.chen@familyoffice.com'
      }
    ],
    riskScore: 25,
    riskLevel: 'low',
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 18475630,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    createdAt: '2024-01-01T07:00:00Z',
    updatedAt: '2024-01-08T16:30:00Z'
  },
  
  {
    id: 'kyc-004',
    userId: 'user-004',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@startup.io',
    phone: '+1-555-0321',
    dateOfBirth: '1988-04-12',
    nationality: 'UK',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    investorType: 'high_net_worth',
    status: 'rejected',
    submittedAt: '2024-01-18T13:20:00Z',
    rejectedAt: '2024-01-19T09:15:00Z',
    rejectionReason: 'Incomplete documentation and source of funds verification required',
    approvedBy: 'admin-003',
    address: {
      street: '321 Innovation Drive',
      city: 'London',
      state: '',
      postalCode: 'SW1A 1AA',
      country: 'UK'
    },
    documentType: 'passport',
    documentNumber: 'GB123456789',
    documents: [
      {
        id: 'doc-009',
        name: 'GB_Passport_Emma_Wilson.pdf',
        type: 'passport',
        ipfsHash: 'QmI1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2',
        uploadedAt: '2024-01-18T13:20:00Z',
        status: 'verified',
        verificationNotes: 'Passport verified as authentic'
      },
      {
        id: 'doc-010',
        name: 'Startup_Exit_Documentation.pdf',
        type: 'business_document',
        ipfsHash: 'QmE1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2',
        uploadedAt: '2024-01-18T13:25:00Z',
        status: 'rejected',
        verificationNotes: 'Incomplete startup exit documentation'
      }
    ],
    sourceOfFunds: 'Startup exit and angel investments',
    connectedParties: [],
    ultimateBeneficialOwners: [],
    authorizedPersons: [],
    riskScore: 85,
    riskLevel: 'high',
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T09:15:00Z'
  },
  
  {
    id: 'kyc-005',
    userId: 'user-005',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david.cohen@investment.com',
    phone: '+971-555-0654',
    dateOfBirth: '1982-09-30',
    nationality: 'AE',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    investorType: 'individual',
    status: 'pending',
    submittedAt: '2024-01-22T15:45:00Z',
    address: {
      street: '654 Financial District',
      city: 'Dubai',
      state: '',
      postalCode: '00000',
      country: 'AE'
    },
    documentType: 'passport',
    documentNumber: 'AE987654321',
    documents: [
      {
        id: 'doc-011',
        name: 'AE_Passport_David_Cohen.pdf',
        type: 'passport',
        ipfsHash: 'QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2',
        uploadedAt: '2024-01-22T15:45:00Z',
        status: 'verified',
        verificationNotes: 'Passport verified as authentic'
      },
      {
        id: 'doc-012',
        name: 'Investment_Group_Registration.pdf',
        type: 'corporate_document',
        ipfsHash: 'QmW1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2',
        uploadedAt: '2024-01-22T15:48:00Z',
        status: 'pending',
        verificationNotes: 'Corporate documents under review'
      }
    ],
    sourceOfFunds: 'Real estate investments and trading profits',
    connectedParties: [
      {
        id: 'cp-004',
        name: 'Cohen Investment Group',
        relationship: 'Investment Vehicle',
        kycStatus: 'pending'
      }
    ],
    ultimateBeneficialOwners: [],
    authorizedPersons: [],
    riskScore: 75,
    riskLevel: 'high',
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-22T15:45:00Z'
  }
] 