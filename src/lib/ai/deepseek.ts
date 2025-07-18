import { RiskLevel, RiskFactor, RiskScore } from '@/types';

// DeepSeek API Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Check if we should use mock data (for PoC)
const USE_MOCK_DATA = !DEEPSEEK_API_KEY || process.env.NODE_ENV === 'development';

// Risk Assessment Prompts
const RISK_ASSESSMENT_PROMPT = `
You are an AI risk assessment specialist for a KYC (Know Your Customer) system. 
Analyze the provided information and assess risk across four dimensions:

1. Identity Risk: Assess the authenticity and reliability of identity information
2. Industry Risk: Evaluate risks associated with the person's industry/business
3. Network Risk: Analyze risks from associated individuals/entities
4. Security Risk: Identify security threats, data breaches, or blacklist matches

For each dimension, provide:
- Risk score (0-100, where 0=no risk, 100=critical risk)
- Risk level (low, medium, high, critical)
- Key risk factors identified
- Supporting evidence or reasoning

Respond in JSON format:
{
  "identityRisk": {
    "score": number,
    "level": "low|medium|high|critical",
    "factors": ["factor1", "factor2"],
    "reasoning": "explanation"
  },
  "industryRisk": { ... },
  "networkRisk": { ... },
  "securityRisk": { ... },
  "overallRisk": {
    "score": number,
    "level": "low|medium|high|critical",
    "factors": ["factor1", "factor2"],
    "reasoning": "explanation"
  }
}
`;

const DOCUMENT_ANALYSIS_PROMPT = `
You are an AI document verification specialist. Analyze the provided document information and determine:

1. Document authenticity indicators
2. Data consistency checks
3. Potential fraud indicators
4. OCR accuracy assessment
5. Risk factors identified

Respond in JSON format:
{
  "authenticity": {
    "score": number,
    "indicators": ["indicator1", "indicator2"],
    "concerns": ["concern1", "concern2"]
  },
  "dataConsistency": {
    "score": number,
    "matches": ["match1", "match2"],
    "discrepancies": ["discrepancy1", "discrepancy2"]
  },
  "fraudIndicators": {
    "score": number,
    "indicators": ["indicator1", "indicator2"],
    "riskLevel": "low|medium|high|critical"
  },
  "ocrAccuracy": {
    "score": number,
    "extractedData": { ... },
    "confidence": number
  },
  "overallAssessment": {
    "verificationStatus": "verified|rejected|requires_review",
    "confidence": number,
    "recommendations": ["rec1", "rec2"]
  }
}
`;

const WEB_SCRAPING_PROMPT = `
You are an AI web intelligence analyst. Based on the provided web scraping results, analyze:

1. Public reputation and mentions
2. Business associations and networks
3. Legal or regulatory issues
4. Financial indicators
5. Risk signals from public sources

Respond in JSON format:
{
  "publicReputation": {
    "score": number,
    "mentions": ["mention1", "mention2"],
    "sentiment": "positive|neutral|negative"
  },
  "businessAssociations": {
    "entities": ["entity1", "entity2"],
    "riskLevel": "low|medium|high|critical",
    "connections": ["connection1", "connection2"]
  },
  "legalIssues": {
    "score": number,
    "issues": ["issue1", "issue2"],
    "regulatoryFlags": ["flag1", "flag2"]
  },
  "financialIndicators": {
    "score": number,
    "indicators": ["indicator1", "indicator2"],
    "riskFactors": ["factor1", "factor2"]
  },
  "overallAssessment": {
    "riskScore": number,
    "riskLevel": "low|medium|high|critical",
    "keyFindings": ["finding1", "finding2"]
  }
}
`;

// Types for AI responses
interface RiskAssessmentResponse {
  identityRisk: RiskDimension;
  industryRisk: RiskDimension;
  networkRisk: RiskDimension;
  securityRisk: RiskDimension;
  overallRisk: RiskDimension;
}

interface RiskDimension {
  score: number;
  level: RiskLevel;
  factors: string[];
  reasoning: string;
}

interface DocumentAnalysisResponse {
  authenticity: DocumentCheck;
  dataConsistency: DocumentCheck;
  fraudIndicators: DocumentCheck;
  ocrAccuracy: OCRCheck;
  overallAssessment: OverallAssessment;
}

interface DocumentCheck {
  score: number;
  indicators?: string[];
  concerns?: string[];
  matches?: string[];
  discrepancies?: string[];
  riskLevel?: RiskLevel;
}

interface OCRCheck {
  score: number;
  extractedData: Record<string, any>;
  confidence: number;
}

interface OverallAssessment {
  verificationStatus: 'verified' | 'rejected' | 'requires_review';
  confidence: number;
  recommendations: string[];
}

interface WebScrapingResponse {
  publicReputation: WebCheck;
  businessAssociations: WebCheck;
  legalIssues: WebCheck;
  financialIndicators: WebCheck;
  overallAssessment: WebOverallAssessment;
}

interface WebCheck {
  score: number;
  mentions?: string[];
  sentiment?: string;
  entities?: string[];
  riskLevel?: RiskLevel;
  connections?: string[];
  issues?: string[];
  regulatoryFlags?: string[];
  indicators?: string[];
  riskFactors?: string[];
}

interface WebOverallAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  keyFindings: string[];
}

/**
 * Make a request to DeepSeek API
 */
async function makeDeepSeekRequest(prompt: string, context: string): Promise<any> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: context,
          },
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from DeepSeek API');
    }

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    console.error('DeepSeek API request failed:', error);
    throw error;
  }
}

/**
 * Perform comprehensive risk assessment
 */
export async function performRiskAssessment(userData: any, documents: any[], webData?: any): Promise<RiskAssessmentResponse> {
  // Use mock data for PoC if no API key or in development
  if (USE_MOCK_DATA) {
    console.log('Using mock data for risk assessment');
    const { getMockDataByEmail } = await import('./mock-data');
    const mockData = getMockDataByEmail(userData.email);
    return mockData.riskAssessment as RiskAssessmentResponse;
  }

  const context = {
    user: userData,
    documents: documents.map(doc => ({
      type: doc.documentType,
      ocrData: doc.ocrData,
      verificationStatus: doc.verificationStatus,
    })),
    webData: webData || {},
  };

  const response = await makeDeepSeekRequest(RISK_ASSESSMENT_PROMPT, JSON.stringify(context, null, 2));
  return response as RiskAssessmentResponse;
}

/**
 * Analyze uploaded documents
 */
export async function analyzeDocument(documentData: any, userData: any): Promise<DocumentAnalysisResponse> {
  // Use mock data for PoC if no API key or in development
  if (USE_MOCK_DATA) {
    console.log('Using mock data for document analysis');
    const { getMockDocumentAnalysis } = await import('./mock-data');
    const isSuspicious = userData.email.includes('vladimir') || userData.email.includes('David');
    return getMockDocumentAnalysis(documentData.documentType, isSuspicious) as DocumentAnalysisResponse;
  }

  const context = {
    document: documentData,
    user: userData,
    timestamp: new Date().toISOString(),
  };

  const response = await makeDeepSeekRequest(DOCUMENT_ANALYSIS_PROMPT, JSON.stringify(context, null, 2));
  return response as DocumentAnalysisResponse;
}

/**
 * Analyze web scraping results
 */
export async function analyzeWebData(webScrapingResults: any, userData: any): Promise<WebScrapingResponse> {
  // Use mock data for PoC if no API key or in development
  if (USE_MOCK_DATA) {
    console.log('Using mock data for web analysis');
    const { getMockDataByEmail } = await import('./mock-data');
    const mockData = getMockDataByEmail(userData.email);
    
    // Map mock data to expected interface
    return {
      publicReputation: {
        score: 100 - mockData.webIntelligence.riskScore,
        mentions: mockData.webIntelligence.personInfo.newsMentions.map(n => n.title),
        sentiment: mockData.webIntelligence.personInfo.newsMentions[0]?.sentiment || 'neutral',
      },
      businessAssociations: {
        entities: [mockData.webIntelligence.personInfo.companyInfo.name],
        riskLevel: mockData.webIntelligence.riskLevel,
        connections: mockData.webIntelligence.personInfo.companyInfo.directors,
      },
      legalIssues: {
        score: mockData.webIntelligence.personInfo.legalRecords.length * 20,
        issues: mockData.webIntelligence.personInfo.legalRecords.map(r => r.title),
        regulatoryFlags: mockData.webIntelligence.personInfo.riskIndicators.map(i => i.description),
      },
      financialIndicators: {
        score: mockData.webIntelligence.riskScore,
        indicators: mockData.webIntelligence.personInfo.companyInfo.riskFactors,
        riskFactors: mockData.webIntelligence.personInfo.riskIndicators.map(i => i.description),
      },
      overallAssessment: {
        riskScore: mockData.webIntelligence.riskScore,
        riskLevel: mockData.webIntelligence.riskLevel,
        keyFindings: mockData.webIntelligence.personInfo.riskIndicators.map(i => i.description),
      },
    } as WebScrapingResponse;
  }

  const context = {
    webResults: webScrapingResults,
    user: userData,
    timestamp: new Date().toISOString(),
  };

  const response = await makeDeepSeekRequest(WEB_SCRAPING_PROMPT, JSON.stringify(context, null, 2));
  return response as WebScrapingResponse;
}

/**
 * Convert AI risk assessment to RiskProfile format
 */
export function convertToRiskProfile(
  assessment: RiskAssessmentResponse,
  userId: string,
  additionalFactors: RiskFactor[] = []
): any {
  return {
    userId,
    identityRisk: {
      score: assessment.identityRisk.score,
      level: assessment.identityRisk.level,
      factors: assessment.identityRisk.factors,
    },
    industryRisk: {
      score: assessment.industryRisk.score,
      level: assessment.industryRisk.level,
      factors: assessment.industryRisk.factors,
    },
    networkRisk: {
      score: assessment.networkRisk.score,
      level: assessment.networkRisk.level,
      factors: assessment.networkRisk.factors,
    },
    securityRisk: {
      score: assessment.securityRisk.score,
      level: assessment.securityRisk.level,
      factors: assessment.securityRisk.factors,
    },
    overallRisk: {
      score: assessment.overallRisk.score,
      level: assessment.overallRisk.level,
      factors: assessment.overallRisk.factors,
    },
    riskFactors: [
      ...additionalFactors,
      {
        type: 'ai_assessment',
        description: assessment.overallRisk.reasoning,
        severity: assessment.overallRisk.level,
        source: 'deepseek_ai',
        timestamp: new Date(),
      },
    ],
    lastUpdated: new Date(),
  };
}

/**
 * Generate risk factors from AI analysis
 */
export function generateRiskFactors(
  assessment: RiskAssessmentResponse,
  documentAnalysis?: DocumentAnalysisResponse,
  webAnalysis?: WebScrapingResponse
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Add risk factors from each dimension
  Object.entries(assessment).forEach(([dimension, data]) => {
    if (dimension !== 'overallRisk' && data.factors.length > 0) {
      factors.push({
        type: `${dimension}_risk`,
        description: data.factors.join(', '),
        severity: data.level,
        source: 'deepseek_ai',
        timestamp: new Date(),
      });
    }
  });

  // Add document analysis factors
  if (documentAnalysis) {
    if (documentAnalysis.fraudIndicators.indicators?.length) {
      factors.push({
        type: 'document_fraud',
        description: documentAnalysis.fraudIndicators.indicators.join(', '),
        severity: documentAnalysis.fraudIndicators.riskLevel || RiskLevel.MEDIUM,
        source: 'deepseek_ai',
        timestamp: new Date(),
      });
    }
  }

  // Add web analysis factors
  if (webAnalysis) {
    if (webAnalysis.legalIssues.issues?.length) {
      factors.push({
        type: 'legal_issues',
        description: webAnalysis.legalIssues.issues.join(', '),
        severity: webAnalysis.legalIssues.riskLevel || RiskLevel.MEDIUM,
        source: 'deepseek_ai',
        timestamp: new Date(),
      });
    }
  }

  return factors;
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return RiskLevel.CRITICAL;
  if (score >= 60) return RiskLevel.HIGH;
  if (score >= 30) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Validate AI response format
 */
export function validateRiskAssessment(response: any): boolean {
  const requiredFields = ['identityRisk', 'industryRisk', 'networkRisk', 'securityRisk', 'overallRisk'];
  const requiredRiskFields = ['score', 'level', 'factors', 'reasoning'];

  for (const field of requiredFields) {
    if (!response[field]) return false;
    
    for (const riskField of requiredRiskFields) {
      if (!response[field][riskField]) return false;
    }
  }

  return true;
} 