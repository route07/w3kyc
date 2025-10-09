import { NextRequest, NextResponse } from 'next/server';
import { getWeb3ContractServicesServer } from '@/lib/web3-contract-services-server';

export async function GET(request: NextRequest) {
  try {
    const contractServices = getWeb3ContractServicesServer();
    
    // Test functions that actually exist in the contracts
    const testResults: any = {};
    
    // Test KYCManager functions
    try {
      // Test with a dummy address (this will likely fail due to access control, but we can see the error)
      const testAddress = '0x1234567890123456789012345678901234567890';
      const kycStatus = await contractServices.getKYCStatus(testAddress);
      // Convert BigInt to string for JSON serialization
      testResults.kycStatus = {
        isVerified: kycStatus[0],
        isActive: kycStatus[1],
        verifiedAt: kycStatus[2].toString(),
        expiresAt: kycStatus[3].toString()
      };
    } catch (error) {
      testResults.kycStatusError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Test contract status
    testResults.contractStatus = contractServices.getContractStatus();
    testResults.availableContracts = contractServices.getAvailableContracts();
    
    // Test emergency mode
    try {
      const emergencyMode = await contractServices.isEmergencyMode();
      testResults.emergencyMode = emergencyMode;
    } catch (error) {
      testResults.emergencyModeError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Test feature flags
    try {
      const featureEnabled = await contractServices.isFeatureEnabled('kyc_verification');
      testResults.featureEnabled = featureEnabled;
    } catch (error) {
      testResults.featureEnabledError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      data: testResults,
      message: "Contract testing completed"
    });
  } catch (error) {
    console.error('Error testing contracts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}