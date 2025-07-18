import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { RiskAssessmentService } from '@/lib/ai/risk-assessment-service';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

async function handler(request: AuthenticatedRequest) {
  try {
    // Get authenticated user
    const authenticatedUser = request.user;

    // Check if user is admin
    if (authenticatedUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required',
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const riskLevel = searchParams.get('riskLevel'); // 'high' or 'critical'

    // Get high-risk users
    const highRiskUsers = await RiskAssessmentService.getHighRiskUsers(limit);

    // Filter by risk level if specified
    let filteredUsers = highRiskUsers;
    if (riskLevel) {
      filteredUsers = highRiskUsers.filter(user => user.riskLevel === riskLevel);
    }

    return NextResponse.json({
      success: true,
      data: {
        users: filteredUsers,
        total: filteredUsers.length,
        riskLevelBreakdown: {
          high: highRiskUsers.filter(u => u.riskLevel === 'high').length,
          critical: highRiskUsers.filter(u => u.riskLevel === 'critical').length,
        },
      },
    });

  } catch (error) {
    console.error('High-risk users API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export const GET = withAuth(handler); 