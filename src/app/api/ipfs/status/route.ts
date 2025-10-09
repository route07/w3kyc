import { NextRequest, NextResponse } from 'next/server';
import { isIPFSNodeAvailable, getIPFSGatewayURL } from '@/lib/ipfs';

export async function GET(request: NextRequest) {
  try {
    const isAvailable = await isIPFSNodeAvailable();
    
    if (!isAvailable) {
      return NextResponse.json({
        success: false,
        message: 'IPFS node is not available',
        status: 'disconnected',
        gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'IPFS node is connected and ready',
      status: 'connected',
      apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
      gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080'
    });

  } catch (error) {
    console.error('IPFS status check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking IPFS status',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}