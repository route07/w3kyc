import { NextRequest, NextResponse } from 'next/server';
import { getMockDataByProfile } from '@/lib/ai/mock-data';

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = searchParams.get('profile') as 'lowRisk' | 'mediumRisk' | 'highRisk' | 'criticalRisk' || 'lowRisk';

    // Get mock data for the requested profile
    const mockData = getMockDataByProfile(profile);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        user: mockData.user,
        riskAssessment: {
          overallRisk: mockData.riskAssessment.overallRisk,
          identityRisk: mockData.riskAssessment.identityRisk,
          industryRisk: mockData.riskAssessment.industryRisk,
          networkRisk: mockData.riskAssessment.networkRisk,
          securityRisk: mockData.riskAssessment.securityRisk,
        },
        webIntelligence: {
          riskScore: mockData.webIntelligence.riskScore,
          riskLevel: mockData.webIntelligence.riskLevel,
          confidence: mockData.webIntelligence.confidence,
          sources: mockData.webIntelligence.sources,
          personInfo: {
            linkedin: mockData.webIntelligence.personInfo.linkedin,
            companyInfo: mockData.webIntelligence.personInfo.companyInfo,
            newsMentions: mockData.webIntelligence.personInfo.newsMentions,
            legalRecords: mockData.webIntelligence.personInfo.legalRecords,
            riskIndicators: mockData.webIntelligence.personInfo.riskIndicators,
          },
          sanctions: mockData.webIntelligence.sanctions,
          dataBreaches: mockData.webIntelligence.dataBreaches,
        },
        riskFactors: mockData.riskFactors,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Demo API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export const GET = handler; 