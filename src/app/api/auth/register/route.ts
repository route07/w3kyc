import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models';

// Simplified validation schema for MVP - matches frontend data
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  walletAddress: z.string().optional(),
  // Optional fields for MVP - can be filled later during KYC
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user with default values for optional fields
    const userData = {
      ...validatedData,
      email: validatedData.email.toLowerCase(),
      dateOfBirth: validatedData.dateOfBirth || '1990-01-01', // Default value
      nationality: validatedData.nationality || 'Unknown',
      phoneNumber: validatedData.phoneNumber || '+1234567890', // Default value
      address: validatedData.address || {
        street: 'Not provided',
        city: 'Not provided',
        state: 'Not provided',
        postalCode: '00000',
        country: 'Unknown'
      },
      kycStatus: 'not_started' as const
    };

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus: user.kycStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
} 