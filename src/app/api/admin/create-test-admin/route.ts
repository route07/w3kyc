import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import { UserRole, AdminLevel } from '@/types';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await DatabaseUserService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new admin user (password will be hashed by pre-save middleware)
    const newUser = await DatabaseUserService.create({
      email,
      password: password,
      firstName,
      lastName,
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'US'
      },
      phoneNumber: '1234567890',
      kycStatus: 'not_started',
      riskScore: 0,
      role: UserRole.SUPER_ADMIN,
      isAdmin: true,
      adminLevel: AdminLevel.SUPER_ADMIN
    });

    if (!newUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test admin user created successfully',
      user: DatabaseUserService.toPublicUser(newUser)
    });

  } catch (error) {
    console.error('Create test admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}