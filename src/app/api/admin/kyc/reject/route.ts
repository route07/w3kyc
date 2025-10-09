import { NextRequest, NextResponse } from 'next/server';
import { getWeb3ContractServicesServer } from '@/lib/web3-contract-services-server';

export async function POST(request: NextRequest) {
  try {
    const { userAddress, reason } = await request.json();
    
    if (!userAddress || !reason) {
      return NextResponse.json(
        { success: false, error: 'User address and reason are required' },
        { status: 400 }
      );
    }

    const contractServices = getWeb3ContractServicesServer();
    await contractServices.rejectKYC(userAddress, reason);

    return NextResponse.json({
      success: true,
      message: 'KYC rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}