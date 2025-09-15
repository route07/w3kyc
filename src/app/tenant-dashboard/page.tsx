'use client'

import { useState, useEffect } from 'react'
import { KYCService } from '@/lib/kyc-service'
import { getNetworkInfo } from '@/lib/blockchain'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  WalletIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
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

interface TenantStats {
  totalUsers: number
  activeUsers: number
  totalVerifications: number
  lastActivity: number
}

interface TenantLimits {
  maxUsers: number
  maxVerificationsPerDay: number
  maxVerificationsPerMonth: number
  maxStorageGB: number
}

interface KYCData {
  isVerified: boolean
  isActive: boolean
  isExpired: boolean
  verificationHash?: string
  riskScore?: number
  jurisdiction?: string
  tenantId?: string
  expiresAt?: number
}

export default function TenantDashboardPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [tenants, setTenants] = useState<TenantConfig[]>([])
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null)
  const [tenantLimits, setTenantLimits] = useState<TenantLimits | null>(null)
  const [tenantUsers, setTenantUsers] = useState<string[]>([])
  const [userKYCData, setUserKYCData] = useState<Record<string, KYCData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingKYCData, setIsLoadingKYCData] = useState(false)
  const [blockchainConnected, setBlockchainConnected] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    checkBlockchainConnection()
    loadTenants()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      loadTenantData(selectedTenant)
    }
  }, [selectedTenant])

  const checkBlockchainConnection = async () => {
    try {
      const network = await getNetworkInfo()
      setNetworkInfo(network)
      setBlockchainConnected(true)
    } catch (error) {
      console.error('Blockchain connection failed:', error)
      setBlockchainConnected(false)
    }
  }

  const loadTenants = async () => {
    try {
      // Mock data for demonstration - in real implementation, this would call smart contracts
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
        },
        {
          tenantId: 'tenant-003',
          name: 'Real Estate Platform',
          requiredCredentials: ['kyc-identity', 'professional-license'],
          maxRiskScore: 60,
          allowedJurisdictions: ['US', 'UK'],
          isActive: false,
          createdAt: Date.now() - 86400000 * 7,
          admin: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          customFields: ['propertyType', 'investmentAmount']
        }
      ]
      setTenants(mockTenants)
      if (mockTenants.length > 0) {
        setSelectedTenant(mockTenants[0].tenantId)
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTenantData = async (tenantId: string) => {
    setIsLoadingKYCData(true)
    try {
      // Mock data for demonstration
      const mockStats: TenantStats = {
        totalUsers: 1250,
        activeUsers: 1180,
        totalVerifications: 3450,
        lastActivity: Date.now() - 3600000
      }

      const mockLimits: TenantLimits = {
        maxUsers: 10000,
        maxVerificationsPerDay: 1000,
        maxVerificationsPerMonth: 30000,
        maxStorageGB: 100
      }

      const mockUsers = [
        '0xf39Fd6e51aad88f6f4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
      ]

      setTenantStats(mockStats)
      setTenantLimits(mockLimits)
      setTenantUsers(mockUsers)

      // Load KYC data for each user
      const kycData: Record<string, KYCData> = {}
      for (const user of mockUsers) {
        try {
          const status = await KYCService.getKYCStatus(user)
          kycData[user] = {
            isVerified: status.isVerified || false,
            isActive: status.isActive || false,
            isExpired: status.isExpired || false,
            verificationHash: status.verificationHash,
            riskScore: status.riskScore,
            jurisdiction: status.jurisdiction,
            tenantId: status.tenantId,
            expiresAt: status.expiresAt
          }
        } catch (error) {
          console.error(`Error loading KYC data for ${user}:`, error)
          kycData[user] = { 
            isVerified: false, 
            isActive: false, 
            isExpired: true,
            verificationHash: undefined,
            riskScore: undefined,
            jurisdiction: undefined,
            tenantId: undefined,
            expiresAt: undefined
          }
        }
      }
      setUserKYCData(kycData)
    } catch (error) {
      console.error('Error loading tenant data:', error)
    } finally {
      setIsLoadingKYCData(false)
    }
  }

  const getStatusColor = (isVerified: boolean, isActive: boolean, isExpired: boolean) => {
    if (!isVerified) return 'text-red-600 bg-red-100'
    if (isExpired) return 'text-yellow-600 bg-yellow-100'
    if (isActive) return 'text-green-600 bg-green-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getStatusText = (isVerified: boolean, isActive: boolean, isExpired: boolean) => {
    if (!isVerified) return 'Not Verified'
    if (isExpired) return 'Expired'
    if (isActive) return 'Active'
    return 'Inactive'
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Multi-tenant KYC management system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 rounded-lg ${blockchainConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <CubeIcon className={`w-5 h-5 mr-2 ${blockchainConnected ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${blockchainConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {blockchainConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                New Tenant
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tenant Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenants</h2>
              <div className="space-y-2">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.tenantId}
                    onClick={() => setSelectedTenant(tenant.tenantId)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTenant === tenant.tenantId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.tenantId}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${tenant.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedTenant && (
              <>
                {/* Tenant Overview */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tenants.find(t => t.tenantId === selectedTenant)?.name}
                      </h2>
                      <p className="text-gray-500">Tenant ID: {selectedTenant}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <CogIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  {tenantStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-8 h-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Users</p>
                            <p className="text-2xl font-bold text-blue-900">{tenantStats.totalUsers.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-8 h-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Active Users</p>
                            <p className="text-2xl font-bold text-green-900">{tenantStats.activeUsers.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-8 h-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Verifications</p>
                            <p className="text-2xl font-bold text-purple-900">{tenantStats.totalVerifications.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <ChartBarIcon className="w-8 h-8 text-orange-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-orange-600">Last Activity</p>
                            <p className="text-sm font-bold text-orange-900">{formatDate(tenantStats.lastActivity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tenant Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
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
                          <span className="text-gray-600">Allowed Jurisdictions:</span>
                          <span className="font-medium">{tenants.find(t => t.tenantId === selectedTenant)?.allowedJurisdictions.join(', ')}</span>
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Limits</h3>
                      {tenantLimits && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Max Users:</span>
                            <span className="font-medium">{tenantLimits.maxUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Daily Verifications:</span>
                            <span className="font-medium">{tenantLimits.maxVerificationsPerDay.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Verifications:</span>
                            <span className="font-medium">{tenantLimits.maxVerificationsPerMonth.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Storage Limit:</span>
                            <span className="font-medium">{tenantLimits.maxStorageGB} GB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                  </div>
                  {isLoadingKYCData ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading user KYC data...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              KYC Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Risk Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jurisdiction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tenantUsers.map((user) => {
                            const kycData = userKYCData[user] || { isVerified: false, isActive: false, isExpired: true }
                            return (
                              <tr key={user} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <WalletIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="text-sm font-medium text-gray-900 font-mono">
                                      {formatAddress(user)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kycData.isVerified, kycData.isActive, kycData.isExpired)}`}>
                                    {getStatusText(kycData.isVerified, kycData.isActive, kycData.isExpired)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {kycData.riskScore !== undefined ? `${kycData.riskScore}%` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {kycData.jurisdiction || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-900">
                                      <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button className="text-green-600 hover:text-green-900">
                                      <CheckCircleIcon className="w-4 h-4" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                      <XCircleIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
