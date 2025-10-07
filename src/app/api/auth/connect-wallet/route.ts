import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('Connect wallet API called');
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

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Authorization token required');
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded successfully, userId:', decoded.userId);
    } catch (error) {
      console.log('ERROR: Token verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    console.log('Looking up user in database...');
    const user = await DatabaseUserService.findById(decoded.userId);
    if (!user) {
      console.log('ERROR: User not found for ID:', decoded.userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('User found:', user.email, 'Current wallet:', user.walletAddress);

    // Check if wallet is already connected to another user
    const existingWalletUser = await DatabaseUserService.findByWalletAddress(walletAddress);
    if (existingWalletUser && existingWalletUser._id?.toString() !== user._id?.toString()) {
      return NextResponse.json(
        { success: false, error: 'This wallet is already connected to another account' },
        { status: 400 }
      );
    }

    // Check if user already has a wallet connected
    if (user.walletAddress && user.walletAddress !== walletAddress) {
      return NextResponse.json(
        { success: false, error: 'User already has a different wallet connected' },
        { status: 400 }
      );
    }

    // Update user with wallet address
    console.log('Updating user with wallet address:', walletAddress.toLowerCase());
    const updatedUser = await DatabaseUserService.update(user._id!, {
      walletAddress: walletAddress.toLowerCase()
    });

    if (!updatedUser) {
      console.log('ERROR: Failed to update user in database');
      return NextResponse.json(
        { success: false, error: 'Failed to connect wallet' },
        { status: 500 }
      );
    }

    console.log('User updated successfully:', updatedUser.email, 'New wallet:', updatedUser.walletAddress);

    // Convert to public user object
    const publicUser = DatabaseUserService.toPublicUser(updatedUser);
    console.log('Public user object:', publicUser);

    return NextResponse.json({
      success: true,
      message: 'Wallet connected successfully',
      user: publicUser
    });

  } catch (error) {
    console.error('Connect wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}