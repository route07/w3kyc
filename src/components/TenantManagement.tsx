'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  WalletIcon,
  ClockIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface TenantConfig {
  tenantId: string
  name: string
  requiredCredentials: string[]
  maxRiskScore: number
  allowedJurisdictions: string[]
  isActive: boolean
  createdAt: number
  admin: string
  customFields: string[]
}

interface CredentialType {
  credentialTypeId: string
  name: string
  description: string
  category: 'IDENTITY' | 'FINANCIAL' | 'PROFESSIONAL' | 'COMPLIANCE' | 'CUSTOM'
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'SUSPENDED'
  defaultValidityPeriod: number
  requiresBiometric: boolean
  requiresDocumentProof: boolean
  requiresThirdPartyVerification: boolean
  requiredFields: string[]
  optionalFields: string[]
  maxIssuanceCount: number
  creationTimestamp: number
  createdBy: string
  version: string
}

interface AuditEntry {
  user: string
  action: string
  details: string
  timestamp: number
  tenantId: string
  jurisdiction: string
}

export default function TenantManagement() {
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [tenants, setTenants] = useState<TenantConfig[]>([])
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'credentials' | 'audit' | 'settings'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      loadTenantSpecificData(selectedTenant)
    }
  }, [selectedTenant])

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
          isActive: true,
          createdAt: Date.now() - 86400000 * 30,
          admin: '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
          customFields: ['employmentStatus', 'incomeRange']
        },
        {
          tenantId: 'tenant-002',
          name: 'Crypto Exchange Ltd',
          requiredCredentials: ['kyc-identity', 'compliance-check'],
          maxRiskScore: 50,
          allowedJurisdictions: ['US', 'CA', 'AU'],
          isActive: true,
          createdAt: Date.now() - 86400000 * 15,
          admin: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          customFields: ['tradingVolume', 'riskTolerance']
        }
      ]

      const mockCredentialTypes: CredentialType[] = [
        {
          credentialTypeId: 'kyc-identity',
          name: 'KYC Identity Verification',
          description: 'Identity verification credential for KYC compliance',
          category: 'IDENTITY',
          status: 'ACTIVE',
          defaultValidityPeriod: 365,
          requiresBiometric: false,
          requiresDocumentProof: true,
          requiresThirdPartyVerification: true,
          requiredFields: ['fullName', 'dateOfBirth', 'nationality'],
          optionalFields: ['middleName', 'previousName'],
          maxIssuanceCount: 1,
          creationTimestamp: Date.now() - 86400000 * 60,
          createdBy: '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
          version: '1.0.0'
        },
        {
          credentialTypeId: 'financial-status',
          name: 'Financial Status Verification',
          description: 'Financial status and income verification',
          category: 'FINANCIAL',
          status: 'ACTIVE',
          defaultValidityPeriod: 180,
          requiresBiometric: false,
          requiresDocumentProof: true,
          requiresThirdPartyVerification: true,
          requiredFields: ['income', 'employmentStatus'],
          optionalFields: ['employer', 'bankStatements'],
          maxIssuanceCount: 3,
          creationTimestamp: Date.now() - 86400000 * 45,
          createdBy: '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
          version: '1.0.0'
        },
        {
          credentialTypeId: 'compliance-check',
          name: 'Compliance Verification',
          description: 'Regulatory compliance and sanctions screening',
          category: 'COMPLIANCE',
          status: 'ACTIVE',
          defaultValidityPeriod: 90,
          requiresBiometric: false,
          requiresDocumentProof: false,
          requiresThirdPartyVerification: true,
          requiredFields: ['sanctionsCheck', 'pepCheck'],
          optionalFields: ['additionalScreening'],
          maxIssuanceCount: 5,
          creationTimestamp: Date.now() - 86400000 * 30,
          createdBy: '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
          version: '1.0.0'
        }
      ]

      setTenants(mockTenants)
      setCredentialTypes(mockCredentialTypes)
      
      if (mockTenants.length > 0) {
        setSelectedTenant(mockTenants[0].tenantId)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTenantSpecificData = async (tenantId: string) => {
    try {
      // Mock audit logs
      const mockAuditLogs: AuditEntry[] = [
        {
          user: '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
          action: 'KYC_VERIFIED',
          details: 'KYC verified with risk score: 25',
          timestamp: Date.now() - 3600000,
          tenantId: tenantId,
          jurisdiction: 'US'
        },
        {
          user: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          action: 'WALLET_LINKED',
          details: 'Wallet linked: 0x1234...5678',
          timestamp: Date.now() - 7200000,
          tenantId: tenantId,
          jurisdiction: 'EU'
        },
        {
          user: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          action: 'KYC_STATUS_UPDATED',
          details: 'KYC status updated to inactive: Compliance review required',
          timestamp: Date.now() - 10800000,
          tenantId: tenantId,
          jurisdiction: 'UK'
        }
      ]
      setAuditLogs(mockAuditLogs)
    } catch (error) {
      console.error('Error loading tenant data:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      IDENTITY: 'bg-blue-100 text-blue-800',
      FINANCIAL: 'bg-green-100 text-green-800',
      PROFESSIONAL: 'bg-purple-100 text-purple-800',
      COMPLIANCE: 'bg-orange-100 text-orange-800',
      CUSTOM: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DEPRECATED: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tenant Management</h2>
            <p className="text-sm text-gray-500">Multi-tenant KYC system administration</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {tenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.name} ({tenant.tenantId})
                </option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'users', name: 'Users', icon: UserGroupIcon },
            { id: 'credentials', name: 'Credentials', icon: DocumentTextIcon },
            { id: 'audit', name: 'Audit Logs', icon: ShieldCheckIcon },
            { id: 'settings', name: 'Settings', icon: CogIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Tenant Info */}
            {selectedTenant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tenant Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium font-mono">{selectedTenant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admin:</span>
                      <span className="font-medium font-mono">{formatAddress(tenants.find(t => t.tenantId === selectedTenant)?.admin || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tenants.find(t => t.tenantId === selectedTenant)?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenants.find(t => t.tenantId === selectedTenant)?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Risk Score:</span>
                      <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.maxRiskScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Credentials:</span>
                      <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.requiredCredentials.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jurisdictions:</span>
                      <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.allowedJurisdictions.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custom Fields:</span>
                      <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.customFields.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">1,250</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">1,180</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Verifications</p>
                    <p className="text-2xl font-bold text-purple-900">3,450</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-900">70</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Credential Types</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Credential Type
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {credentialTypes.map((credential) => (
                <div key={credential.credentialTypeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{credential.name}</h4>
                      <p className="text-sm text-gray-500">{credential.credentialTypeId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                      {credential.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{credential.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(credential.category)}`}>
                        {credential.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Validity:</span>
                      <span className="font-medium">{credential.defaultValidityPeriod} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Required Fields:</span>
                      <span className="font-medium">{credential.requiredFields.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Document Proof:</span>
                      <span className="font-medium">{credential.requiresDocumentProof ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Biometric:</span>
                      <span className="font-medium">{credential.requiresBiometric ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center">
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>All Actions</option>
                  <option>KYC_VERIFIED</option>
                  <option>WALLET_LINKED</option>
                  <option>KYC_STATUS_UPDATED</option>
                </select>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                  Export
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurisdiction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatAddress(log.user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-1" />
                          {log.jurisdiction}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Tenant Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Risk Management</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Risk Score
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={tenants.find(t => t.tenantId === selectedTenant)?.maxRiskScore}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto-Expiry Period (days)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue="365"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Compliance</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Jurisdictions
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={tenants.find(t => t.tenantId === selectedTenant)?.allowedJurisdictions.join(', ')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Credentials
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={tenants.find(t => t.tenantId === selectedTenant)?.requiredCredentials.join(', ')}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
