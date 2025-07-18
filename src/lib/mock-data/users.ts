export interface MockUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  walletAddress?: string
  institutionId?: string
  investorType: 'individual' | 'company' | 'family_office' | 'high_net_worth'
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected' | 'verified'
  kycSubmittedAt?: string
  kycApprovedAt?: string
  kycRejectedAt?: string
  kycRejectionReason?: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  sourceOfFunds: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: string
  }
  connectedParties: Array<{
    id: string
    name: string
    relationship: string
    kycStatus: string
  }>
  ultimateBeneficialOwners: Array<{
    id: string
    name: string
    ownershipPercentage: number
    nationality: string
  }>
  authorizedPersons: Array<{
    id: string
    name: string
    role: string
    email: string
  }>
  createdAt: string
  updatedAt: string
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-03-15',
    nationality: 'US',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    investorType: 'individual',
    kycStatus: 'approved',
    kycSubmittedAt: '2024-01-15T10:30:00Z',
    kycApprovedAt: '2024-01-18T14:20:00Z',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
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
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'user-002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@techcorp.com',
    phone: '+1-555-0456',
    dateOfBirth: '1990-07-22',
    nationality: 'ES',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c772c3c3',
    institutionId: 'inst-001',
    investorType: 'company',
    kycStatus: 'pending',
    kycSubmittedAt: '2024-01-20T11:15:00Z',
    address: {
      street: '456 Business Ave',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US'
    },
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
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  {
    id: 'user-003',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@familyoffice.com',
    phone: '+1-555-0789',
    dateOfBirth: '1975-11-08',
    nationality: 'SG',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    investorType: 'family_office',
    kycStatus: 'verified',
    kycSubmittedAt: '2024-01-05T08:45:00Z',
    kycApprovedAt: '2024-01-08T16:30:00Z',
    address: {
      street: '789 Wealth Street',
      city: 'Singapore',
      state: '',
      postalCode: '018956',
      country: 'SG'
    },
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
    createdAt: '2024-01-01T07:00:00Z',
    updatedAt: '2024-01-08T16:30:00Z'
  },
  {
    id: 'user-004',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@startup.io',
    phone: '+1-555-0321',
    dateOfBirth: '1988-04-12',
    nationality: 'UK',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    investorType: 'high_net_worth',
    kycStatus: 'rejected',
    kycSubmittedAt: '2024-01-18T13:20:00Z',
    kycRejectedAt: '2024-01-19T09:15:00Z',
    kycRejectionReason: 'Incomplete documentation and source of funds verification required',
    address: {
      street: '321 Innovation Drive',
      city: 'London',
      state: '',
      postalCode: 'SW1A 1AA',
      country: 'UK'
    },
    sourceOfFunds: 'Startup exit and angel investments',
    connectedParties: [],
    ultimateBeneficialOwners: [],
    authorizedPersons: [],
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T09:15:00Z'
  },
  {
    id: 'user-005',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david.cohen@investment.com',
    phone: '+971-555-0654',
    dateOfBirth: '1982-09-30',
    nationality: 'AE',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    investorType: 'individual',
    kycStatus: 'pending',
    kycSubmittedAt: '2024-01-22T15:45:00Z',
    address: {
      street: '654 Financial District',
      city: 'Dubai',
      state: '',
      postalCode: '00000',
      country: 'AE'
    },
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
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-22T15:45:00Z'
  }
] 