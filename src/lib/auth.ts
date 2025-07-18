import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models';
import dbConnect from '@/lib/mongodb';

export interface JWTPayload {
  userId: string;
  email: string;
  kycStatus: string;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-mvp') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to authenticate requests
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  user: any;
  token: string;
} | null> {
  try {
    // Extract token
    const token = extractToken(request);
    if (!token) {
      return null;
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Connect to database
    await dbConnect();

    // Get user from database
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return null;
    }

    return { user, token };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Middleware wrapper for protected routes
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add user and token to request context
    (request as any).user = auth.user;
    (request as any).token = auth.token;

    return handler(request);
  };
}

/**
 * Middleware wrapper for admin routes
 */
export function withAdminAuth(handler: Function) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you'll need to implement this based on your admin model)
    // For now, we'll check if the user has admin role in their profile
    if (auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user and token to request context
    (request as any).user = auth.user;
    (request as any).token = auth.token;

    return handler(request);
  };
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: any): string {
  const userId = user._id?.toString() || user.userId || user.id;
  const email = user.email;
  const kycStatus = user.kycStatus || 'not_started';
  
  return jwt.sign(
    {
      userId,
      email,
      kycStatus,
    },
    process.env.JWT_SECRET || 'fallback-secret-for-mvp',
    { expiresIn: '24h' }
  );
}

/**
 * Get user from request (after authentication)
 */
export function getUserFromRequest(request: NextRequest): any {
  return (request as any).user;
}

/**
 * Get token from request (after authentication)
 */
export function getTokenFromRequest(request: NextRequest): string {
  return (request as any).token;
} 