import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/user-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const walletAddress = searchParams.get('walletAddress');

    if (email) {
      const user = await UserService.findByEmail(email);
      if (user) {
        return NextResponse.json({
          success: true,
          user: UserService.toPublicUser(user)
        });
      }
    }

    if (walletAddress) {
      const user = await UserService.findByWalletAddress(walletAddress);
      if (user) {
        return NextResponse.json({
          success: true,
          user: UserService.toPublicUser(user)
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

    const user = await UserService.findByEmail(email);
    if (user) {
      return NextResponse.json({
        success: true,
        user: UserService.toPublicUser(user)
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