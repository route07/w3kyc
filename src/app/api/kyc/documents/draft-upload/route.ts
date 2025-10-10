import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { uploadToIPFS, pinToIPFS } from '@/lib/ipfs-simple';
import dbConnect from '@/lib/mongodb';
import { KYCDocument } from '@/lib/models';
import { KYCSubmissionService } from '@/lib/kyc-submission-service';
import { z } from 'zod';

const documentUploadSchema = z.object({
  fileData: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  documentType: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

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
    let ipfsUrl: string;
    try {
      const ipfsResult = await uploadToIPFS(fileBuffer, validatedData.fileName);
      ipfsHash = ipfsResult.hash;
      ipfsUrl = ipfsResult.url;
      
      // Pin the file to ensure persistence
      const pinResult = await pinToIPFS(ipfsHash);
      if (!pinResult) {
        console.warn('Warning: Failed to pin file to IPFS, file may not persist');
      }
    } catch (error) {
      console.error('IPFS upload error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to IPFS',
      }, { status: 500 });
    }

    // Create KYCDocument record
    const kycDocument = new KYCDocument({
      userId: authResult.userId,
      documentType: validatedData.documentType,
      fileName: validatedData.fileName,
      fileSize: validatedData.fileSize,
      mimeType: validatedData.mimeType,
      ipfsHash,
      verificationStatus: 'pending',
      uploadedAt: new Date()
    });

    await kycDocument.save();

    // Update the user's draft KYC submission with IPFS document info
    const draftSubmission = await KYCSubmissionService.findDraftByUserId(authResult.userId);
    if (draftSubmission) {
      // Add IPFS document to the draft submission
      const ipfsDocument = {
        documentType: validatedData.documentType,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        ipfsHash,
        ipfsUrl,
        verificationStatus: 'pending',
        uploadedAt: new Date()
      };

      // Update the draft with the new IPFS document
      await KYCSubmissionService.createOrUpdateDraft(
        authResult.userId,
        draftSubmission.email,
        draftSubmission.currentStep,
        {
          ...draftSubmission.userData,
          ipfsDocuments: [...(draftSubmission.userData.ipfsDocuments || []), ipfsDocument]
        }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: kycDocument._id.toString(),
        documentType: validatedData.documentType,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        ipfsHash,
        ipfsUrl,
        verificationStatus: 'pending',
        uploadedAt: kycDocument.uploadedAt
      }
    });

  } catch (error) {
    console.error('Draft document upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}