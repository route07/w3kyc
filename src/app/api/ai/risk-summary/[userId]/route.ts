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

    // Check if user is requesting their own summary or is admin
    if (authenticatedUser._id.toString() !== params.userId && authenticatedUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to access risk summary for this user',
      }, { status: 403 });
    }

    // Get risk summary
    const summary = await RiskAssessmentService.getRiskSummary(params.userId);

    return NextResponse.json({
      success: true,
      data: summary,
    });

  } catch (error) {
    console.error('Risk summary API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export const GET = withAuth(handler); 