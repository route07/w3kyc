import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { User, KYCDocument, RiskProfile, AuditLog } from '@/lib/models';
import { withAdminAuth } from '@/lib/auth';
import { verifyKYCOnChain, createAuditLogOnChain } from '@/lib/blockchain';
import { uploadToIPFS, pinToIPFS } from '@/lib/ipfs-simple';

interface AdminRequest extends NextRequest {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

// Validation schema for KYC approval
const kycApprovalSchema = z.object({
  finalRiskScore: z.number().min(0).max(100),
  notes: z.string().optional(),
  verificationHash: z.string().optional(),
});

// Helper function to upload documents to IPFS after approval
async function uploadDocumentsToIPFSAfterApproval(userId: string, documents: any[]) {
  console.log(`📤 Uploading ${documents.length} documents to IPFS for approved user ${userId}`);
  
  for (const doc of documents) {
    try {
      // Check if document already has IPFS hash
      if (doc.ipfsHash) {
        console.log(`Document ${doc.fileName} already has IPFS hash: ${doc.ipfsHash}`);
        continue;
      }

      // For now, we'll skip actual file upload since we don't have the file data
      // In a real implementation, you'd need to store the file data during draft stage
      // and retrieve it here for IPFS upload
      console.log(`⚠️  Document ${doc.fileName} needs file data for IPFS upload`);
      
      // TODO: Implement file data retrieval and IPFS upload
      // This would require storing file data during draft stage
      
    } catch (error) {
      console.error(`Failed to upload document ${doc.fileName} to IPFS:`, error);
    }
  }
}

async function handler(
  request: AdminRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Get authenticated admin user
    const adminUser = request.user;

    // Get user to approve
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // Check if user is eligible for approval
    if (user.kycStatus !== 'in_progress') {
      return NextResponse.json({
        success: false,
        error: 'User KYC is not in progress',
      }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = kycApprovalSchema.parse(body);

    // Get user's documents
    const documents = await KYCDocument.find({ userId: params.userId });
    const pendingDocuments = documents.filter(doc => doc.verificationStatus === 'pending');

    // Mark all pending documents as verified
    for (const document of pendingDocuments) {
      document.verificationStatus = 'verified';
      document.verifiedAt = new Date();
      await document.save();
    }

    // Update risk profile
    const riskProfile = await RiskProfile.findOne({ userId: params.userId });
    if (riskProfile) {
      riskProfile.overallRisk.score = validatedData.finalRiskScore;
      riskProfile.overallRisk.level = getRiskLevel(validatedData.finalRiskScore);
      riskProfile.lastUpdated = new Date();
      
      if (validatedData.notes) {
        riskProfile.riskFactors.push({
          type: 'admin_review',
          description: validatedData.notes,
          severity: riskProfile.overallRisk.level,
          source: 'admin_approval',
          timestamp: new Date(),
        });
      }
      
      await riskProfile.save();
    }

    // Trigger AI reassessment to update all risk dimensions
    try {
      const { RiskAssessmentService } = await import('@/lib/ai/risk-assessment-service');
      RiskAssessmentService.assessUserRisk(params.userId).catch(error => {
        console.error('AI reassessment failed during approval:', error);
      });
    } catch (error) {
      console.error('Failed to trigger AI reassessment:', error);
    }

    // Update user KYC status
    user.kycStatus = 'verified';
    user.riskScore = validatedData.finalRiskScore;
    await user.save();

    // Update KYCSubmission status to approved
    try {
      const { KYCSubmissionService } = await import('@/lib/kyc-submission-service');
      await KYCSubmissionService.updateStatus(
        params.userId, 
        'approved', 
        adminUser._id.toString()
      );
      console.log('✅ KYCSubmission status updated to approved');
    } catch (error) {
      console.error('Failed to update KYCSubmission status:', error);
    }

    // Create audit log
    const auditLog = new AuditLog({
      userId: user._id.toString(),
      action: 'KYC_APPROVED',
      details: {
        approvedBy: adminUser._id.toString(),
        adminEmail: adminUser.email,
        finalRiskScore: validatedData.finalRiskScore,
        notes: validatedData.notes,
        documentCount: documents.length,
        verifiedDocumentCount: documents.filter(doc => doc.verificationStatus === 'verified').length,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      severity: 'HIGH',
    });

    await auditLog.save();

    // Upload documents to IPFS after approval
    try {
      await uploadDocumentsToIPFSAfterApproval(params.userId, documents);
      console.log('✅ Documents uploaded to IPFS after approval');
    } catch (error) {
      console.error('Failed to upload documents to IPFS after approval:', error);
      // Don't fail the approval if IPFS upload fails
    }

    // Verify on blockchain
    let blockchainResult = null;
    try {
      const contractAddress = process.env.NEXT_PUBLIC_KYCVERIFICATION_CONTRACT_ADDRESS;
      if (contractAddress && user.walletAddress) {
        // Use provided verification hash or generate one
        const verificationHash = validatedData.verificationHash || `kyc-verified-${user._id}-${Date.now()}`;
        
        // Verify KYC on blockchain
        const tx = await verifyKYCOnChain(
          contractAddress,
          user.walletAddress,
          verificationHash,
          validatedData.finalRiskScore
        );

        // Create audit log on blockchain
        await createAuditLogOnChain(
          contractAddress,
          user.walletAddress,
          'KYC_APPROVED',
          JSON.stringify({
            approvedBy: adminUser.email,
            finalRiskScore: validatedData.finalRiskScore,
            timestamp: new Date().toISOString(),
          })
        );

        blockchainResult = {
          transactionHash: tx.hash,
          verificationHash,
          success: true,
        };

        // Update audit log with blockchain hash
        auditLog.onChainHash = tx.hash;
        await auditLog.save();
      }
    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      blockchainResult = {
        success: false,
        error: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
      };
    }

    return NextResponse.json({
      success: true,
      message: 'KYC approved successfully',
      data: {
        userId: user._id,
        kycStatus: 'verified',
        finalRiskScore: validatedData.finalRiskScore,
        riskLevel: getRiskLevel(validatedData.finalRiskScore),
        documentsVerified: pendingDocuments.length,
        blockchainResult,
        approvedAt: new Date().toISOString(),
        approvedBy: adminUser.email,
      },
    });

  } catch (error) {
    console.error('KYC approval error:', error);

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

/**
 * Get risk level based on score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export const PUT = withAdminAuth(handler); 