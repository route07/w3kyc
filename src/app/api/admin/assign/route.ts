import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole, AdminLevel } from '@/types';
import { requireAdmin } from '@/lib/admin-middleware';

const userService = new DatabaseUserService();

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return adminCheck;
    }

    const { email, adminLevel } = await request.json();

    // Validate required fields
    if (!email || !adminLevel) {
      return NextResponse.json(
        { success: false, error: 'Email and admin level are required' },
        { status: 400 }
      );
    }

    // Validate admin level
    if (!Object.values(AdminLevel).includes(adminLevel)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin level' },
        { status: 400 }
      );
    }

    const assigner = adminCheck.user;

    // Check if assigner has permission to assign admins
    if (assigner.adminLevel !== AdminLevel.SUPER_ADMIN && adminLevel === AdminLevel.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to assign super admin role' },
        { status: 403 }
      );
    }

    // Find the user to assign admin role to
    const user = await userService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with admin role
    const updatedUser = await userService.update(user._id!, {
      role: UserRole.ADMIN,
      isAdmin: true,
      adminLevel: adminLevel
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been assigned ${adminLevel} admin role`,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        adminLevel: updatedUser.adminLevel
      }
    });

  } catch (error) {
    console.error('Admin assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return adminCheck;
    }

    // Get all admin users
    const admins = await userService.findAdmins();
    
    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isAdmin: admin.isAdmin,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt
      }))
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}