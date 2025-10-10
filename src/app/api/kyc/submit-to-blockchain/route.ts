import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { orchestratorService } from '@/lib/orchestrator-service'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    console.log('🚀 Submitting approved KYC to blockchain for wallet:', walletAddress)

    // Get user's approved KYC data
    const { default: KYCSubmission } = await import('@/lib/models/KYCSubmission')
    const kycData = await KYCSubmission.findOne({
      userId: authResult.userId,
      status: 'approved'
    }).sort({ createdAt: -1 })

    if (!kycData) {
      return NextResponse.json({ error: 'No approved KYC data found' }, { status: 404 })
    }

    // Start blockchain session
    const startResult = await orchestratorService.startSession()
    if (!startResult.success) {
      return NextResponse.json({ 
        error: 'Failed to start blockchain session: ' + startResult.error 
      }, { status: 500 })
    }

    // Execute all steps on blockchain
    const steps = [
      { step: 1, data: kycData.userData },
      { step: 2, data: kycData.userData },
      { step: 3, data: kycData.userData },
      { step: 4, data: kycData.userData },
      { step: 5, data: kycData.userData }
    ]

    let lastTxHash = null
    for (const stepData of steps) {
      const result = await orchestratorService.executeStep(stepData.step, stepData.data)
      if (!result.success) {
        return NextResponse.json({ 
          error: `Failed to execute step ${stepData.step}: ${result.error}` 
        }, { status: 500 })
      }
      lastTxHash = result.txHash
    }

    // Update KYC status to blockchain_submitted
    await KYCSubmission.findByIdAndUpdate(kycData._id, {
      status: 'blockchain_submitted',
      blockchainTxHash: lastTxHash,
      blockchainSubmittedAt: new Date()
    })

    console.log('✅ KYC successfully submitted to blockchain')

    return NextResponse.json({
      success: true,
      txHash: lastTxHash,
      message: 'KYC successfully submitted to blockchain'
    })

  } catch (error) {
    console.error('❌ Blockchain submission error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}