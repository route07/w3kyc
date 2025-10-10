import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { KYCDocument, AuditLog } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { uploadToIPFS, pinToIPFS } from '@/lib/ipfs-simple';
import { getUserKYCDocuments } from '@/lib/kyc-document-sync';

// Validation schema for document upload
const documentUploadSchema = z.object({
  documentType: z.enum(['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'proof_of_address']),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive').max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.string().refine((type) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    return allowedTypes.includes(type);
  }, 'Invalid file type. Only PDF and images are allowed'),
  fileData: z.string().min(1, 'File data is required'), // Base64 encoded
});

async function handler(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get authenticated user
    const user = (request as { user: { _id: string; email: string } }).user;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = documentUploadSchema.parse(body);

    // Convert base64 to buffer
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(validatedData.fileData, 'base64');
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file data format',
      }, { status: 400 });
    }

    // Validate file size
    if (fileBuffer.length !== validatedData.fileSize) {
      return NextResponse.json({
        success: false,
        error: 'File size mismatch',
      }, { status: 400 });
    }

    // Upload to IPFS
    let ipfsHash: string;
    try {
      ipfsHash = await uploadToIPFS(fileBuffer, validatedData.fileName);
      await pinToIPFS(ipfsHash);
    } catch (error) {
      console.error('IPFS upload error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to IPFS',
      }, { status: 500 });
    }

    // Create document record
    const document = new KYCDocument({
      userId: user._id.toString(),
      documentType: validatedData.documentType,
      fileName: validatedData.fileName,
      fileSize: validatedData.fileSize,
      mimeType: validatedData.mimeType,
      ipfsHash,
      verificationStatus: 'pending',
    });

    await document.save();

    // Create audit log
    const auditLog = new AuditLog({
      userId: user._id.toString(),
      action: 'DOCUMENT_UPLOADED',
      details: {
        documentId: document._id.toString(),
        documentType: validatedData.documentType,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        ipfsHash,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      severity: 'MEDIUM',
    });

    await auditLog.save();

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId: document._id,
        documentType: document.documentType,
        fileName: document.fileName,
        fileSize: document.fileSize,
        ipfsHash: document.ipfsHash,
        verificationStatus: document.verificationStatus,
        uploadedAt: document.uploadedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Document upload error:', error);

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

// GET handler to fetch user's IPFS documents
async function getHandler(request: NextRequest) {
  try {
    // Get authenticated user
    const user = (request as { user: { _id: string; email: string } }).user;

    // Use the sync function to get documents
    const result = await getUserKYCDocuments(user._id.toString());
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to fetch IPFS documents',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      documents: result.documents || [],
      count: result.documents?.length || 0,
    });

  } catch (error) {
    console.error('Error fetching IPFS documents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch IPFS documents',
    }, { status: 500 });
  }
}

// Use authentication middleware
export const POST = withAuth(handler);
export const GET = withAuth(getHandler); 