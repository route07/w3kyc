import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { KYCSubmissionService } from '@/lib/kyc-submission-service';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('Load KYC progress API called');

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
    let decoded: any;
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

    // Check if user has saved KYC progress in dedicated collection
    const kycSubmission = await KYCSubmissionService.findDraftByUserId(decoded.userId);
    
    if (!kycSubmission) {
      console.log('No KYC progress found for user');
      return NextResponse.json({
        success: true,
        hasProgress: false,
        message: 'No saved KYC progress found'
      });
    }

    console.log('KYC progress found for user:', {
      currentStep: kycSubmission.currentStep,
      lastSaved: kycSubmission.updatedAt,
      hasUserData: !!kycSubmission.userData,
      status: kycSubmission.status
    });

    return NextResponse.json({
      success: true,
      hasProgress: true,
      progress: {
        currentStep: kycSubmission.currentStep,
        userData: kycSubmission.userData,
        lastSaved: kycSubmission.updatedAt,
        status: kycSubmission.status
      }
    });

  } catch (error) {
    console.error('Load KYC progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}