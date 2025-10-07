import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user already exists with this wallet
    const existingUser = await DatabaseUserService.findByWalletAddress(walletAddress);
    
    if (existingUser) {
      // Generate JWT token for existing user
      const token = jwt.sign(
        { 
          userId: existingUser._id.toString(),
          email: existingUser.email,
          walletAddress: existingUser.walletAddress
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        user: DatabaseUserService.toPublicUser(existingUser),
        token
      });
    }

    // Create new wallet user
    const walletEmail = `wallet_${walletAddress.slice(2, 10)}@wallet.local`;
    console.log('Creating wallet user with email:', walletEmail);
    
    const newUser = await DatabaseUserService.create({
      email: walletEmail,
      password: uuidv4(), // Random password for wallet users
      walletAddress: walletAddress,
      firstName: 'Wallet',
      lastName: 'User'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id.toString(),
        email: newUser.email,
        walletAddress: newUser.walletAddress
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      user: DatabaseUserService.toPublicUser(newUser),
      token
    });

  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}