import { NextRequest, NextResponse } from 'next/server';
import { KYCSubmissionService } from '@/lib/kyc-submission-service';
import { requireAdmin } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('Fetching KYC submissions, status filter:', status);

    const submissions = await KYCSubmissionService.findAll(status || undefined);

    console.log(`Found ${submissions.length} KYC submissions`);

    return NextResponse.json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission._id,
        userId: submission.userId,
        email: submission.email,
        currentStep: submission.currentStep,
        status: submission.status,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
        reviewedBy: submission.reviewedBy,
        rejectionReason: submission.rejectionReason,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        userData: {
          firstName: submission.userData.firstName,
          lastName: submission.userData.lastName,
          investorType: submission.userData.investorType,
          jurisdiction: submission.userData.jurisdiction,
          kycStatus: submission.userData.kycStatus
        }
      }))
    });

  } catch (error) {
    console.error('Get KYC submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}