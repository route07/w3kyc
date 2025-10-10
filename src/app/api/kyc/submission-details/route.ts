import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { KYCSubmissionService } from '@/lib/kyc-submission-service'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    console.log('🔍 Fetching KYC submission details for wallet:', walletAddress)

    // Get user's latest KYC submission using the service
    console.log('🔍 Looking for submissions for user:', authResult.userId);
    
    // First, let's check if there are any submissions for this user at all
    try {
      const allUserSubmissions = await KYCSubmissionService.findAll();
      const userSubmissions = allUserSubmissions.filter(sub => sub.userId === authResult.userId);
      console.log('🔍 All submissions for user:', {
        count: userSubmissions.length,
        submissions: userSubmissions.map(sub => ({
          id: sub._id,
          status: sub.status,
          kycStatus: sub.userData?.kycStatus,
          walletAddress: sub.userData?.walletAddress,
          createdAt: sub.createdAt
        }))
      });
    } catch (error) {
      console.error('❌ Error fetching all submissions:', error);
      // Continue with the main query even if this fails
    }
    
    // Try to find submission by wallet address using the service
    const submission = await KYCSubmissionService.findByUserId(authResult.userId);
    
    // Check if the found submission has the correct wallet address
    if (submission && submission.userData?.walletAddress) {
      const addressesMatch = submission.userData.walletAddress.toLowerCase() === walletAddress.toLowerCase();
      console.log('🔍 Found submission by userId:', {
        id: submission._id,
        status: submission.status,
        kycStatus: submission.userData?.kycStatus,
        submissionWalletAddress: submission.userData?.walletAddress,
        queryWalletAddress: walletAddress,
        addressesMatch
      });
      
      // If addresses don't match, we might have the wrong submission
      if (!addressesMatch) {
        console.log('🔍 Wallet addresses don\'t match, but using this submission anyway');
      }
    } else {
      console.log('🔍 No submission found for user');
    }

    console.log('🔍 Database query result:', {
      found: !!submission,
      submissionId: submission?._id,
      submissionStatus: submission?.status,
      submissionKycStatus: submission?.userData?.kycStatus,
      submissionWalletAddress: submission?.userData?.walletAddress,
      queryWalletAddress: walletAddress,
      addressesMatch: submission?.userData?.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
    })

    if (!submission) {
      return NextResponse.json({ 
        success: true, 
        submission: null,
        message: 'No KYC submission found for this user'
      })
    }

    console.log('✅ KYC submission found:', {
      id: submission._id,
      status: submission.status,
      kycStatus: submission.userData.kycStatus,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
      blockchainTxHash: submission.blockchainTxHash
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission._id,
        status: submission.status,
        kycStatus: submission.userData.kycStatus,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
        reviewedBy: submission.reviewedBy,
        blockchainTxHash: submission.blockchainTxHash,
        blockchainSubmittedAt: submission.blockchainSubmittedAt,
        rejectionReason: submission.rejectionReason,
        currentStep: submission.currentStep,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error fetching KYC submission details:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}