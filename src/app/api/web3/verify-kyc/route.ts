import { NextRequest, NextResponse } from 'next/server';
import { web3KYCService } from '@/lib/web3-kyc-service';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for KYC verification
const verifyKYCSchema = z.object({
  userAddress: z.string().min(1, 'User address is required'),
  verificationHash: z.string().min(1, 'Verification hash is required'),
  riskScore: z.number().min(0).max(100, 'Risk score must be between 0 and 100'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

async function handler(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = verifyKYCSchema.parse(body);

    // Check if contracts are deployed
    const contractStatus = await web3KYCService.checkContractStatus();
    if (!contractStatus.kycManager) {
      return NextResponse.json({
        success: false,
        error: 'KYCManager contract not deployed. Please deploy the contract first.',
        contractStatus
      }, { status: 503 });
    }

    // Verify KYC on blockchain
    const result = await web3KYCService.verifyKYC(
      validatedData.userAddress,
      validatedData.verificationHash,
      validatedData.riskScore,
      validatedData.jurisdiction,
      validatedData.tenantId
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'KYC verification failed'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'KYC verified successfully on blockchain',
      txHash: result.txHash,
      data: {
        userAddress: validatedData.userAddress,
        verificationHash: validatedData.verificationHash,
        riskScore: validatedData.riskScore,
        jurisdiction: validatedData.jurisdiction,
        tenantId: validatedData.tenantId
      }
    });

  } catch (error) {
    console.error('Web3 KYC verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Use authentication middleware
export const POST = withAuth(handler);