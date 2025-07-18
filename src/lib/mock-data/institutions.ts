export interface MockInstitution {
  id: string
  name: string
  type: 'bank' | 'investment_firm' | 'family_office' | 'corporate' | 'trust'
  registrationNumber: string
  jurisdiction: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contactPerson: {
    name: string
    email: string
    phone: string
    role: string
  }
  regulatoryStatus: {
    licensed: boolean
    licenseNumber?: string
    regulatoryBody: string
    complianceStatus: 'compliant' | 'pending' | 'non_compliant'
  }
  businessActivities: string[]
  riskLevel: 'low' | 'medium' | 'high'
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export const mockInstitutions: MockInstitution[] = [
  {
    id: 'inst-001',
    name: 'TechCorp Holdings Ltd',
    type: 'corporate',
    registrationNumber: 'CORP-2024-001',
    jurisdiction: 'Delaware, US',
    address: {
      street: '456 Business Avenue',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US'
    },
    contactPerson: {
      name: 'Maria Garcia',
      email: 'maria.garcia@techcorp.com',
      phone: '+1-555-0456',
      role: 'CEO'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'FL-CORP-2024-001',
      regulatoryBody: 'Florida Department of State',
      complianceStatus: 'compliant'
    },
    businessActivities: [
      'Software Development',
      'Technology Consulting',
      'Digital Services',
      'Investment Management'
    ],
    riskLevel: 'medium',
    kycStatus: 'pending',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  
  {
    id: 'inst-002',
    name: 'Chen Family Office',
    type: 'family_office',
    registrationNumber: 'FO-2024-002',
    jurisdiction: 'Singapore',
    address: {
      street: '789 Wealth Street',
      city: 'Singapore',
      state: '',
      postalCode: '018956',
      country: 'SG'
    },
    contactPerson: {
      name: 'David Chen',
      email: 'david.chen@familyoffice.com',
      phone: '+1-555-0789',
      role: 'Managing Director'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'SG-FO-2024-002',
      regulatoryBody: 'Monetary Authority of Singapore',
      complianceStatus: 'compliant'
    },
    businessActivities: [
      'Wealth Management',
      'Investment Advisory',
      'Family Trust Management',
      'Philanthropic Activities'
    ],
    riskLevel: 'low',
    kycStatus: 'approved',
    createdAt: '2024-01-01T07:00:00Z',
    updatedAt: '2024-01-08T16:30:00Z'
  },
  
  {
    id: 'inst-003',
    name: 'InnovationStartup Ltd',
    type: 'corporate',
    registrationNumber: 'STARTUP-2024-003',
    jurisdiction: 'United Kingdom',
    address: {
      street: '321 Innovation Drive',
      city: 'London',
      state: '',
      postalCode: 'SW1A 1AA',
      country: 'UK'
    },
    contactPerson: {
      name: 'Emma Wilson',
      email: 'emma.wilson@startup.io',
      phone: '+1-555-0321',
      role: 'Founder & CEO'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'UK-COMP-2024-003',
      regulatoryBody: 'Companies House UK',
      complianceStatus: 'pending'
    },
    businessActivities: [
      'Technology Innovation',
      'Software Development',
      'Digital Platforms',
      'Investment Activities'
    ],
    riskLevel: 'medium',
    kycStatus: 'rejected',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T09:15:00Z'
  },
  
  {
    id: 'inst-004',
    name: 'Cohen Investment Group',
    type: 'investment_firm',
    registrationNumber: 'INV-2024-004',
    jurisdiction: 'Dubai, UAE',
    address: {
      street: '654 Financial District',
      city: 'Dubai',
      state: '',
      postalCode: '00000',
      country: 'AE'
    },
    contactPerson: {
      name: 'David Cohen',
      email: 'david.cohen@investment.com',
      phone: '+971-555-0654',
      role: 'Managing Director'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'AE-INV-2024-004',
      regulatoryBody: 'Dubai Financial Services Authority',
      complianceStatus: 'compliant'
    },
    businessActivities: [
      'Real Estate Investment',
      'Trading Operations',
      'Portfolio Management',
      'International Investments'
    ],
    riskLevel: 'medium',
    kycStatus: 'pending',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-22T15:45:00Z'
  },
  
  {
    id: 'inst-005',
    name: 'Chase Bank',
    type: 'bank',
    registrationNumber: 'BANK-2024-005',
    jurisdiction: 'New York, US',
    address: {
      street: '270 Park Avenue',
      city: 'New York',
      state: 'NY',
      postalCode: '10017',
      country: 'US'
    },
    contactPerson: {
      name: 'John Smith',
      email: 'john.smith@chase.com',
      phone: '+1-555-0123',
      role: 'Relationship Manager'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'NY-BANK-2024-005',
      regulatoryBody: 'Federal Reserve Bank of New York',
      complianceStatus: 'compliant'
    },
    businessActivities: [
      'Commercial Banking',
      'Investment Banking',
      'Wealth Management',
      'Retail Banking'
    ],
    riskLevel: 'low',
    kycStatus: 'approved',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  
  {
    id: 'inst-006',
    name: 'DBS Bank',
    type: 'bank',
    registrationNumber: 'BANK-2024-006',
    jurisdiction: 'Singapore',
    address: {
      street: '12 Marina Boulevard',
      city: 'Singapore',
      state: '',
      postalCode: '018982',
      country: 'SG'
    },
    contactPerson: {
      name: 'David Chen',
      email: 'david.chen@dbs.com',
      phone: '+65-6878-8888',
      role: 'Private Banking Manager'
    },
    regulatoryStatus: {
      licensed: true,
      licenseNumber: 'SG-BANK-2024-006',
      regulatoryBody: 'Monetary Authority of Singapore',
      complianceStatus: 'compliant'
    },
    businessActivities: [
      'Commercial Banking',
      'Private Banking',
      'Investment Services',
      'Wealth Management'
    ],
    riskLevel: 'low',
    kycStatus: 'approved',
    createdAt: '2024-01-01T07:00:00Z',
    updatedAt: '2024-01-08T16:30:00Z'
  }
] 