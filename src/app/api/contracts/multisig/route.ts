import { NextRequest, NextResponse } from 'next/server'
import { contractFunctions } from '@/lib/contract-functions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const functionName = searchParams.get('function') || 'default'
    
    // Get multisig information
    const [multisigConfig, pendingOperations, signerCount] = await Promise.all([
      contractFunctions.getMultisigConfig(functionName),
      contractFunctions.getPendingOperations(),
      contractFunctions.getAuthorizedSignerCount()
    ])
    
    return NextResponse.json({
      success: true,
      multisigConfig,
      pendingOperations,
      signerCount,
      contractAddress: contractFunctions.getContractAddresses().MultisigManager
    })
    
  } catch (error) {
    console.error('Error getting multisig data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}