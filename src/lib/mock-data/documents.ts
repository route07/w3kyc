export interface MockDocument {
  id: string
  userId: string
  name: string
  type: 'passport' | 'utility_bill' | 'bank_statement' | 'corporate_document' | 'trust_deed' | 'business_document' | 'identity_document' | 'proof_of_address'
  ipfsHash: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verificationNotes?: string
  rejectionReason?: string
  verifiedAt?: string
  verifiedBy?: string
  ocrResults?: {
    extractedData: Record<string, string>
    confidence: number
    validationStatus: 'valid' | 'invalid' | 'pending'
    extractedFields: Array<{
      field: string
      value: string
      confidence: number
    }>
  }
  documentMetadata: {
    issueDate?: string
    expiryDate?: string
    issuingCountry?: string
    documentNumber?: string
    documentType?: string
  }
  blockchainStatus: {
    onChainVerification: boolean
    verificationHash?: string
    blockNumber?: number
    transactionHash?: string
  }
  createdAt: string
  updatedAt: string
}

export const mockDocuments: MockDocument[] = [
  {
    id: 'doc-001',
    userId: 'user-001',
    name: 'US_Passport_John_Smith.pdf',
    type: 'passport',
    ipfsHash: 'QmXzK9L2M1N8P7Q6R5S4T3U2V1W0X9Y8Z7A6B5C4D3E2F1',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'verified',
    verificationNotes: 'Passport verified as authentic',
    verifiedAt: '2024-01-15T10:35:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'firstName': 'John',
        'lastName': 'Smith',
        'dateOfBirth': '1985-03-15',
        'passportNumber': 'US123456789',
        'issueDate': '2020-01-15',
        'expiryDate': '2030-01-15',
        'issuingCountry': 'US'
      },
      confidence: 0.94,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'firstName', value: 'John', confidence: 0.98 },
        { field: 'lastName', value: 'Smith', confidence: 0.97 },
        { field: 'dateOfBirth', value: '1985-03-15', confidence: 0.95 },
        { field: 'passportNumber', value: 'US123456789', confidence: 0.92 },
        { field: 'issueDate', value: '2020-01-15', confidence: 0.90 },
        { field: 'expiryDate', value: '2030-01-15', confidence: 0.91 }
      ]
    },
    documentMetadata: {
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15',
      issuingCountry: 'US',
      documentNumber: 'US123456789',
      documentType: 'Passport'
    },
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 18475632,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z'
  },
  
  {
    id: 'doc-002',
    userId: 'user-001',
    name: 'Utility_Bill_John_Smith.pdf',
    type: 'utility_bill',
    ipfsHash: 'QmF1E2D3C4B5A6Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4',
    fileSize: 1048576,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T10:32:00Z',
    status: 'verified',
    verificationNotes: 'Address verification successful',
    verifiedAt: '2024-01-15T10:37:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'customerName': 'John Smith',
        'address': '123 Main Street, New York, NY 10001',
        'accountNumber': 'UTIL123456',
        'billDate': '2024-01-01',
        'dueDate': '2024-01-31'
      },
      confidence: 0.89,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'customerName', value: 'John Smith', confidence: 0.95 },
        { field: 'address', value: '123 Main Street, New York, NY 10001', confidence: 0.88 },
        { field: 'accountNumber', value: 'UTIL123456', confidence: 0.92 },
        { field: 'billDate', value: '2024-01-01', confidence: 0.90 },
        { field: 'dueDate', value: '2024-01-31', confidence: 0.87 }
      ]
    },
    documentMetadata: {
      issueDate: '2024-01-01',
      expiryDate: '2024-01-31',
      issuingCountry: 'US',
      documentType: 'Utility Bill'
    },
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 18475632,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    createdAt: '2024-01-15T10:32:00Z',
    updatedAt: '2024-01-15T10:37:00Z'
  },
  
  {
    id: 'doc-003',
    userId: 'user-002',
    name: 'ES_Passport_Maria_Garcia.pdf',
    type: 'passport',
    ipfsHash: 'QmG1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2',
    fileSize: 2097152,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-20T11:15:00Z',
    status: 'verified',
    verificationNotes: 'Passport verified as authentic',
    verifiedAt: '2024-01-20T11:20:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'firstName': 'Maria',
        'lastName': 'Garcia',
        'dateOfBirth': '1990-07-22',
        'passportNumber': 'ES987654321',
        'issueDate': '2019-06-15',
        'expiryDate': '2029-06-15',
        'issuingCountry': 'ES'
      },
      confidence: 0.93,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'firstName', value: 'Maria', confidence: 0.97 },
        { field: 'lastName', value: 'Garcia', confidence: 0.96 },
        { field: 'dateOfBirth', value: '1990-07-22', confidence: 0.94 },
        { field: 'passportNumber', value: 'ES987654321', confidence: 0.91 },
        { field: 'issueDate', value: '2019-06-15', confidence: 0.89 },
        { field: 'expiryDate', value: '2029-06-15', confidence: 0.90 }
      ]
    },
    documentMetadata: {
      issueDate: '2019-06-15',
      expiryDate: '2029-06-15',
      issuingCountry: 'ES',
      documentNumber: 'ES987654321',
      documentType: 'Passport'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-20T11:20:00Z'
  },
  
  {
    id: 'doc-004',
    userId: 'user-002',
    name: 'TechCorp_Articles_of_Incorporation.pdf',
    type: 'corporate_document',
    ipfsHash: 'QmC1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2',
    fileSize: 3145728,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-20T11:18:00Z',
    status: 'pending',
    verificationNotes: 'Corporate documents under review',
    ocrResults: {
      extractedData: {
        'companyName': 'TechCorp Holdings Ltd',
        'registrationNumber': 'CORP-2024-001',
        'jurisdiction': 'Delaware, US',
        'incorporationDate': '2024-01-15',
        'businessType': 'Corporation'
      },
      confidence: 0.87,
      validationStatus: 'pending',
      extractedFields: [
        { field: 'companyName', value: 'TechCorp Holdings Ltd', confidence: 0.92 },
        { field: 'registrationNumber', value: 'CORP-2024-001', confidence: 0.88 },
        { field: 'jurisdiction', value: 'Delaware, US', confidence: 0.85 },
        { field: 'incorporationDate', value: '2024-01-15', confidence: 0.90 },
        { field: 'businessType', value: 'Corporation', confidence: 0.89 }
      ]
    },
    documentMetadata: {
      issueDate: '2024-01-15',
      issuingCountry: 'US',
      documentType: 'Articles of Incorporation'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-20T11:18:00Z',
    updatedAt: '2024-01-20T11:18:00Z'
  },
  
  {
    id: 'doc-005',
    userId: 'user-002',
    name: 'TechCorp_Bank_Statement.pdf',
    type: 'bank_statement',
    ipfsHash: 'QmY1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2',
    fileSize: 1572864,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-20T11:20:00Z',
    status: 'pending',
    verificationNotes: 'Bank statements under review',
    ocrResults: {
      extractedData: {
        'accountHolder': 'TechCorp Holdings Ltd',
        'accountNumber': '****5678',
        'bankName': 'Chase Bank',
        'statementPeriod': 'December 2023',
        'accountBalance': '$2,500,000.00'
      },
      confidence: 0.85,
      validationStatus: 'pending',
      extractedFields: [
        { field: 'accountHolder', value: 'TechCorp Holdings Ltd', confidence: 0.90 },
        { field: 'accountNumber', value: '****5678', confidence: 0.88 },
        { field: 'bankName', value: 'Chase Bank', confidence: 0.92 },
        { field: 'statementPeriod', value: 'December 2023', confidence: 0.87 },
        { field: 'accountBalance', value: '$2,500,000.00', confidence: 0.83 }
      ]
    },
    documentMetadata: {
      issueDate: '2023-12-31',
      issuingCountry: 'US',
      documentType: 'Bank Statement'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-20T11:20:00Z',
    updatedAt: '2024-01-20T11:20:00Z'
  },
  
  {
    id: 'doc-006',
    userId: 'user-003',
    name: 'SG_Passport_David_Chen.pdf',
    type: 'passport',
    ipfsHash: 'QmU1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2',
    fileSize: 1998848,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-05T08:45:00Z',
    status: 'verified',
    verificationNotes: 'Passport verified as authentic',
    verifiedAt: '2024-01-05T08:50:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'firstName': 'David',
        'lastName': 'Chen',
        'dateOfBirth': '1975-11-08',
        'passportNumber': 'SG123456789',
        'issueDate': '2018-03-20',
        'expiryDate': '2028-03-20',
        'issuingCountry': 'SG'
      },
      confidence: 0.95,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'firstName', value: 'David', confidence: 0.98 },
        { field: 'lastName', value: 'Chen', confidence: 0.97 },
        { field: 'dateOfBirth', value: '1975-11-08', confidence: 0.96 },
        { field: 'passportNumber', value: 'SG123456789', confidence: 0.93 },
        { field: 'issueDate', value: '2018-03-20', confidence: 0.91 },
        { field: 'expiryDate', value: '2028-03-20', confidence: 0.92 }
      ]
    },
    documentMetadata: {
      issueDate: '2018-03-20',
      expiryDate: '2028-03-20',
      issuingCountry: 'SG',
      documentNumber: 'SG123456789',
      documentType: 'Passport'
    },
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 18475630,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-01-05T08:50:00Z'
  },
  
  {
    id: 'doc-007',
    userId: 'user-003',
    name: 'Chen_Family_Trust_Deed.pdf',
    type: 'trust_deed',
    ipfsHash: 'QmQ1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2',
    fileSize: 4194304,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-05T08:48:00Z',
    status: 'verified',
    verificationNotes: 'Trust deed verified and authenticated',
    verifiedAt: '2024-01-05T08:55:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'trustName': 'Chen Family Trust',
        'settlor': 'David Chen',
        'trustee': 'David Chen',
        'establishmentDate': '2015-06-15',
        'jurisdiction': 'Singapore'
      },
      confidence: 0.88,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'trustName', value: 'Chen Family Trust', confidence: 0.92 },
        { field: 'settlor', value: 'David Chen', confidence: 0.90 },
        { field: 'trustee', value: 'David Chen', confidence: 0.89 },
        { field: 'establishmentDate', value: '2015-06-15', confidence: 0.87 },
        { field: 'jurisdiction', value: 'Singapore', confidence: 0.91 }
      ]
    },
    documentMetadata: {
      issueDate: '2015-06-15',
      issuingCountry: 'SG',
      documentType: 'Trust Deed'
    },
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 18475630,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    createdAt: '2024-01-05T08:48:00Z',
    updatedAt: '2024-01-05T08:55:00Z'
  },
  
  {
    id: 'doc-008',
    userId: 'user-003',
    name: 'DBS_Bank_Statement.pdf',
    type: 'bank_statement',
    ipfsHash: 'QmM1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2',
    fileSize: 1835008,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-05T08:50:00Z',
    status: 'verified',
    verificationNotes: 'Bank statements verified',
    verifiedAt: '2024-01-05T08:58:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'accountHolder': 'Chen Family Office',
        'accountNumber': '****5678',
        'bankName': 'DBS Bank',
        'statementPeriod': 'December 2023',
        'accountBalance': 'SGD 15,000,000.00'
      },
      confidence: 0.86,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'accountHolder', value: 'Chen Family Office', confidence: 0.89 },
        { field: 'accountNumber', value: '****5678', confidence: 0.87 },
        { field: 'bankName', value: 'DBS Bank', confidence: 0.93 },
        { field: 'statementPeriod', value: 'December 2023', confidence: 0.85 },
        { field: 'accountBalance', value: 'SGD 15,000,000.00', confidence: 0.82 }
      ]
    },
    documentMetadata: {
      issueDate: '2023-12-31',
      issuingCountry: 'SG',
      documentType: 'Bank Statement'
    },
    blockchainStatus: {
      onChainVerification: true,
      verificationHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 18475630,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    createdAt: '2024-01-05T08:50:00Z',
    updatedAt: '2024-01-05T08:58:00Z'
  },
  
  {
    id: 'doc-009',
    userId: 'user-004',
    name: 'GB_Passport_Emma_Wilson.pdf',
    type: 'passport',
    ipfsHash: 'QmI1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2',
    fileSize: 2129920,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-18T13:20:00Z',
    status: 'verified',
    verificationNotes: 'Passport verified as authentic',
    verifiedAt: '2024-01-18T13:25:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'firstName': 'Emma',
        'lastName': 'Wilson',
        'dateOfBirth': '1988-04-12',
        'passportNumber': 'GB123456789',
        'issueDate': '2021-09-10',
        'expiryDate': '2031-09-10',
        'issuingCountry': 'GB'
      },
      confidence: 0.92,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'firstName', value: 'Emma', confidence: 0.96 },
        { field: 'lastName', value: 'Wilson', confidence: 0.95 },
        { field: 'dateOfBirth', value: '1988-04-12', confidence: 0.93 },
        { field: 'passportNumber', value: 'GB123456789', confidence: 0.90 },
        { field: 'issueDate', value: '2021-09-10', confidence: 0.88 },
        { field: 'expiryDate', value: '2031-09-10', confidence: 0.89 }
      ]
    },
    documentMetadata: {
      issueDate: '2021-09-10',
      expiryDate: '2031-09-10',
      issuingCountry: 'GB',
      documentNumber: 'GB123456789',
      documentType: 'Passport'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-18T13:20:00Z',
    updatedAt: '2024-01-18T13:25:00Z'
  },
  
  {
    id: 'doc-010',
    userId: 'user-004',
    name: 'Startup_Exit_Documentation.pdf',
    type: 'business_document',
    ipfsHash: 'QmE1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2',
    fileSize: 5242880,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-18T13:25:00Z',
    status: 'rejected',
    rejectionReason: 'Incomplete startup exit documentation',
    verificationNotes: 'Missing key financial details and transaction records',
    ocrResults: {
      extractedData: {
        'companyName': 'InnovationStartup Ltd',
        'exitType': 'Acquisition',
        'exitDate': '2023-12-15',
        'acquirer': 'Tech Giant Inc'
      },
      confidence: 0.78,
      validationStatus: 'invalid',
      extractedFields: [
        { field: 'companyName', value: 'InnovationStartup Ltd', confidence: 0.85 },
        { field: 'exitType', value: 'Acquisition', confidence: 0.80 },
        { field: 'exitDate', value: '2023-12-15', confidence: 0.75 },
        { field: 'acquirer', value: 'Tech Giant Inc', confidence: 0.82 }
      ]
    },
    documentMetadata: {
      issueDate: '2023-12-15',
      issuingCountry: 'GB',
      documentType: 'Business Document'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-18T13:25:00Z',
    updatedAt: '2024-01-19T09:15:00Z'
  },
  
  {
    id: 'doc-011',
    userId: 'user-005',
    name: 'AE_Passport_David_Cohen.pdf',
    type: 'passport',
    ipfsHash: 'QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2',
    fileSize: 1966080,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-22T15:45:00Z',
    status: 'verified',
    verificationNotes: 'Passport verified as authentic',
    verifiedAt: '2024-01-22T15:50:00Z',
    verifiedBy: 'system',
    ocrResults: {
      extractedData: {
        'firstName': 'David',
        'lastName': 'Cohen',
        'dateOfBirth': '1982-09-30',
        'passportNumber': 'AE987654321',
        'issueDate': '2020-11-20',
        'expiryDate': '2030-11-20',
        'issuingCountry': 'AE'
      },
      confidence: 0.91,
      validationStatus: 'valid',
      extractedFields: [
        { field: 'firstName', value: 'David', confidence: 0.95 },
        { field: 'lastName', value: 'Cohen', confidence: 0.94 },
        { field: 'dateOfBirth', value: '1982-09-30', confidence: 0.92 },
        { field: 'passportNumber', value: 'AE987654321', confidence: 0.89 },
        { field: 'issueDate', value: '2020-11-20', confidence: 0.87 },
        { field: 'expiryDate', value: '2030-11-20', confidence: 0.88 }
      ]
    },
    documentMetadata: {
      issueDate: '2020-11-20',
      expiryDate: '2030-11-20',
      issuingCountry: 'AE',
      documentNumber: 'AE987654321',
      documentType: 'Passport'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-22T15:45:00Z',
    updatedAt: '2024-01-22T15:50:00Z'
  },
  
  {
    id: 'doc-012',
    userId: 'user-005',
    name: 'Investment_Group_Registration.pdf',
    type: 'corporate_document',
    ipfsHash: 'QmW1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2',
    fileSize: 2621440,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-22T15:48:00Z',
    status: 'pending',
    verificationNotes: 'Corporate documents under review',
    ocrResults: {
      extractedData: {
        'companyName': 'Cohen Investment Group',
        'registrationNumber': 'INV-2024-004',
        'jurisdiction': 'Dubai, UAE',
        'registrationDate': '2024-01-20',
        'businessType': 'Investment Company'
      },
      confidence: 0.84,
      validationStatus: 'pending',
      extractedFields: [
        { field: 'companyName', value: 'Cohen Investment Group', confidence: 0.88 },
        { field: 'registrationNumber', value: 'INV-2024-004', confidence: 0.85 },
        { field: 'jurisdiction', value: 'Dubai, UAE', confidence: 0.82 },
        { field: 'registrationDate', value: '2024-01-20', confidence: 0.86 },
        { field: 'businessType', value: 'Investment Company', confidence: 0.83 }
      ]
    },
    documentMetadata: {
      issueDate: '2024-01-20',
      issuingCountry: 'AE',
      documentType: 'Corporate Registration'
    },
    blockchainStatus: {
      onChainVerification: false
    },
    createdAt: '2024-01-22T15:48:00Z',
    updatedAt: '2024-01-22T15:48:00Z'
  }
] 