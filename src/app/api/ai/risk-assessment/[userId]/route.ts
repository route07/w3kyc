import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { RiskAssessmentService } from '@/lib/ai/risk-assessment-service';

async function handler(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get authenticated user
    const authenticatedUser = (request as { user: { _id: string; role: string } }).user;

    // Check if user is requesting their own assessment or is admin
    if (authenticatedUser._id.toString() !== params.userId && authenticatedUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to trigger risk assessment for this user',
      }, { status: 403 });
    }

    // Trigger risk assessment
    const result = await RiskAssessmentService.assessUserRisk(params.userId);

    return NextResponse.json({
      success: true,
      message: 'Risk assessment completed successfully',
      data: {
        userId: params.userId,
        riskProfile: {
          overallRisk: result.riskProfile.overallRisk,
          identityRisk: result.riskProfile.identityRisk,
          industryRisk: result.riskProfile.industryRisk,
          networkRisk: result.riskProfile.networkRisk,
          securityRisk: result.riskProfile.securityRisk,
          riskFactors: result.riskProfile.riskFactors.slice(-5), // Last 5 factors
          lastUpdated: result.riskProfile.lastUpdated,
        },
        webIntelligence: {
          riskScore: result.webIntelligence.riskScore,
          riskLevel: result.webIntelligence.riskLevel,
          confidence: result.webIntelligence.confidence,
          sources: result.webIntelligence.sources,
        },
        documentAnalyses: result.documentAnalyses.map((analysis: { documentType: string; analysis?: unknown; error?: unknown }) => ({
          documentType: analysis.documentType,
          hasAnalysis: !!analysis.analysis,
          hasError: !!analysis.error,
        })),
        assessment: {
          overallRisk: result.assessment.overallRisk,
          timestamp: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Risk assessment API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export const POST = withAuth(handler);
export const GET = withAuth(handler); 