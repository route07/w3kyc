import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { uploadToIPFS } from '@/lib/ipfs'
import { verifyKYCOnChain, waitForTransaction } from '@/lib/blockchain'
import dbConnect from '@/lib/mongodb'
import { User, KYCDocument } from '@/lib/models'

export async function POST(request: NextRequest) {
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

    // Get user from database
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const documents = formData.getAll('documents') as File[]
    const kycData = JSON.parse(formData.get('kycData') as string)

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      )
    }

    // Upload documents to IPFS (for MVP, use mock IPFS)
    const ipfsHashes: string[] = []
    for (const doc of documents) {
      try {
        const buffer = Buffer.from(await doc.arrayBuffer())
        const hash = await uploadToIPFS(buffer, doc.name)
        ipfsHashes.push(hash)
        
        // Save document to database
        const kycDocument = new KYCDocument({
          userId: user._id,
          documentType: doc.name.split('.').pop() || 'unknown',
          fileName: doc.name,
          fileSize: doc.size,
          ipfsHash: hash,
          verificationStatus: 'pending',
          uploadedAt: new Date()
        })
        await kycDocument.save()
      } catch (error) {
        console.error('Error uploading document to IPFS:', error)
        return NextResponse.json(
          { error: 'Failed to upload documents' },
          { status: 500 }
        )
      }
    }

    // Submit to blockchain
    try {
      const contractAddress = process.env.NEXT_PUBLIC_KYCVERIFICATION_CONTRACT_ADDRESS!
      if (!contractAddress) {
        throw new Error('KYC contract address not configured')
      }

      // Create verification hash (combine user data and document hashes)
      const verificationData = {
        userId: user._id.toString(),
        email: user.email,
        documents: ipfsHashes,
        kycData,
        timestamp: Date.now()
      }
      const verificationHash = Buffer.from(JSON.stringify(verificationData)).toString('base64')

      // Submit to blockchain
      const tx = await verifyKYCOnChain(
        contractAddress,
        user.walletAddress || user._id.toString(),
        verificationHash,
        user.riskScore || 0
      )

      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx, 1)

      // Update user KYC status
      user.kycStatus = 'pending'
      user.kycSubmittedAt = new Date()
      await user.save()

      return NextResponse.json({
        success: true,
        submissionId: user._id.toString(),
        txHash: receipt?.hash || tx.hash,
        documents: ipfsHashes,
        status: 'pending',
        message: 'KYC submission successful'
      })
    } catch (error) {
      console.error('Error submitting to blockchain:', error)
      return NextResponse.json(
        { error: 'Failed to submit to blockchain' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in KYC submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 