'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  WalletIcon
} from '@heroicons/react/24/outline'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  walletAddress?: string
  kycStatus: 'not_started' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'verified' | 'expired'
  kycSubmittedAt?: string
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  documents: Array<{
    id: string
    name: string
    type: string
    status: string
    uploadedAt: string
  }>
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        console.error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_started: { class: 'status-not-started', text: 'Not Started', icon: ClockIcon },
      pending: { class: 'status-pending', text: 'Pending Review', icon: ClockIcon },
      approved: { class: 'status-approved', text: 'Approved', icon: CheckCircleIcon },
      rejected: { class: 'status-rejected', text: 'Rejected', icon: XCircleIcon },
      verified: { class: 'status-verified', text: 'Verified', icon: ShieldCheckIcon },
      in_progress: { class: 'status-in-progress', text: 'In Progress', icon: ClockIcon },
      expired: { class: 'status-expired', text: 'Expired', icon: XCircleIcon }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    
    // Safety check for unknown status
    if (!config) {
      return (
        <span className="status-badge status-unknown">
          <ClockIcon className="w-4 h-4 mr-1" />
          {status || 'Unknown'}
        </span>
      )
    }

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">KYC Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {userData?.kycStatus ? getStatusBadge(userData.kycStatus) : 'Not Submitted'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {userData?.riskScore ? `${userData.riskScore}/100` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-lg font-semibold text-gray-900">
                {userData?.documents?.length || 0} uploaded
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData?.kycStatus === 'pending' && (
            <Link href="/kyc/status" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Check KYC Status</p>
                <p className="text-sm text-gray-600">View your verification progress</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
          )}

          {(userData?.kycStatus === 'not_started' || userData?.kycStatus === 'rejected') && (
            <Link href="/kyc/submit" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Submit KYC</p>
                <p className="text-sm text-gray-600">Complete your verification</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
          )}

          <Link href="/risk-profile" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Risk Profile</p>
              <p className="text-sm text-gray-600">Check your AI risk assessment</p>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>

          <Link href="/documents" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Documents</p>
              <p className="text-sm text-gray-600">View and update your documents</p>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {userData?.kycSubmittedAt && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">KYC submitted for review</p>
                <p className="text-xs text-gray-500">
                  {new Date(userData.kycSubmittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          
          {userData?.documents?.map((doc, index) => (
            <div key={doc.id} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{doc.name} uploaded</p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <p className="text-gray-900">{userData?.firstName} {userData?.lastName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-900">{userData?.email}</p>
          </div>
          
          {userData?.walletAddress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <WalletIcon className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 font-mono text-sm">
                  {userData.walletAddress.slice(0, 6)}...{userData.walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
            <div>{userData?.kycStatus ? getStatusBadge(userData.kycStatus) : 'Not Submitted'}</div>
          </div>
        </div>
      </div>

      {userData?.riskScore && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userData.riskScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{userData.riskScore}/100</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <div>{userData.riskLevel ? getRiskLevelBadge(userData.riskLevel) : 'Not assessed'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <Link href="/kyc/submit" className="btn-primary">
          Upload New Document
        </Link>
      </div>

      {userData?.documents && userData.documents.length > 0 ? (
        <div className="card">
          <div className="space-y-4">
            {userData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`status-badge ${doc.status === 'verified' ? 'status-verified' : 'status-pending'}`}>
                  {doc.status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-600 mb-6">Upload your identity documents to complete KYC verification</p>
          <Link href="/kyc/submit" className="btn-primary">
            Upload Documents
          </Link>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userData?.firstName}! Here&apos;s your KYC verification status.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'profile', name: 'Profile', icon: UserIcon },
              { id: 'documents', name: 'Documents', icon: DocumentTextIcon }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'documents' && renderDocuments()}
      </div>
    </div>
  )
} 