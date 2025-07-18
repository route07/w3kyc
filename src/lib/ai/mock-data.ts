import { RiskLevel } from '@/types';

// Mock user profiles for different risk scenarios
export const MOCK_USERS = {
  lowRisk: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    nationality: 'British',
    company: 'TechCorp Ltd',
    riskProfile: 'low',
  },
  mediumRisk: {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    nationality: 'Spanish',
    company: 'Global Trading Co',
    riskProfile: 'medium',
  },
  highRisk: {
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david.cohen@email.com',
    nationality: 'UAE',
    company: 'Offshore Holdings Ltd',
    riskProfile: 'high',
  },
  criticalRisk: {
    firstName: 'Vladimir',
    lastName: 'Petrov',
    email: 'vladimir.petrov@email.com',
    nationality: 'Russian',
    company: 'Eastern Ventures LLC',
    riskProfile: 'critical',
  },
};

// Mock risk assessment responses
export const MOCK_RISK_ASSESSMENTS = {
  lowRisk: {
    identityRisk: {
      score: 15,
      level: RiskLevel.LOW,
      factors: ['Valid passport', 'Consistent address history'],
      reasoning: 'Strong identity verification with consistent documentation',
    },
    industryRisk: {
      score: 10,
      level: RiskLevel.LOW,
      factors: ['Legitimate tech company', 'Clean business record'],
      reasoning: 'Low-risk industry with established reputation',
    },
    networkRisk: {
      score: 5,
      level: RiskLevel.LOW,
      factors: ['No high-risk connections', 'Professional network'],
      reasoning: 'Clean network with no suspicious associations',
    },
    securityRisk: {
      score: 8,
      level: RiskLevel.LOW,
      factors: ['No data breaches', 'Secure email domain'],
      reasoning: 'No security incidents detected',
    },
    overallRisk: {
      score: 10,
      level: RiskLevel.LOW,
      factors: ['Low-risk profile across all dimensions'],
      reasoning: 'Comprehensive assessment indicates low risk profile',
    },
  },
  mediumRisk: {
    identityRisk: {
      score: 35,
      level: RiskLevel.MEDIUM,
      factors: ['Recent address change', 'Multiple passports'],
      reasoning: 'Some identity verification concerns due to recent changes',
    },
    industryRisk: {
      score: 45,
      level: RiskLevel.MEDIUM,
      factors: ['Trading company', 'International operations'],
      reasoning: 'Medium-risk industry with international exposure',
    },
    networkRisk: {
      score: 30,
      level: RiskLevel.MEDIUM,
      factors: ['Some international connections', 'Mixed business network'],
      reasoning: 'Moderate network risk with international exposure',
    },
    securityRisk: {
      score: 25,
      level: RiskLevel.MEDIUM,
      factors: ['Minor data breach exposure', 'Public social media presence'],
      reasoning: 'Some security concerns but not critical',
    },
    overallRisk: {
      score: 34,
      level: RiskLevel.MEDIUM,
      factors: ['Medium risk across multiple dimensions'],
      reasoning: 'Balanced risk profile with some areas of concern',
    },
  },
  highRisk: {
    identityRisk: {
      score: 65,
      level: RiskLevel.HIGH,
      factors: ['Inconsistent documentation', 'Multiple identities'],
      reasoning: 'Significant identity verification concerns',
    },
    industryRisk: {
      score: 75,
      level: RiskLevel.HIGH,
      factors: ['Offshore company', 'High-risk jurisdiction'],
      reasoning: 'High-risk industry with offshore operations',
    },
    networkRisk: {
      score: 70,
      level: RiskLevel.HIGH,
      factors: ['High-risk connections', 'Suspicious associations'],
      reasoning: 'Network contains multiple high-risk entities',
    },
    securityRisk: {
      score: 60,
      level: RiskLevel.HIGH,
      factors: ['Multiple data breaches', 'Dark web mentions'],
      reasoning: 'Significant security concerns detected',
    },
    overallRisk: {
      score: 68,
      level: RiskLevel.HIGH,
      factors: ['High risk across multiple dimensions'],
      reasoning: 'Comprehensive assessment indicates high risk profile',
    },
  },
  criticalRisk: {
    identityRisk: {
      score: 85,
      level: RiskLevel.CRITICAL,
      factors: ['Fake documentation', 'Identity theft indicators'],
      reasoning: 'Critical identity verification issues detected',
    },
    industryRisk: {
      score: 90,
      level: RiskLevel.CRITICAL,
      factors: ['Sanctioned entities', 'Illegal operations'],
      reasoning: 'Critical industry risk with sanctioned connections',
    },
    networkRisk: {
      score: 95,
      level: RiskLevel.CRITICAL,
      factors: ['Criminal network', 'Terrorist financing links'],
      reasoning: 'Critical network risk with criminal associations',
    },
    securityRisk: {
      score: 88,
      level: RiskLevel.CRITICAL,
      factors: ['Major data breaches', 'Blacklist matches'],
      reasoning: 'Critical security issues with blacklist matches',
    },
    overallRisk: {
      score: 90,
      level: RiskLevel.CRITICAL,
      factors: ['Critical risk across all dimensions'],
      reasoning: 'Immediate action required - critical risk profile',
    },
  },
};

// Mock web intelligence data
export const MOCK_WEB_INTELLIGENCE = {
  lowRisk: {
    personInfo: {
      linkedin: {
        profileFound: true,
        connections: 150,
        company: 'TechCorp Ltd',
        position: 'Senior Developer',
        note: 'Professional profile with consistent information',
      },
      companyInfo: {
        name: 'TechCorp Ltd',
        registrationNumber: '12345678',
        status: 'active',
        incorporationDate: '2015-03-15',
        directors: ['John Smith', 'Jane Doe'],
        riskFactors: [],
        industry: 'Technology',
        size: '50-100 employees',
      },
      newsMentions: [
        {
          title: 'TechCorp Ltd Launches New Product',
          source: 'Tech News',
          date: '2024-01-15',
          url: 'https://technews.com/article1',
          sentiment: 'positive',
          relevance: 'high',
        },
      ],
      legalRecords: [],
      riskIndicators: [],
    },
    sanctions: [
      {
        list: 'OFAC',
        match: false,
        confidence: 0,
        note: 'No matches found',
      },
      {
        list: 'UK Sanctions',
        match: false,
        confidence: 0,
        note: 'No matches found',
      },
    ],
    dataBreaches: [
      {
        source: 'haveibeenpwned',
        breaches: [],
        note: 'No breaches found',
      },
    ],
    riskScore: 8,
    riskLevel: RiskLevel.LOW,
    confidence: 95,
    sources: ['web_search', 'company_registry', 'news_search', 'sanctions_lists', 'data_breaches'],
  },
  mediumRisk: {
    personInfo: {
      linkedin: {
        profileFound: true,
        connections: 75,
        company: 'Global Trading Co',
        position: 'Business Development Manager',
        note: 'Professional profile with international focus',
      },
      companyInfo: {
        name: 'Global Trading Co',
        registrationNumber: '87654321',
        status: 'active',
        incorporationDate: '2018-07-22',
        directors: ['Maria Garcia', 'Carlos Rodriguez'],
        riskFactors: ['International operations', 'Multiple jurisdictions'],
        industry: 'Trading',
        size: '10-50 employees',
      },
      newsMentions: [
        {
          title: 'Global Trading Co Expands Operations',
          source: 'Business Daily',
          date: '2024-02-10',
          url: 'https://businessdaily.com/article2',
          sentiment: 'neutral',
          relevance: 'medium',
        },
      ],
      legalRecords: [
        {
          type: 'regulatory_inquiry',
          title: 'Minor regulatory inquiry - resolved',
          date: '2023-06-15',
          status: 'closed',
          relevance: 'low',
        },
      ],
      riskIndicators: [
        {
          type: 'regulatory_inquiry',
          severity: RiskLevel.MEDIUM,
          description: 'Previous regulatory inquiry',
          source: 'legal_records',
        },
      ],
    },
    sanctions: [
      {
        list: 'OFAC',
        match: false,
        confidence: 0,
        note: 'No matches found',
      },
    ],
    dataBreaches: [
      {
        source: 'haveibeenpwned',
        breaches: ['LinkedIn 2021'],
        note: 'Minor breach exposure',
      },
    ],
    riskScore: 35,
    riskLevel: RiskLevel.MEDIUM,
    confidence: 85,
    sources: ['web_search', 'company_registry', 'news_search', 'legal_records', 'sanctions_lists', 'data_breaches'],
  },
  highRisk: {
    personInfo: {
      linkedin: {
        profileFound: false,
        note: 'No professional profile found',
      },
      companyInfo: {
        name: 'Offshore Holdings Ltd',
        registrationNumber: 'OFF123456',
        status: 'active',
        incorporationDate: '2020-01-10',
        directors: ['David Cohen', 'Unknown Director'],
        riskFactors: ['Offshore jurisdiction', 'Shell company indicators', 'Limited transparency'],
        industry: 'Holding Company',
        size: '1-10 employees',
      },
      newsMentions: [
        {
          title: 'Offshore Holdings Under Investigation',
          source: 'Financial Times',
          date: '2024-03-01',
          url: 'https://ft.com/article3',
          sentiment: 'negative',
          relevance: 'high',
        },
      ],
      legalRecords: [
        {
          type: 'investigation',
          title: 'Ongoing financial investigation',
          date: '2024-02-15',
          status: 'active',
          relevance: 'high',
        },
      ],
      riskIndicators: [
        {
          type: 'offshore_company',
          severity: RiskLevel.HIGH,
          description: 'Offshore company with limited transparency',
          source: 'company_registry',
        },
        {
          type: 'active_investigation',
          severity: RiskLevel.HIGH,
          description: 'Active financial investigation',
          source: 'legal_records',
        },
      ],
    },
    sanctions: [
      {
        list: 'OFAC',
        match: false,
        confidence: 0,
        note: 'No direct matches',
      },
    ],
    dataBreaches: [
      {
        source: 'haveibeenpwned',
        breaches: ['LinkedIn 2021', 'Adobe 2013', 'Dropbox 2012'],
        note: 'Multiple breach exposures',
      },
    ],
    riskScore: 65,
    riskLevel: RiskLevel.HIGH,
    confidence: 80,
    sources: ['web_search', 'company_registry', 'news_search', 'legal_records', 'sanctions_lists', 'data_breaches'],
  },
  criticalRisk: {
    personInfo: {
      linkedin: {
        profileFound: false,
        note: 'No professional profile found',
      },
      companyInfo: {
        name: 'Eastern Ventures LLC',
        registrationNumber: 'EV789012',
        status: 'under_investigation',
        incorporationDate: '2019-11-30',
        directors: ['Vladimir Petrov', 'Unknown Director'],
        riskFactors: ['Sanctioned jurisdiction', 'Criminal associations', 'Money laundering indicators'],
        industry: 'Unknown',
        size: 'Unknown',
      },
      newsMentions: [
        {
          title: 'Eastern Ventures Linked to Sanctioned Entities',
          source: 'Reuters',
          date: '2024-03-15',
          url: 'https://reuters.com/article4',
          sentiment: 'negative',
          relevance: 'high',
        },
        {
          title: 'Criminal Network Uncovered',
          source: 'BBC News',
          date: '2024-03-10',
          url: 'https://bbc.com/article5',
          sentiment: 'negative',
          relevance: 'high',
        },
      ],
      legalRecords: [
        {
          type: 'criminal_case',
          title: 'Money laundering investigation',
          date: '2024-01-20',
          status: 'active',
          relevance: 'high',
        },
        {
          type: 'sanctions_violation',
          title: 'Sanctions violation case',
          date: '2024-02-28',
          status: 'active',
          relevance: 'high',
        },
      ],
      riskIndicators: [
        {
          type: 'sanctions_violation',
          severity: RiskLevel.CRITICAL,
          description: 'Active sanctions violation investigation',
          source: 'legal_records',
        },
        {
          type: 'criminal_association',
          severity: RiskLevel.CRITICAL,
          description: 'Criminal network associations',
          source: 'news_search',
        },
      ],
    },
    sanctions: [
      {
        list: 'OFAC',
        match: true,
        confidence: 95,
        note: 'Potential match found',
      },
      {
        list: 'UK Sanctions',
        match: true,
        confidence: 90,
        note: 'Potential match found',
      },
    ],
    dataBreaches: [
      {
        source: 'haveibeenpwned',
        breaches: ['LinkedIn 2021', 'Adobe 2013', 'Dropbox 2012', 'Yahoo 2013', 'MySpace 2016'],
        note: 'Extensive breach exposure',
      },
    ],
    riskScore: 90,
    riskLevel: RiskLevel.CRITICAL,
    confidence: 95,
    sources: ['web_search', 'company_registry', 'news_search', 'legal_records', 'sanctions_lists', 'data_breaches'],
  },
};

// Mock document analysis responses
export const MOCK_DOCUMENT_ANALYSES = {
  passport: {
    authenticity: {
      score: 85,
      indicators: ['Valid MRZ format', 'Consistent fonts', 'Proper hologram'],
      concerns: [],
    },
    dataConsistency: {
      score: 90,
      matches: ['Name matches user data', 'Date of birth consistent'],
      discrepancies: [],
    },
    fraudIndicators: {
      score: 15,
      indicators: [],
      riskLevel: RiskLevel.LOW,
    },
    ocrAccuracy: {
      score: 95,
      extractedData: {
        name: 'John Smith',
        dateOfBirth: '1985-03-15',
        nationality: 'British',
        passportNumber: '123456789',
        expiryDate: '2030-03-15',
      },
      confidence: 0.95,
    },
    overallAssessment: {
      verificationStatus: 'verified',
      confidence: 90,
      recommendations: ['Document appears authentic', 'Proceed with verification'],
    },
  },
  utilityBill: {
    authenticity: {
      score: 75,
      indicators: ['Valid utility company', 'Proper formatting'],
      concerns: ['Recent document'],
    },
    dataConsistency: {
      score: 80,
      matches: ['Address matches user data'],
      discrepancies: ['Date is recent'],
    },
    fraudIndicators: {
      score: 25,
      indicators: [],
      riskLevel: RiskLevel.LOW,
    },
    ocrAccuracy: {
      score: 85,
      extractedData: {
        company: 'British Gas',
        address: '123 Main Street, London, SW1A 1AA',
        accountNumber: '1234567890',
        date: '2024-02-15',
      },
      confidence: 0.85,
    },
    overallAssessment: {
      verificationStatus: 'verified',
      confidence: 80,
      recommendations: ['Document verified', 'Consider additional proof of address'],
    },
  },
  suspiciousDocument: {
    authenticity: {
      score: 45,
      indicators: ['Basic formatting'],
      concerns: ['Poor quality', 'Inconsistent fonts', 'Missing security features'],
    },
    dataConsistency: {
      score: 30,
      matches: [],
      discrepancies: ['Name mismatch', 'Inconsistent dates'],
    },
    fraudIndicators: {
      score: 75,
      indicators: ['Suspicious formatting', 'Data inconsistencies', 'Poor quality'],
      riskLevel: RiskLevel.HIGH,
    },
    ocrAccuracy: {
      score: 60,
      extractedData: {
        name: 'John Smith',
        dateOfBirth: '1985-03-15',
        // Inconsistent data
      },
      confidence: 0.60,
    },
    overallAssessment: {
      verificationStatus: 'rejected',
      confidence: 70,
      recommendations: ['Document appears fraudulent', 'Require additional verification', 'Flag for manual review'],
    },
  },
};

// Mock risk factors for different scenarios
export const MOCK_RISK_FACTORS = {
  lowRisk: [
    {
      type: 'identity_verification',
      description: 'Strong identity verification with consistent documentation',
      severity: RiskLevel.LOW,
      source: 'ai_assessment',
      timestamp: new Date(),
    },
  ],
  mediumRisk: [
    {
      type: 'regulatory_inquiry',
      description: 'Previous regulatory inquiry - resolved',
      severity: RiskLevel.MEDIUM,
      source: 'legal_records',
      timestamp: new Date(),
    },
    {
      type: 'data_breach',
      description: 'Minor data breach exposure (LinkedIn 2021)',
      severity: RiskLevel.MEDIUM,
      source: 'data_breaches',
      timestamp: new Date(),
    },
  ],
  highRisk: [
    {
      type: 'offshore_company',
      description: 'Offshore company with limited transparency',
      severity: RiskLevel.HIGH,
      source: 'company_registry',
      timestamp: new Date(),
    },
    {
      type: 'active_investigation',
      description: 'Active financial investigation',
      severity: RiskLevel.HIGH,
      source: 'legal_records',
      timestamp: new Date(),
    },
    {
      type: 'multiple_breaches',
      description: 'Multiple data breach exposures detected',
      severity: RiskLevel.HIGH,
      source: 'data_breaches',
      timestamp: new Date(),
    },
  ],
  criticalRisk: [
    {
      type: 'sanctions_violation',
      description: 'Active sanctions violation investigation',
      severity: RiskLevel.CRITICAL,
      source: 'legal_records',
      timestamp: new Date(),
    },
    {
      type: 'criminal_association',
      description: 'Criminal network associations detected',
      severity: RiskLevel.CRITICAL,
      source: 'news_search',
      timestamp: new Date(),
    },
    {
      type: 'sanctions_match',
      description: 'Potential sanctions list matches',
      severity: RiskLevel.CRITICAL,
      source: 'sanctions_lists',
      timestamp: new Date(),
    },
  ],
};

// Helper function to get mock data based on user profile
export function getMockDataByProfile(profile: 'lowRisk' | 'mediumRisk' | 'highRisk' | 'criticalRisk') {
  return {
    user: MOCK_USERS[profile],
    riskAssessment: MOCK_RISK_ASSESSMENTS[profile],
    webIntelligence: MOCK_WEB_INTELLIGENCE[profile],
    riskFactors: MOCK_RISK_FACTORS[profile],
  };
}

// Helper function to get mock data based on email
export function getMockDataByEmail(email: string) {
  const emailLower = email.toLowerCase();
  
  if (emailLower.includes('john.smith')) return getMockDataByProfile('lowRisk');
  if (emailLower.includes('maria.garcia')) return getMockDataByProfile('mediumRisk');
  if (emailLower.includes('david.cohen')) return getMockDataByProfile('highRisk');
  if (emailLower.includes('vladimir.petrov')) return getMockDataByProfile('criticalRisk');
  
  // Default to medium risk for unknown emails
  return getMockDataByProfile('mediumRisk');
}

// Helper function to get mock document analysis
export function getMockDocumentAnalysis(documentType: string, isSuspicious: boolean = false) {
  if (isSuspicious) return MOCK_DOCUMENT_ANALYSES.suspiciousDocument;
  
  switch (documentType) {
    case 'passport':
      return MOCK_DOCUMENT_ANALYSES.passport;
    case 'utility_bill':
    case 'proof_of_address':
      return MOCK_DOCUMENT_ANALYSES.utilityBill;
    default:
      return MOCK_DOCUMENT_ANALYSES.passport;
  }
}

// Mock high-risk users for admin dashboard
export const MOCK_HIGH_RISK_USERS = [
  {
    userId: 'user1',
    firstName: 'Vladimir',
    lastName: 'Petrov',
    email: 'vladimir.petrov@email.com',
    riskScore: 90,
    riskLevel: RiskLevel.CRITICAL,
    riskFactors: [
      'Active sanctions violation investigation',
      'Criminal network associations',
      'Potential sanctions list matches',
    ],
    lastUpdated: new Date('2024-03-15'),
  },
  {
    userId: 'user2',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david.cohen@email.com',
    riskScore: 68,
    riskLevel: RiskLevel.HIGH,
    riskFactors: [
      'Offshore company with limited transparency',
      'Active financial investigation',
    ],
    lastUpdated: new Date('2024-03-14'),
  },
  {
    userId: 'user3',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    riskScore: 34,
    riskLevel: RiskLevel.MEDIUM,
    riskFactors: [
      'Previous regulatory inquiry',
      'Minor data breach exposure',
    ],
    lastUpdated: new Date('2024-03-13'),
  },
];

// Mock bulk assessment results
export const MOCK_BULK_ASSESSMENT_RESULTS = {
  processed: 25,
  successful: 22,
  failed: 3,
  successRate: '88%',
  results: [
    { userId: 'user1', success: true, riskScore: 90 },
    { userId: 'user2', success: true, riskScore: 68 },
    { userId: 'user3', success: true, riskScore: 34 },
    { userId: 'user4', success: true, riskScore: 15 },
    { userId: 'user5', success: false, error: 'AI service timeout' },
  ],
  timestamp: new Date().toISOString(),
}; 