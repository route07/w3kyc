import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole, AdminLevel } from '@/types';

const userService = new DatabaseUserService();

export async function POST(request: NextRequest) {
  try {
    // Check if super admin already exists
    const existingAdmins = await userService.findAdmins();
    const superAdmin = existingAdmins.find(admin => admin.adminLevel === AdminLevel.SUPER_ADMIN);
    
    if (superAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Super admin already exists',
        existingAdmin: {
          email: superAdmin.email,
          adminLevel: superAdmin.adminLevel
        }
      });
    }
    
    // Create super admin user
    const superAdminData = {
      email: 'admin@w3kyc.com',
      password: 'Admin123!@#',
      firstName: 'Super',
      lastName: 'Admin',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'Admin State',
        postalCode: '12345',
        country: 'United States'
      },
      phoneNumber: '+1234567890',
      kycStatus: 'verified',
      riskScore: 0,
      role: UserRole.SUPER_ADMIN,
      isAdmin: true,
      adminLevel: AdminLevel.SUPER_ADMIN
    };
    
    const createdAdmin = await userService.create(superAdminData);
    
    if (createdAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Super admin created successfully!',
        admin: {
          email: createdAdmin.email,
          firstName: createdAdmin.firstName,
          lastName: createdAdmin.lastName,
          adminLevel: createdAdmin.adminLevel,
          role: createdAdmin.role
        },
        credentials: {
          email: 'admin@w3kyc.com',
          password: 'Admin123!@#'
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create super admin' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Create super admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}