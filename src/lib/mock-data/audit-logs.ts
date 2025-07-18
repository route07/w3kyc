export interface MockAuditLog {
  id: string
  userId: string
  action: string
  category: 'kyc_submission' | 'kyc_approval' | 'kyc_rejection' | 'document_upload' | 'profile_update' | 'risk_assessment' | 'wallet_linking' | 'admin_action'
  description: string
  details: Record<string, any>
  timestamp: string
  ipAddress: string
  userAgent: string
  blockchainHash?: string
  blockNumber?: number
  transactionHash?: string
  adminId?: string
  status: 'pending' | 'completed' | 'failed'
}

export const mockAuditLogs: MockAuditLog[] = [
  {
    id: 'audit-001',
    userId: 'user-001',
    action: 'KYC_SUBMISSION_CREATED',
    category: 'kyc_submission',
    description: 'Initial KYC submission created',
    details: {
      investorType: 'individual',
      documentCount: 2,
      sourceOfFunds: 'Employment income and investment returns'
    },
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-002',
    userId: 'user-001',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Passport document uploaded and verified',
    details: {
      documentType: 'passport',
      documentName: 'US_Passport_John_Smith.pdf',
      ipfsHash: 'QmXzK9L2M1N8P7Q6R5S4T3U2V1W0X9Y8Z7A6B5C4D3E2F1',
      verificationStatus: 'verified'
    },
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-003',
    userId: 'user-001',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Utility bill uploaded for address verification',
    details: {
      documentType: 'utility_bill',
      documentName: 'Utility_Bill_John_Smith.pdf',
      ipfsHash: 'QmF1E2D3C4B5A6Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4',
      verificationStatus: 'verified'
    },
    timestamp: '2024-01-15T10:32:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-004',
    userId: 'user-001',
    action: 'RISK_ASSESSMENT_TRIGGERED',
    category: 'risk_assessment',
    description: 'AI risk assessment initiated',
    details: {
      riskScore: 15,
      riskLevel: 'low',
      assessmentType: 'automated'
    },
    timestamp: '2024-01-15T10:35:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'System/AI-Assessment',
    status: 'completed'
  },
  
  {
    id: 'audit-005',
    userId: 'user-001',
    action: 'KYC_APPROVED',
    category: 'kyc_approval',
    description: 'KYC submission approved by admin',
    details: {
      approvedBy: 'admin-001',
      approvalNotes: 'All documents verified, risk assessment passed',
      riskScore: 15,
      riskLevel: 'low'
    },
    timestamp: '2024-01-18T14:20:00Z',
    ipAddress: '10.0.0.50',
    userAgent: 'Admin-Portal/1.0',
    adminId: 'admin-001',
    blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 18475632,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'completed'
  },
  
  {
    id: 'audit-006',
    userId: 'user-001',
    action: 'WALLET_LINKED',
    category: 'wallet_linking',
    description: 'Cryptocurrency wallet linked to verified profile',
    details: {
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      walletType: 'Ethereum',
      linkingMethod: 'manual'
    },
    timestamp: '2024-01-18T14:25:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18475633,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'completed'
  },
  
  {
    id: 'audit-007',
    userId: 'user-002',
    action: 'KYC_SUBMISSION_CREATED',
    category: 'kyc_submission',
    description: 'Corporate KYC submission created',
    details: {
      investorType: 'company',
      institutionId: 'inst-001',
      documentCount: 3,
      sourceOfFunds: 'Business operations and investment portfolio'
    },
    timestamp: '2024-01-20T11:15:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-008',
    userId: 'user-002',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Corporate documents uploaded',
    details: {
      documentType: 'corporate_document',
      documentName: 'TechCorp_Articles_of_Incorporation.pdf',
      ipfsHash: 'QmC1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2',
      verificationStatus: 'pending'
    },
    timestamp: '2024-01-20T11:18:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-009',
    userId: 'user-002',
    action: 'RISK_ASSESSMENT_TRIGGERED',
    category: 'risk_assessment',
    description: 'AI risk assessment initiated for corporate entity',
    details: {
      riskScore: 65,
      riskLevel: 'medium',
      assessmentType: 'automated',
      notes: 'International business operations detected'
    },
    timestamp: '2024-01-20T11:25:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'System/AI-Assessment',
    status: 'completed'
  },
  
  {
    id: 'audit-010',
    userId: 'user-003',
    action: 'KYC_SUBMISSION_CREATED',
    category: 'kyc_submission',
    description: 'Family office KYC submission created',
    details: {
      investorType: 'family_office',
      documentCount: 3,
      sourceOfFunds: 'Family wealth management and investment returns'
    },
    timestamp: '2024-01-05T08:45:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-011',
    userId: 'user-003',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Family trust deed uploaded and verified',
    details: {
      documentType: 'trust_deed',
      documentName: 'Chen_Family_Trust_Deed.pdf',
      ipfsHash: 'QmQ1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2',
      verificationStatus: 'verified'
    },
    timestamp: '2024-01-05T08:48:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-012',
    userId: 'user-003',
    action: 'KYC_APPROVED',
    category: 'kyc_approval',
    description: 'Family office KYC approved',
    details: {
      approvedBy: 'admin-002',
      approvalNotes: 'Well-established family office with clean background',
      riskScore: 25,
      riskLevel: 'low'
    },
    timestamp: '2024-01-08T16:30:00Z',
    ipAddress: '10.0.0.51',
    userAgent: 'Admin-Portal/1.0',
    adminId: 'admin-002',
    blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18475630,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'completed'
  },
  
  {
    id: 'audit-013',
    userId: 'user-004',
    action: 'KYC_SUBMISSION_CREATED',
    category: 'kyc_submission',
    description: 'High net worth individual KYC submission created',
    details: {
      investorType: 'high_net_worth',
      documentCount: 2,
      sourceOfFunds: 'Startup exit and angel investments'
    },
    timestamp: '2024-01-18T13:20:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-014',
    userId: 'user-004',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Startup exit documentation uploaded',
    details: {
      documentType: 'business_document',
      documentName: 'Startup_Exit_Documentation.pdf',
      ipfsHash: 'QmE1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2',
      verificationStatus: 'rejected',
      rejectionReason: 'Incomplete startup exit documentation'
    },
    timestamp: '2024-01-18T13:25:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-015',
    userId: 'user-004',
    action: 'KYC_REJECTED',
    category: 'kyc_rejection',
    description: 'KYC submission rejected due to incomplete documentation',
    details: {
      rejectedBy: 'admin-003',
      rejectionReason: 'Incomplete documentation and source of funds verification required',
      riskScore: 85,
      riskLevel: 'high'
    },
    timestamp: '2024-01-19T09:15:00Z',
    ipAddress: '10.0.0.52',
    userAgent: 'Admin-Portal/1.0',
    adminId: 'admin-003',
    status: 'completed'
  },
  
  {
    id: 'audit-016',
    userId: 'user-005',
    action: 'KYC_SUBMISSION_CREATED',
    category: 'kyc_submission',
    description: 'International investor KYC submission created',
    details: {
      investorType: 'individual',
      documentCount: 2,
      sourceOfFunds: 'Real estate investments and trading profits'
    },
    timestamp: '2024-01-22T15:45:00Z',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-017',
    userId: 'user-005',
    action: 'DOCUMENT_UPLOADED',
    category: 'document_upload',
    description: 'Investment group registration uploaded',
    details: {
      documentType: 'corporate_document',
      documentName: 'Investment_Group_Registration.pdf',
      ipfsHash: 'QmW1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2',
      verificationStatus: 'pending'
    },
    timestamp: '2024-01-22T15:48:00Z',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'completed'
  },
  
  {
    id: 'audit-018',
    userId: 'user-001',
    action: 'PROFILE_UPDATED',
    category: 'profile_update',
    description: 'User profile information updated',
    details: {
      updatedFields: ['phone', 'address'],
      previousValues: {
        phone: '+1-555-0123',
        address: '123 Main Street, New York, NY 10001'
      },
      newValues: {
        phone: '+1-555-0124',
        address: '124 Main Street, New York, NY 10001'
      }
    },
    timestamp: '2024-01-25T10:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 18475640,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'completed'
  },
  
  {
    id: 'audit-019',
    userId: 'user-002',
    action: 'ADMIN_REVIEW_REQUESTED',
    category: 'admin_action',
    description: 'Admin review requested for corporate KYC',
    details: {
      requestedBy: 'admin-001',
      reviewReason: 'International business operations require enhanced due diligence',
      priority: 'medium'
    },
    timestamp: '2024-01-22T16:00:00Z',
    ipAddress: '10.0.0.50',
    userAgent: 'Admin-Portal/1.0',
    adminId: 'admin-001',
    status: 'completed'
  },
  
  {
    id: 'audit-020',
    userId: 'user-005',
    action: 'RISK_ASSESSMENT_TRIGGERED',
    category: 'risk_assessment',
    description: 'AI risk assessment initiated for international investor',
    details: {
      riskScore: 75,
      riskLevel: 'high',
      assessmentType: 'automated',
      notes: 'International operations and investment activities detected'
    },
    timestamp: '2024-01-22T15:55:00Z',
    ipAddress: '192.168.1.104',
    userAgent: 'System/AI-Assessment',
    status: 'completed'
  }
] 