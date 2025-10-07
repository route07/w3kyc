import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole, AdminLevel } from '@/types';

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
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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

    // Find the user to promote
    const user = await DatabaseUserService.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already an admin
    if (user.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'User is already an admin'
      });
    }

    // Promote user to admin
    const updatedUser = await DatabaseUserService.update(userId, {
      role: UserRole.ADMIN,
      isAdmin: true,
      adminLevel: AdminLevel.BASIC
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to promote user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} has been promoted to admin`,
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
    console.error('Promote user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}