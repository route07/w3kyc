import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseUserService } from '@/lib/database-user-service';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await DatabaseUserService.findByEmail(email);
      if (existingUser && existingUser._id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Email is already taken' },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await DatabaseUserService.update(session.user.id, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password hash
    const userWithoutPassword = DatabaseUserService.toPublicUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}