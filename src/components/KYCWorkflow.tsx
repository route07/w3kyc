'use client'

import { useState, useEffect } from 'react'
import { KYCService } from '@/lib/kyc-service'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  WalletIcon,
  GlobeAltIcon,
  KeyIcon,
  CameraIcon,
  FingerPrintIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface CredentialType {
  credentialTypeId: string
  name: string
  description: string
  category: 'IDENTITY' | 'FINANCIAL' | 'PROFESSIONAL' | 'COMPLIANCE' | 'CUSTOM'
  requiredFields: string[]
  optionalFields: string[]
  requiresBiometric: boolean
  requiresDocumentProof: boolean
  requiresThirdPartyVerification: boolean
  defaultValidityPeriod: number
}

interface TenantConfig {
  tenantId: string
  name: string
  requiredCredentials: string[]
  maxRiskScore: number
  allowedJurisdictions: string[]
  customFields: string[]
}

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  required: boolean
  icon: any
}

export default function KYCWorkflow() {
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [tenants, setTenants] = useState<TenantConfig[]>([])
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([])
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [userAddress, setUserAddress] = useState<string>('')
  const [kycData, setKycData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      generateVerificationSteps()
    }
  }, [selectedTenant, credentialTypes])

  const loadInitialData = async () => {
    try {
      // Mock data for demonstration
      const mockTenants: TenantConfig[] = [
        {
          tenantId: 'tenant-001',
          name: 'Financial Services Corp',
          requiredCredentials: ['kyc-identity', 'financial-status'],
          maxRiskScore: 75,
          allowedJurisdictions: ['US', 'EU', 'UK'],
          customFields: ['employmentStatus', 'incomeRange']
        },
        {
          tenantId: 'tenant-002',
          name: 'Crypto Exchange Ltd',
          requiredCredentials: ['kyc-identity', 'compliance-check'],
          maxRiskScore: 50,
          allowedJurisdictions: ['US', 'CA', 'AU'],
          customFields: ['tradingVolume', 'riskTolerance']
        }
      ]

      const mockCredentialTypes: CredentialType[] = [
        {
          credentialTypeId: 'kyc-identity',
          name: 'KYC Identity Verification',
          description: 'Identity verification credential for KYC compliance',
          category: 'IDENTITY',
          requiredFields: ['fullName', 'dateOfBirth', 'nationality', 'address'],
          optionalFields: ['middleName', 'previousName', 'phoneNumber'],
          requiresBiometric: false,
          requiresDocumentProof: true,
          requiresThirdPartyVerification: true,
          defaultValidityPeriod: 365
        },
        {
          credentialTypeId: 'financial-status',
          name: 'Financial Status Verification',
          description: 'Financial status and income verification',
          category: 'FINANCIAL',
          requiredFields: ['income', 'employmentStatus', 'bankAccount'],
          optionalFields: ['employer', 'bankStatements', 'taxReturns'],
          requiresBiometric: false,
          requiresDocumentProof: true,
          requiresThirdPartyVerification: true,
          defaultValidityPeriod: 180
        },
        {
          credentialTypeId: 'compliance-check',
          name: 'Compliance Verification',
          description: 'Regulatory compliance and sanctions screening',
          category: 'COMPLIANCE',
          requiredFields: ['sanctionsCheck', 'pepCheck', 'adverseMediaCheck'],
          optionalFields: ['additionalScreening', 'sourceOfFunds'],
          requiresBiometric: false,
          requiresDocumentProof: false,
          requiresThirdPartyVerification: true,
          defaultValidityPeriod: 90
        }
      ]

      setTenants(mockTenants)
      setCredentialTypes(mockCredentialTypes)
      
      if (mockTenants.length > 0) {
        setSelectedTenant(mockTenants[0].tenantId)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const generateVerificationSteps = () => {
    if (!selectedTenant) return

    const tenant = tenants.find(t => t.tenantId === selectedTenant)
    if (!tenant) return

    const steps: VerificationStep[] = []

    // Identity verification step
    steps.push({
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued documents',
      status: 'pending',
      required: true,
      icon: UserIcon
    })

    // Add steps for each required credential
    tenant.requiredCredentials.forEach(credentialId => {
      const credential = credentialTypes.find(c => c.credentialTypeId === credentialId)
      if (credential) {
        steps.push({
          id: credentialId,
          title: credential.name,
          description: credential.description,
          status: 'pending',
          required: true,
          icon: getCredentialIcon(credential.category)
        })
      }
    })

    // Risk assessment step
    steps.push({
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'AI-powered risk scoring and analysis',
      status: 'pending',
      required: true,
      icon: ShieldCheckIcon
    })

    // Wallet linking step
    steps.push({
      id: 'wallet-linking',
      title: 'Wallet Linking',
      description: 'Link your blockchain wallet for verification',
      status: 'pending',
      required: true,
      icon: WalletIcon
    })

    // Final verification step
    steps.push({
      id: 'final-verification',
      title: 'Final Verification',
      description: 'Complete KYC verification and receive credentials',
      status: 'pending',
      required: true,
      icon: CheckCircleIcon
    })

    setVerificationSteps(steps)
  }

  const getCredentialIcon = (category: string) => {
    const icons = {
      IDENTITY: UserIcon,
      FINANCIAL: BanknotesIcon,
      PROFESSIONAL: BuildingOfficeIcon,
      COMPLIANCE: ShieldCheckIcon,
      CUSTOM: KeyIcon
    }
    return icons[category as keyof typeof icons] || DocumentTextIcon
  }

  const getStepStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-400 bg-gray-100',
      'in-progress': 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-100'
  }

  const getStepStatusIcon = (status: string) => {
    const icons = {
      pending: ClockIcon,
      'in-progress': ExclamationCircleIcon,
      completed: CheckCircleIcon,
      failed: XCircleIcon
    }
    return icons[status as keyof typeof icons] || ClockIcon
  }

  const startVerification = async () => {
    if (!userAddress || !selectedTenant) return

    setIsLoading(true)
    try {
      // Check current KYC status
      const status = await KYCService.getKYCStatus(userAddress)
      setKycData(status)

      // Update first step to in-progress
      const updatedSteps = [...verificationSteps]
      updatedSteps[0].status = 'in-progress'
      setVerificationSteps(updatedSteps)
      setCurrentStep(0)

    } catch (error) {
      console.error('Error starting verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeStep = async (stepIndex: number) => {
    const updatedSteps = [...verificationSteps]
    updatedSteps[stepIndex].status = 'completed'
    
    // Move to next step if available
    if (stepIndex + 1 < updatedSteps.length) {
      updatedSteps[stepIndex + 1].status = 'in-progress'
      setCurrentStep(stepIndex + 1)
    }
    
    setVerificationSteps(updatedSteps)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification Workflow</h1>
          <p className="text-gray-600 mt-1">Complete your identity verification process</p>
        </div>

        {/* Tenant Selection */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tenant
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Wallet Address
              </label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={startVerification}
              disabled={!userAddress || !selectedTenant || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Starting...' : 'Start Verification'}
            </button>
          </div>
        </div>

        {/* Current KYC Status */}
        {kycData && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current KYC Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${kycData.isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Verified: {kycData.isVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className={`w-5 h-5 mr-2 ${kycData.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Active: {kycData.isActive ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className={`w-5 h-5 mr-2 ${kycData.isExpired ? 'text-red-600' : 'text-green-600'}`} />
                  <span className="text-sm font-medium">Expired: {kycData.isExpired ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Steps */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Steps</h3>
          <div className="space-y-4">
            {verificationSteps.map((step, index) => {
              const StatusIcon = getStepStatusIcon(step.status)
              const StepIcon = step.icon
              
              return (
                <div
                  key={step.id}
                  className={`border rounded-lg p-4 transition-all ${
                    index === currentStep ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${getStepStatusColor(step.status)}`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-5 h-5 ${getStepStatusColor(step.status).split(' ')[0]}`} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}>
                            {step.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      
                      {/* Step-specific content */}
                      {step.status === 'in-progress' && (
                        <div className="mt-4">
                          {step.id === 'identity' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                  type="date"
                                  placeholder="Date of Birth"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                  type="text"
                                  placeholder="Nationality"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                  type="text"
                                  placeholder="Address"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <div className="flex items-center space-x-4">
                                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                  <CameraIcon className="w-5 h-5 mr-2" />
                                  Upload ID Document
                                </button>
                                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                  <FingerPrintIcon className="w-5 h-5 mr-2" />
                                  Biometric Scan
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {step.id === 'financial-status' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Annual Income"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <select className="border border-gray-300 rounded-lg px-3 py-2">
                                  <option>Employment Status</option>
                                  <option>Employed</option>
                                  <option>Self-Employed</option>
                                  <option>Unemployed</option>
                                  <option>Retired</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Bank Account Number"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <input
                                  type="text"
                                  placeholder="Employer Name"
                                  className="border border-gray-300 rounded-lg px-3 py-2"
                                />
                              </div>
                              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <DocumentTextIcon className="w-5 h-5 mr-2" />
                                Upload Bank Statements
                              </button>
                            </div>
                          )}
                          
                          {step.id === 'compliance-check' && (
                            <div className="space-y-3">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                  <span className="text-sm text-yellow-800">
                                    Automated compliance checks will be performed
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                  <ShieldCheckIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium">Sanctions Check</p>
                                </div>
                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                  <UserIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium">PEP Check</p>
                                </div>
                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                  <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium">Adverse Media</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {step.id === 'wallet-linking' && (
                            <div className="space-y-3">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                  <WalletIcon className="w-5 h-5 text-blue-600 mr-2" />
                                  <span className="text-sm text-blue-800">
                                    Connect your wallet to complete verification
                                  </span>
                                </div>
                              </div>
                              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                Connect Wallet
                              </button>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => completeStep(index)}
                              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            >
                              Complete Step
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tenant Requirements */}
        {selectedTenant && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tenant Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Credentials</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {tenants.find(t => t.tenantId === selectedTenant)?.requiredCredentials.map((cred, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                      {credentialTypes.find(c => c.credentialTypeId === cred)?.name || cred}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Max Risk Score:</span>
                    <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.maxRiskScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jurisdictions:</span>
                    <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.allowedJurisdictions.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Fields:</span>
                    <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.customFields.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
