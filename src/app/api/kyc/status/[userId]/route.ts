import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, KYCDocument, RiskProfile } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { getKYCStatusFromChain } from '@/lib/blockchain';

async function handler(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Get authenticated user
    const authenticatedUser = (request as { user: { _id: string; role: string } }).user;

    // Check if user is requesting their own status or is admin
    if (authenticatedUser._id.toString() !== params.userId && authenticatedUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to access this KYC status',
      }, { status: 403 });
    }

    // Get user information
    const user = await User.findById(params.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // Get KYC documents
    const documents = await KYCDocument.find({ userId: params.userId })
      .sort({ uploadedAt: -1 });

    // Get risk profile
    const riskProfile = await RiskProfile.findOne({ userId: params.userId });

    // Get blockchain KYC status if user has wallet address
    let blockchainStatus = null;
    if (user.walletAddress) {
      try {
        const contractAddress = process.env.NEXT_PUBLIC_KYCVERIFICATION_CONTRACT_ADDRESS;
        if (contractAddress) {
          blockchainStatus = await getKYCStatusFromChain(contractAddress, user.walletAddress);
        }
      } catch (error) {
        console.error('Blockchain status fetch error:', error);
        // Don't fail the request if blockchain is unavailable
      }
    }

    // Prepare response data
    const kycData = {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kycStatus: user.kycStatus,
        riskScore: user.riskScore,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      documents: documents.map(doc => ({
        _id: doc._id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
      })),
      riskProfile: riskProfile ? {
        identityRisk: riskProfile.identityRisk,
        industryRisk: riskProfile.industryRisk,
        networkRisk: riskProfile.networkRisk,
        securityRisk: riskProfile.securityRisk,
        overallRisk: riskProfile.overallRisk,
        riskFactors: riskProfile.riskFactors,
        lastUpdated: riskProfile.lastUpdated,
      } : null,
      blockchainStatus,
      summary: {
        totalDocuments: documents.length,
        verifiedDocuments: documents.filter(doc => doc.verificationStatus === 'verified').length,
        pendingDocuments: documents.filter(doc => doc.verificationStatus === 'pending').length,
        rejectedDocuments: documents.filter(doc => doc.verificationStatus === 'rejected').length,
        overallRiskLevel: riskProfile?.overallRisk.level || 'unknown',
        kycCompletionPercentage: calculateKYCCompletion(user.kycStatus, documents.length),
      },
    };

    return NextResponse.json({
      success: true,
      data: kycData,
    });

  } catch (error) {
    console.error('KYC status fetch error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * Calculate KYC completion percentage
 */
function calculateKYCCompletion(kycStatus: string, documentCount: number): number {
  if (kycStatus === 'verified') return 100;
  if (kycStatus === 'rejected') return 0;
  if (kycStatus === 'in_progress') {
    // Basic calculation: 50% for submission + 10% per document (up to 90%)
    return Math.min(50 + (documentCount * 10), 90);
  }
  return 0;
}

export const GET = withAuth(handler); 