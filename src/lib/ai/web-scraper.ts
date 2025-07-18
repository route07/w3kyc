import { RiskLevel } from '@/types';

// Web scraping configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const MAX_REQUESTS_PER_MINUTE = 30;
const USER_AGENT = 'KYC-Platform-Bot/1.0 (Compliance Research)';

// Rate limiting
let requestCount = 0;
let lastRequestTime = 0;

/**
 * Rate limiting utility
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  
  // Reset counter if a minute has passed
  if (now - lastRequestTime > 60000) {
    requestCount = 0;
  }
  
  // Check if we've exceeded the limit
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = 60000 - (now - lastRequestTime);
    console.log(`Rate limit reached. Waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    requestCount = 0;
  }
  
  // Ensure minimum delay between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  requestCount++;
  lastRequestTime = Date.now();
}

/**
 * Make a web request with proper headers and rate limiting
 */
async function makeWebRequest(url: string): Promise<Response> {
  await rateLimit();
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

/**
 * Search for public information about a person
 */
export async function searchPersonInfo(
  firstName: string,
  lastName: string,
  company?: string,
  location?: string
): Promise<any> {
  const searchResults: any = {
    linkedin: null,
    companyInfo: null,
    newsMentions: [],
    legalRecords: [],
    socialMedia: [],
    riskIndicators: [],
  };

  try {
    // Search LinkedIn (simulated - in production, use LinkedIn API)
    if (firstName && lastName) {
      try {
        const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${firstName} ${lastName}`)}`;
        // Note: In production, use LinkedIn API instead of scraping
        searchResults.linkedin = {
          profileFound: false,
          note: 'LinkedIn API integration required for production',
        };
      } catch (error) {
        console.warn('LinkedIn search failed:', error);
      }
    }

    // Search company information
    if (company) {
      try {
        searchResults.companyInfo = await searchCompanyInfo(company);
      } catch (error) {
        console.warn('Company search failed:', error);
      }
    }

    // Search news mentions
    try {
      searchResults.newsMentions = await searchNewsMentions(firstName, lastName, company);
    } catch (error) {
      console.warn('News search failed:', error);
    }

    // Search legal records (simulated)
    try {
      searchResults.legalRecords = await searchLegalRecords(firstName, lastName, location);
    } catch (error) {
      console.warn('Legal records search failed:', error);
    }

    // Analyze risk indicators
    searchResults.riskIndicators = analyzeRiskIndicators(searchResults);

  } catch (error) {
    console.error('Web scraping failed:', error);
  }

  return searchResults;
}

/**
 * Search for company information
 */
async function searchCompanyInfo(companyName: string): Promise<any> {
  try {
    // In production, integrate with company databases like:
    // - Companies House API (UK)
    // - OpenCorporates API
    // - Dun & Bradstreet API
    
    const companyInfo = {
      name: companyName,
      registrationNumber: null,
      status: 'unknown',
      incorporationDate: null,
      directors: [],
      riskFactors: [],
      industry: null,
      size: null,
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, return mock data
    // In production, make actual API calls
    return {
      ...companyInfo,
      note: 'Company API integration required for production',
    };

  } catch (error) {
    console.error('Company info search failed:', error);
    return null;
  }
}

/**
 * Search for news mentions
 */
async function searchNewsMentions(
  firstName: string,
  lastName: string,
  company?: string
): Promise<any[]> {
  try {
    const mentions = [];
    const searchTerms = [`${firstName} ${lastName}`];
    
    if (company) {
      searchTerms.push(company);
    }

    // In production, integrate with news APIs like:
    // - NewsAPI
    // - GDELT Project
    // - Factiva
    
    // Simulate news search
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock data for demo
    return [
      {
        title: 'Sample news mention',
        source: 'Mock News Source',
        date: new Date().toISOString(),
        url: 'https://example.com/news',
        sentiment: 'neutral',
        relevance: 'medium',
      },
    ];

  } catch (error) {
    console.error('News search failed:', error);
    return [];
  }
}

/**
 * Search for legal records
 */
async function searchLegalRecords(
  firstName: string,
  lastName: string,
  location?: string
): Promise<any[]> {
  try {
    // In production, integrate with legal databases like:
    // - UK Companies House
    // - Court records APIs
    // - Regulatory databases
    
    // Simulate legal records search
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock data for demo
    return [
      {
        type: 'court_case',
        title: 'Sample legal record',
        date: new Date().toISOString(),
        status: 'closed',
        relevance: 'low',
      },
    ];

  } catch (error) {
    console.error('Legal records search failed:', error);
    return [];
  }
}

/**
 * Analyze risk indicators from web data
 */
function analyzeRiskIndicators(webData: any): any[] {
  const indicators = [];

  // Analyze company information
  if (webData.companyInfo) {
    if (webData.companyInfo.status === 'dissolved') {
      indicators.push({
        type: 'company_dissolved',
        severity: RiskLevel.HIGH,
        description: 'Company has been dissolved',
        source: 'company_registry',
      });
    }

    if (webData.companyInfo.riskFactors?.length > 0) {
      indicators.push({
        type: 'company_risk_factors',
        severity: RiskLevel.MEDIUM,
        description: webData.companyInfo.riskFactors.join(', '),
        source: 'company_registry',
      });
    }
  }

  // Analyze news mentions
  if (webData.newsMentions?.length > 0) {
    const negativeMentions = webData.newsMentions.filter(
      (mention: any) => mention.sentiment === 'negative'
    );

    if (negativeMentions.length > 0) {
      indicators.push({
        type: 'negative_news_mentions',
        severity: RiskLevel.MEDIUM,
        description: `${negativeMentions.length} negative news mentions found`,
        source: 'news_search',
      });
    }
  }

  // Analyze legal records
  if (webData.legalRecords?.length > 0) {
    const activeCases = webData.legalRecords.filter(
      (record: any) => record.status === 'active'
    );

    if (activeCases.length > 0) {
      indicators.push({
        type: 'active_legal_cases',
        severity: RiskLevel.HIGH,
        description: `${activeCases.length} active legal cases found`,
        source: 'legal_records',
      });
    }
  }

  return indicators;
}

/**
 * Search for sanctions and watchlists
 */
export async function searchSanctionsLists(
  firstName: string,
  lastName: string,
  dateOfBirth?: string,
  nationality?: string
): Promise<any[]> {
  try {
    // In production, integrate with sanctions databases like:
    // - OFAC (US)
    // - UK Sanctions List
    // - EU Sanctions List
    // - UN Sanctions List
    
    const sanctions = [];

    // Simulate sanctions search
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock data for demo
    return [
      {
        list: 'OFAC',
        match: false,
        confidence: 0,
        note: 'Sanctions API integration required for production',
      },
    ];

  } catch (error) {
    console.error('Sanctions search failed:', error);
    return [];
  }
}

/**
 * Search for data breaches
 */
export async function searchDataBreaches(
  email: string,
  phoneNumber?: string
): Promise<any[]> {
  try {
    // In production, integrate with breach databases like:
    // - Have I Been Pwned API
    // - BreachDirectory
    // - DeHashed
    
    const breaches = [];

    // Simulate breach search
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return mock data for demo
    return [
      {
        source: 'haveibeenpwned',
        breaches: [],
        note: 'Data breach API integration required for production',
      },
    ];

  } catch (error) {
    console.error('Data breach search failed:', error);
    return [];
  }
}

/**
 * Comprehensive web intelligence gathering
 */
export async function gatherWebIntelligence(userData: any): Promise<any> {
  // Use mock data for PoC if no API key or in development
  if (!process.env.DEEPSEEK_API_KEY || process.env.NODE_ENV === 'development') {
    console.log('Using mock data for web intelligence');
    const { getMockDataByEmail } = await import('./mock-data');
    const mockData = getMockDataByEmail(userData.email);
    return mockData.webIntelligence;
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    nationality,
    address,
    company,
  } = userData;

  const intelligence: any = {
    personInfo: null,
    sanctions: [],
    dataBreaches: [],
    riskScore: 0,
    riskLevel: RiskLevel.LOW,
    confidence: 0,
    sources: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Gather person information
    intelligence.personInfo = await searchPersonInfo(
      firstName,
      lastName,
      company,
      address?.country
    );

    // Check sanctions lists
    intelligence.sanctions = await searchSanctionsLists(
      firstName,
      lastName,
      dateOfBirth,
      nationality
    );

    // Check data breaches
    intelligence.dataBreaches = await searchDataBreaches(email, phoneNumber);

    // Calculate risk score
    intelligence.riskScore = calculateWebRiskScore(intelligence);
    intelligence.riskLevel = getRiskLevel(intelligence.riskScore);
    intelligence.confidence = calculateConfidence(intelligence);

    // Track data sources
    intelligence.sources = [
      'web_search',
      'company_registry',
      'news_search',
      'legal_records',
      'sanctions_lists',
      'data_breaches',
    ];

  } catch (error) {
    console.error('Web intelligence gathering failed:', error);
  }

  return intelligence;
}

/**
 * Calculate risk score from web intelligence
 */
function calculateWebRiskScore(intelligence: any): number {
  let score = 0;

  // Person info risk factors
  if (intelligence.personInfo?.riskIndicators) {
    intelligence.personInfo.riskIndicators.forEach((indicator: any) => {
      switch (indicator.severity) {
        case RiskLevel.CRITICAL:
          score += 25;
          break;
        case RiskLevel.HIGH:
          score += 15;
          break;
        case RiskLevel.MEDIUM:
          score += 10;
          break;
        case RiskLevel.LOW:
          score += 5;
          break;
      }
    });
  }

  // Sanctions matches
  if (intelligence.sanctions?.some((s: any) => s.match)) {
    score += 50;
  }

  // Data breaches
  if (intelligence.dataBreaches?.some((b: any) => b.breaches?.length > 0)) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Calculate confidence level of web intelligence
 */
function calculateConfidence(intelligence: any): number {
  let confidence = 0;
  let totalSources = 0;

  // Check data availability
  if (intelligence.personInfo) {
    confidence += 30;
    totalSources++;
  }

  if (intelligence.sanctions?.length > 0) {
    confidence += 25;
    totalSources++;
  }

  if (intelligence.dataBreaches?.length > 0) {
    confidence += 25;
    totalSources++;
  }

  // Normalize confidence
  return totalSources > 0 ? Math.min(confidence, 100) : 0;
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return RiskLevel.CRITICAL;
  if (score >= 60) return RiskLevel.HIGH;
  if (score >= 30) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
} 