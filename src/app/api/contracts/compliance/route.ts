import { NextRequest, NextResponse } from 'next/server'
import { contractFunctions } from '@/lib/contract-functions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    const jurisdiction = searchParams.get('jurisdiction') || 'UK'
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      )
    }
    
    // Get compliance information
    const [complianceCheck, supportedJurisdictions] = await Promise.all([
      contractFunctions.checkCompliance(userAddress, jurisdiction),
      contractFunctions.getSupportedJurisdictions()
    ])
    
    return NextResponse.json({
      success: true,
      userAddress,
      jurisdiction,
      complianceCheck,
      supportedJurisdictions,
      contractAddress: contractFunctions.getContractAddresses().ComplianceChecker
    })
    
  } catch (error) {
    console.error('Error getting compliance data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}