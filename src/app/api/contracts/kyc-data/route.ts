import { NextRequest, NextResponse } from 'next/server'
import { contractFunctions } from '@/lib/contract-functions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      )
    }
    
    // Get KYC data and status
    const [kycData, kycStatus, linkedWallets] = await Promise.all([
      contractFunctions.getKYCData(userAddress),
      contractFunctions.getKYCStatus(userAddress),
      contractFunctions.getLinkedWallets(userAddress)
    ])
    
    return NextResponse.json({
      success: true,
      userAddress,
      kycData,
      kycStatus,
      linkedWallets,
      contractAddress: contractFunctions.getContractAddresses().KYCDataStorage
    })
    
  } catch (error) {
    console.error('Error getting KYC data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}