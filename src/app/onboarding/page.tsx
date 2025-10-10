'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'

// Extend Window interface for global callback
declare global {
  interface Window {
    updateUserDataCallback?: (data: UserData) => void;
  }
}
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  WalletIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'pending' | 'current' | 'completed' | 'error'
  component: string
}

interface UserData {
  firstName: string
  lastName: string
  email: string
  walletAddress: string
  jurisdiction: string
  investorType: 'individual' | 'institutional' | 'retail' | 'accredited' | 'qualified'
  eligibilityAnswers: {
    [key: string]: boolean | string
  }
  institutionDetails?: {
    name: string
    registrationNumber: string
    country: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    businessType: string
    website?: string
  }
  uboDeclaration: {
    hasUBO: boolean
    uboDetails: Array<{
      firstName: string
      lastName: string
      dateOfBirth: string
      nationality: string
      ownershipPercentage: number
      address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
      }
    }>
  }
  directorsDeclaration: {
    hasDirectors: boolean
    directors: Array<{
      firstName: string
      lastName: string
      dateOfBirth: string
      nationality: string
      passportNumber: string
      address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
      }
      position: string
    }>
  }
  documents: {
    passport?: File
    addressProof?: File
    selfie?: File
    institutionRegistration?: File
    uboDocuments?: File[]
    directorDocuments?: File[]
  }
  kycStatus: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'
}

// Additional type definitions for form handlers
interface DocumentData {
  [key: string]: File | string
}

interface InstitutionDetails {
  name: string
  registrationNumber: string
  country: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  businessType: string
  website?: string
}

interface UBODeclaration {
  hasUBO: boolean
  uboDetails: Array<{
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    ownershipPercentage: number
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }>
}

interface DirectorsDeclaration {
  hasDirectors: boolean
  directors: Array<{
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    passportNumber: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }>
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<UserData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    walletAddress: user?.walletAddress || address || '',
    jurisdiction: 'UK',
    investorType: 'individual',
    eligibilityAnswers: {},
    institutionDetails: {
      name: '',
      registrationNumber: '',
      country: '',
      address: { street: '', city: '', state: '', postalCode: '', country: '' },
      businessType: '',
      website: ''
    },
    uboDeclaration: {
      hasUBO: false,
      uboDetails: []
    },
    directorsDeclaration: {
      hasDirectors: false,
      directors: []
    },
    documents: {},
    kycStatus: user?.kycStatus || 'not_started'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Check if user already has wallet connected and skip wallet step
  useEffect(() => {
    if (isAuthenticated && user?.walletAddress) {
      console.log('User already has wallet connected:', user.walletAddress);
      setUserData(prev => ({
        ...prev,
        walletAddress: user.walletAddress
      }));
      
      // Skip wallet step if user already has wallet
      if (currentStep === 1) {
        console.log('Skipping wallet step - user already has wallet');
        setCurrentStep(2); // Move to next step
      }
    }
  }, [isAuthenticated, user?.walletAddress, currentStep]);

  // Update wallet address when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setUserData(prev => ({
        ...prev,
        walletAddress: address
      }))
    }
  }, [isConnected, address])

  // Load saved KYC progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated || !user?.email) return;

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/kyc/load-progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success && data.hasProgress) {
          console.log('Loading saved KYC progress:', data.progress);
          
          // Ensure all required fields have default values
          const savedUserData = {
            firstName: data.progress.userData.firstName || '',
            lastName: data.progress.userData.lastName || '',
            email: data.progress.userData.email || user?.email || '',
            walletAddress: data.progress.userData.walletAddress || user?.walletAddress || address || '',
            jurisdiction: data.progress.userData.jurisdiction || 'UK',
            investorType: data.progress.userData.investorType || 'individual',
            eligibilityAnswers: data.progress.userData.eligibilityAnswers || {},
            institutionDetails: data.progress.userData.institutionDetails || {
              name: '',
              registrationNumber: '',
              country: '',
              address: { street: '', city: '', state: '', postalCode: '', country: '' },
              businessType: '',
              website: ''
            },
            uboDeclaration: data.progress.userData.uboDeclaration || {
              hasUBO: false,
              uboDetails: []
            },
            directorsDeclaration: data.progress.userData.directorsDeclaration || {
              hasDirectors: false,
              directors: []
            },
            documents: data.progress.userData.documents || {},
            kycStatus: data.progress.userData.kycStatus || 'in_progress'
          };
          
          setUserData(savedUserData);
          setCurrentStep(data.progress.currentStep);
          setSaveMessage(`Resuming from step ${data.progress.currentStep + 1} (saved ${new Date(data.progress.lastSaved).toLocaleString()})`);
        }
      } catch (error) {
        console.error('Error loading KYC progress:', error);
      }
    };

    loadProgress();
  }, [isAuthenticated, user?.email]);

  // Set up global callback for step components to update userData
  useEffect(() => {
    window.updateUserDataCallback = (updatedData: UserData) => {
      setUserData(updatedData);
    };

    return () => {
      delete window.updateUserDataCallback;
    };
  }, []);

  // Auto-save progress when userData changes (debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.email || currentStep === 0) return;

    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 10000); // Auto-save after 10 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [userData, currentStep, isAuthenticated, user?.email]);

  // Immediate save when step changes (user completes a step)
  useEffect(() => {
    if (!isAuthenticated || !user?.email || currentStep === 0) return;
    
    // Save immediately when step changes (user moved to next step)
    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 500); // Quick save when step changes

    return () => clearTimeout(timeoutId);
  }, [currentStep, isAuthenticated, user?.email]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Web3 KYC',
      description: 'Get started with decentralized identity verification',
      icon: ShieldCheckIcon,
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending',
      component: 'welcome'
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet to begin',
      icon: WalletIcon,
      status: user?.walletAddress ? 'completed' : currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
      component: 'wallet'
    },
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Provide your basic information',
      icon: UserIcon,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      component: 'personal'
    },
    {
      id: 'investor-type',
      title: 'Investor Type',
      description: 'Select your investor classification',
      icon: ShieldCheckIcon,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      component: 'investor-type'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Questionnaire',
      description: 'Complete regulatory compliance questions',
      icon: DocumentTextIcon,
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending',
      component: 'eligibility'
    },
    {
      id: 'institution',
      title: 'Institution Details',
      description: 'Provide corporate information (if applicable)',
      icon: CubeIcon,
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending',
      component: 'institution'
    },
    {
      id: 'ubo',
      title: 'UBO Declaration',
      description: 'Declare ultimate beneficial owners',
      icon: UserIcon,
      status: currentStep === 6 ? 'current' : currentStep > 6 ? 'completed' : 'pending',
      component: 'ubo'
    },
    {
      id: 'directors',
      title: 'Directors Declaration',
      description: 'Provide director information',
      icon: UserIcon,
      status: currentStep === 7 ? 'current' : currentStep > 7 ? 'completed' : 'pending',
      component: 'directors'
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload required verification documents',
      icon: DocumentTextIcon,
      status: currentStep === 8 ? 'current' : currentStep > 8 ? 'completed' : 'pending',
      component: 'documents'
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'AI-powered document verification',
      icon: CubeIcon,
      status: currentStep === 9 ? 'current' : currentStep > 9 ? 'completed' : 'pending',
      component: 'verification'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Your KYC is complete!',
      icon: CheckCircleIcon,
      status: currentStep === 10 ? 'current' : currentStep > 10 ? 'completed' : 'pending',
      component: 'complete'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleWalletConnect = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          const walletAddress = accounts[0]
          
          // Update local state
          setUserData(prev => ({ ...prev, walletAddress }))
          
          // Save to database if user is authenticated
          const token = localStorage.getItem('auth_token')
          if (token) {
            try {
              const response = await fetch('/api/auth/connect-wallet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress })
              })

              const result = await response.json()
              if (!result.success) {
                console.warn('Failed to save wallet to database:', result.error)
                // Continue with the flow even if database save fails
              }
            } catch (dbError) {
              console.warn('Database save failed:', dbError)
              // Continue with the flow even if database save fails
            }
          }
          
          handleNext()
        }
      } else {
        setError('Please install MetaMask or another Web3 wallet')
      }
    } catch (error) {
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalInfoSubmit = (data: { firstName: string, lastName: string, email: string, jurisdiction: string }) => {
    setUserData(prev => ({ ...prev, ...data }))
    // Save immediately after personal info is submitted
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleDocumentUpload = (documents: DocumentData) => {
    setUserData(prev => ({ ...prev, documents: { ...prev.documents, ...documents } }))
    // Save immediately after documents are uploaded
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleInvestorTypeSubmit = (investorType: string) => {
    setUserData(prev => ({ ...prev, investorType: investorType as any }))
    // Save immediately after investor type is selected
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleEligibilitySubmit = (answers: { [key: string]: boolean | string }) => {
    setUserData(prev => ({ ...prev, eligibilityAnswers: { ...prev.eligibilityAnswers, ...answers } }))
    // Save immediately after eligibility answers are submitted
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleInstitutionSubmit = (institutionDetails: InstitutionDetails) => {
    setUserData(prev => ({ ...prev, institutionDetails }))
    // Save immediately after institution details are submitted
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleUBOSubmit = (uboDeclaration: UBODeclaration) => {
    setUserData(prev => ({ ...prev, uboDeclaration }))
    // Save immediately after UBO declaration is submitted
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleDirectorsSubmit = (directorsDeclaration: DirectorsDeclaration) => {
    setUserData(prev => ({ ...prev, directorsDeclaration }))
    // Save immediately after directors declaration is submitted
    setTimeout(() => saveProgress(), 100)
    handleNext()
  }

  const handleKYCSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Submit KYC to blockchain
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          kycStatus: 'pending_review'
        })
      })
      
      if (response.ok) {
        setUserData(prev => ({ ...prev, kycStatus: 'pending_review' }))
        handleNext()
      } else {
        throw new Error('Failed to submit KYC')
      }
    } catch (error) {
      setError('Failed to submit KYC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Save KYC progress to database
  const saveProgress = async (isManual = false) => {
    if (!isAuthenticated || !user?.email) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found for saving progress');
        return;
      }

      console.log(`Saving KYC progress (${isManual ? 'manual' : 'auto'}) - Step: ${currentStep}`, {
        hasFirstName: !!userData.firstName,
        hasLastName: !!userData.lastName,
        hasEmail: !!userData.email,
        hasWallet: !!userData.walletAddress,
        hasInvestorType: !!userData.investorType,
        hasEligibilityAnswers: Object.keys(userData.eligibilityAnswers || {}).length > 0,
        hasInstitutionDetails: !!userData.institutionDetails,
        hasUBO: !!userData.uboDeclaration,
        hasDirectors: !!userData.directorsDeclaration,
        userDataKeys: Object.keys(userData)
      });

      const response = await fetch('/api/kyc/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentStep,
          userData
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ KYC progress saved successfully to database');
        if (isManual) {
          setSaveMessage('Progress saved successfully!');
        } else {
          setSaveMessage('Progress saved automatically');
        }
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        console.error('❌ Failed to save KYC progress:', data.error);
        if (isManual) {
          setSaveMessage('Failed to save progress. Please try again.');
          setTimeout(() => setSaveMessage(null), 5000);
        }
      }
    } catch (error) {
      console.error('❌ Error saving KYC progress:', error);
      if (isManual) {
        setSaveMessage('Error saving progress. Please try again.');
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } finally {
      setSaving(false);
    }
  };

  // Manual save progress function
  const handleSaveProgress = async () => {
    await saveProgress(true);
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep]
    
    switch (currentStepData.component) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />
      case 'wallet':
        return <WalletStep onConnect={handleWalletConnect} loading={loading} error={error} />
      case 'personal':
        return <PersonalInfoStep 
          onSubmit={handlePersonalInfoSubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'investor-type':
        return <InvestorTypeStep 
          onSubmit={handleInvestorTypeSubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'eligibility':
        return <EligibilityStep 
          onSubmit={handleEligibilitySubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'institution':
        return <InstitutionStep 
          onSubmit={handleInstitutionSubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'ubo':
        return <UBOStep 
          onSubmit={handleUBOSubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'directors':
        return <DirectorsStep 
          onSubmit={handleDirectorsSubmit} 
          userData={userData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      case 'documents':
        return <DocumentUploadStep onUpload={handleDocumentUpload} userData={userData} />
      case 'verification':
        return <VerificationStep onSubmit={handleKYCSubmit} userData={userData} loading={loading} error={error} />
      case 'complete':
        return <CompleteStep userData={userData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-lg border-b border-blue-100">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Web3 KYC
                </h1>
                <p className="text-sm text-gray-600 font-medium">Identity Verification Process</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 rounded-full"
                style={{ 
                  width: `${((currentStep) / (steps.length - 1)) * 100}%` 
                }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between px-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center group flex-1">
                  {/* Step Circle */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                    step.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-xl shadow-green-200' 
                    : step.status === 'current' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-xl shadow-blue-200 animate-pulse' 
                    : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:shadow-lg'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircleIcon className="w-8 h-8" />
                    ) : (
                      <step.icon className={`w-8 h-8 ${
                        step.status === 'current' ? 'text-white' : 'text-gray-400'
                      }`} />
                    )}
                    
                    {/* Step Number */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : step.status === 'current' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="mt-6 text-center max-w-40">
                    <p className={`text-base font-bold transition-colors duration-300 ${
                      step.status === 'current' 
                        ? 'text-blue-600' 
                        : step.status === 'completed' 
                        ? 'text-green-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm mt-2 transition-colors duration-300 ${
                      step.status === 'current' 
                        ? 'text-blue-500' 
                        : step.status === 'completed' 
                        ? 'text-green-500' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-20 translate-x-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-50 to-blue-50 rounded-full translate-y-16 -translate-x-16 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {renderStepContent()}
          </div>
        </div>

        {/* Save Progress Status */}
        {saveMessage && (
          <div className="mt-8 px-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm text-green-800">{saveMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <ArrowLeftIcon className="w-6 h-6 mr-3" />
              Previous Step
            </button>

            {/* Save Progress Button */}
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="flex items-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Save Progress
                  </>
                )}
              </button>
            )}
          </div>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Next Step
              <ArrowRightIcon className="w-6 h-6 ml-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Web3 KYC</h2>
        <p className="text-lg text-gray-600 mb-6">
          Complete your identity verification to access decentralized services and build your Web3 reputation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-sm text-gray-600">Link your Web3 wallet to get started</p>
        </div>
        
        <div className="text-center">
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-sm text-gray-600">Provide required verification documents</p>
        </div>
        
        <div className="text-center">
          <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CubeIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Verification</h3>
          <p className="text-sm text-gray-600">Advanced AI-powered document verification</p>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Get Started
      </button>
    </div>
  )
}

function WalletStep({ onConnect, loading, error }: { 
  onConnect: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <WalletIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-lg text-gray-600 mb-6">
          Connect your Web3 wallet to begin the KYC process. Your wallet address will be linked to your verified identity.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      <button
        onClick={onConnect}
        disabled={loading}
        className={`px-8 py-3 font-medium rounded-lg transition-colors ${
          loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      <p className="text-sm text-gray-500 mt-4">
        Supported wallets: MetaMask, WalletConnect, Coinbase Wallet
      </p>
    </div>
  )
}

function PersonalInfoStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (data: { firstName: string; lastName: string; email: string; jurisdiction: string }) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    jurisdiction: userData.jurisdiction
  })

  // Auto-save as user types (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Update userData with current form data for auto-save
      const updatedUserData = { ...userData, ...formData }
      // Update the parent component's userData to trigger auto-save
      if (window.updateUserDataCallback) {
        window.updateUserDataCallback(updatedUserData)
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [formData, userData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <UserIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Personal Information</h2>
        <p className="text-lg text-gray-600">
          Please provide your basic information for KYC verification.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            handleSubmit(new Event('submit') as any)
            onNext()
          }}
          disabled={!formData.firstName || !formData.lastName || !formData.email}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !formData.firstName || !formData.lastName || !formData.email
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jurisdiction
          </label>
          <select
            value={formData.jurisdiction}
            onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UK">United Kingdom</option>
            <option value="EU">European Union</option>
            <option value="US">United States</option>
            <option value="AU">Australia</option>
            <option value="ZA">South Africa</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

function DocumentUploadStep({ onUpload, userData }: { 
  onUpload: (documents: DocumentData) => void
  userData: UserData
}) {
  const [documents, setDocuments] = useState({
    passport: null as File | null,
    addressProof: null as File | null,
    selfie: null as File | null
  })
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleFileUpload = (type: string, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }))
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front camera for selfie
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setCameraStream(stream)
      setShowCamera(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (video && context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
          handleFileUpload('selfie', file)
          setCapturedImage(canvas.toDataURL())
        }
      }, 'image/jpeg', 0.8)
      
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setDocuments(prev => ({ ...prev, selfie: null }))
    startCamera()
  }

  // Set up camera video element when camera starts
  useEffect(() => {
    if (showCamera && cameraStream) {
      const video = document.getElementById('camera-video') as HTMLVideoElement
      if (video) {
        video.srcObject = cameraStream
      }
    }
  }, [showCamera, cameraStream])

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const handleSubmit = () => {
    onUpload(documents)
  }

  const isComplete = documents.passport && documents.addressProof && documents.selfie

  return (
    <div>
      <div className="text-center mb-8">
        <DocumentTextIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Upload</h2>
        <p className="text-lg text-gray-600">
          Upload the required documents for verification. All documents will be processed securely.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Passport */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Passport or ID Document</h3>
          <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your passport or government-issued ID</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload('passport', e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {documents.passport && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.passport.name}</p>
          )}
        </div>
        
        {/* Address Proof */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Proof of Address</h3>
          <p className="text-sm text-gray-600 mb-4">Upload a utility bill, bank statement, or government document showing your address</p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload('addressProof', e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {documents.addressProof && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.addressProof.name}</p>
          )}
        </div>
        
        {/* Selfie */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selfie Verification</h3>
          <p className="text-sm text-gray-600 mb-4">Take a selfie holding your ID document for verification</p>
          
          {!showCamera && !capturedImage && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={startCamera}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Take Photo with Camera</span>
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-white rounded-full opacity-50"></div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Capture Photo</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retake Photo
                </button>
                <button
                  onClick={() => {
                    setCapturedImage(null)
                    setDocuments(prev => ({ ...prev, selfie: null }))
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {documents.selfie && !capturedImage && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.selfie.name}</p>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
            isComplete 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isComplete ? 'Continue to Verification' : 'Upload All Documents to Continue'}
        </button>
      </div>
    </div>
  )
}

function VerificationStep({ onSubmit, userData, loading, error }: { 
  onSubmit: () => void
  userData: UserData
  loading: boolean
  error: string | null
}) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <CubeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Verification</h2>
        <p className="text-lg text-gray-600 mb-6">
          Your documents are being processed by our AI-powered verification system. This may take a few minutes.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto space-y-4 mb-8">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Document Analysis</span>
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-600">Processing...</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Identity Verification</span>
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-600">Processing...</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-600">Processing...</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={loading}
        className={`px-8 py-3 font-medium rounded-lg transition-colors ${
          loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Submitting KYC...
          </div>
        ) : (
          'Submit for Review'
        )}
      </button>
    </div>
  )
}

function CompleteStep({ userData }: { userData: UserData }) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">KYC Submitted!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Your KYC application has been submitted and is under review. You'll receive an email notification once the review is complete.
        </p>
      </div>
      
      <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Name:</span>
            <span className="text-sm font-medium text-gray-900">{userData.firstName} {userData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="text-sm font-medium text-gray-900">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Wallet:</span>
            <span className="text-sm font-mono text-gray-900">
              {userData.walletAddress ? `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Jurisdiction:</span>
            <span className="text-sm font-medium text-gray-900">{userData.jurisdiction}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="text-sm font-medium text-orange-600">Pending Review</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
        
        <p className="text-sm text-gray-500">
          You can check your KYC status anytime in your dashboard
        </p>
      </div>
    </div>
  )
}

// New Step Components
function InvestorTypeStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (investorType: string) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [selectedType, setSelectedType] = useState(userData.investorType || 'individual')

  const investorTypes = [
    {
      id: 'individual',
      title: 'Individual',
      description: 'Personal investment account',
      icon: UserIcon
    },
    {
      id: 'retail',
      title: 'Retail Investor',
      description: 'Non-professional investor',
      icon: ShieldCheckIcon
    },
    {
      id: 'accredited',
      title: 'Accredited Investor',
      description: 'High net worth individual',
      icon: DocumentTextIcon
    },
    {
      id: 'qualified',
      title: 'Qualified Investor',
      description: 'Professional investor',
      icon: CubeIcon
    },
    {
      id: 'institutional',
      title: 'Institutional',
      description: 'Corporate or institutional investor',
      icon: CubeIcon
    }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Investor Type</h2>
        <p className="text-lg text-gray-600">
          Please select your investor classification. This helps us determine the appropriate compliance requirements.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            onSubmit(selectedType)
            onNext()
          }}
          disabled={!selectedType}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !selectedType
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {investorTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id as any)}
            className={`p-6 rounded-lg border-2 text-left transition-colors ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <type.icon className={`w-8 h-8 ${
                selectedType === type.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}

function EligibilityStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (answers: { [key: string]: boolean | string }) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [answers, setAnswers] = useState<{ [key: string]: boolean | string }>(userData.eligibilityAnswers || {})

  // Auto-save as user answers questions (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Update userData with current answers for auto-save
      const updatedUserData = { ...userData, eligibilityAnswers: answers }
      // Update the parent component's userData to trigger auto-save
      if (window.updateUserDataCallback) {
        window.updateUserDataCallback(updatedUserData)
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [answers, userData])

  const questions = [
    {
      id: 'us_citizen',
      question: 'Are you a US citizen or resident?',
      type: 'boolean'
    },
    {
      id: 'eu_resident',
      question: 'Are you a resident of the European Union?',
      type: 'boolean'
    },
    {
      id: 'accredited_status',
      question: 'Do you meet the criteria for an accredited investor?',
      type: 'boolean'
    },
    {
      id: 'pep_status',
      question: 'Are you a Politically Exposed Person (PEP)?',
      type: 'boolean'
    },
    {
      id: 'sanctions',
      question: 'Are you subject to any sanctions or restrictions?',
      type: 'boolean'
    },
    {
      id: 'source_of_funds',
      question: 'What is your primary source of funds?',
      type: 'select',
      options: ['Employment', 'Business', 'Investment', 'Inheritance', 'Other']
    }
  ]

  const handleAnswerChange = (questionId: string, value: boolean | string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <DocumentTextIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Eligibility Questionnaire</h2>
        <p className="text-lg text-gray-600">
          Please answer these regulatory compliance questions to determine your eligibility.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            onSubmit(answers)
            onNext()
          }}
          className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      <div className="space-y-6 mb-8">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h3>
            
            {question.type === 'boolean' ? (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAnswerChange(question.id, true)}
                  className={`px-4 py-2 rounded-lg border ${
                    answers[question.id] === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswerChange(question.id, false)}
                  className={`px-4 py-2 rounded-lg border ${
                    answers[question.id] === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <select
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an option</option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

function InstitutionStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (institutionDetails: InstitutionDetails) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [institutionDetails, setInstitutionDetails] = useState(userData.institutionDetails || {
    name: '',
    registrationNumber: '',
    country: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    businessType: '',
    website: ''
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setInstitutionDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setInstitutionDetails(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <CubeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Institution Details</h2>
        <p className="text-lg text-gray-600">
          Provide information about your institution or organization.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            onSubmit(institutionDetails)
            onNext()
          }}
          className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
            <input
              type="text"
              value={institutionDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter institution name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
            <input
              type="text"
              value={institutionDetails.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter registration number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={institutionDetails.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="SG">Singapore</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
            <select
              value={institutionDetails.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select business type</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
              <option value="llc">Limited Liability Company</option>
              <option value="trust">Trust</option>
              <option value="foundation">Foundation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
          <input
            type="url"
            value={institutionDetails.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                value={institutionDetails.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={institutionDetails.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                value={institutionDetails.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter state/province"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                value={institutionDetails.address.postalCode}
                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter postal code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={institutionDetails.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="SG">Singapore</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function UBOStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (uboDeclaration: UBODeclaration) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [uboDeclaration, setUboDeclaration] = useState(userData.uboDeclaration || {
    hasUBO: false,
    uboDetails: []
  })

  const addUBO = () => {
    setUboDeclaration(prev => ({
      ...prev,
      uboDetails: [...prev.uboDetails, {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        ownershipPercentage: 0,
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      }]
    }))
  }

  const updateUBO = (index: number, field: string, value: string | number | boolean) => {
    setUboDeclaration(prev => ({
      ...prev,
      uboDetails: prev.uboDetails.map((ubo, i) => 
        i === index 
          ? field.includes('.') 
            ? { ...ubo, [field.split('.')[0]]: { ...ubo[field.split('.')[0] as keyof typeof ubo], [field.split('.')[1]]: value } }
            : { ...ubo, [field]: value }
          : ubo
      )
    }))
  }

  const removeUBO = (index: number) => {
    setUboDeclaration(prev => ({
      ...prev,
      uboDetails: prev.uboDetails.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <UserIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">UBO Declaration</h2>
        <p className="text-lg text-gray-600">
          Declare all Ultimate Beneficial Owners (UBOs) with 25% or more ownership.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            onSubmit(uboDeclaration)
            onNext()
          }}
          className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="checkbox"
            id="hasUBO"
            checked={uboDeclaration.hasUBO}
            onChange={(e) => setUboDeclaration(prev => ({ ...prev, hasUBO: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasUBO" className="text-lg font-medium text-gray-900">
            This entity has Ultimate Beneficial Owners
          </label>
        </div>
      </div>

      {uboDeclaration.hasUBO && (
        <div className="space-y-6 mb-8">
          {uboDeclaration.uboDetails.map((ubo, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">UBO #{index + 1}</h3>
                <button
                  onClick={() => removeUBO(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={ubo.firstName}
                    onChange={(e) => updateUBO(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={ubo.lastName}
                    onChange={(e) => updateUBO(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={ubo.dateOfBirth}
                    onChange={(e) => updateUBO(index, 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select
                    value={ubo.nationality}
                    onChange={(e) => updateUBO(index, 'nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select nationality</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="SG">Singapore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={ubo.ownershipPercentage}
                    onChange={(e) => updateUBO(index, 'ownershipPercentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={ubo.address.street}
                      onChange={(e) => updateUBO(index, 'address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={ubo.address.city}
                      onChange={(e) => updateUBO(index, 'address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={ubo.address.state}
                      onChange={(e) => updateUBO(index, 'address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={ubo.address.postalCode}
                      onChange={(e) => updateUBO(index, 'address.postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={ubo.address.country}
                      onChange={(e) => updateUBO(index, 'address.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="SG">Singapore</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addUBO}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add Another UBO
          </button>
        </div>
      )}

    </div>
  )
}

function DirectorsStep({ onSubmit, userData, onPrevious, onNext, currentStep, totalSteps }: { 
  onSubmit: (directorsDeclaration: DirectorsDeclaration) => void
  userData: UserData
  onPrevious: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}) {
  const [directorsDeclaration, setDirectorsDeclaration] = useState(userData.directorsDeclaration || {
    hasDirectors: false,
    directors: []
  })

  const addDirector = () => {
    setDirectorsDeclaration(prev => ({
      ...prev,
      directors: [...prev.directors, {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        position: ''
      }]
    }))
  }

  const updateDirector = (index: number, field: string, value: string | number | boolean) => {
    setDirectorsDeclaration(prev => ({
      ...prev,
      directors: prev.directors.map((director, i) => 
        i === index 
          ? field.includes('.') 
            ? { ...director, [field.split('.')[0]]: { ...director[field.split('.')[0] as keyof typeof director], [field.split('.')[1]]: value } }
            : { ...director, [field]: value }
          : director
      )
    }))
  }

  const removeDirector = (index: number) => {
    setDirectorsDeclaration(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <UserIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Directors Declaration</h2>
        <p className="text-lg text-gray-600">
          Provide information about all directors and key personnel.
        </p>
      </div>

      {/* Top Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            onSubmit(directorsDeclaration)
            onNext()
          }}
          className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="checkbox"
            id="hasDirectors"
            checked={directorsDeclaration.hasDirectors}
            onChange={(e) => setDirectorsDeclaration(prev => ({ ...prev, hasDirectors: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasDirectors" className="text-lg font-medium text-gray-900">
            This entity has directors or key personnel
          </label>
        </div>
      </div>

      {directorsDeclaration.hasDirectors && (
        <div className="space-y-6 mb-8">
          {directorsDeclaration.directors.map((director, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Director #{index + 1}</h3>
                <button
                  onClick={() => removeDirector(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={director.firstName}
                    onChange={(e) => updateDirector(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={director.lastName}
                    onChange={(e) => updateDirector(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={director.dateOfBirth}
                    onChange={(e) => updateDirector(index, 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                  <select
                    value={director.nationality}
                    onChange={(e) => updateDirector(index, 'nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select nationality</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="SG">Singapore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                  <input
                    type="text"
                    value={director.passportNumber}
                    onChange={(e) => updateDirector(index, 'passportNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={director.position}
                    onChange={(e) => updateDirector(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CEO, CFO, Director"
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={director.address.street}
                      onChange={(e) => updateDirector(index, 'address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={director.address.city}
                      onChange={(e) => updateDirector(index, 'address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={director.address.state}
                      onChange={(e) => updateDirector(index, 'address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={director.address.postalCode}
                      onChange={(e) => updateDirector(index, 'address.postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={director.address.country}
                      onChange={(e) => updateDirector(index, 'address.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="SG">Singapore</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addDirector}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add Another Director
          </button>
        </div>
      )}

    </div>
  )
}