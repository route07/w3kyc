'use client'

import { useState } from 'react'
import MockNavigation from '@/components/MockNavigation'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  WalletIcon,
  UserIcon,
  CubeIcon,
  ArrowRightIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface UserAData {
  id: string
  firstName: string
  lastName: string
  email: string
  walletAddress: string
  kycStatus: 'verified'
  kycSubmittedAt: string
  kycVerifiedAt: string
  riskScore: number
  riskLevel: 'low'
  documents: Array<{
    id: string
    name: string
    type: string
    status: string
    uploadedAt: string
    ipfsHash: string
    blockchainTx: string
  }>
  blockchainCredentials: {
    credentialId: string
    issuer: string
    issuedAt: string
    expiresAt: string
    blockchainTx: string
    smartContractAddress: string
    credentialHash: string
  }
  riskProfile: {
    overallScore: number
    riskFactors: Array<{
      factor: string
      score: number
      description: string
      severity: 'low' | 'medium' | 'high'
    }>
    aiAnalysis: {
      documentAuthenticity: number
      identityConsistency: number
      riskIndicators: string[]
      recommendations: string[]
    }
  }
  activityHistory: Array<{
    id: string
    action: string
    timestamp: string
    blockchainTx?: string
    status: string
  }>
  web3Profile: {
    reputationScore: number
    totalTransactions: number
    verifiedDeFiProtocols: string[]
    nftHoldings: number
    governanceParticipation: number
  }
}

const userAData: UserAData = {
  id: 'user-a-001',
  firstName: 'Alex',
  lastName: 'Chen',
  email: 'alex.chen@web3mail.eth',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  kycStatus: 'verified',
  kycSubmittedAt: '2024-01-15T10:30:00Z',
  kycVerifiedAt: '2024-01-17T14:22:00Z',
  riskScore: 12,
  riskLevel: 'low',
  documents: [
    {
      id: 'doc-001',
      name: 'Passport - Alex Chen',
      type: 'passport',
      status: 'verified',
      uploadedAt: '2024-01-15T10:30:00Z',
      ipfsHash: 'QmX7K9Y2Z1A8B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9',
      blockchainTx: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      id: 'doc-002',
      name: 'Proof of Address - Utility Bill',
      type: 'address_proof',
      status: 'verified',
      uploadedAt: '2024-01-15T10:35:00Z',
      ipfsHash: 'QmY8L0Z2B9C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1',
      blockchainTx: '0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      id: 'doc-003',
      name: 'Selfie Verification',
      type: 'selfie',
      status: 'verified',
      uploadedAt: '2024-01-15T10:40:00Z',
      ipfsHash: 'QmZ9M1A3C0D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2',
      blockchainTx: '0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef'
    }
  ],
  blockchainCredentials: {
    credentialId: 'cred-kyc-001',
    issuer: 'Route07 KYC Authority',
    issuedAt: '2024-01-17T14:22:00Z',
    expiresAt: '2025-01-17T14:22:00Z',
    blockchainTx: '0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef',
    smartContractAddress: '0x9876543210fedcba9876543210fedcba9876543210',
    credentialHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  riskProfile: {
    overallScore: 12,
    riskFactors: [
      {
        factor: 'Document Authenticity',
        score: 95,
        description: 'All documents verified as authentic',
        severity: 'low'
      },
      {
        factor: 'Identity Consistency',
        score: 98,
        description: 'Perfect match across all identity documents',
        severity: 'low'
      },
      {
        factor: 'Address Verification',
        score: 92,
        description: 'Address confirmed through multiple sources',
        severity: 'low'
      },
      {
        factor: 'Web Intelligence',
        score: 88,
        description: 'Clean online presence, no red flags',
        severity: 'low'
      }
    ],
    aiAnalysis: {
      documentAuthenticity: 95,
      identityConsistency: 98,
      riskIndicators: ['None detected'],
      recommendations: ['Continue monitoring for compliance', 'Renew KYC before expiration']
    }
  },
  activityHistory: [
    {
      id: 'act-001',
      action: 'KYC Verification Completed',
      timestamp: '2024-01-17T14:22:00Z',
      blockchainTx: '0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'completed'
    },
    {
      id: 'act-002',
      action: 'Credential Minted on Blockchain',
      timestamp: '2024-01-17T14:23:00Z',
      blockchainTx: '0x5678901234ef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'completed'
    },
    {
      id: 'act-003',
      action: 'Risk Assessment Completed',
      timestamp: '2024-01-17T14:25:00Z',
      status: 'completed'
    },
    {
      id: 'act-004',
      action: 'Documents Uploaded',
      timestamp: '2024-01-15T10:40:00Z',
      status: 'completed'
    },
    {
      id: 'act-005',
      action: 'KYC Application Submitted',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed'
    }
  ],
  web3Profile: {
    reputationScore: 850,
    totalTransactions: 1247,
    verifiedDeFiProtocols: ['Uniswap', 'Aave', 'Compound', 'Curve'],
    nftHoldings: 23,
    governanceParticipation: 15
  }
}

export default function UserAPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Three Colorful Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/kyc/complete/userA" className="group">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <ShieldCheckIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Check KYC</h3>
                  <p className="text-blue-100">View verification status</p>
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
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WalletIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Wallet</p>
              <p className="text-sm font-mono text-blue-800">{truncateHash(userAData.walletAddress)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Documents</p>
              <p className="text-lg font-semibold text-purple-800">{userAData.documents.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Reputation</p>
              <p className="text-lg font-semibold text-orange-800">{userAData.web3Profile.reputationScore}</p>
            </div>
          </div>
        </div>

        <div className="card bg-indigo-50 border-indigo-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-indigo-600">Transactions</p>
              <p className="text-lg font-semibold text-indigo-800">{userAData.web3Profile.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Credential */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Credential</h3>
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Credential ID</p>
              <p className="font-mono text-sm text-gray-900">{userAData.blockchainCredentials.credentialId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Issuer</p>
              <p className="text-sm text-gray-900">{userAData.blockchainCredentials.issuer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="text-sm text-gray-900">{formatDate(userAData.blockchainCredentials.issuedAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Expires</p>
              <p className="text-sm text-gray-900">{formatDate(userAData.blockchainCredentials.expiresAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-600">Transaction Hash</p>
              <p className="font-mono text-sm text-gray-900">{truncateHash(userAData.blockchainCredentials.blockchainTx)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {userAData.activityHistory.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-600">{formatDate(activity.timestamp)}</p>
              </div>
              {activity.blockchainTx && (
                <div className="text-xs text-gray-500 font-mono">
                  {truncateHash(activity.blockchainTx)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderRiskProfile = () => (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Low Risk</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-800">{userAData.riskProfile.overallScore}/100</p>
              <p className="text-green-600">Overall Risk Score</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600">Document Authenticity</div>
              <div className="text-lg font-semibold text-green-800">{userAData.riskProfile.aiAnalysis.documentAuthenticity}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
        <div className="space-y-4">
          {userAData.riskProfile.riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">{factor.factor}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(factor.severity)}`}>
                    {factor.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{factor.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{factor.score}%</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Identity Consistency</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-800">{userAData.riskProfile.aiAnalysis.identityConsistency}%</div>
              <p className="text-sm text-blue-600">Perfect match across documents</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {userAData.riskProfile.aiAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified Documents</h3>
        <div className="space-y-4">
          {userAData.documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Verified
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">IPFS Hash</p>
                  <p className="font-mono text-gray-900">{truncateHash(doc.ipfsHash)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Blockchain TX</p>
                  <p className="font-mono text-gray-900">{truncateHash(doc.blockchainTx)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Uploaded</p>
                  <p className="text-gray-900">{formatDate(doc.uploadedAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWeb3Profile = () => (
    <div className="space-y-6">
      {/* Web3 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Web3 Reputation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Reputation Score</span>
              <span className="text-2xl font-bold text-blue-600">{userAData.web3Profile.reputationScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="text-lg font-semibold text-gray-900">{userAData.web3Profile.totalTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">NFT Holdings</span>
              <span className="text-lg font-semibold text-gray-900">{userAData.web3Profile.nftHoldings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Governance Participation</span>
              <span className="text-lg font-semibold text-gray-900">{userAData.web3Profile.governanceParticipation}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified DeFi Protocols</h3>
          <div className="space-y-2">
            {userAData.web3Profile.verifiedDeFiProtocols.map((protocol, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900">{protocol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blockchain Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Activity</h3>
        <div className="space-y-3">
          {userAData.activityHistory.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1 bg-blue-100 rounded">
                <CubeIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-600">{formatDate(activity.timestamp)}</p>
              </div>
              {activity.blockchainTx && (
                <div className="text-xs text-gray-500 font-mono">
                  {truncateHash(activity.blockchainTx)}
                </div>
              )}
            </div>
          ))}
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
              <div className="p-3 bg-green-100 rounded-full">
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{userAData.firstName} {userAData.lastName}</h1>
                  <p className="text-gray-600">{userAData.email}</p>
                </div>
                {/* KYC Status Badge */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-4 py-2 text-white">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-bold">KYC Verified</div>
                      <div className="text-xs text-green-100">{userAData.riskScore}/100 Risk Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <WalletIcon className="w-4 h-4" />
            <span className="font-mono">{userAData.walletAddress}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'risk-profile', name: 'Risk Profile', icon: ShieldCheckIcon },
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
        {activeTab === 'risk-profile' && renderRiskProfile()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'web3-profile' && renderWeb3Profile()}
      </div>
    </div>
  )
} 