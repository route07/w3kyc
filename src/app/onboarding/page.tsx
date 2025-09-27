'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
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
  icon: any
  status: 'pending' | 'current' | 'completed' | 'error'
  component: string
}

interface UserData {
  firstName: string
  lastName: string
  email: string
  walletAddress: string
  jurisdiction: string
  documents: {
    passport?: File
    addressProof?: File
    selfie?: File
  }
  kycStatus: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'
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
    documents: {},
    kycStatus: user?.kycStatus || 'not_started'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Update wallet address when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setUserData(prev => ({
        ...prev,
        walletAddress: address
      }))
    }
  }, [isConnected, address])

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
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
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
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload required verification documents',
      icon: DocumentTextIcon,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      component: 'documents'
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'AI-powered document verification',
      icon: CubeIcon,
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending',
      component: 'verification'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Your KYC is complete!',
      icon: CheckCircleIcon,
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending',
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
          setUserData(prev => ({ ...prev, walletAddress: accounts[0] }))
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
    handleNext()
  }

  const handleDocumentUpload = (documents: any) => {
    setUserData(prev => ({ ...prev, documents: { ...prev.documents, ...documents } }))
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

  const renderStepContent = () => {
    const currentStepData = steps[currentStep]
    
    switch (currentStepData.component) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />
      case 'wallet':
        return <WalletStep onConnect={handleWalletConnect} loading={loading} error={error} />
      case 'personal':
        return <PersonalInfoStep onSubmit={handlePersonalInfoSubmit} userData={userData} />
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
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Web3 KYC</h1>
                <p className="text-sm text-gray-600">Identity Verification</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  step.status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.id} className="text-center max-w-24">
                <p className={`text-sm font-medium ${
                  step.status === 'current' ? 'text-blue-600' :
                  step.status === 'completed' ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg ${
              currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ArrowRightIcon className="w-4 h-4 ml-2" />
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

function PersonalInfoStep({ onSubmit, userData }: { 
  onSubmit: (data: any) => void
  userData: UserData
}) {
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    jurisdiction: userData.jurisdiction
  })

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
  onUpload: (documents: any) => void
  userData: UserData
}) {
  const [documents, setDocuments] = useState({
    passport: null as File | null,
    addressProof: null as File | null,
    selfie: null as File | null
  })

  const handleFileUpload = (type: string, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }))
  }

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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {documents.selfie && (
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
            <span className="text-sm font-mono text-gray-900">{userData.walletAddress.slice(0, 6)}...{userData.walletAddress.slice(-4)}</span>
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