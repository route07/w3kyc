import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { KYCSubmissionService } from '@/lib/kyc-submission-service';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('Save KYC progress API called');
    const { currentStep, userData } = await request.json();
    console.log('KYC progress data received:', { currentStep, userDataKeys: Object.keys(userData || {}) });

    // Validate required fields
    if (currentStep === undefined || !userData) {
      console.log('ERROR: currentStep and userData are required');
      return NextResponse.json(
        { success: false, error: 'currentStep and userData are required' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Authorization token required');
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');

    // Verify JWT token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded successfully, userId:', decoded.userId);
    } catch (error) {
      console.log('ERROR: Token verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    console.log('Looking up user in database...');
    const user = await DatabaseUserService.findById(decoded.userId);
    if (!user) {
      console.log('ERROR: User not found for ID:', decoded.userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('User found:', user.email);

    // Save KYC progress to dedicated collection
    console.log('Saving KYC progress to dedicated collection...');
    console.log('UserData being saved:', {
      hasFirstName: !!userData.firstName,
      hasLastName: !!userData.lastName,
      hasEmail: !!userData.email,
      hasWallet: !!userData.walletAddress,
      hasInvestorType: !!userData.investorType,
      hasEligibilityAnswers: Object.keys(userData.eligibilityAnswers || {}).length > 0,
      hasInstitutionDetails: !!userData.institutionDetails,
      hasUBO: !!userData.uboDeclaration,
      hasDirectors: !!userData.directorsDeclaration,
      currentStep
    });

    const kycSubmission = await KYCSubmissionService.createOrUpdateDraft(
      user._id!,
      user.email,
      currentStep,
      userData
    );

    if (!kycSubmission) {
      console.log('ERROR: Failed to save KYC progress to collection');
      return NextResponse.json(
        { success: false, error: 'Failed to save KYC progress' },
        { status: 500 }
      );
    }

    console.log('KYC progress saved successfully to collection for user:', user.email);

    return NextResponse.json({
      success: true,
      message: 'KYC progress saved successfully',
      progress: {
        currentStep,
        lastSaved: new Date()
      }
    });

  } catch (error) {
    console.error('Save KYC progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}