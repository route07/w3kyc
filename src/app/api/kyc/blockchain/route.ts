import { NextRequest, NextResponse } from 'next/server';
import { KYCService } from '@/lib/kyc-service';
import { getNetworkInfo } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userAddress = searchParams.get('userAddress');

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'status':
        if (!userAddress) {
          return NextResponse.json(
            { error: 'User address is required for status check' },
            { status: 400 }
          );
        }
        
        const statusResult = await KYCService.getKYCStatus(userAddress);
        return NextResponse.json(statusResult);

      case 'data':
        if (!userAddress) {
          return NextResponse.json(
            { error: 'User address is required for data retrieval' },
            { status: 400 }
          );
        }
        
        const dataResult = await KYCService.getKYCData(userAddress);
        return NextResponse.json(dataResult);

      case 'validity':
        if (!userAddress) {
          return NextResponse.json(
            { error: 'User address is required for validity check' },
            { status: 400 }
          );
        }
        
        const validityResult = await KYCService.isKYCValid(userAddress);
        return NextResponse.json(validityResult);

      case 'network':
        const networkResult = await KYCService.getNetworkInfo();
        return NextResponse.json(networkResult);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Blockchain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userAddress, dataHash, verificationHash, riskScore } = body;

    if (!action || !userAddress) {
      return NextResponse.json(
        { error: 'Action and userAddress are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'store':
        if (!dataHash) {
          return NextResponse.json(
            { error: 'Data hash is required for storing KYC data' },
            { status: 400 }
          );
        }
        
        const storeResult = await KYCService.storeKYCData(userAddress, dataHash);
        return NextResponse.json(storeResult);

      case 'verify':
        if (!verificationHash || riskScore === undefined) {
          return NextResponse.json(
            { error: 'Verification hash and risk score are required for verification' },
            { status: 400 }
          );
        }
        
        const verifyResult = await KYCService.verifyKYC(userAddress, verificationHash, riskScore);
        return NextResponse.json(verifyResult);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Blockchain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
