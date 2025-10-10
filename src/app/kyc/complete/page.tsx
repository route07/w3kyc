'use client'

import { useState } from 'react'
import Link from 'next/link'
import MockNavigation from '@/components/MockNavigation'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  WalletIcon,
  UserIcon,
  StarIcon,
  CubeIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  CogIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BanknotesIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

interface KYCStep {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'required'
  icon: React.ComponentType<{ className?: string }>
  color: string
  content: React.ReactNode
}

export default function KYCCompletePage() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'required': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'in_progress': return <ClockIcon className="w-4 h-4" />
      case 'required': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  const kycSteps: KYCStep[] = [
    {
      id: 'investor-type',
      title: 'Investor Type',
      description: 'Investment profile and experience level',
      status: 'not_started',
      icon: CurrencyDollarIcon,
      color: 'green',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investor Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select investor type</option>
                <option value="retail">Retail Investor</option>
                <option value="accredited">Accredited Investor</option>
                <option value="institutional">Institutional Investor</option>
                <option value="professional">Professional Investor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="advanced">Advanced (5+ years)</option>
                <option value="expert">Expert (10+ years)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Investment Budget</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select budget range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="over-500k">Over $500,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select risk tolerance</option>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
                <option value="very-aggressive">Very Aggressive</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'eligibility-questionnaire',
      title: 'Eligibility Questionnaire',
      description: 'Compliance and regulatory requirements',
      status: 'required',
      icon: ShieldCheckIcon,
      color: 'red',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input type="checkbox" id="q1" className="mt-1 h-4 w-4 text-blue-600" />
              <label htmlFor="q1" className="text-sm text-gray-700">
                I confirm that I am not a politically exposed person (PEP) or related to a PEP
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" id="q2" className="mt-1 h-4 w-4 text-blue-600" />
              <label htmlFor="q2" className="text-sm text-gray-700">
                I confirm that I am not subject to any sanctions or restrictions
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" id="q3" className="mt-1 h-4 w-4 text-blue-600" />
              <label htmlFor="q3" className="text-sm text-gray-700">
                I understand and agree to comply with all applicable regulations
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <input type="checkbox" id="q4" className="mt-1 h-4 w-4 text-blue-600" />
              <label htmlFor="q4" className="text-sm text-gray-700">
                I consent to the collection and processing of my personal data for KYC purposes
              </label>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">All questions must be answered to proceed</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'institution-details',
      title: 'Institution Details',
      description: 'Organization and business information',
      status: 'not_started',
      icon: BuildingOfficeIcon,
      color: 'indigo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
              <input type="text" placeholder="Enter institution name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input type="text" placeholder="Enter registration number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select industry</option>
                <option value="fintech">Fintech</option>
                <option value="defi">DeFi</option>
                <option value="nft">NFT/Gaming</option>
                <option value="trading">Trading</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Registration</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="SG">Singapore</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ubo-declaration',
      title: 'UBO Declaration',
      description: 'Ultimate beneficial ownership information',
      status: 'not_started',
      icon: UserIcon,
      color: 'orange',
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">UBO Information Required</h4>
                <p className="text-sm text-orange-700">Please provide details for all ultimate beneficial owners</p>
              </div>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Add UBO Information
          </button>
        </div>
      )
    },
    {
      id: 'directors-declaration',
      title: 'Directors Declaration',
      description: 'Board member and executive information',
      status: 'not_started',
      icon: UserIcon,
      color: 'yellow',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-900">Directors Information Required</h4>
                <p className="text-sm text-yellow-700">Please provide details for all directors and executives</p>
              </div>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            Add Director Information
          </button>
        </div>
      )
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Basic identity details and contact information',
      status: 'completed',
      icon: UserIcon,
      color: 'blue',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value="Sarah" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value="Johnson" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value="sarah.johnson@web3mail.eth" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Personal information verified</span>
          </div>
        </div>
      )
    },
    {
      id: 'identity-documents',
      title: 'Identity Documents',
      description: 'Government-issued ID and verification documents',
      status: 'in_progress',
      icon: IdentificationIcon,
      color: 'purple',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Passport Upload Required</h4>
                <p className="text-sm text-blue-700">Please upload a clear photo of your passport</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Proof of Address</h4>
                <p className="text-sm text-gray-700">Utility bill or bank statement (optional)</p>
              </div>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Upload Documents
          </button>
        </div>
      )
    },
    {
      id: 'source-of-funds',
      title: 'Source of Funds',
      description: 'Fund origin and verification',
      status: 'not_started',
      icon: BanknotesIcon,
      color: 'emerald',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Source of Funds</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select source</option>
                <option value="salary">Employment/Salary</option>
                <option value="business">Business Income</option>
                <option value="investment">Investment Returns</option>
                <option value="inheritance">Inheritance</option>
                <option value="gift">Gift</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income Range</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select range</option>
                <option value="under-50k">Under $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-250k">$100,000 - $250,000</option>
                <option value="250k-500k">$250,000 - $500,000</option>
                <option value="over-500k">Over $500,000</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Documentation</label>
            <textarea 
              placeholder="Please provide any additional information about your source of funds..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      id: 'bank-details',
      title: 'Bank Details',
      description: 'Banking and payment information',
      status: 'not_started',
      icon: BanknotesIcon,
      color: 'teal',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input type="text" placeholder="Enter bank name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select account type</option>
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="business">Business Account</option>
                <option value="investment">Investment Account</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (Last 4 digits)</label>
              <input type="text" placeholder="****" className="w-full px-3 py-2 border border-gray-300 rounded-lg" maxLength={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
              <input type="text" placeholder="Enter routing number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Bank details are encrypted and secure</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MockNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete KYC Verification</h1>
              <p className="text-gray-600 mt-2">Complete all required sections to verify your identity</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-2xl font-bold text-gray-900">2/9</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Steps */}
        <div className="space-y-4">
          {/* Section 1: Corporate Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section 1: Corporate Information</h2>
            {kycSteps.slice(0, 5).map((step) => {
              const Icon = step.icon
              const isExpanded = expandedStep === step.id
              
              return (
                <div key={step.id} className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 bg-${step.color}-100 rounded-lg`}>
                        <Icon className={`w-5 h-5 text-${step.color}-600`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <div className="pt-4">
                        {step.content}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Section 2: Personal & Financial Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section 2: Personal & Financial Information</h2>
            {kycSteps.slice(5).map((step) => {
              const Icon = step.icon
              const isExpanded = expandedStep === step.id
              
              return (
                <div key={step.id} className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 bg-${step.color}-100 rounded-lg`}>
                        <Icon className={`w-5 h-5 text-${step.color}-600`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <div className="pt-4">
                        {step.content}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Link 
            href="/userB"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Progress
          </button>
        </div>
      </div>
    </div>
  )
} 