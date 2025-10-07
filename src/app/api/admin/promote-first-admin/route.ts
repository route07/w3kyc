import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole, AdminLevel } from '@/types';

const userService = new DatabaseUserService();

export async function POST(request: NextRequest) {
  try {
    const { email, secretKey } = await request.json();

    // Validate secret key
    const validSecretKey = process.env.PROMOTE_ADMIN_SECRET_KEY || 'PROMOTE_ADMIN_2025';
    if (secretKey !== validSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    // Check if any super admin already exists
    const existingAdmins = await userService.findAdmins();
    const superAdmin = existingAdmins.find(admin => admin.adminLevel === AdminLevel.SUPER_ADMIN);
    
    if (superAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Super admin already exists. This promotion can only be used once.',
        existingAdmin: {
          email: superAdmin.email,
          adminLevel: superAdmin.adminLevel
        }
      });
    }

    // Find the user to promote
    const user = await DatabaseUserService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email address' },
        { status: 404 }
      );
    }

    // Check if user is already an admin
    if (user.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'User is already an admin',
        currentRole: {
          isAdmin: user.isAdmin,
          adminLevel: user.adminLevel,
          role: user.role
        }
      });
    }

    // Promote user to super admin
    const updatedUser = await DatabaseUserService.update(user._id!, {
      role: UserRole.SUPER_ADMIN,
      isAdmin: true,
      adminLevel: AdminLevel.SUPER_ADMIN
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to promote user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been successfully promoted to Super Admin!`,
      promotedUser: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        adminLevel: updatedUser.adminLevel
      },
      instructions: {
        login: 'You can now login with your existing credentials',
        adminAccess: 'After login, visit /admin to access the admin dashboard',
        nextSteps: 'Use the admin management tab to assign admin roles to other users'
      }
    });

  } catch (error) {
    console.error('Promote admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}