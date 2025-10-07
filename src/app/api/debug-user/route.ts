import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUserService } from '@/lib/database-user-service';

const userService = new DatabaseUserService();

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization token provided',
        instructions: 'Please login first to get a token'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        instructions: 'Please login again'
      });
    }

    // Get fresh user data from database
    const freshUser = await DatabaseUserService.findById(decoded.userId);
    
    if (!freshUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found in database',
        instructions: 'Please login again'
      });
    }

    return NextResponse.json({
      success: true,
      tokenData: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        isAdmin: decoded.isAdmin,
        adminLevel: decoded.adminLevel
      },
      freshDatabaseData: {
        id: freshUser._id,
        email: freshUser.email,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        role: freshUser.role,
        isAdmin: freshUser.isAdmin,
        adminLevel: freshUser.adminLevel
      },
      isTokenOutdated: decoded.role !== freshUser.role || decoded.isAdmin !== freshUser.isAdmin,
      instructions: freshUser.isAdmin ? 
        'You are an admin! If you still see access denied, try logging out and logging in again.' :
        'You are not an admin. Please contact support.'
    });

  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Token verification failed',
      details: error.message,
      instructions: 'Please login again to get a fresh token'
    });
  }
}