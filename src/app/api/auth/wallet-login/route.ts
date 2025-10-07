import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('Wallet login API called');
    const { walletAddress } = await request.json();
    console.log('Wallet address received:', walletAddress);

    // Validate required fields
    if (!walletAddress) {
      console.log('ERROR: Wallet address is required');
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.log('ERROR: Invalid wallet address format:', walletAddress);
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Find user by wallet address
    console.log('Looking up user by wallet address...');
    const user = await DatabaseUserService.findByWalletAddress(walletAddress);
    
    if (!user) {
      console.log('ERROR: No user found with this wallet address');
      return NextResponse.json(
        { success: false, error: 'No account found with this wallet address. Please connect your wallet to an existing account first.' },
        { status: 404 }
      );
    }

    console.log('User found:', user.email, 'Wallet:', user.walletAddress);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('JWT token generated for user:', user.email);

    // Convert to public user object
    const publicUser = DatabaseUserService.toPublicUser(user);

    return NextResponse.json({
      success: true,
      message: 'Wallet login successful',
      token,
      user: publicUser
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}