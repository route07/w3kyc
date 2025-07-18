export interface MockRiskProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  assessmentDate: string
  lastUpdated: string
  
  // Identity Risk Assessment
  identityRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
    documentVerification: {
      passportVerified: boolean
      addressVerified: boolean
      identityMatch: boolean
      livenessCheck: boolean
    }
  }
  
  // Industry Risk Assessment
  industryRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
    industryAffiliations: Array<{
      company: string
      role: string
      riskLevel: string
      notes: string
    }>
  }
  
  // Network Risk Assessment
  networkRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
    networkConnections: Array<{
      name: string
      relationship: string
      riskLevel: string
      notes: string
    }>
  }
  
  // Security Risk Assessment
  securityRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
    securityChecks: {
      dataBreachCheck: boolean
      darkWebScan: boolean
      sanctionsCheck: boolean
      pepCheck: boolean
      adverseMediaCheck: boolean
    }
  }
  
  // Document Analysis
  documentAnalysis: {
    authenticity: number
    completeness: number
    quality: number
    findings: string[]
    ocrResults: {
      extractedData: Record<string, string>
      confidence: number
      validationStatus: 'valid' | 'invalid' | 'pending'
    }
  }
  
  // Web Intelligence
  webIntelligence: {
    socialMediaPresence: number
    onlineReputation: number
    newsMentions: number
    findings: string[]
    sentimentAnalysis: {
      overall: 'positive' | 'neutral' | 'negative'
      score: number
      keyTopics: string[]
    }
  }
  
  // AI Recommendations
  recommendations: string[]
  
  // Risk Factors Summary
  riskFactors: Array<{
    category: string
    factor: string
    impact: 'low' | 'medium' | 'high'
    description: string
    mitigationRequired: boolean
  }>
  
  // Compliance Status
  complianceStatus: {
    amlCompliant: boolean
    kycCompliant: boolean
    regulatoryChecks: Array<{
      jurisdiction: string
      status: 'pass' | 'fail' | 'pending'
      notes: string
    }>
  }
}

export const mockRiskProfiles: MockRiskProfile[] = [
  {
    id: 'rp-001',
    userId: 'user-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    riskScore: 15,
    riskLevel: 'low',
    assessmentDate: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-18T14:20:00Z',
    
    identityRisk: {
      score: 10,
      factors: [
        {
          factor: 'Document Authenticity',
          impact: 'low',
          description: 'All submitted documents verified as authentic',
          resolved: true
        },
        {
          factor: 'Identity Match',
          impact: 'low',
          description: 'Personal information consistent across all sources',
          resolved: true
        }
      ],
      documentVerification: {
        passportVerified: true,
        addressVerified: true,
        identityMatch: true,
        livenessCheck: true
      }
    },
    
    industryRisk: {
      score: 5,
      factors: [
        {
          factor: 'Clean Industry Background',
          impact: 'low',
          description: 'No high-risk industry affiliations detected',
          resolved: true
        }
      ],
      industryAffiliations: [
        {
          company: 'Tech Solutions Inc',
          role: 'Senior Software Engineer',
          riskLevel: 'low',
          notes: 'Legitimate technology company with clean background'
        }
      ]
    },
    
    networkRisk: {
      score: 8,
      factors: [
        {
          factor: 'Low-Risk Network',
          impact: 'low',
          description: 'No connections to high-risk individuals or entities',
          resolved: true
        }
      ],
      networkConnections: [
        {
          name: 'Sarah Smith',
          relationship: 'Spouse',
          riskLevel: 'low',
          notes: 'Verified spouse with clean background'
        }
      ]
    },
    
    securityRisk: {
      score: 12,
      factors: [
        {
          factor: 'Clean Security Profile',
          impact: 'low',
          description: 'No security issues detected',
          resolved: true
        }
      ],
      securityChecks: {
        dataBreachCheck: false,
        darkWebScan: false,
        sanctionsCheck: false,
        pepCheck: false,
        adverseMediaCheck: false
      }
    },
    
    documentAnalysis: {
      authenticity: 95,
      completeness: 98,
      quality: 92,
      findings: [
        'Passport document verified as authentic',
        'Address documentation complete and valid',
        'All required fields properly filled',
        'Document quality meets standards'
      ],
      ocrResults: {
        extractedData: {
          'firstName': 'John',
          'lastName': 'Smith',
          'dateOfBirth': '1985-03-15',
          'passportNumber': 'US123456789',
          'address': '123 Main Street, New York, NY 10001'
        },
        confidence: 0.94,
        validationStatus: 'valid'
      }
    },
    
    webIntelligence: {
      socialMediaPresence: 75,
      onlineReputation: 85,
      newsMentions: 3,
      findings: [
        'Active professional LinkedIn profile',
        'Positive online presence',
        'Limited news mentions - all positive',
        'Consistent digital footprint'
      ],
      sentimentAnalysis: {
        overall: 'positive',
        score: 0.78,
        keyTopics: ['technology', 'software development', 'professional']
      }
    },
    
    recommendations: [
      'Continue monitoring for any changes in risk profile',
      'Regular review of connected parties',
      'Maintain current compliance standards'
    ],
    
    riskFactors: [
      {
        category: 'Identity',
        factor: 'Document Verification',
        impact: 'low',
        description: 'All identity documents verified successfully',
        mitigationRequired: false
      }
    ],
    
    complianceStatus: {
      amlCompliant: true,
      kycCompliant: true,
      regulatoryChecks: [
        {
          jurisdiction: 'US',
          status: 'pass',
          notes: 'All US regulatory requirements met'
        }
      ]
    }
  },
  
  {
    id: 'rp-002',
    userId: 'user-002',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@techcorp.com',
    riskScore: 65,
    riskLevel: 'medium',
    assessmentDate: '2024-01-20T11:15:00Z',
    lastUpdated: '2024-01-22T16:45:00Z',
    
    identityRisk: {
      score: 25,
      factors: [
        {
          factor: 'Complex Corporate Structure',
          impact: 'medium',
          description: 'Multiple corporate entities require additional verification',
          resolved: false
        }
      ],
      documentVerification: {
        passportVerified: true,
        addressVerified: true,
        identityMatch: true,
        livenessCheck: true
      }
    },
    
    industryRisk: {
      score: 35,
      factors: [
        {
          factor: 'Technology Industry',
          impact: 'medium',
          description: 'Technology sector has moderate risk profile',
          resolved: false
        }
      ],
      industryAffiliations: [
        {
          company: 'TechCorp Holdings Ltd',
          role: 'CEO',
          riskLevel: 'medium',
          notes: 'Technology company with international operations'
        }
      ]
    },
    
    networkRisk: {
      score: 45,
      factors: [
        {
          factor: 'International Business Network',
          impact: 'medium',
          description: 'Multiple international business connections',
          resolved: false
        }
      ],
      networkConnections: [
        {
          name: 'Carlos Rodriguez',
          relationship: 'Business Partner',
          riskLevel: 'medium',
          notes: 'CFO of TechCorp Holdings Ltd'
        }
      ]
    },
    
    securityRisk: {
      score: 20,
      factors: [
        {
          factor: 'Clean Security Profile',
          impact: 'low',
          description: 'No security issues detected',
          resolved: true
        }
      ],
      securityChecks: {
        dataBreachCheck: false,
        darkWebScan: false,
        sanctionsCheck: false,
        pepCheck: false,
        adverseMediaCheck: false
      }
    },
    
    documentAnalysis: {
      authenticity: 88,
      completeness: 85,
      quality: 90,
      findings: [
        'Corporate documents require additional verification',
        'International business structure complexity noted',
        'Document quality meets standards',
        'Additional corporate governance documents needed'
      ],
      ocrResults: {
        extractedData: {
          'firstName': 'Maria',
          'lastName': 'Garcia',
          'dateOfBirth': '1990-07-22',
          'passportNumber': 'ES987654321',
          'address': '456 Business Ave, Miami, FL 33101'
        },
        confidence: 0.89,
        validationStatus: 'pending'
      }
    },
    
    webIntelligence: {
      socialMediaPresence: 60,
      onlineReputation: 70,
      newsMentions: 8,
      findings: [
        'Professional business presence',
        'Technology industry recognition',
        'International business mentions',
        'Moderate public profile'
      ],
      sentimentAnalysis: {
        overall: 'positive',
        score: 0.65,
        keyTopics: ['technology', 'business', 'leadership', 'international']
      }
    },
    
    recommendations: [
      'Complete corporate structure verification',
      'Provide additional governance documents',
      'Enhanced due diligence on international operations',
      'Regular monitoring of business network changes'
    ],
    
    riskFactors: [
      {
        category: 'Industry',
        factor: 'Technology Sector',
        impact: 'medium',
        description: 'Technology industry has moderate risk profile',
        mitigationRequired: true
      },
      {
        category: 'Network',
        factor: 'International Business',
        impact: 'medium',
        description: 'International business operations require enhanced monitoring',
        mitigationRequired: true
      }
    ],
    
    complianceStatus: {
      amlCompliant: true,
      kycCompliant: false,
      regulatoryChecks: [
        {
          jurisdiction: 'US',
          status: 'pending',
          notes: 'Additional corporate documentation required'
        },
        {
          jurisdiction: 'ES',
          status: 'pass',
          notes: 'Spanish regulatory requirements met'
        }
      ]
    }
  },
  
  {
    id: 'rp-003',
    userId: 'user-003',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@familyoffice.com',
    riskScore: 25,
    riskLevel: 'low',
    assessmentDate: '2024-01-05T08:45:00Z',
    lastUpdated: '2024-01-08T16:30:00Z',
    
    identityRisk: {
      score: 15,
      factors: [
        {
          factor: 'High Net Worth Individual',
          impact: 'low',
          description: 'Well-established family office with verified wealth',
          resolved: true
        }
      ],
      documentVerification: {
        passportVerified: true,
        addressVerified: true,
        identityMatch: true,
        livenessCheck: true
      }
    },
    
    industryRisk: {
      score: 10,
      factors: [
        {
          factor: 'Family Office',
          impact: 'low',
          description: 'Established family office with clean background',
          resolved: true
        }
      ],
      industryAffiliations: [
        {
          company: 'Chen Family Office',
          role: 'Managing Director',
          riskLevel: 'low',
          notes: 'Established family office with long history'
        }
      ]
    },
    
    networkRisk: {
      score: 12,
      factors: [
        {
          factor: 'Established Network',
          impact: 'low',
          description: 'Well-established professional network',
          resolved: true
        }
      ],
      networkConnections: [
        {
          name: 'Chen Family Trust',
          relationship: 'Family Trust',
          riskLevel: 'low',
          notes: 'Established family trust with clean background'
        }
      ]
    },
    
    securityRisk: {
      score: 8,
      factors: [
        {
          factor: 'Clean Security Profile',
          impact: 'low',
          description: 'No security issues detected',
          resolved: true
        }
      ],
      securityChecks: {
        dataBreachCheck: false,
        darkWebScan: false,
        sanctionsCheck: false,
        pepCheck: false,
        adverseMediaCheck: false
      }
    },
    
    documentAnalysis: {
      authenticity: 98,
      completeness: 95,
      quality: 96,
      findings: [
        'All documents verified as authentic',
        'Complete documentation provided',
        'High-quality document submission',
        'Family office structure well documented'
      ],
      ocrResults: {
        extractedData: {
          'firstName': 'David',
          'lastName': 'Chen',
          'dateOfBirth': '1975-11-08',
          'passportNumber': 'SG123456789',
          'address': '789 Wealth Street, Singapore 018956'
        },
        confidence: 0.97,
        validationStatus: 'valid'
      }
    },
    
    webIntelligence: {
      socialMediaPresence: 40,
      onlineReputation: 90,
      newsMentions: 15,
      findings: [
        'Established business leader',
        'Positive media coverage',
        'Philanthropic activities noted',
        'Respected in financial community'
      ],
      sentimentAnalysis: {
        overall: 'positive',
        score: 0.85,
        keyTopics: ['finance', 'philanthropy', 'leadership', 'family office']
      }
    },
    
    recommendations: [
      'Continue current compliance standards',
      'Regular review of family office structure',
      'Monitor for any changes in family trust arrangements'
    ],
    
    riskFactors: [
      {
        category: 'Identity',
        factor: 'High Net Worth',
        impact: 'low',
        description: 'Well-established high net worth individual',
        mitigationRequired: false
      }
    ],
    
    complianceStatus: {
      amlCompliant: true,
      kycCompliant: true,
      regulatoryChecks: [
        {
          jurisdiction: 'SG',
          status: 'pass',
          notes: 'All Singapore regulatory requirements met'
        }
      ]
    }
  },
  
  {
    id: 'rp-004',
    userId: 'user-004',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@startup.io',
    riskScore: 85,
    riskLevel: 'high',
    assessmentDate: '2024-01-18T13:20:00Z',
    lastUpdated: '2024-01-19T09:15:00Z',
    
    identityRisk: {
      score: 45,
      factors: [
        {
          factor: 'Incomplete Documentation',
          impact: 'high',
          description: 'Missing critical identity verification documents',
          resolved: false
        },
        {
          factor: 'Source of Funds Unclear',
          impact: 'high',
          description: 'Insufficient documentation of fund sources',
          resolved: false
        }
      ],
      documentVerification: {
        passportVerified: false,
        addressVerified: false,
        identityMatch: false,
        livenessCheck: false
      }
    },
    
    industryRisk: {
      score: 35,
      factors: [
        {
          factor: 'Startup Background',
          impact: 'medium',
          description: 'Startup exit requires additional verification',
          resolved: false
        }
      ],
      industryAffiliations: [
        {
          company: 'InnovationStartup Ltd',
          role: 'Founder & CEO',
          riskLevel: 'medium',
          notes: 'Recent startup exit requires verification'
        }
      ]
    },
    
    networkRisk: {
      score: 50,
      factors: [
        {
          factor: 'Limited Network History',
          impact: 'medium',
          description: 'Limited established business network',
          resolved: false
        }
      ],
      networkConnections: []
    },
    
    securityRisk: {
      score: 30,
      factors: [
        {
          factor: 'Limited Security History',
          impact: 'medium',
          description: 'Limited security profile history',
          resolved: false
        }
      ],
      securityChecks: {
        dataBreachCheck: false,
        darkWebScan: false,
        sanctionsCheck: false,
        pepCheck: false,
        adverseMediaCheck: false
      }
    },
    
    documentAnalysis: {
      authenticity: 60,
      completeness: 45,
      quality: 70,
      findings: [
        'Incomplete document submission',
        'Missing critical identity documents',
        'Source of funds documentation insufficient',
        'Additional verification required'
      ],
      ocrResults: {
        extractedData: {
          'firstName': 'Emma',
          'lastName': 'Wilson',
          'dateOfBirth': '1988-04-12'
        },
        confidence: 0.75,
        validationStatus: 'invalid'
      }
    },
    
    webIntelligence: {
      socialMediaPresence: 80,
      onlineReputation: 60,
      newsMentions: 25,
      findings: [
        'High social media presence',
        'Mixed media coverage',
        'Startup exit mentioned in news',
        'Limited professional history'
      ],
      sentimentAnalysis: {
        overall: 'neutral',
        score: 0.45,
        keyTopics: ['startup', 'technology', 'exit', 'entrepreneur']
      }
    },
    
    recommendations: [
      'Complete all required identity documentation',
      'Provide detailed source of funds verification',
      'Submit additional corporate governance documents',
      'Enhanced due diligence required',
      'Consider enhanced monitoring period'
    ],
    
    riskFactors: [
      {
        category: 'Identity',
        factor: 'Incomplete Documentation',
        impact: 'high',
        description: 'Missing critical identity verification documents',
        mitigationRequired: true
      },
      {
        category: 'Identity',
        factor: 'Source of Funds',
        impact: 'high',
        description: 'Insufficient documentation of fund sources',
        mitigationRequired: true
      },
      {
        category: 'Industry',
        factor: 'Startup Exit',
        impact: 'medium',
        description: 'Recent startup exit requires additional verification',
        mitigationRequired: true
      }
    ],
    
    complianceStatus: {
      amlCompliant: false,
      kycCompliant: false,
      regulatoryChecks: [
        {
          jurisdiction: 'UK',
          status: 'fail',
          notes: 'Incomplete documentation and source of funds verification required'
        }
      ]
    }
  },
  
  {
    id: 'rp-005',
    userId: 'user-005',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david.cohen@investment.com',
    riskScore: 75,
    riskLevel: 'high',
    assessmentDate: '2024-01-22T15:45:00Z',
    lastUpdated: '2024-01-22T15:45:00Z',
    
    identityRisk: {
      score: 35,
      factors: [
        {
          factor: 'International Background',
          impact: 'medium',
          description: 'International investor requires enhanced verification',
          resolved: false
        }
      ],
      documentVerification: {
        passportVerified: true,
        addressVerified: true,
        identityMatch: true,
        livenessCheck: true
      }
    },
    
    industryRisk: {
      score: 45,
      factors: [
        {
          factor: 'Real Estate Investments',
          impact: 'medium',
          description: 'Real estate investment background requires verification',
          resolved: false
        }
      ],
      industryAffiliations: [
        {
          company: 'Cohen Investment Group',
          role: 'Managing Director',
          riskLevel: 'medium',
          notes: 'Real estate investment company with international operations'
        }
      ]
    },
    
    networkRisk: {
      score: 60,
      factors: [
        {
          factor: 'International Business Network',
          impact: 'high',
          description: 'Multiple international business connections require verification',
          resolved: false
        }
      ],
      networkConnections: [
        {
          name: 'Cohen Investment Group',
          relationship: 'Investment Vehicle',
          riskLevel: 'medium',
          notes: 'Investment vehicle with international operations'
        }
      ]
    },
    
    securityRisk: {
      score: 25,
      factors: [
        {
          factor: 'Enhanced Monitoring Required',
          impact: 'medium',
          description: 'International operations require enhanced monitoring',
          resolved: false
        }
      ],
      securityChecks: {
        dataBreachCheck: false,
        darkWebScan: false,
        sanctionsCheck: false,
        pepCheck: false,
        adverseMediaCheck: false
      }
    },
    
    documentAnalysis: {
      authenticity: 85,
      completeness: 80,
      quality: 88,
      findings: [
        'International documents require additional verification',
        'Investment structure complexity noted',
        'Document quality meets standards',
        'Additional corporate documentation needed'
      ],
      ocrResults: {
        extractedData: {
          'firstName': 'David',
          'lastName': 'Cohen',
          'dateOfBirth': '1982-09-30',
          'passportNumber': 'AE987654321',
          'address': '654 Financial District, Dubai, UAE'
        },
        confidence: 0.87,
        validationStatus: 'pending'
      }
    },
    
    webIntelligence: {
      socialMediaPresence: 50,
      onlineReputation: 65,
      newsMentions: 12,
      findings: [
        'Professional business presence',
        'Real estate industry mentions',
        'International business activities',
        'Moderate public profile'
      ],
      sentimentAnalysis: {
        overall: 'neutral',
        score: 0.55,
        keyTopics: ['real estate', 'investment', 'international', 'business']
      }
    },
    
    recommendations: [
      'Complete international business verification',
      'Provide additional investment structure documentation',
      'Enhanced due diligence on international operations',
      'Regular monitoring of investment activities',
      'Consider enhanced monitoring period'
    ],
    
    riskFactors: [
      {
        category: 'Network',
        factor: 'International Operations',
        impact: 'high',
        description: 'Multiple international business connections require verification',
        mitigationRequired: true
      },
      {
        category: 'Industry',
        factor: 'Real Estate Investments',
        impact: 'medium',
        description: 'Real estate investment background requires verification',
        mitigationRequired: true
      }
    ],
    
    complianceStatus: {
      amlCompliant: true,
      kycCompliant: false,
      regulatoryChecks: [
        {
          jurisdiction: 'AE',
          status: 'pending',
          notes: 'Additional international business documentation required'
        }
      ]
    }
  }
] 