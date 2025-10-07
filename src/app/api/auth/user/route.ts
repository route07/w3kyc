import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const walletAddress = searchParams.get('walletAddress');

    if (email) {
      const user = await DatabaseUserService.findByEmail(email);
      if (user) {
        return NextResponse.json({
          success: true,
          user: DatabaseUserService.toPublicUser(user)
        });
      }
    }

    if (walletAddress) {
      const user = await DatabaseUserService.findByWalletAddress(walletAddress);
      if (user) {
        return NextResponse.json({
          success: true,
          user: DatabaseUserService.toPublicUser(user)
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'User not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await DatabaseUserService.findByEmail(email);
    if (user) {
      return NextResponse.json({
        success: true,
        user: DatabaseUserService.toPublicUser(user)
      });
    }

    return NextResponse.json({
      success: false,
      error: 'User not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}