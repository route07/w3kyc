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
  PlusIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface UserBData {
  id: string
  firstName: string
  lastName: string
  email: string
  walletAddress?: string
  kycStatus: 'not_started'
  riskScore?: number
  riskLevel?: string
  documents: Array<{
    id: string
    name: string
    type: string
    status: string
    uploadedAt?: string
  }>
  web3Profile: {
    reputationScore: number
    totalTransactions: number
    verifiedDeFiProtocols: string[]
    nftHoldings: number
    governanceParticipation: number
  }
}

const userBData: UserBData = {
  id: 'user-b-001',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@web3mail.eth',
  walletAddress: undefined,
  kycStatus: 'not_started',
  documents: [],
  web3Profile: {
    reputationScore: 0,
    totalTransactions: 0,
    verifiedDeFiProtocols: [],
    nftHoldings: 0,
    governanceParticipation: 0
  }
}

export default function UserBPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Three Colorful Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/kyc/complete" className="group">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Complete KYC</h3>
                  <p className="text-blue-100">Start verification process</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="#dashboard" className="group">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <ChartBarIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">My Dashboard</h3>
                  <p className="text-green-100">View your progress</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="#settings" className="group">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <CogIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Settings</h3>
                  <p className="text-purple-100">Manage preferences</p>
                </div>
              </div>
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <WalletIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Wallet</p>
              <p className="text-sm text-gray-800">Not Connected</p>
            </div>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-lg font-semibold text-gray-800">0</p>
            </div>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reputation</p>
              <p className="text-lg font-semibold text-gray-800">0</p>
            </div>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-lg font-semibold text-gray-800">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <WalletIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="font-medium text-gray-900">Connect Wallet</h4>
              <p className="text-sm text-gray-600">Link your Web3 wallet to start the KYC process</p>
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Connect
            </button>
          </div>

          <div className="flex items-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="font-medium text-gray-900">Submit KYC Documents</h4>
              <p className="text-sm text-gray-600">Upload required identity documents for verification</p>
            </div>
            <Link href="/kyc/complete" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start KYC
            </Link>
          </div>

          <div className="flex items-center p-4 border border-purple-200 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="font-medium text-gray-900">Complete Verification</h4>
              <p className="text-sm text-gray-600">Wait for AI and human review of your documents</p>
            </div>
            <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Benefits of KYC */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of KYC Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Access DeFi Protocols</h4>
              <p className="text-sm text-gray-600">Unlock higher limits and advanced features</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Enhanced Security</h4>
              <p className="text-sm text-gray-600">Protect your assets with verified identity</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Build Reputation</h4>
              <p className="text-sm text-gray-600">Establish trust in the Web3 ecosystem</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Compliance Ready</h4>
              <p className="text-sm text-gray-600">Meet regulatory requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={userBData.firstName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={userBData.lastName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={userBData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input
                type="text"
                value={userBData.walletAddress || 'Not Connected'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-gray-500" />
            <div>
              <h4 className="font-medium text-gray-900">Not Started</h4>
              <p className="text-sm text-gray-600">You haven&apos;t begun the KYC verification process yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <Link href="/kyc/submit" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>Upload Documents</span>
          </Link>
        </div>
        
        {userBData.documents.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h3>
            <p className="text-gray-600 mb-4">Upload your identity documents to start the KYC process</p>
            <Link href="/kyc/submit" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>Start KYC Process</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userBData.documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderWeb3Profile = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Web3 Profile</h3>
        <div className="text-center py-12">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Web3 Profile Locked</h3>
          <p className="text-gray-600 mb-4">Complete KYC verification to unlock your Web3 profile and start building reputation</p>
          <Link href="/kyc/submit" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowRightIcon className="w-4 h-4" />
            <span>Start KYC Process</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What You&apos;ll Unlock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <StarIcon className="w-5 h-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Reputation Score</h4>
            </div>
            <p className="text-sm text-gray-600">Build trust and reputation in the Web3 ecosystem</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <CubeIcon className="w-5 h-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Transaction History</h4>
            </div>
            <p className="text-sm text-gray-600">Track your on-chain activity and interactions</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Verified Protocols</h4>
            </div>
            <p className="text-sm text-gray-600">Access to verified DeFi and governance protocols</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">NFT Holdings</h4>
            </div>
            <p className="text-sm text-gray-600">Display your NFT collection and achievements</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <MockNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <UserIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{userBData.firstName} {userBData.lastName}</h1>
                  <p className="text-gray-600">{userBData.email}</p>
                </div>
                {/* KYC Status Badge */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-bold">KYC Not Started</div>
                      <div className="text-xs text-orange-100">0/100 Risk Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <WalletIcon className="w-4 h-4" />
            <span>Wallet not connected</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'profile', name: 'Profile', icon: UserIcon },
              { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
              { id: 'web3-profile', name: 'Web3 Profile', icon: CubeIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'web3-profile' && renderWeb3Profile()}
      </div>
    </div>
  )
} 