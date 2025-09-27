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

    // Get transaction data for user to sign
    const result = await kycSubmissionService.getTransactionData(kycData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Transaction data prepared for signing',
        data: {
          transaction: result.transaction,
          message: 'Please sign this transaction to submit your KYC',
          walletAddress: kycData.walletAddress,
          jurisdiction: kycData.jurisdiction,
          estimatedGasCost: '0.001 ETH'
        }
      }, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Transaction data preparation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during transaction preparation' 
      },
      { status: 500 }
    );
  }
}
