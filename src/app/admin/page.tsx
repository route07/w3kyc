'use client'

import { useState, useEffect } from 'react'
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
    firstName: 'Web3',
    lastName: 'Ventures LLC',
    email: 'alex.chen@web3ventures.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    status: 'verified',
    submittedAt: '2024-01-15T10:30:00Z',
    riskScore: 12,
    riskLevel: 'low',
    documents: [
      {
        id: 'doc-001',
        name: 'Passport - Web3 Ventures LLC',
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
    firstName: 'Crypto',
    lastName: 'Finance Corp',
    email: 'sarah.johnson@cryptofinance.com',
    status: 'not_started',
    submittedAt: '',
    documents: []
  },
  {
    id: 'sub-003',
    userId: 'user-c-001',
    firstName: 'NFT',
    lastName: 'Gaming Studios',
    email: 'michael.rodriguez@nftgaming.com',
    walletAddress: '0x8f4e2A1B3C5D7E9F0A2B4C6D8E0F1A3B5C7D9E0F',
    status: 'pending',
    submittedAt: '2024-01-20T09:15:00Z',
    riskScore: 45,
    riskLevel: 'medium',
    documents: [
      {
        id: 'doc-003',
        name: 'Driver License - NFT Gaming Studios',
        type: 'driver_license',
        ipfsHash: 'QmZ9M1A3C0D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2',
        status: 'pending'
      }
    ]
  },
  {
    id: 'sub-004',
    userId: 'user-d-001',
    firstName: 'DeFi',
    lastName: 'Protocol Labs',
    email: 'emma.wilson@defiprotocol.com',
    walletAddress: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1',
    status: 'approved',
    submittedAt: '2024-01-18T14:30:00Z',
    riskScore: 25,
    riskLevel: 'low',
    documents: [
      {
        id: 'doc-004',
        name: 'Passport - DeFi Protocol Labs',
        type: 'passport',
        ipfsHash: 'QmN0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0',
        status: 'verified'
      }
    ]
  },
  {
    id: 'sub-005',
    userId: 'user-e-001',
    firstName: 'Blockchain',
    lastName: 'Tech Solutions',
    email: 'david.kim@blockchaintech.com',
    walletAddress: '0x2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3',
    status: 'rejected',
    submittedAt: '2024-01-19T11:45:00Z',
    riskScore: 78,
    riskLevel: 'high',
    documents: [
      {
        id: 'doc-005',
        name: 'ID Card - Blockchain Tech Solutions',
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
    firstName: 'Web3',
    lastName: 'Ventures LLC',
    email: 'alex.chen@web3ventures.com',
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
    firstName: 'NFT',
    lastName: 'Gaming Studios',
    email: 'michael.rodriguez@nftgaming.com',
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
    firstName: 'Blockchain',
    lastName: 'Tech Solutions',
    email: 'david.kim@blockchaintech.com',
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
  const [contractStats, setContractStats] = useState<any>(null)
  const [auditStats, setAuditStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContractStats = async () => {
      try {
        setLoading(true)
        
        // Fetch audit statistics from blockchain
        const auditResponse = await fetch('/api/contracts/audit-logs?address=0x0000000000000000000000000000000000000000&limit=1')
        const auditData = await auditResponse.json()
        
        setAuditStats(auditData.auditStats)
        
        // Fetch multisig information
        const multisigResponse = await fetch('/api/contracts/multisig')
        const multisigData = await multisigResponse.json()
        
        setContractStats({
          multisig: multisigData,
          audit: auditData
        })
      } catch (error) {
        console.error('Error fetching contract stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContractStats()
  }, [])
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
      pending: { 
        class: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200', 
        text: 'Pending Review', 
        icon: ClockIcon 
      },
      approved: { 
        class: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200', 
        text: 'Approved', 
        icon: CheckCircleIcon 
      },
      rejected: { 
        class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200', 
        text: 'Rejected', 
        icon: XCircleIcon 
      },
      verified: { 
        class: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200', 
        text: 'Verified', 
        icon: ShieldCheckIcon 
      },
      not_started: { 
        class: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200', 
        text: 'Not Started', 
        icon: ClockIcon 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.class}`}>
        <Icon className="w-3 h-3 mr-2" />
        {config.text}
      </span>
    )
  }

  const getRiskLevelBadge = (level: string) => {
    const levelConfig = {
      low: { 
        class: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200', 
        text: 'Low Risk' 
      },
      medium: { 
        class: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200', 
        text: 'Medium Risk' 
      },
      high: { 
        class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200', 
        text: 'High Risk' 
      }
    }

    const config = levelConfig[level as keyof typeof levelConfig]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.class}`}>
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
    <div className="space-y-8">
      {/* Blockchain Statistics */}
      {loading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <span className="ml-4 text-gray-600 font-medium">Loading blockchain statistics...</span>
          </div>
        </div>
      ) : contractStats && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3" />
              Blockchain Statistics
            </h3>
            <p className="text-indigo-100 mt-1">Real-time blockchain data and analytics</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Audit Logs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {auditStats?.totalLogs ? Number(auditStats.totalLogs).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Blockchain transactions</p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Unique Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {auditStats?.uniqueUsers ? Number(auditStats.uniqueUsers).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active participants</p>
                  </div>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                <div className="relative flex items-center">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Authorized Signers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {contractStats?.multisig?.signerCount || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Multisig signers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Verified</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verified + stats.approved}</p>
              <p className="text-xs text-gray-500 mt-1">Approved users</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">High Risk</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highRisk}</p>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-lg">
              <ExclamationTriangleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <ShieldCheckIcon className="w-8 h-8 mr-3" />
            Risk Distribution
          </h3>
          <p className="text-emerald-100 mt-1">User risk assessment overview</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.lowRisk}</div>
                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Low Risk</div>
                <div className="text-xs text-gray-500 mt-1">Safe & verified</div>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.mediumRisk}</div>
                <div className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Medium Risk</div>
                <div className="text-xs text-gray-500 mt-1">Needs review</div>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-2xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">{stats.highRisk}</div>
                <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">High Risk</div>
                <div className="text-xs text-gray-500 mt-1">Requires attention</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <ClockIcon className="w-8 h-8 mr-3" />
            Recent Activity
          </h3>
          <p className="text-purple-100 mt-1">Latest user submissions and updates</p>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {submissions.slice(0, 5).map((submission, index) => (
              <div key={submission.id} className="group relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {submission.firstName} {submission.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                      {submission.walletAddress && (
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {submission.walletAddress.slice(0, 6)}...{submission.walletAddress.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(submission.status)}
                    {submission.riskLevel && getRiskLevelBadge(submission.riskLevel)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderKYCSubmissions = () => (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FunnelIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <MagnifyingGlassIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md w-full lg:w-80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-3" />
            KYC Submissions
          </h3>
          <p className="text-indigo-100 mt-1">Manage and review user verification requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {submission.firstName} {submission.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{submission.email}</div>
                        {submission.walletAddress && (
                          <div className="text-xs text-gray-400 font-mono mt-1">
                            {submission.walletAddress.slice(0, 6)}...{submission.walletAddress.slice(-4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {submission.riskLevel ? getRiskLevelBadge(submission.riskLevel) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{submission.documents.length}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">docs</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setShowModal(true)
                      }}
                      className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4" />
                        <span className="font-semibold">View</span>
                      </div>
                      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <ShieldCheckIcon className="w-8 h-8 mr-3" />
            AI Risk Assessments
          </h3>
          <p className="text-purple-100 mt-1">Advanced AI-powered risk analysis and profiling</p>
        </div>
        <div className="p-8">
          <div className="space-y-8">
            {riskProfiles.map((profile) => (
              <div key={profile.id} className="group relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h4>
                      <p className="text-lg text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {getRiskLevelBadge(profile.riskLevel)}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{profile.overallScore}/100</div>
                      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Risk Score</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
                    <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-orange-500" />
                      Risk Factors
                    </h5>
                    <div className="space-y-4">
                      {profile.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50">
                          <div>
                            <span className="font-semibold text-gray-900">{factor.factor}</span>
                            <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">{factor.score}%</div>
                            <div className={`text-xs font-semibold uppercase tracking-wide ${
                              factor.severity === 'high' ? 'text-red-600' :
                              factor.severity === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {factor.severity} risk
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
                    <h5 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <ChartBarIcon className="w-6 h-6 mr-3 text-blue-500" />
                      AI Analysis
                    </h5>
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Document Authenticity</span>
                          <span className="text-2xl font-bold text-blue-600">{profile.aiAnalysis.documentAuthenticity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${profile.aiAnalysis.documentAuthenticity}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Identity Consistency</span>
                          <span className="text-2xl font-bold text-emerald-600">{profile.aiAnalysis.identityConsistency}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${profile.aiAnalysis.identityConsistency}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Social Media Presence</span>
                          <span className="text-2xl font-bold text-purple-600">{profile.webIntelligence.socialMediaPresence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${profile.webIntelligence.socialMediaPresence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <MockNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <ChartBarIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                  <p className="text-indigo-100 text-lg">
                    Comprehensive KYC management and monitoring system
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-3xl">
                Manage KYC submissions, risk assessments, user verification, and blockchain analytics 
                in a secure, decentralized environment.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 mb-8 p-2">
          <nav className="flex space-x-2">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon, color: 'from-blue-500 to-indigo-600' },
              { id: 'kyc-submissions', name: 'KYC Submissions', icon: UserGroupIcon, color: 'from-emerald-500 to-green-600' },
              { id: 'risk-profiles', name: 'Risk Profiles', icon: ShieldCheckIcon, color: 'from-purple-500 to-pink-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-3 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                )}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">
                        {selectedSubmission.firstName} {selectedSubmission.lastName}
                      </h3>
                      <p className="text-indigo-100 text-lg">{selectedSubmission.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-200"
                  >
                    <XCircleIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Email Address</p>
                          <p className="text-lg font-medium text-gray-900">{selectedSubmission.email}</p>
                        </div>
                        {selectedSubmission.walletAddress && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Wallet Address</p>
                            <p className="text-lg font-mono text-gray-900 break-all">{selectedSubmission.walletAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        Verification Status
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-700">Status</span>
                          {getStatusBadge(selectedSubmission.status)}
                        </div>
                        {selectedSubmission.riskLevel && (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-700">Risk Level</span>
                            {getRiskLevelBadge(selectedSubmission.riskLevel)}
                          </div>
                        )}
                        {selectedSubmission.riskScore && (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-700">Risk Score</span>
                            <span className="text-2xl font-bold text-gray-900">{selectedSubmission.riskScore}/100</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        Documents ({selectedSubmission.documents.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedSubmission.documents.length > 0 ? (
                          selectedSubmission.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                              <div>
                                <span className="font-semibold text-gray-900">{doc.name}</span>
                                <p className="text-sm text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedSubmission.blockchainCredentials && (
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/50">
                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                          Blockchain Credentials
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Credential ID</p>
                            <p className="text-lg font-mono text-gray-900">{selectedSubmission.blockchainCredentials.credentialId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Issuer</p>
                            <p className="text-lg font-medium text-gray-900">{selectedSubmission.blockchainCredentials.issuer}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Issued At</p>
                            <p className="text-lg text-gray-900">
                              {new Date(selectedSubmission.blockchainCredentials.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedSubmission.id)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission.id)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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