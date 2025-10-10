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

export default function KYCCompleteUserAPage() {
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
      status: 'completed',
      icon: CurrencyDollarIcon,
      color: 'green',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investor Type</label>
              <input type="text" value="Accredited Investor" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
              <input type="text" value="Advanced (5+ years)" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Investment Budget</label>
              <input type="text" value="$100,000 - $500,000" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
              <input type="text" value="Aggressive" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Investor profile verified</span>
          </div>
        </div>
      )
    },
    {
      id: 'eligibility-questionnaire',
      title: 'Eligibility Questionnaire',
      description: 'Compliance and regulatory requirements',
      status: 'completed',
      icon: ShieldCheckIcon,
      color: 'red',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
              <label className="text-sm text-gray-700">
                I confirm that I am not a politically exposed person (PEP) or related to a PEP
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
              <label className="text-sm text-gray-700">
                I confirm that I am not subject to any sanctions or restrictions
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
              <label className="text-sm text-gray-700">
                I understand and agree to comply with all applicable regulations
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
              <label className="text-sm text-gray-700">
                I consent to the collection and processing of my personal data for KYC purposes
              </label>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">All eligibility requirements met</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'institution-details',
      title: 'Institution Details',
      description: 'Organization and business information',
      status: 'completed',
      icon: BuildingOfficeIcon,
      color: 'indigo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
              <input type="text" value="Web3 Ventures LLC" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input type="text" value="LLC-2024-001234" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input type="text" value="Fintech/DeFi" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Registration</label>
              <input type="text" value="United States" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Institution details verified</span>
          </div>
        </div>
      )
    },
    {
      id: 'ubo-declaration',
      title: 'UBO Declaration',
      description: 'Ultimate beneficial ownership information',
      status: 'completed',
      icon: UserIcon,
      color: 'orange',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">UBO Information Verified</h4>
                <p className="text-sm text-green-700">All ultimate beneficial owners confirmed</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Alex Chen - 60% ownership</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Sarah Johnson - 25% ownership</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Michael Rodriguez - 15% ownership</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'directors-declaration',
      title: 'Directors Declaration',
      description: 'Board member and executive information',
      status: 'completed',
      icon: UserIcon,
      color: 'yellow',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Directors Information Verified</h4>
                <p className="text-sm text-green-700">All board members and executives confirmed</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Alex Chen - CEO & Founder</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Sarah Johnson - CTO</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Michael Rodriguez - CFO</span>
            </div>
          </div>
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
              <input type="text" value="Alex" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value="Chen" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value="alex.chen@web3mail.eth" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value="+1 (555) 987-6543" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
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
      status: 'completed',
      icon: IdentificationIcon,
      color: 'purple',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Passport Verified</h4>
                <p className="text-sm text-green-700">Document authenticity confirmed</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Proof of Address Verified</h4>
                <p className="text-sm text-green-700">Utility bill confirmed</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">All identity documents verified</span>
          </div>
        </div>
      )
    },
    {
      id: 'source-of-funds',
      title: 'Source of Funds',
      description: 'Fund origin and verification',
      status: 'completed',
      icon: BanknotesIcon,
      color: 'emerald',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Source of Funds</label>
              <input type="text" value="Business Income" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income Range</label>
              <input type="text" value="$250,000 - $500,000" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Documentation</label>
            <textarea 
              value="Funds primarily derived from successful Web3 consulting business and previous technology investments. All sources verified through bank statements and tax returns."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              rows={3}
              readOnly
            />
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Source of funds verified</span>
          </div>
        </div>
      )
    },
    {
      id: 'bank-details',
      title: 'Bank Details',
      description: 'Banking and payment information',
      status: 'completed',
      icon: BanknotesIcon,
      color: 'teal',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input type="text" value="Chase Bank" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <input type="text" value="Business Account" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (Last 4 digits)</label>
              <input type="text" value="****5678" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
              <input type="text" value="021000021" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Bank details verified and secure</span>
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
              <h1 className="text-3xl font-bold text-gray-900">KYC Verification Status</h1>
              <p className="text-gray-600 mt-2">Your identity verification is complete</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-2xl font-bold text-gray-900">9/9</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">100%</span>
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
            href="/userA"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">Verification Complete</span>
          </div>
        </div>
      </div>
    </div>
  )
} 