import { NextRequest, NextResponse } from 'next/server';
import { getWeb3ContractServicesServer } from '@/lib/web3-contract-services-server';

export async function POST(request: NextRequest) {
  try {
    const { userAddress } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    const contractServices = getWeb3ContractServicesServer();
    await contractServices.approveKYC(userAddress);

    return NextResponse.json({
      success: true,
      message: 'KYC approved successfully'
    });
  } catch (error) {
    console.error('Error approving KYC:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}