import { NextRequest, NextResponse } from 'next/server'
import { getContractAddresses, getNetworkInfo, provider } from '@/lib/blockchain'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
  try {
    const addresses = getContractAddresses()
    const networkInfo = await getNetworkInfo()
    
    const contractStatuses = []
    
    // Check each contract
    for (const [name, address] of Object.entries(addresses)) {
      try {
        const contract = new ethers.Contract(
          address,
          ['function owner() view returns (address)', 'function VERSION() view returns (uint256)'],
          provider
        )
        
        const [owner, version] = await Promise.all([
          contract.owner().catch(() => null),
          contract.VERSION().catch(() => null)
        ])
        
        contractStatuses.push({
          name,
          address,
          status: 'deployed',
          owner: owner || undefined,
          version: version ? version.toString() : undefined
        })
      } catch (error) {
        contractStatuses.push({
          name,
          address,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const deployedContracts = contractStatuses.filter(c => c.status === 'deployed')
    const errorContracts = contractStatuses.filter(c => c.status === 'error')
    
    return NextResponse.json({
      success: true,
      network: {
        chainId: networkInfo.chainId.toString(),
        name: networkInfo.name,
        blockNumber: networkInfo.blockNumber,
        gasPrice: networkInfo.gasPrice?.toString()
      },
      contracts: {
        total: contractStatuses.length,
        deployed: deployedContracts.length,
        errors: errorContracts.length,
        successRate: contractStatuses.length > 0 ? Math.round((deployedContracts.length / contractStatuses.length) * 100) : 0
      },
      contractStatuses,
      deployedContracts,
      errorContracts
    })
    
  } catch (error) {
    console.error('Error checking contract status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}