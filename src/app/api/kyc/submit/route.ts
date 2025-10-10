import { NextRequest, NextResponse } from 'next/server';
import { kycSubmissionService, KYCSubmissionData } from '@/lib/kyc-submission';
import { KYCSubmissionService } from '@/lib/kyc-submission-service';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user first
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 Web3 KYC submission received:', {
      hasFormData: !!body.formData,
      hasWalletAddress: !!body.walletAddress,
      source: body.source
    });

    // Extract data from formData if it exists (Web3 submission)
    const kycData: KYCSubmissionData = {
      firstName: body.formData?.firstName || body.firstName,
      lastName: body.formData?.lastName || body.lastName,
      email: body.formData?.email || body.email,
      walletAddress: body.formData?.walletAddress || body.walletAddress,
      jurisdiction: body.formData?.jurisdiction || body.jurisdiction || 'UK',
      documents: body.formData?.documents || body.documents,
      kycStatus: body.formData?.kycStatus || body.kycStatus || 'pending_review'
    };

    console.log('🔍 Processed KYC data:', {
      firstName: kycData.firstName,
      lastName: kycData.lastName,
      email: kycData.email,
      walletAddress: kycData.walletAddress,
      jurisdiction: kycData.jurisdiction,
      kycStatus: kycData.kycStatus,
      formDataWalletAddress: body.formData?.walletAddress,
      bodyWalletAddress: body.walletAddress
    });

    // Submit to blockchain (Web3 service)
    const blockchainResult = await kycSubmissionService.submitKYC(kycData);
    
    if (!blockchainResult.success) {
      return NextResponse.json(blockchainResult, { status: 400 });
    }

    // ALSO save to database for dashboard status tracking
    console.log('💾 Saving Web3 KYC to database for status tracking...');
    
    // Create userData object for database storage
    const userData = {
      firstName: kycData.firstName,
      lastName: kycData.lastName,
      email: kycData.email,
      walletAddress: kycData.walletAddress, // This now comes from formData.walletAddress
      jurisdiction: kycData.jurisdiction,
      investorType: body.formData?.investorType || 'individual',
      eligibilityAnswers: body.formData?.eligibilityAnswers || {},
      institutionDetails: body.formData?.institutionDetails || {
        name: '',
        registrationNumber: '',
        country: '',
        address: { street: '', city: '', state: '', postalCode: '', country: '' },
        businessType: '',
        website: ''
      },
      uboDeclaration: body.formData?.uboDeclaration || {
        hasUBO: false,
        uboDetails: []
      },
      directorsDeclaration: body.formData?.directorsDeclaration || {
        hasDirectors: false,
        directors: []
      },
      documents: kycData.documents || {},
      kycStatus: 'pending_review' // Web3 submissions start as pending review
    };

    console.log('🔍 Saving to database with userData:', {
      walletAddress: userData.walletAddress,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      kycStatus: userData.kycStatus
    });

    // Save to database using the same service as Web2
    const dbSubmission = await KYCSubmissionService.createOrUpdateDraft(
      authResult.userId,
      kycData.email,
      10, // Final step for Web3 submissions
      userData
    );

    // Update status to submitted
    if (dbSubmission) {
      dbSubmission.status = 'submitted';
      dbSubmission.submittedAt = new Date();
      dbSubmission.userData.kycStatus = 'pending_review';
      await dbSubmission.save();
      
      console.log('✅ Web3 KYC saved to database with status: submitted');
    }

    // Return combined result
    return NextResponse.json({
      success: true,
      message: 'Web3 KYC submitted successfully to both blockchain and database',
      data: {
        ...blockchainResult.data,
        databaseId: dbSubmission?._id,
        source: 'web3'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Web3 KYC submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during Web3 KYC submission' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'walletAddress parameter is required' 
        },
        { status: 400 }
      );
    }

    // Get KYC status using the service
    const result = await kycSubmissionService.getKYCStatus(walletAddress);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error) {
    console.error('KYC status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve KYC status' 
      },
      { status: 500 }
    );
  }
}
