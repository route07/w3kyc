'use client'

import { useState } from 'react'
import MockNavigation from '@/components/MockNavigation'
import { 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface KYCSubmission {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  walletAddress?: string
  status: 'pending' | 'approved' | 'rejected' | 'verified' | 'not_started'
  submittedAt: string
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  documents: Array<{
    id: string
    name: string
    type: string
    ipfsHash: string
    status: string
  }>
  blockchainCredentials?: {
    credentialId: string
    issuer: string
    issuedAt: string
    expiresAt: string
    blockchainTx: string
  }
}

interface RiskProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high'
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
  webIntelligence: {
    socialMediaPresence: number
    newsMentions: number
    riskIndicators: string[]
  }
  lastUpdated: string
}

// Mock data for comprehensive admin dashboard
const mockSubmissions: KYCSubmission[] = [
  {
    id: 'sub-001',
    userId: 'user-a-001',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@web3mail.eth',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    status: 'verified',
    submittedAt: '2024-01-15T10:30:00Z',
    riskScore: 12,
    riskLevel: 'low',
    documents: [
      {
        id: 'doc-001',
        name: 'Passport - Alex Chen',
        type: 'passport',
        ipfsHash: 'QmX7K9Y2Z1A8B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9',
        status: 'verified'
      },
      {
        id: 'doc-002',
        name: 'Proof of Address - Utility Bill',
        type: 'address_proof',
        ipfsHash: 'QmY8L0Z2B9C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1',
        status: 'verified'
      }
    ],
    blockchainCredentials: {
      credentialId: 'cred-kyc-001',
      issuer: 'Route07 KYC Authority',
      issuedAt: '2024-01-17T14:22:00Z',
      expiresAt: '2025-01-17T14:22:00Z',
      blockchainTx: '0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef'
    }
  },
  {
    id: 'sub-002',
    userId: 'user-b-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@web3mail.eth',
    status: 'not_started',
    submittedAt: '',
    documents: []
  },
  {
    id: 'sub-003',
    userId: 'user-c-001',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@web3mail.eth',
    walletAddress: '0x8f4e2A1B3C5D7E9F0A2B4C6D8E0F1A3B5C7D9E0F',
    status: 'pending',
    submittedAt: '2024-01-20T09:15:00Z',
    riskScore: 45,
    riskLevel: 'medium',
    documents: [
      {
        id: 'doc-003',
        name: 'Driver License - Michael Rodriguez',
        type: 'driver_license',
        ipfsHash: 'QmZ9M1A3C0D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2',
        status: 'pending'
      }
    ]
  },
  {
    id: 'sub-004',
    userId: 'user-d-001',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@web3mail.eth',
    walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1',
    status: 'approved',
    submittedAt: '2024-01-18T14:30:00Z',
    riskScore: 25,
    riskLevel: 'low',
    documents: [
      {
        id: 'doc-004',
        name: 'Passport - Emma Wilson',
        type: 'passport',
        ipfsHash: 'QmN0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0',
        status: 'verified'
      }
    ]
  },
  {
    id: 'sub-005',
    userId: 'user-e-001',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@web3mail.eth',
    walletAddress: '0x2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3',
    status: 'rejected',
    submittedAt: '2024-01-19T11:45:00Z',
    riskScore: 78,
    riskLevel: 'high',
    documents: [
      {
        id: 'doc-005',
        name: 'ID Card - David Thompson',
        type: 'national_id',
        ipfsHash: 'QmO1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1',
        status: 'rejected'
      }
    ]
  }
]

const mockRiskProfiles: RiskProfile[] = [
  {
    id: 'risk-001',
    userId: 'user-a-001',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@web3mail.eth',
    overallScore: 12,
    riskLevel: 'low',
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
      }
    ],
    aiAnalysis: {
      documentAuthenticity: 95,
      identityConsistency: 98,
      riskIndicators: ['None detected'],
      recommendations: ['Continue monitoring for compliance']
    },
    webIntelligence: {
      socialMediaPresence: 85,
      newsMentions: 0,
      riskIndicators: []
    },
    lastUpdated: '2024-01-17T14:25:00Z'
  },
  {
    id: 'risk-002',
    userId: 'user-c-001',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@web3mail.eth',
    overallScore: 45,
    riskLevel: 'medium',
    riskFactors: [
      {
        factor: 'Address Verification',
        score: 65,
        description: 'Address partially verified, needs additional proof',
        severity: 'medium'
      },
      {
        factor: 'Web Intelligence',
        score: 55,
        description: 'Limited online presence detected',
        severity: 'medium'
      }
    ],
    aiAnalysis: {
      documentAuthenticity: 88,
      identityConsistency: 92,
      riskIndicators: ['Limited address history'],
      recommendations: ['Request additional address verification documents']
    },
    webIntelligence: {
      socialMediaPresence: 45,
      newsMentions: 0,
      riskIndicators: ['Limited online footprint']
    },
    lastUpdated: '2024-01-20T09:20:00Z'
  },
  {
    id: 'risk-003',
    userId: 'user-e-001',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@web3mail.eth',
    overallScore: 78,
    riskLevel: 'high',
    riskFactors: [
      {
        factor: 'Document Authenticity',
        score: 35,
        description: 'Document authenticity concerns detected',
        severity: 'high'
      },
      {
        factor: 'Web Intelligence',
        score: 25,
        description: 'Multiple risk indicators found online',
        severity: 'high'
      }
    ],
    aiAnalysis: {
      documentAuthenticity: 35,
      identityConsistency: 45,
      riskIndicators: ['Document tampering suspected', 'Identity mismatch'],
      recommendations: ['Manual review required', 'Additional verification needed']
    },
    webIntelligence: {
      socialMediaPresence: 15,
      newsMentions: 3,
      riskIndicators: ['Negative news mentions', 'Suspicious online activity']
    },
    lastUpdated: '2024-01-19T12:00:00Z'
  }
]

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>(mockSubmissions)
  const [riskProfiles] = useState<RiskProfile[]>(mockRiskProfiles)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleApprove = async (submissionId: string) => {
    // Mock approval - in real app this would call the API
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, status: 'approved' as const }
        : sub
    ))
    setShowModal(false)
  }

  const handleReject = async (submissionId: string) => {
    // Mock rejection - in real app this would call the API
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, status: 'rejected' as const }
        : sub
    ))
    setShowModal(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending Review', icon: ClockIcon },
      approved: { class: 'status-approved', text: 'Approved', icon: CheckCircleIcon },
      rejected: { class: 'status-rejected', text: 'Rejected', icon: XCircleIcon },
      verified: { class: 'status-verified', text: 'Verified', icon: ShieldCheckIcon },
      not_started: { class: 'status-not-started', text: 'Not Started', icon: ClockIcon }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    
    const Icon = config.icon

    return (
      <span className={`status-badge ${config.class}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    )
  }

  const getRiskLevelBadge = (level: string) => {
    const levelConfig = {
      low: { class: 'bg-green-100 text-green-800', text: 'Low Risk' },
      medium: { class: 'bg-yellow-100 text-yellow-800', text: 'Medium Risk' },
      high: { class: 'bg-red-100 text-red-800', text: 'High Risk' }
    }

    const config = levelConfig[level as keyof typeof levelConfig]

    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
    )
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter
    const matchesSearch = searchTerm === '' || 
      submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    verified: submissions.filter(s => s.status === 'verified').length,
    highRisk: riskProfiles.filter(r => r.riskLevel === 'high').length,
    mediumRisk: riskProfiles.filter(r => r.riskLevel === 'medium').length,
    lowRisk: riskProfiles.filter(r => r.riskLevel === 'low').length
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verified + stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.highRisk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
            <div className="text-sm text-green-600">Low Risk</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
            <div className="text-sm text-yellow-600">Medium Risk</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <div className="text-sm text-red-600">High Risk</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {submissions.slice(0, 5).map((submission) => (
            <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {submission.firstName} {submission.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{submission.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(submission.status)}
                {submission.riskLevel && getRiskLevelBadge(submission.riskLevel)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderKYCSubmissions = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.firstName} {submission.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{submission.email}</div>
                      {submission.walletAddress && (
                        <div className="text-xs text-gray-400 font-mono">
                          {submission.walletAddress.slice(0, 6)}...{submission.walletAddress.slice(-4)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.riskLevel ? getRiskLevelBadge(submission.riskLevel) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.documents.length} docs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderRiskProfiles = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Risk Assessments</h3>
        <div className="space-y-4">
          {riskProfiles.map((profile) => (
            <div key={profile.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getRiskLevelBadge(profile.riskLevel)}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{profile.overallScore}/100</div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Risk Factors</h5>
                  <div className="space-y-2">
                    {profile.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{factor.factor}</span>
                        <span className="font-medium">{factor.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">AI Analysis</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Authenticity</span>
                      <span className="font-medium">{profile.aiAnalysis.documentAuthenticity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Identity Consistency</span>
                      <span className="font-medium">{profile.aiAnalysis.identityConsistency}%</span>
                    </div>
                  </div>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage KYC submissions, risk assessments, and user verification
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'kyc-submissions', name: 'KYC Submissions', icon: UserGroupIcon },
              { id: 'risk-profiles', name: 'Risk Profiles', icon: ShieldCheckIcon }
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
        {activeTab === 'kyc-submissions' && renderKYCSubmissions()}
        {activeTab === 'risk-profiles' && renderRiskProfiles()}

        {/* Detail Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedSubmission.firstName} {selectedSubmission.lastName}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium">{selectedSubmission.email}</p>
                  </div>
                  
                  {selectedSubmission.walletAddress && (
                    <div>
                      <p className="text-sm text-gray-600">Wallet Address</p>
                      <p className="text-sm font-mono">{selectedSubmission.walletAddress}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                  
                  {selectedSubmission.riskLevel && (
                    <div>
                      <p className="text-sm text-gray-600">Risk Level</p>
                      {getRiskLevelBadge(selectedSubmission.riskLevel)}
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600">Documents</p>
                    <div className="space-y-2">
                      {selectedSubmission.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <span className="text-xs text-gray-500">{doc.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedSubmission.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 