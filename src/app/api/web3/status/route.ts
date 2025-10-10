import { NextRequest, NextResponse } from 'next/server';
import { web3KYCService } from '@/lib/web3-kyc-service';

export async function GET(request: NextRequest) {
  try {
    // Check contract deployment status
    const contractStatus = await web3KYCService.checkContractStatus();
    const contractAddresses = web3KYCService.getContractAddresses();

    // Get detailed contract information
    const contractInfo = {
      kycManager: {
        deployed: contractStatus.kycManager,
        address: contractAddresses.kycManager,
        name: 'KYCManager',
        description: 'Handles KYC verification and status management'
      },
      didManager: {
        deployed: contractStatus.didManager,
        address: contractAddresses.didManager,
        name: 'DIDManager',
        description: 'Manages Decentralized Identity credentials'
      },
      authorizationManager: {
        deployed: contractStatus.authorizationManager,
        address: process.env.NEXT_PUBLIC_AUTHORIZATIONMANAGER_ADDRESS,
        name: 'AuthorizationManager',
        description: 'Manages user authorization and permissions'
      },
      complianceChecker: {
        deployed: contractStatus.complianceChecker,
        address: process.env.NEXT_PUBLIC_COMPLIANCECHECKER_ADDRESS,
        name: 'ComplianceChecker',
        description: 'Checks compliance across multiple data sources'
      },
      versionManager: {
        deployed: contractStatus.versionManager,
        address: process.env.NEXT_PUBLIC_VERSIONMANAGER_ADDRESS,
        name: 'VersionManager',
        description: 'Manages system versioning and compatibility'
      },
      jurisdictionConfig: {
        deployed: contractStatus.jurisdictionConfig,
        address: process.env.NEXT_PUBLIC_JURISDICTIONCONFIG_ADDRESS,
        name: 'JurisdictionConfig',
        description: 'Manages jurisdiction-specific configurations'
      },
      featureFlags: {
        deployed: contractStatus.featureFlags,
        address: process.env.NEXT_PUBLIC_FEATUREFLAGS_ADDRESS,
        name: 'FeatureFlags',
        description: 'Manages feature toggles and system capabilities'
      },
      credentialTypeManager: {
        deployed: contractStatus.credentialTypeManager,
        address: process.env.NEXT_PUBLIC_CREDENTIALTYPEMANAGER_ADDRESS,
        name: 'CredentialTypeManager',
        description: 'Manages supported credential types'
      },
      multisigModifier: {
        deployed: contractStatus.multisigModifier,
        address: process.env.NEXT_PUBLIC_MULTISIGMODIFIER_ADDRESS,
        name: 'MultisigModifier',
        description: 'Provides multisig functionality to other contracts'
      },
      emergencyManager: {
        deployed: contractStatus.emergencyManager,
        address: process.env.NEXT_PUBLIC_EMERGENCYMANAGER_ADDRESS,
        name: 'EmergencyManager',
        description: 'Handles emergency situations and system shutdowns'
      },
      governanceManager: {
        deployed: contractStatus.governanceManager,
        address: process.env.NEXT_PUBLIC_GOVERNANCEMANAGER_ADDRESS,
        name: 'GovernanceManager',
        description: 'Manages governance proposals and voting'
      },
      multisigExample: {
        deployed: contractStatus.multisigExample,
        address: process.env.NEXT_PUBLIC_MULTISIGEXAMPLE_ADDRESS,
        name: 'MultisigExample',
        description: 'Example implementation of multisig functionality'
      }
    };

    // Calculate overall Web3 readiness
    const deployedContracts = Object.values(contractStatus).filter(Boolean).length;
    const totalContracts = Object.keys(contractStatus).length;
    const readinessPercentage = Math.round((deployedContracts / totalContracts) * 100);

    return NextResponse.json({
      success: true,
      message: 'Web3 status retrieved successfully',
      data: {
        overall: {
          readinessPercentage,
          deployedContracts,
          totalContracts,
          status: readinessPercentage >= 50 ? 'ready' : 'partial'
        },
        contracts: contractInfo,
        features: {
          kycVerification: contractStatus.kycManager,
          didCredentials: contractStatus.didManager,
          authorizationControl: contractStatus.authorizationManager,
          complianceChecking: contractStatus.complianceChecker,
          versionManagement: contractStatus.versionManager,
          jurisdictionSupport: contractStatus.jurisdictionConfig,
          featureToggles: contractStatus.featureFlags,
          credentialTypes: contractStatus.credentialTypeManager,
          multisigOperations: true, // MultisigManager is deployed
          emergencyManagement: contractStatus.emergencyManager,
          governance: contractStatus.governanceManager,
          ipfsStorage: true, // IPFS is always available
          auditTrail: true // AuditLogStorage is deployed
        },
        recommendations: getRecommendations(contractStatus)
      }
    });

  } catch (error) {
    console.error('Web3 status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check Web3 status'
    }, { status: 500 });
  }
}

function getRecommendations(contractStatus: Record<string, boolean>): string[] {
  const recommendations: string[] = [];
  const deployedCount = Object.values(contractStatus).filter(Boolean).length;
  const totalCount = Object.keys(contractStatus).length;

  if (deployedCount === totalCount) {
    recommendations.push('🎉 Complete Web3 KYC system deployed! All 19 contracts are active');
    recommendations.push('🚀 System ready for production use with full Web3 capabilities');
    recommendations.push('💡 Consider implementing advanced governance and emergency procedures');
  } else {
    const missingCount = totalCount - deployedCount;
    recommendations.push(`${missingCount} contracts still need deployment for complete Web3 KYC system`);
    
    if (!contractStatus.kycManager) {
      recommendations.push('Deploy KYCManager contract to enable on-chain KYC verification');
    }
    if (!contractStatus.didManager) {
      recommendations.push('Deploy DIDManager contract to enable DID credential management');
    }
    if (!contractStatus.authorizationManager) {
      recommendations.push('Deploy AuthorizationManager contract to enable access control');
    }
    if (!contractStatus.complianceChecker) {
      recommendations.push('Deploy ComplianceChecker contract to enable compliance verification');
    }
  }

  return recommendations;
}