import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { KYCStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, walletAddress } = body;

    // Validate required fields
    if (!email || !password || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingEmailUser = await DatabaseUserService.findByEmail(email);
    if (existingEmailUser) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken' },
        { status: 409 }
      );
    }

    // Check if wallet is already connected to another account
    const existingWalletUser = await DatabaseUserService.findByWalletAddress(walletAddress);
    if (existingWalletUser) {
      return NextResponse.json(
        { success: false, error: 'Wallet is already connected to another account' },
        { status: 409 }
      );
    }

    // Create new user with both email and wallet
    const newUser = await DatabaseUserService.create({
      email,
      password,
      firstName: '',
      lastName: '',
      walletAddress,
      kycStatus: KYCStatus.NOT_STARTED,
    });

    // Return user without password hash
    const userWithoutPassword = DatabaseUserService.toPublicUser(newUser);

    return NextResponse.json({
      success: true,
      message: 'Email connected successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Connect email error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}