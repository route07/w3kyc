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

    // Only allow POST for bulk operations
    if (request.method !== 'POST') {
      return NextResponse.json({
        success: false,
        error: 'Method not allowed',
      }, { status: 405 });
    }

    // Trigger bulk assessment
    const result = await RiskAssessmentService.assessPendingUsers();

    return NextResponse.json({
      success: true,
      message: 'Bulk risk assessment completed',
      data: {
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        successRate: result.processed > 0 ? (result.successful / result.processed * 100).toFixed(2) + '%' : '0%',
        results: result.results.slice(0, 10), // Return first 10 results for preview
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Bulk assessment API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export const POST = withAuth(handler); 