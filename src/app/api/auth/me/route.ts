import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';
import jwt from 'jsonwebtoken';

// Simple in-memory cache for user sessions
const userCache = new Map<string, { user: any; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Always fetch fresh data from database for admin checks
    // (Skip cache to ensure we get the latest admin status)
    const cacheKey = `user_${decoded.userId}`;

    // Fetch from database
    const user = await DatabaseUserService.findById(decoded.userId);
    
    if (!user) {
      // Clear invalid token and user data
      userCache.delete(cacheKey);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert to public user object
    const publicUser = DatabaseUserService.toPublicUser(user);
    
    // Cache the result
    userCache.set(cacheKey, {
      user: publicUser,
      expires: Date.now() + CACHE_DURATION
    });

    // Clean up expired cache entries periodically
    if (Math.random() < 0.1) { // 10% chance
      for (const [key, value] of userCache.entries()) {
        if (value.expires <= Date.now()) {
          userCache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: publicUser
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
