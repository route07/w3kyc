import { NextRequest, NextResponse } from 'next/server'
import { getContractAddresses, getKYCManagerContract } from '@/lib/blockchain'
import { ethers } from 'ethers'

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
    
    const addresses = getContractAddresses()
    const kycManager = getKYCManagerContract(addresses.KYCManager)
    
    try {
      // Get KYC status from blockchain
      const kycStatus = await kycManager.getKYCStatus(userAddress)
      
      // Get additional KYC data
      const [verificationHash, riskScore, expirationDate] = await Promise.all([
        kycManager.getVerificationHash(userAddress).catch(() => ''),
        kycManager.getRiskScore(userAddress).catch(() => 0),
        kycManager.getExpirationDate(userAddress).catch(() => 0)
      ])
      
      return NextResponse.json({
        success: true,
        userAddress,
        kycStatus: {
          isVerified: kycStatus.isVerified,
          isActive: kycStatus.isActive,
          isExpired: kycStatus.isExpired,
          verificationHash,
          riskScore: riskScore.toString(),
          expirationDate: expirationDate.toString()
        },
        contractAddress: addresses.KYCManager
      })
      
    } catch (error) {
      // If user doesn't exist on blockchain, return not verified
      return NextResponse.json({
        success: true,
        userAddress,
        kycStatus: {
          isVerified: false,
          isActive: false,
          isExpired: false,
          verificationHash: '',
          riskScore: '0',
          expirationDate: '0'
        },
        contractAddress: addresses.KYCManager,
        note: 'User not found on blockchain'
      })
    }
    
  } catch (error) {
    console.error('Error getting KYC status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}