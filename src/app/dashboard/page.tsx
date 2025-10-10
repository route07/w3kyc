'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { UserIcon, ShieldCheckIcon, DocumentTextIcon, WalletIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon, CloudIcon, LinkIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Web3KYCLink from '@/components/Web3KYCLink';

// Status configuration for comprehensive display
const statusConfig = {
  'not_started': {
    title: 'Not Started',
    description: 'KYC verification has not been initiated',
    icon: DocumentTextIcon,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-500',
    dotColor: 'bg-gray-400',
    progress: 0
  },
  'draft': {
    title: 'Draft',
    description: 'KYC form is being filled out',
    icon: DocumentTextIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-400',
    progress: 20
  },
  'in_progress': {
    title: 'In Progress',
    description: 'KYC verification is currently being completed',
    icon: ClockIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    dotColor: 'bg-blue-400',
    progress: 40
  },
  'submitted': {
    title: 'Submitted',
    description: 'KYC application has been submitted for review',
    icon: ClockIcon,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    dotColor: 'bg-yellow-400',
    progress: 60
  },
  'under_review': {
    title: 'Under Review',
    description: 'KYC application is being reviewed by administrators',
    icon: ClockIcon,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400',
    progress: 70
  },
  'pending_review': {
    title: 'Pending Review',
    description: 'KYC application is awaiting administrative review',
    icon: ClockIcon,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-400',
    progress: 70
  },
  'approved': {
    title: 'Approved',
    description: 'KYC verification has been approved',
    icon: CheckCircleIcon,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    dotColor: 'bg-green-400',
    progress: 90
  },
  'verified': {
    title: 'Verified',
    description: 'KYC verification is complete and verified',
    icon: ShieldCheckIcon,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    dotColor: 'bg-emerald-400',
    progress: 95
  },
  'rejected': {
    title: 'Rejected',
    description: 'KYC verification has been rejected',
    icon: XCircleIcon,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    dotColor: 'bg-red-400',
    progress: 0
  },
  'blockchain_submitted': {
    title: 'Blockchain Submitted',
    description: 'KYC verification has been submitted to the blockchain',
    icon: WalletIcon,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-500',
    dotColor: 'bg-purple-400',
    progress: 100
  }
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Helper function to get status configuration
  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig['not_started'];
  };

  // Helper function to get primary status
  const getPrimaryStatus = () => {
    // If still loading, return null to indicate loading state
    if (isLoadingStatus) {
      return null;
    }
    
    // Priority order: applicationStatus.status > applicationStatus.kycStatus > user.kycStatus > 'not_started'
    if (applicationStatus) {
      const primaryStatus = applicationStatus.status || applicationStatus.kycStatus || 'not_started';
      console.log('🔍 Application Status Debug:', {
        status: applicationStatus.status,
        kycStatus: applicationStatus.kycStatus,
        submittedAt: applicationStatus.submittedAt,
        reviewedAt: applicationStatus.reviewedAt,
        determinedPrimaryStatus: primaryStatus
      });
      return primaryStatus;
    }
    
    console.log('🔍 No applicationStatus found, using user.kycStatus:', user?.kycStatus);
    return user?.kycStatus || 'not_started';
  };

  // Helper function to format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Test function to verify status mapping (for debugging)
  const testStatusMapping = useCallback(() => {
    console.log('🧪 Testing Status Mapping:');
    const testCases = [
      { status: 'submitted', kycStatus: 'pending_review', expected: 'submitted' },
      { status: 'under_review', kycStatus: 'pending_review', expected: 'under_review' },
      { status: 'approved', kycStatus: 'approved', expected: 'approved' },
      { status: 'rejected', kycStatus: 'rejected', expected: 'rejected' },
      { status: null, kycStatus: 'pending_review', expected: 'pending_review' },
      { status: '', kycStatus: 'in_progress', expected: 'in_progress' }
    ];

    testCases.forEach(testCase => {
      const result = testCase.status || testCase.kycStatus || 'not_started';
      const config = getStatusConfig(result);
      console.log(`  ${testCase.status || 'null'}/${testCase.kycStatus} → ${result} → ${config.title} (${config.progress}%)`);
    });
  }, []);

  // Run status mapping test on mount (for debugging)
  useEffect(() => {
    if (mounted) {
      testStatusMapping();
    }
  }, [mounted, testStatusMapping]);
  const [kycStatus, setKycStatus] = useState<{ status: string; verified: boolean } | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{
    status: string;
    kycStatus: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    blockchainTxHash?: string;
  } | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [blockchainSubmitting, setBlockchainSubmitting] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState<string | null>(null);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [ipfsDocuments, setIpfsDocuments] = useState<any[]>([]);
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication check
  useEffect(() => {
    if (!mounted) return;

    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  // Auto-connect wallet to user account when wallet connects and user is authenticated
  // Temporarily disabled to debug manual connection
  // useEffect(() => {
  //   const autoConnectWallet = async () => {
  //     if (isConnected && address && isAuthenticated && user?.email && !user?.walletAddress) {
  //       console.log('Auto-connecting wallet to user account in dashboard...');
  //       try {
  //         const response = await fetch('/api/auth/connect-wallet', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  //           },
  //           body: JSON.stringify({ walletAddress: address })
  //         });

  //         const data = await response.json();
  //         if (data.success) {
  //           console.log('Wallet automatically connected to user account');
  //           // Refresh user data to show updated wallet address
  //           window.location.reload();
  //         } else {
  //           console.log('Auto-connect failed:', data.error);
  //         }
  //       } catch (error) {
  //         console.log('Auto-connect error:', error);
  //       }
  //     }
  //   };

  //   if (mounted && isAuthenticated && user) {
  //     autoConnectWallet();
  //   }
  // }, [mounted, isConnected, address, isAuthenticated, user?.email, user?.walletAddress]);

  // Debug wallet connection state
  useEffect(() => {
    const hasWallet = !!(isConnected || user?.walletAddress || address);
    const walletProvider = typeof window !== 'undefined' && window.ethereum;
    
    console.log('Dashboard: Wallet connection state changed', {
      isConnected,
      address,
      userWalletAddress: user?.walletAddress,
      hasWallet,
      walletProvider: !!walletProvider,
      walletProviderType: walletProvider?.isMetaMask ? 'MetaMask' : walletProvider?.isWalletConnect ? 'WalletConnect' : 'Unknown'
    });
  }, [isConnected, address, user?.walletAddress]);

  // Fetch IPFS documents
  const fetchIPFSDocuments = async () => {
    if (!mounted || !isAuthenticated || !user) return;
    
    setIpfsLoading(true);
    setIpfsError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Fetch user's IPFS documents
      const response = await fetch('/api/kyc/documents/upload', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIpfsDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch IPFS documents:', response.status);
        setIpfsError('Failed to load IPFS documents');
      }
    } catch (error) {
      console.error('Error fetching IPFS documents:', error);
      setIpfsError('Error loading IPFS documents');
    } finally {
      setIpfsLoading(false);
    }
  };

  // Fetch IPFS documents when user is authenticated
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      fetchIPFSDocuments();
    }
  }, [mounted, isAuthenticated, user]);

  // Fetch KYC status and submission data
  useEffect(() => {
    const fetchKYCData = async () => {
      // Set loading state at the start
      setIsLoadingStatus(true);
      
      if (user?.walletAddress || address) {
        try {
          const walletAddr = user?.walletAddress || address;
          
          // Fetch KYC status
          const statusResponse = await fetch(`/api/kyc/submit?walletAddress=${walletAddr}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setKycStatus(statusData);
          }

          // Fetch latest KYC submission details
          console.log('🔍 Fetching KYC submission details for wallet:', walletAddr);
          console.log('🔍 User wallet address:', user?.walletAddress);
          console.log('🔍 Connected wallet address:', address);
          console.log('🔍 Using wallet address for query:', walletAddr);
          
          const submissionResponse = await fetch(`/api/kyc/submission-details?walletAddress=${walletAddr}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          console.log('🔍 Submission response status:', submissionResponse.status);
          console.log('🔍 Submission response headers:', Object.fromEntries(submissionResponse.headers.entries()));
          
          if (submissionResponse.ok) {
            const submissionData = await submissionResponse.json();
            console.log('🔍 Submission data received:', submissionData);
            console.log('🔍 Submission found:', !!submissionData.submission);
            if (submissionData.submission) {
              console.log('🔍 Submission details:', {
                id: submissionData.submission.id,
                status: submissionData.submission.status,
                kycStatus: submissionData.submission.kycStatus,
                walletAddress: submissionData.submission.userData?.walletAddress,
                submittedAt: submissionData.submission.submittedAt
              });
            }
            
            if (submissionData.submission?.blockchainTxHash) {
              setBlockchainTxHash(submissionData.submission.blockchainTxHash);
            }
            
            // Set comprehensive application status
            const appStatus = {
              status: submissionData.submission?.status || 'not_started',
              kycStatus: submissionData.submission?.userData?.kycStatus || 'not_started',
              submittedAt: submissionData.submission?.submittedAt ? new Date(submissionData.submission.submittedAt) : undefined,
              reviewedAt: submissionData.submission?.reviewedAt ? new Date(submissionData.submission.reviewedAt) : undefined,
              rejectionReason: submissionData.submission?.rejectionReason,
              blockchainTxHash: submissionData.submission?.blockchainTxHash
            };
            
            console.log('🔍 Setting application status:', appStatus);
            setApplicationStatus(appStatus);
            
            // Show success message if submission found
            if (submissionData.submission) {
              console.log('✅ KYC submission found in database:', {
                id: submissionData.submission.id,
                status: submissionData.submission.status,
                kycStatus: submissionData.submission.kycStatus,
                submittedAt: submissionData.submission.submittedAt
              });
            }
          } else {
            console.log('🔍 No submission found or error:', submissionResponse.status);
            // If no submission found, set applicationStatus to null to fall back to user.kycStatus
            setApplicationStatus(null);
          }
        } catch (error) {
          console.error('Error fetching KYC data:', error);
        }
      }
      
      // Set loading state to false when done
      setIsLoadingStatus(false);
    };

    if (mounted && isAuthenticated && user) {
      fetchKYCData();
    }
  }, [mounted, isAuthenticated, user, address]);

  // Handle blockchain submission
  const handleBlockchainSubmission = async () => {
    if (!isConnected || !address) {
      setBlockchainError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    setBlockchainSubmitting(true);
    setBlockchainError(null);

    try {
      console.log('🚀 Submitting approved KYC to blockchain...');
      
      // Import orchestrator service dynamically
      const { orchestratorService } = await import('@/lib/orchestrator-service');
      
      // Set up signer
      if (!walletClient) {
        throw new Error('Wallet client not available');
      }
      
      await orchestratorService.setSigner(walletClient);
      
      // Start session
      const startResult = await orchestratorService.startSession();
      if (!startResult.success) {
        throw new Error('Failed to start blockchain session: ' + startResult.error);
      }
      
      // Submit KYC data to blockchain
      const submitResult = await fetch('/api/kyc/submit-to-blockchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          walletAddress: address
        })
      });
      
      if (!submitResult.ok) {
        throw new Error('Failed to submit to blockchain');
      }
      
      const data = await submitResult.json();
      setBlockchainTxHash(data.txHash);
      
      console.log('✅ KYC successfully submitted to blockchain');
      
    } catch (err) {
      console.error('❌ Blockchain submission error:', err);
      setBlockchainError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBlockchainSubmitting(false);
    }
  };

  // Handle wallet connection (same logic as KYC onboarding)
  const handleWalletConnect = async () => {
    try {
      console.log('Dashboard wallet connection started');
      setWalletConnecting(true);
      setWalletError(null);
      
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('Wallet provider detected, requesting accounts...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts received:', accounts);
        
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          console.log('Wallet address:', walletAddress);
          
          // Save to database if user is authenticated
          const token = localStorage.getItem('auth_token');
          console.log('Auth token found:', !!token);
          
          if (token) {
            try {
              console.log('Sending wallet address to database...');
              const response = await fetch('/api/auth/connect-wallet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress })
              });

              console.log('Database response status:', response.status);
              const result = await response.json();
              console.log('Database response:', result);
              
              if (result.success) {
                console.log('✅ Wallet connected and saved to database successfully');
                // Refresh the page to show updated user data
                window.location.reload();
              } else {
                console.error('❌ Database save failed:', result.error);
                setWalletError(result.error || 'Failed to save wallet to database');
              }
            } catch (dbError) {
              console.error('❌ Database save error:', dbError);
              setWalletError('Failed to save wallet to database');
            }
          } else {
            console.error('❌ No authentication token found');
            setWalletError('No authentication token found');
          }
        } else {
          console.error('❌ No accounts returned from wallet');
          setWalletError('No accounts returned from wallet');
        }
      } else {
        console.error('❌ No wallet provider detected');
        setWalletError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      setWalletError('Failed to connect wallet. Please try again.');
    } finally {
      setWalletConnecting(false);
    }
  };

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show dashboard content
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Account Type Card */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.authMethod === 'web2' ? 'Email' : user?.authMethod === 'web3' ? 'Web3' : 'Hybrid'}
                    </div>
                    <div className="text-sm text-gray-600">Account Type</div>
                  </div>
                </div>
                
                {/* Account Details */}
                <div className="space-y-3">
                  {/* Primary Account Type */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.authMethod === 'web2' ? 'Email Account' : user?.authMethod === 'web3' ? 'Web3 Wallet' : 'Hybrid Account'}
                    </span>
                  </div>

                  {/* Email Address Display */}
                  {user?.email && (
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-200/50">
                      <div className="text-xs font-medium text-gray-600 mb-1">Email Address</div>
                      <div className="text-sm text-gray-800 break-all">{user.email}</div>
                    </div>
                  )}

                  {/* Admin Role Indicator */}
                  {user?.isAdmin && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Role: {user?.adminLevel ? `${user.adminLevel} Admin` : 'Administrator'}
                      </span>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user?.isEmailVerified ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Email {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  {/* Wallet Connection Status */}
                  {(user?.authMethod === 'web3' || user?.authMethod === 'hybrid') && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user?.isWalletConnected || (isConnected || user?.walletAddress || address) ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        Wallet {user?.isWalletConnected || (isConnected || user?.walletAddress || address) ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  )}

                  {/* Account Creation Date */}
                  {user?.createdAt && (
                    <div className="pt-2 border-t border-blue-200/50">
                      <div className="text-xs text-gray-500">
                        Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KYC Status Card */}
            {(() => {
              const primaryStatus = getPrimaryStatus();
              
              // Show loading state if still loading
              if (primaryStatus === null) {
                return (
                  <div className="group relative bg-gray-50 overflow-hidden rounded-2xl shadow-lg border-2 border-gray-200">
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl shadow-lg">
                          <ClockIcon className="h-6 w-6 text-white animate-pulse" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-600 animate-pulse">
                            Loading...
                          </div>
                          <div className="text-sm text-gray-500">Application Status</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-600">
                            Fetching your application status
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gray-300 animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Please wait...
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              const config = getStatusConfig(primaryStatus);
              const Icon = config.icon;
              
              // Show additional info if no database record found
              const showDataSourceInfo = !applicationStatus && user?.kycStatus;
              
              return (
                <div className={`group relative ${config.bgColor} overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${config.borderColor} border-2`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-opacity-5 to-opacity-10"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${config.color === 'gray' ? 'from-gray-500 to-gray-600' :
                        config.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        config.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                        config.color === 'orange' ? 'from-orange-500 to-orange-600' :
                        config.color === 'green' ? 'from-green-500 to-green-600' :
                        config.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                        config.color === 'red' ? 'from-red-500 to-red-600' :
                        config.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-gray-500 to-gray-600'} rounded-xl shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {config.title}
                        </div>
                        <div className="text-sm text-gray-600">Application Status</div>
                        {showDataSourceInfo && (
                          <div className="text-xs text-orange-600 mt-1">
                            ⚠️ Using user profile data
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
                        <span className={`text-sm font-medium ${config.textColor}`}>
                          {config.description}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            config.color === 'gray' ? 'bg-gray-400' :
                            config.color === 'blue' ? 'bg-blue-400' :
                            config.color === 'yellow' ? 'bg-yellow-400' :
                            config.color === 'orange' ? 'bg-orange-400' :
                            config.color === 'green' ? 'bg-green-400' :
                            config.color === 'emerald' ? 'bg-emerald-400' :
                            config.color === 'red' ? 'bg-red-400' :
                            config.color === 'purple' ? 'bg-purple-400' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${config.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {config.progress}% Complete
                      </div>
                      {showDataSourceInfo && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                          <strong>Note:</strong> No recent KYC submission found in database. Showing status from user profile. 
                          If you have submitted a KYC application, please ensure your wallet address matches exactly.
                        </div>
                      )}
                      
                      {applicationStatus && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                          <strong>✅ Database Record Found:</strong> Status from KYC submission in database.
                          <div className="mt-1 text-xs text-gray-600">
                            Using: <strong>{applicationStatus.status || applicationStatus.kycStatus || 'not_started'}</strong>
                            {applicationStatus.status && applicationStatus.kycStatus && applicationStatus.status !== applicationStatus.kycStatus && (
                              <span> (status: {applicationStatus.status}, kycStatus: {applicationStatus.kycStatus})</span>
                            )}
                          </div>
                          {applicationStatus.submittedAt && (
                            <div className="mt-1 text-xs text-gray-600">
                              Submitted: {formatDate(applicationStatus.submittedAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Wallet Status Card */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {(isConnected || user?.walletAddress || address) ? 'Active' : 'Offline'}
                    </div>
                    <div className="text-sm text-gray-600">Wallet Status</div>
                  </div>
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    (isConnected || user?.walletAddress || address) ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {(isConnected || user?.walletAddress || address) ? 'Connected' : 'Not Connected'}
                  </span>
                  {walletConnecting && (
                    <div className="ml-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </div>

                {/* Wallet Details */}
                {(user?.walletAddress || address) && (
                  <div className="space-y-3">
                    {/* 2x2 Grid of Wallet Info */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Wallet Address */}
                      <div className="bg-white/60 rounded-lg p-2 border border-purple-200/50">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-mono text-gray-800 truncate">
                            {(user?.walletAddress || address)?.slice(0, 6)}...{(user?.walletAddress || address)?.slice(-4)}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(user?.walletAddress || address || '')}
                            className="text-purple-600 hover:text-purple-800 transition-colors ml-1"
                            title="Copy address"
                          >
                            <LinkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Wallet Provider */}
                      <div className="bg-white/60 rounded-lg p-2 border border-purple-200/50">
                        <div className="text-xs text-gray-800 truncate">
                          {typeof window !== 'undefined' && window.ethereum?.isMetaMask ? 'MetaMask' :
                           typeof window !== 'undefined' && window.ethereum?.isWalletConnect ? 'WalletConnect' :
                           typeof window !== 'undefined' && window.ethereum ? 'Web3 Provider' : 'Unknown'}
                        </div>
                      </div>

                      {/* Connection Method */}
                      <div className="bg-white/60 rounded-lg p-2 border border-purple-200/50">
                        <div className="text-xs text-gray-800 truncate">
                          {user?.authMethod === 'web3' ? 'Web3 Only' :
                           user?.authMethod === 'hybrid' ? 'Hybrid' : 'Email + Web3'}
                        </div>
                      </div>

                      {/* Security Status */}
                      <div className="bg-white/60 rounded-lg p-2 border border-purple-200/50">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-800">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2 pt-1">
                      {!user?.walletAddress && !address && (
                        <button
                          onClick={handleWalletConnect}
                          disabled={walletConnecting}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                      )}
                      {(user?.walletAddress || address) && (
                        <button
                          onClick={() => disconnect()}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Not Connected State */}
                {!user?.walletAddress && !address && (
                  <div className="text-center py-4">
                    <div className="text-gray-500 text-sm mb-3">
                      Connect your wallet to access Web3 features
                    </div>
                    <button
                      onClick={handleWalletConnect}
                      disabled={walletConnecting}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <UserIcon className="w-6 h-6 mr-3" />
                  Account Information
                </h3>
                <p className="mt-1 text-indigo-100">
                  Your account details and verification status
                </p>
              </div>
              <div className="divide-y divide-gray-200/50">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Email Address
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : 'Not provided'
                    }
                  </dd>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Wallet Address
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">
                        {user?.walletAddress || address || 'Not connected'}
                      </span>
                      {!user?.walletAddress && !address && (
                        <button
                          onClick={handleWalletConnect}
                          disabled={walletConnecting}
                          className="ml-4 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                      )}
                      {(user?.walletAddress || address) && (
                        <button
                          onClick={() => disconnect()}
                          className="ml-4 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Application Status
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {(() => {
                      const primaryStatus = getPrimaryStatus();
                      
                      // Show loading state if still loading
                      if (primaryStatus === null) {
                        return (
                          <div className="space-y-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              <div className="w-2 h-2 rounded-full mr-2 bg-gray-400 animate-pulse"></div>
                              Loading...
                            </div>
                            <div className="text-xs text-gray-500">
                              Fetching your application status
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-gray-300 animate-pulse"></div>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                              Please wait...
                            </div>
                          </div>
                        );
                      }
                      
                      const config = getStatusConfig(primaryStatus);
                      
                      return (
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></div>
                            {config.title}
                          </span>
                          <div className="text-xs text-gray-500">
                            {config.description}
                          </div>
                          {/* Progress indicator */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                config.color === 'gray' ? 'bg-gray-400' :
                                config.color === 'blue' ? 'bg-blue-400' :
                                config.color === 'yellow' ? 'bg-yellow-400' :
                                config.color === 'orange' ? 'bg-orange-400' :
                                config.color === 'green' ? 'bg-green-400' :
                                config.color === 'emerald' ? 'bg-emerald-400' :
                                config.color === 'red' ? 'bg-red-400' :
                                config.color === 'purple' ? 'bg-purple-400' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${config.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 text-right">
                            {config.progress}% Complete
                          </div>
                        </div>
                      );
                    })()}
                  </dd>
                </div>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                    Account Created
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Unknown'
                    }
                  </dd>
                </div>
              </div>
            </div>

          {/* Application Status Timeline */}
          {applicationStatus && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                  onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <ClockIcon className="w-6 h-6 mr-3" />
                        Application Progress Timeline
                      </h3>
                      <p className="mt-1 text-blue-100">
                        Track your KYC verification journey from start to completion
                        <span className="ml-2 text-blue-200 text-sm">(Click to {isTimelineCollapsed ? 'expand' : 'collapse'})</span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      {isTimelineCollapsed ? (
                        <ChevronDownIcon className="w-6 h-6 text-white" />
                      ) : (
                        <ChevronUpIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isTimelineCollapsed ? 'max-h-0 opacity-0' : 'max-h-screen opacity-100'
                }`}>
                  <div className="p-6">
                  {(() => {
                    const primaryStatus = getPrimaryStatus();
                    const statusSteps = [
                      { key: 'not_started', title: 'Not Started', description: 'Begin KYC process' },
                      { key: 'draft', title: 'Draft', description: 'Fill out KYC form' },
                      { key: 'in_progress', title: 'In Progress', description: 'Complete verification' },
                      { key: 'submitted', title: 'Submitted', description: 'Application submitted' },
                      { key: 'under_review', title: 'Under Review', description: 'Admin review' },
                      { key: 'approved', title: 'Approved', description: 'KYC approved' },
                      { key: 'verified', title: 'Verified', description: 'Verification complete' },
                      { key: 'blockchain_submitted', title: 'Blockchain', description: 'On-chain verification' }
                    ];

                    const currentStepIndex = statusSteps.findIndex(step => step.key === primaryStatus);
                    
                    return (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {statusSteps.map((step, index) => {
                          const isCompleted = index <= currentStepIndex;
                          const isCurrent = index === currentStepIndex;
                          const config = getStatusConfig(step.key);
                          const Icon = config.icon;
                          
                          return (
                            <div key={step.key} className="relative flex items-start space-x-4 pb-8 last:pb-0">
                              {/* Timeline dot */}
                              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                                isCompleted 
                                  ? `bg-gradient-to-r ${config.color === 'gray' ? 'from-gray-500 to-gray-600' :
                                    config.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                    config.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                                    config.color === 'orange' ? 'from-orange-500 to-orange-600' :
                                    config.color === 'green' ? 'from-green-500 to-green-600' :
                                    config.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                                    config.color === 'red' ? 'from-red-500 to-red-600' :
                                    config.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                    'from-gray-500 to-gray-600'} border-white shadow-lg`
                                  : 'bg-white border-gray-300'
                              }`}>
                                <Icon className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                              </div>
                              
                              {/* Content */}
                              <div className={`flex-1 min-w-0 ${isCurrent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-lg font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {step.title}
                                  </h4>
                                  {isCompleted && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                      isCurrent 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {isCurrent ? 'Current' : 'Completed'}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {step.description}
                                </p>
                                
                                {/* Show dates for completed steps */}
                                {isCompleted && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {step.key === 'submitted' && applicationStatus.submittedAt && (
                                      <span>Submitted: {formatDate(applicationStatus.submittedAt)}</span>
                                    )}
                                    {step.key === 'under_review' && applicationStatus.reviewedAt && (
                                      <span>Reviewed: {formatDate(applicationStatus.reviewedAt)}</span>
                                    )}
                                    {step.key === 'blockchain_submitted' && applicationStatus.blockchainTxHash && (
                                      <span>Blockchain: {applicationStatus.blockchainTxHash.substring(0, 8)}...</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  </div>
                </div>
              </div>
            )}

          {/* Comprehensive Application Status Details */}
          {applicationStatus && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 mr-3" />
                  Application Status Details
                </h3>
                <p className="mt-1 text-indigo-100">
                  Complete overview of your KYC application status and progress
                </p>
              </div>
              <div className="divide-y divide-gray-200/50">
                {/* Current Status */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    Current Status
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {(() => {
                      const primaryStatus = getPrimaryStatus();
                      const config = getStatusConfig(primaryStatus);
                      
                      return (
                        <div className="space-y-3">
                          <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></div>
                            {config.title}
                          </span>
                          <p className="text-sm text-gray-600">{config.description}</p>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                config.color === 'gray' ? 'bg-gray-400' :
                                config.color === 'blue' ? 'bg-blue-400' :
                                config.color === 'yellow' ? 'bg-yellow-400' :
                                config.color === 'orange' ? 'bg-orange-400' :
                                config.color === 'green' ? 'bg-green-400' :
                                config.color === 'emerald' ? 'bg-emerald-400' :
                                config.color === 'red' ? 'bg-red-400' :
                                config.color === 'purple' ? 'bg-purple-400' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${config.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {config.progress}% Complete
                          </div>
                        </div>
                      );
                    })()}
                  </dd>
                </div>

                {/* Submission Details */}
                {applicationStatus.submittedAt && (
                  <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Submitted At
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(applicationStatus.submittedAt)}
                    </dd>
                  </div>
                )}

                {/* Review Details */}
                {applicationStatus.reviewedAt && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Reviewed At
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(applicationStatus.reviewedAt)}
                    </dd>
                  </div>
                )}

                {/* Blockchain Status */}
                {applicationStatus.blockchainTxHash && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Blockchain Transaction
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {applicationStatus.blockchainTxHash.substring(0, 8)}...{applicationStatus.blockchainTxHash.substring(applicationStatus.blockchainTxHash.length - 8)}
                        </span>
                        <span className="text-xs text-green-600 font-semibold">✓ Confirmed</span>
                      </div>
                    </dd>
                  </div>
                )}

                {/* Rejection Reason */}
                {applicationStatus.rejectionReason && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Rejection Reason
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{applicationStatus.rejectionReason}</p>
                      </div>
                    </dd>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                    Next Steps
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    {(() => {
                      const primaryStatus = getPrimaryStatus();
                      
                      // Show loading state if still loading
                      if (primaryStatus === null) {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Loading next steps...</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500">Please wait while we determine your next steps</span>
                            </div>
                          </div>
                        );
                      }
                      
                      switch (primaryStatus) {
                        case 'not_started':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Start your KYC verification process</p>
                              <button
                                onClick={() => router.push('/onboarding')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Begin KYC Process
                              </button>
                            </div>
                          );
                        case 'draft':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Resume your KYC verification process</p>
                              <button
                                onClick={() => router.push('/onboarding')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Resume KYC Process
                              </button>
                            </div>
                          );
                        case 'in_progress':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Continue completing your KYC form</p>
                              <button
                                onClick={() => router.push('/onboarding')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Continue KYC
                              </button>
                            </div>
                          );
                        case 'submitted':
                        case 'under_review':
                        case 'pending_review':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Your application is being reviewed. Please wait for administrator approval.</p>
                              <div className="flex items-center space-x-2 text-sm text-orange-600">
                                <ClockIcon className="w-4 h-4" />
                                <span>Review in progress</span>
                              </div>
                            </div>
                          );
                        case 'approved':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Your KYC has been approved! Submit to blockchain for permanent verification.</p>
                              <button
                                onClick={handleBlockchainSubmission}
                                disabled={blockchainSubmitting || !isConnected}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Submit to Blockchain
                              </button>
                            </div>
                          );
                        case 'verified':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Your KYC is verified and ready for blockchain submission.</p>
                              <button
                                onClick={handleBlockchainSubmission}
                                disabled={blockchainSubmitting || !isConnected}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Submit to Blockchain
                              </button>
                            </div>
                          );
                        case 'rejected':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Your KYC was rejected. Please review the reason and resubmit.</p>
                              <button
                                onClick={() => router.push('/onboarding')}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Resubmit KYC
                              </button>
                            </div>
                          );
                        case 'blockchain_submitted':
                          return (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">✅ Your KYC is permanently recorded on the blockchain!</p>
                              <div className="flex items-center space-x-2 text-sm text-green-600">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Verification Complete</span>
                              </div>
                            </div>
                          );
                        default:
                          return <p className="text-sm text-gray-600">Status unknown</p>;
                      }
                    })()}
                  </dd>
                </div>
              </div>
            </div>
          )}

          {/* KYC Status Details */}
          {kycStatus && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 mr-3" />
                  KYC Verification Details
                </h3>
                <p className="mt-1 text-emerald-100">
                  Your current KYC verification status and details
                </p>
              </div>
              <div className="divide-y divide-gray-200/50">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Verification Status
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {kycStatus.status || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Risk Assessment
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kycStatus.riskScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {kycStatus.riskScore || 0}%
                      </span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection Card */}
          {!user?.walletAddress && !address && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
                    <p className="text-sm text-gray-600">Link your Web3 wallet for enhanced security and features</p>
                  </div>
                </div>
                <button
                  onClick={handleWalletConnect}
                  disabled={walletConnecting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletConnecting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>
              
              {/* Wallet Connection Error */}
              {walletError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{walletError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IPFS Data Section */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <CloudIcon className="w-6 h-6 mr-3" />
                IPFS Data Storage
              </h3>
              <p className="text-cyan-100 text-sm mt-1">Your documents stored on the decentralized network</p>
            </div>
            
            <div className="p-6">
              {ipfsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  <span className="ml-3 text-gray-600">Loading IPFS documents...</span>
                </div>
              ) : ipfsError ? (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Error loading IPFS documents</p>
                  <p className="text-gray-500 text-sm mt-2">{ipfsError}</p>
                  <button
                    onClick={fetchIPFSDocuments}
                    className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : ipfsDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No IPFS documents found</p>
                  <p className="text-gray-500 text-sm mt-2">Upload documents to see them stored on IPFS</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {ipfsDocuments.length} Document{ipfsDocuments.length !== 1 ? 's' : ''} on IPFS
                      </h4>
                      <p className="text-sm text-gray-600">All your KYC documents are stored decentralized</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-600">
                        {ipfsDocuments.filter(doc => doc.verificationStatus === 'verified').length}
                      </div>
                      <div className="text-sm text-gray-600">Verified</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ipfsDocuments.map((doc, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              doc.verificationStatus === 'verified' ? 'bg-green-500' :
                              doc.verificationStatus === 'pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {doc.documentType?.replace('_', ' ')}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                            doc.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {doc.verificationStatus}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">File Name</p>
                            <p className="text-sm font-mono text-gray-900 truncate">{doc.fileName}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">IPFS Hash</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-mono text-gray-700 flex-1 truncate">
                                {doc.ipfsHash?.substring(0, 16)}...
                              </p>
                              <button
                                onClick={() => navigator.clipboard.writeText(doc.ipfsHash)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy hash"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="text-sm text-gray-700">
                              {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
                            </p>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => window.open(`http://65.109.136.54:8080/ipfs/${doc.ipfsHash}`, '_blank')}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `http://65.109.136.54:8080/ipfs/${doc.ipfsHash}`;
                                link.download = doc.fileName;
                                link.click();
                              }}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-start">
                      <CloudIcon className="h-5 w-5 text-cyan-600 mt-0.5 mr-3" />
                      <div>
                        <h5 className="text-sm font-semibold text-cyan-900">IPFS Storage Benefits</h5>
                        <ul className="text-xs text-cyan-800 mt-1 space-y-1">
                          <li>• Decentralized storage - no single point of failure</li>
                          <li>• Immutable data - cannot be modified once stored</li>
                          <li>• Global access - available from anywhere in the world</li>
                          <li>• Data ownership - you control your documents</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Submission Section */}
          {(() => {
            const primaryStatus = getPrimaryStatus();
            return (primaryStatus === 'verified' || primaryStatus === 'approved') && !applicationStatus?.blockchainTxHash;
          })() && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <CheckCircleIcon className="w-6 h-6 mr-3" />
                  Blockchain Submission
                </h3>
                <p className="mt-1 text-emerald-100">
                  Your KYC is approved. Submit to blockchain for permanent verification.
                </p>
              </div>
              <div className="p-6">
                {!blockchainTxHash ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            Submit to Blockchain
                          </h4>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Once submitted to the blockchain, your KYC verification will be permanently recorded and verifiable by anyone.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBlockchainSubmission}
                      disabled={blockchainSubmitting || !isConnected}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {blockchainSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting to Blockchain...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <WalletIcon className="w-5 h-5 mr-2" />
                          Submit to Blockchain
                        </div>
                      )}
                    </button>
                    
                    {!isConnected && (
                      <p className="text-sm text-gray-500 text-center">
                        Please connect your wallet to submit to blockchain
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Successfully Submitted to Blockchain
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Transaction Hash: {blockchainTxHash}</p>
                          <p className="mt-1">Your KYC is now permanently recorded on the blockchain.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {blockchainError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">
                          Submission Failed
                        </h4>
                        <p className="text-sm text-red-700 mt-1">{blockchainError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC Options */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-3" />
                KYC Verification Options
              </h3>
              <p className="mt-1 text-indigo-100">
                Choose your preferred KYC verification method
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Web2 KYC */}
                <button
                  onClick={() => router.push('/onboarding')}
                  className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-lg">Web2 KYC</h4>
                      <p className="text-sm text-blue-100">Traditional form-based verification</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Web3 KYC */}
                <Web3KYCLink />
              </div>
            </div>
          </div>

          {/* Other Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/profile')}
              className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center space-x-3">
                <UserIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Update Profile</span>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={() => router.push('/blockchain-status')}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center space-x-3">
                <DocumentTextIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Blockchain Status</span>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}