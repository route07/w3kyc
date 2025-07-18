import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models';

// Validation schema for user login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus: user.kycStatus
      }
    });

  } catch (error) {
    console.error('Login error:', error);

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