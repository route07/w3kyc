import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database - in production, use a real database
const users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find current user
    const currentUser = users.find(u => u.id === decoded.userId);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another user
    const emailExists = users.find(u => u.email === email && u.id !== currentUser.id);
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Email is already associated with another account' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user with email and password
    const updatedUser = {
      ...currentUser,
      email,
      password: hashedPassword,
      authMethod: 'hybrid' as const,
      isEmailVerified: false,
      updatedAt: new Date().toISOString(),
    };

    // Update user in database
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = updatedUser;

    // Generate new token
    const newToken = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email, walletAddress: updatedUser.walletAddress },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Email connected successfully',
      user: userWithoutPassword,
      token: newToken,
    }, { status: 200 });

  } catch (error) {
    console.error('Email connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}