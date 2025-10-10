'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  UserIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import { OnboardingStep, orchestratorService } from '@/lib/orchestrator-service';
import DocumentUpload from '@/components/DocumentUpload';

interface KYCFormData {
  // Registration Step
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  walletAddress: string;
  
  // Investor Type Step
  investorType: 'individual' | 'institutional' | 'retail' | 'accredited' | 'qualified';
  
  // Eligibility Step
  country: string;
  age: string;
  income: string;
  
  // Document Upload Step
  documents: File[];
  documentTypes: string[];
}

const stepConfig = {
  [OnboardingStep.REGISTRATION]: {
    title: 'Personal Information',
    description: 'Enter your basic personal details',
    icon: UserIcon,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  [OnboardingStep.INVESTOR_TYPE_SELECTION]: {
    title: 'Investor Classification',
    description: 'Select your investor type and category',
    icon: IdentificationIcon,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800'
  },
  [OnboardingStep.ELIGIBILITY_CHECK]: {
    title: 'Eligibility Assessment',
    description: 'Complete your eligibility requirements',
    icon: ShieldCheckIcon,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  [OnboardingStep.DOCUMENT_UPLOAD]: {
    title: 'Document Upload',
    description: 'Upload required verification documents',
    icon: CloudArrowUpIcon,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800'
  },
  [OnboardingStep.FINAL_VERIFICATION]: {
    title: 'Final Verification',
    description: 'Review and submit your KYC application',
    icon: CheckBadgeIcon,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800'
  }
};

export default function Web3KYCOnboardingPage() {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    session,
    isLoading,
    error,
    startSession,
    executeStep,
    refreshSession,
    walletClient
  } = useOrchestrator();

  // Form state
  const [formData, setFormData] = useState<KYCFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    walletAddress: address || '',
    investorType: 'individual',
    country: '',
    age: '',
    income: '',
    documents: [],
    documentTypes: []
  });

  // UI state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.REGISTRATION);
  const [stepProgress, setStepProgress] = useState<Record<OnboardingStep, boolean>>({} as Record<OnboardingStep, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'status' | 'debug'>('form');
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);

  // Update wallet address in formData when address changes
  useEffect(() => {
    if (address) {
      setFormData(prev => ({ ...prev, walletAddress: address }));
    }
  }, [address]);

  // Auto-save effect
  useEffect(() => {
    if (session && session.isActive) {
      const interval = setInterval(() => {
        saveDraftData();
      }, 10000); // Auto-save every 10 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('🔍 Not authenticated, redirecting to login...');
      router.push('/auth/login');
      return;
    }

    // Handle wallet connection state
    if (isConnecting) {
      console.log('🔄 Wallet is connecting...');
      setIsWalletLoading(true);
      return;
    }

    // Add a small delay to allow wallet to fully initialize
    if (!walletCheckComplete) {
      const timer = setTimeout(() => {
        setWalletCheckComplete(true);
        setIsWalletLoading(false);
      }, 1000); // 1 second delay to allow wallet initialization
      
      return () => clearTimeout(timer);
    }

    if (!isConnected || !address) {
      console.log('🔍 Wallet not connected, redirecting to onboarding...');
      router.push('/onboarding');
      return;
    }

    console.log('✅ User authenticated and wallet connected');
    setIsWalletLoading(false);
  }, [isAuthenticated, isConnected, isConnecting, address, authLoading, router, walletCheckComplete]);

  // Load draft data
  const loadDraftData = async () => {
    try {
      const response = await fetch('/api/kyc/load-progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.draft) {
          // Ensure documents and documentTypes are always arrays
          const userData = {
            ...data.draft.userData,
            documents: data.draft.userData.documents || [],
            documentTypes: data.draft.userData.documentTypes || []
          };
          setFormData(userData);
          setCurrentStep(data.draft.currentStep || OnboardingStep.REGISTRATION);
          setStepProgress(data.draft.stepProgress || {});
          console.log('Draft data loaded:', data.draft);
        }
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
  };

  // Save draft data
  const saveDraftData = async () => {
    if (!isConnected || !address || !session || !session.isActive) {
      console.log('Skipping draft save - not connected or no active session');
      return;
    }

    try {
      const response = await fetch('/api/kyc/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          currentStep,
          userData: {
            ...formData,
            documents: formData.documents || [],
            documentTypes: formData.documentTypes || []
          },
          userDataKeys: Object.keys(formData).filter(key => formData[key as keyof KYCFormData] !== '')
        })
      });

      if (response.ok) {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 3000);
        console.log('Draft saved successfully');
      } else {
        console.error('Draft save failed:', response.status);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof KYCFormData, value: string | number | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Ensure documents and documentTypes are always arrays
      documents: prev.documents || [],
      documentTypes: prev.documentTypes || []
    }));
    
    // Auto-save if session is active
    if (session && session.isActive) {
      saveDraftData();
    }
  };

  // Handle document upload
  const handleDocumentUploadComplete = (document: { type: string; url: string; [key: string]: unknown }, file: File) => {
    console.log('Document uploaded:', document);
    console.log('File:', file);
    
    // Validate file
    if (!file || !(file instanceof File)) {
      console.error('Invalid file received:', file);
      return;
    }
    
    // Add the file to the documents array
    setFormData(prev => ({ 
      ...prev, 
      documents: [...(prev.documents || []), file]
    }));
  };

  const handleDocumentUploadError = (error: string) => {
    setSubmitError(error);
  };

  // Get next step
  const getNextStep = (step?: OnboardingStep) => {
    const current = step || currentStep;
    switch (current) {
      case OnboardingStep.REGISTRATION:
        return OnboardingStep.INVESTOR_TYPE_SELECTION;
      case OnboardingStep.INVESTOR_TYPE_SELECTION:
        return OnboardingStep.ELIGIBILITY_CHECK;
      case OnboardingStep.ELIGIBILITY_CHECK:
        return OnboardingStep.DOCUMENT_UPLOAD;
      case OnboardingStep.DOCUMENT_UPLOAD:
        return OnboardingStep.FINAL_VERIFICATION;
      default:
        return null;
    }
  };

  // Check if step is terminal
  const isCurrentStepTerminal = (step: OnboardingStep) => {
    return step === OnboardingStep.COMPLETED || step === OnboardingStep.FAILED || step === OnboardingStep.FINAL_VERIFICATION;
  };

  // Start session
  const handleStartSession = async () => {
    if (!address) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('🚀 Starting blockchain session...');
      
      // Check if session already exists
      const existingSession = await orchestratorService.getSession(address);
      if (existingSession && existingSession.isActive) {
        console.log('✅ Using existing active session');
        await refreshSession();
      } else {
        console.log('🔄 Starting new blockchain session...');
        const result = await startSession();
        if (!result.success) {
          setSubmitError('Failed to start session: ' + result.error);
          return;
        }
        console.log('✅ Blockchain session started successfully');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await refreshSession();
      }
    } catch (err) {
      console.error('❌ Error starting session:', err);
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel session
  const handleCancelSession = async () => {
    if (!address) return;

    setIsSubmitting(true);
    try {
      // Implementation for canceling session
      console.log('Canceling session...');
      await refreshSession();
    } catch (err) {
      console.error('Error canceling session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute step
  const handleExecuteStep = async () => {
    if (!address) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('🔄 Executing step (database + progression)...');
      
      await saveDraftData();
      setStepProgress(prev => ({ ...prev, [currentStep]: true }));

      if (currentStep === OnboardingStep.FINAL_VERIFICATION) {
        await handleFinalSubmission();
      } else {
        const nextStep = getNextStep(currentStep);
        if (nextStep) {
          setCurrentStep(nextStep);
          setSubmitError(null);
        } else {
          setSubmitError('No next step available');
        }
      }
    } catch (err) {
      console.error('❌ Error executing step:', err);
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final submission (database only)
  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('💾 Submitting KYC to database for review...');
      
      const result = await saveFinalSubmission();
      console.log('✅ KYC submitted successfully for review');
      
      // Log document upload results
      if (result?.documents && result.documents.length > 0) {
        console.log(`📄 Successfully uploaded ${result.documents.length} documents to IPFS:`);
        result.documents.forEach((doc: any, index: number) => {
          console.log(`  ${index + 1}. ${doc.fileName} -> ${doc.ipfsHash}`);
        });
      }
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error in final submission:', err);
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save final submission
  const saveFinalSubmission = async () => {
    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          formData: formData,
          walletAddress: address,
          source: 'web3-orchestrator'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit KYC');
      }

      const result = await response.json();
      console.log('Final submission saved to database:', result);
      
      return result; // Return the result so it can be used in handleFinalSubmission
      
    } catch (error) {
      console.error('Error saving final submission:', error);
      throw error;
    }
  };

  // Render step content
  const renderStepContent = () => {
    const stepInfo = stepConfig[currentStep];
    const Icon = stepInfo.icon;

    switch (currentStep) {
      case OnboardingStep.REGISTRATION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${stepInfo.textColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{stepInfo.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{stepInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>
        );

      case OnboardingStep.INVESTOR_TYPE_SELECTION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${stepInfo.textColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{stepInfo.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{stepInfo.description}</p>
            </div>

            <div className="space-y-4">
              {[
                { value: 'individual', label: 'Individual Investor', description: 'Personal investment account' },
                { value: 'institutional', label: 'Institutional Investor', description: 'Corporate or organization account' },
                { value: 'retail', label: 'Retail Investor', description: 'Standard retail investment account' },
                { value: 'accredited', label: 'Accredited Investor', description: 'High net worth individual' },
                { value: 'qualified', label: 'Qualified Investor', description: 'Professional investor status' }
              ].map((type) => (
                <label key={type.value} className="relative flex cursor-pointer rounded-lg p-4 focus:outline-none">
                  <input
                    type="radio"
                    name="investorType"
                    value={type.value}
                    checked={formData.investorType === type.value}
                    onChange={(e) => handleInputChange('investorType', e.target.value)}
                    className="sr-only"
                  />
                  <span className={`flex flex-1 rounded-lg border-2 p-4 ${
                    formData.investorType === type.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">{type.label}</span>
                      <span className="mt-1 text-sm text-gray-500">{type.description}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case OnboardingStep.ELIGIBILITY_CHECK:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${stepInfo.textColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{stepInfo.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{stepInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                <select
                  value={formData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Income Range</option>
                  <option value="0-25000">$0 - $25,000</option>
                  <option value="25000-50000">$25,000 - $50,000</option>
                  <option value="50000-100000">$50,000 - $100,000</option>
                  <option value="100000-250000">$100,000 - $250,000</option>
                  <option value="250000+">$250,000+</option>
                </select>
              </div>
            </div>
          </div>
        );

      case OnboardingStep.DOCUMENT_UPLOAD:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${stepInfo.textColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{stepInfo.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{stepInfo.description}</p>
            </div>

            <DocumentUpload
              onUploadComplete={handleDocumentUploadComplete}
              onError={handleDocumentUploadError}
            />
          </div>
        );


      case OnboardingStep.FINAL_VERIFICATION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepInfo.bgColor}`}>
                <Icon className={`h-6 w-6 ${stepInfo.textColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{stepInfo.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{stepInfo.description}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    KYC Complete
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your KYC information has been submitted for review. Once approved, you can submit it to the blockchain from your dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Web3 KYC...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please log in to access the Web3 KYC process.</p>
        </div>
      </div>
    );
  }

  // Show loading state while wallet connection is being detected
  if (isWalletLoading || (isConnecting && !isConnected)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Detecting Wallet Connection</h2>
          <p className="mt-2 text-gray-600">Please wait while we check your wallet connection...</p>
        </div>
      </div>
    );
  }

  // Wallet not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <WalletIcon className="h-12 w-12 text-orange-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Wallet Not Connected</h2>
          <p className="mt-2 text-gray-600">Please connect your wallet to proceed with Web3 KYC.</p>
          <p className="mt-1 text-sm text-gray-500">Redirecting to onboarding page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web3 KYC Onboarding
          </h1>
          <p className="text-xl text-gray-600">
            Complete your Know Your Customer verification on the blockchain
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Object.values(OnboardingStep).filter(step => typeof step === 'number' && step > 0 && step <= OnboardingStep.FINAL_VERIFICATION).map((step, index) => {
              const stepInfo = stepConfig[step as OnboardingStep] || {
                title: `Step ${step}`,
                description: 'Complete this step',
                icon: DocumentTextIcon,
                color: 'gray',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-800'
              };
              const isActive = currentStep === step;
              const isCompleted = stepProgress[step as OnboardingStep];
              const Icon = stepInfo.icon;

              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? `bg-${stepInfo.color}-500 border-${stepInfo.color}-500 text-white`
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  {index < 5 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'form', name: 'KYC Form', icon: DocumentTextIcon },
                { id: 'status', name: 'Status', icon: CheckCircleIcon },
                { id: 'debug', name: 'Debug', icon: CogIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'form' && (
              <div className="space-y-6">
                {!session || !session.isActive ? (
                  // No active session
                  <div className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                      <PlayIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Start KYC Process</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Begin your Web3 KYC verification process
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleStartSession}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-5 w-5 mr-2" />
                            Start KYC Process
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Active session - show step content
                  <div className="space-y-6">
                    {renderStepContent()}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancelSession}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          <StopIcon className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                        
                        <button
                          onClick={saveDraftData}
                          disabled={isSavingDraft}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isSavingDraft ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              💾 Save Draft
                            </>
                          )}
                        </button>
                      </div>
                      
                      {!isCurrentStepTerminal(currentStep) && (
                        <button
                          onClick={handleExecuteStep}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              Next Step
                              <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </button>
                      )}
                      
                  {isCurrentStepTerminal(currentStep) && (
                    <button
                      onClick={handleExecuteStep}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          ✅ Complete KYC
                          <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </button>
                  )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-6">
                {/* Session Status */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Session Status</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                        session && session.isActive ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="ml-3 text-sm text-gray-600">
                        {session && session.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Current Step:</span> {currentStep}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Wallet:</span> {address?.substring(0, 6)}...{address?.substring(38)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Draft Status:</span> {draftSaved ? 'Saved' : 'Not Saved'}
                    </div>
                  </div>
                </div>

                {/* Transaction Status */}
                {lastTxHash && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Last Transaction</h3>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-sm text-green-700">
                        Transaction Hash: {lastTxHash}
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress Overview */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Progress Overview</h3>
                  <div className="space-y-3">
                    {Object.entries(stepProgress).map(([step, completed]) => {
                      const stepInfo = stepConfig[parseInt(step) as OnboardingStep];
                      const Icon = stepInfo.icon;
                      return (
                        <div key={step} className="flex items-center">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                            completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {completed ? (
                              <CheckCircleIcon className="h-4 w-4 text-white" />
                            ) : (
                              <Icon className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <span className="ml-3 text-sm text-gray-600">
                            {stepInfo.title} {completed ? '(Completed)' : '(Pending)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Debug Information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>This section contains technical information for debugging purposes.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Session Info</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>User: {session?.sessionUser || 'N/A'}</p>
                      <p>Current Step: {session?.currentStep || 'N/A'}</p>
                      <p>Is Active: {session?.isActive ? 'Yes' : 'No'}</p>
                      <p>Start Time: {session?.startTime ? new Date(session.startTime * 1000).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Wallet Info</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Address: {address || 'N/A'}</p>
                      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
                      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => refreshSession()}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      Refresh Session
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                    >
                      Reload Page
                    </button>
                    <button
                      onClick={() => console.log('Session:', session, 'Form:', formData)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                    >
                      Log State
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{submitError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {draftSaved && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Draft Saved</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your progress has been automatically saved.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}