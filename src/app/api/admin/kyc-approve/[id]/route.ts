import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { updateKYCStatusOnChain, waitForTransaction } from '@/lib/blockchain'
import dbConnect from '@/lib/mongodb'
import { User, AuditLog } from '@/lib/models'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    const resolvedParams = await params
    const submissionId = resolvedParams.id
    const { reason, adminNotes } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await User.findById(submissionId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update blockchain
    try {
      const contractAddress = process.env.NEXT_PUBLIC_KYCVERIFICATION_CONTRACT_ADDRESS!
      if (!contractAddress) {
        throw new Error('KYC contract address not configured')
      }

      // Update KYC status on blockchain
      const tx = await updateKYCStatusOnChain(
        contractAddress,
        user.walletAddress || user._id.toString(),
        true // isActive = true for approval
      )

      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx, 1)

      // Update user in database
      user.kycStatus = 'approved'
      user.kycApprovedAt = new Date()
      await user.save()

      // Create audit log
      const auditLog = new AuditLog({
        userId: user._id,
        action: 'KYC_APPROVED',
        details: {
          reason: reason || 'Approved by admin',
          adminNotes: adminNotes || '',
          adminId: decoded.userId,
          txHash: receipt?.hash || tx.hash
        },
        severity: 'LOW',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        onChainHash: receipt?.hash || tx.hash
      })
      await auditLog.save()

      return NextResponse.json({
        success: true,
        submissionId,
        txHash: receipt?.hash || tx.hash,
        status: 'approved',
        message: 'KYC submission approved successfully'
      })
    } catch (error) {
      console.error('Error approving KYC on blockchain:', error)
      return NextResponse.json(
        { error: 'Failed to approve on blockchain' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in KYC approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 