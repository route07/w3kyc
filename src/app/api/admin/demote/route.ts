import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole } from '@/types';
import jwt from 'jsonwebtoken';

const userService = new DatabaseUserService();

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get admin user from database
    const adminUser = await DatabaseUserService.findById(decoded.userId);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (!adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the user to demote
    const user = await DatabaseUserService.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is not an admin
    if (!user.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'User is not an admin'
      });
    }

    // Prevent demoting yourself
    if (user._id?.toString() === adminUser._id?.toString()) {
      return NextResponse.json({
        success: false,
        error: 'You cannot demote yourself'
      });
    }

    // Demote user from admin
    const updatedUser = await DatabaseUserService.update(userId, {
      role: UserRole.USER,
      isAdmin: false,
      adminLevel: undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to demote user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} has been demoted from admin`,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin,
        adminLevel: updatedUser.adminLevel
      }
    });

  } catch (error) {
    console.error('Demote user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}