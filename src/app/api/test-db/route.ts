import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { KYCStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to database
    await dbConnect();
    console.log('✅ Database connected successfully');

    // Test basic operations
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // Test creating a test user
    const testUser = new User({
      email: 'test-db@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'Database',
      walletAddress: '0x1234567890123456789012345678901234567890',
      kycStatus: KYCStatus.NOT_STARTED
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Test finding the user
    const foundUser = await User.findOne({ email: 'test-db@example.com' });
    console.log('✅ Test user found:', foundUser ? 'Yes' : 'No');

    // Clean up test user
    await User.deleteOne({ email: 'test-db@example.com' });
    console.log('✅ Test user cleaned up');

    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        connected: true,
        userCount,
        testOperations: 'passed'
      }
    });

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}