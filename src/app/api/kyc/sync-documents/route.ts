import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { syncDocumentsWithKYCStatus } from '@/lib/kyc-document-sync';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kycStatus } = body;

    if (!kycStatus || !['approved', 'rejected', 'permanently_rejected'].includes(kycStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid KYC status. Must be: approved, rejected, or permanently_rejected'
      }, { status: 400 });
    }

    // Sync documents with KYC status
    const result = await syncDocumentsWithKYCStatus(authResult.userId, kycStatus);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to sync documents'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      documentsUpdated: result.documentsUpdated,
      documentsDeleted: result.documentsDeleted
    });

  } catch (error) {
    console.error('Document sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during document sync'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kycStatus = searchParams.get('kycStatus');

    if (!kycStatus || !['approved', 'rejected', 'permanently_rejected'].includes(kycStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid KYC status. Must be: approved, rejected, or permanently_rejected'
      }, { status: 400 });
    }

    // Sync documents with KYC status
    const result = await syncDocumentsWithKYCStatus(authResult.userId, kycStatus);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to sync documents'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      documentsUpdated: result.documentsUpdated,
      documentsDeleted: result.documentsDeleted
    });

  } catch (error) {
    console.error('Document sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during document sync'
    }, { status: 500 });
  }
}