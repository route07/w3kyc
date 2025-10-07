'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CubeIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { getContractAddresses, getNetworkInfo, provider } from '@/lib/blockchain'

interface ContractStatus {
  name: string
  address: string
  status: 'deployed' | 'error'
  owner?: string
  version?: string
  error?: string
}

interface NetworkStatus {
  chainId: bigint
  name: string
  blockNumber: number
  gasPrice?: bigint
}

export default function BlockchainStatusPage() {
  const [contracts, setContracts] = useState<ContractStatus[]>([])
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const checkContractStatus = async () => {
    setLoading(true)
    try {
      const addresses = getContractAddresses()
      const contractStatuses: ContractStatus[] = []
      
      // Check each contract
      for (const [name, address] of Object.entries(addresses)) {
        try {
          const contract = new (await import('ethers')).Contract(
            address,
            ['function owner() view returns (address)', 'function VERSION() view returns (uint256)'],
            provider
          )
          
          const [owner, version] = await Promise.all([
            contract.owner().catch(() => null),
            contract.VERSION().catch(() => null)
          ])
          
          contractStatuses.push({
            name,
            address,
            status: 'deployed',
            owner: owner || undefined,
            version: version ? version.toString() : undefined
          })
        } catch (error) {
          contractStatuses.push({
            name,
            address,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      setContracts(contractStatuses)
      
      // Get network status
      const networkInfo = await getNetworkInfo()
      setNetworkStatus({
        chainId: networkInfo.chainId,
        name: networkInfo.name,
        blockNumber: networkInfo.blockNumber,
        gasPrice: networkInfo.gasPrice
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error checking contract status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkContractStatus()
    // Refresh every 30 seconds
    const interval = setInterval(checkContractStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const deployedContracts = contracts.filter(c => c.status === 'deployed')
  const errorContracts = contracts.filter(c => c.status === 'error')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <CubeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blockchain Status</h1>
                <p className="text-sm text-gray-600">Tractsafe Testnet Contract Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={checkContractStatus}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Status */}
        {networkStatus && (
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
              Network Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Network</div>
                <div className="font-semibold text-gray-900">{networkStatus.name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Chain ID</div>
                <div className="font-semibold text-gray-900">{networkStatus.chainId.toString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Block Number</div>
                <div className="font-semibold text-gray-900">{networkStatus.blockNumber.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Gas Price</div>
                <div className="font-semibold text-gray-900">
                  {networkStatus.gasPrice ? `${(Number(networkStatus.gasPrice) / 1e9).toFixed(2)} Gwei` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contract Status Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{deployedContracts.length}</div>
                <div className="text-sm text-gray-600">Deployed Contracts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{errorContracts.length}</div>
                <div className="text-sm text-gray-600">Error Contracts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {contracts.length > 0 ? Math.round((deployedContracts.length / contracts.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contract Details</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Checking contract status...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract.name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {contract.status === 'deployed' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                          )}
                          <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{contract.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contract.status === 'deployed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contract.status === 'deployed' ? 'Deployed' : 'Error'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {contract.owner ? `${contract.owner.slice(0, 6)}...${contract.owner.slice(-4)}` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contract.version || 'N/A'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Details */}
        {errorContracts.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Contract Errors</h3>
            <div className="space-y-2">
              {errorContracts.map((contract) => (
                <div key={contract.name} className="bg-white p-3 rounded border border-red-200">
                  <div className="font-medium text-red-900">{contract.name}</div>
                  <div className="text-sm text-red-700">{contract.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}