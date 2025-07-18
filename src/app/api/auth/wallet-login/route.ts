import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { generateToken } from '@/lib/auth'
import { getMockUserById } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json()

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // For MVP, find or create user by wallet address
    // In production, you'd check the database
    const user = getMockUserById('1') // Use first mock user for demo
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      walletAddress: walletAddress
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        walletAddress: user.walletAddress,
        kycStatus: user.kycStatus
      }
    })
  } catch (error) {
    console.error('Error in wallet login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 