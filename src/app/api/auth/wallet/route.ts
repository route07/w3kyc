import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock database - in production, use a real database
const users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    // Validate wallet address
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check if wallet is already associated with a user
    const existingUser = users.find(u => u.walletAddress === walletAddress);
    
    if (existingUser) {
      // Existing user with this wallet
      const token = jwt.sign(
        { userId: existingUser.id, walletAddress: existingUser.walletAddress },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = existingUser;

      return NextResponse.json({
        success: true,
        message: 'Wallet connected to existing account',
        user: userWithoutPassword,
        token,
      }, { status: 200 });
    } else {
      // New wallet user - create account
      const newUser = {
        id: `wallet_${Date.now()}`,
        walletAddress,
        authMethod: 'web3' as const,
        isEmailVerified: false,
        isWalletConnected: true,
        kycStatus: 'NONE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store user (in production, save to database)
      users.push(newUser);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, walletAddress: newUser.walletAddress },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        message: 'New wallet account created',
        user: newUser,
        token,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Wallet connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}