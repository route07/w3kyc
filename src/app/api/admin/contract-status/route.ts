import { NextRequest, NextResponse } from 'next/server';
import { getWeb3ContractServicesServer } from '@/lib/web3-contract-services-server';

export async function GET(request: NextRequest) {
  try {
    const contractServices = getWeb3ContractServicesServer();
    const contractStatus = contractServices.getContractStatus();
    const availableContracts = contractServices.getAvailableContracts();

    return NextResponse.json({
      success: true,
      data: {
        contractStatus,
        availableContracts,
        totalContracts: availableContracts.length,
        activeContracts: Object.values(contractStatus).filter(Boolean).length
      }
    });
  } catch (error) {
    console.error('Error getting contract status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}