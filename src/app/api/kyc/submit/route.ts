import { NextRequest, NextResponse } from 'next/server';
import { kycSubmissionService, KYCSubmissionData } from '@/lib/kyc-submission';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const kycData: KYCSubmissionData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      walletAddress: body.walletAddress,
      jurisdiction: body.jurisdiction,
      documents: body.documents,
      kycStatus: body.kycStatus
    };

    // Submit KYC using the service
    const result = await kycSubmissionService.submitKYC(kycData);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during KYC submission' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'walletAddress parameter is required' 
        },
        { status: 400 }
      );
    }

    // Get KYC status using the service
    const result = await kycSubmissionService.getKYCStatus(walletAddress);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error) {
    console.error('KYC status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve KYC status' 
      },
      { status: 500 }
    );
  }
}
