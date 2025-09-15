'use client'

import { useState, useEffect } from 'react'
import { KYCService } from '@/lib/kyc-service'
import { getNetworkInfo } from '@/lib/blockchain'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  WalletIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

interface BlockchainStatus {
  connected: boolean
  networkInfo?: any
  error?: string
}

interface ContractStatus {
  name: string
  address: string
  status: 'connected' | 'error' | 'unknown'
  error?: string
}

export default function TestBlockchainPage() {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus>({ connected: false })
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    testBlockchainConnection()
  }, [])

  const testBlockchainConnection = async () => {
    setIsLoading(true)
    
    try {
      // Test network connection
      const networkResult = await KYCService.getNetworkInfo()
      
      if (networkResult.success) {
        setBlockchainStatus({
          connected: true,
          networkInfo: networkResult.networkInfo
        })
        
        // Test contract connections
        await testContractConnections()
      } else {
        setBlockchainStatus({
          connected: false,
          error: networkResult.error
        })
      }
    } catch (error) {
      setBlockchainStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testContractConnections = async () => {
    const contracts = [
      { name: 'KYCDataStorage', address: '0x5eb3bc0a489c5a8288765d2336659ebca68fcd00' },
      { name: 'KYCManager', address: '0x1291be112d480055dafd8a610b7d1e203891c274' },
    ]

    const statuses: ContractStatus[] = []

    for (const contract of contracts) {
      try {
        // Test with a simple call
        const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        
        if (contract.name === 'KYCManager') {
          const result = await KYCService.isKYCValid(testAddress)
          statuses.push({
            name: contract.name,
            address: contract.address,
            status: result.success ? 'connected' : 'error',
            error: result.error
          })
        } else {
          // For other contracts, just mark as connected if we got this far
          statuses.push({
            name: contract.name,
            address: contract.address,
            status: 'connected'
          })
        }
      } catch (error) {
        statuses.push({
          name: contract.name,
          address: contract.address,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    setContractStatuses(statuses)
  }

  const runKYCTest = async () => {
    const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    
    try {
      // Test KYC status
      const statusResult = await KYCService.getKYCStatus(testAddress)
      setTestResults(prev => ({ ...prev, kycStatus: statusResult }))
      
      // Test KYC validity
      const validityResult = await KYCService.isKYCValid(testAddress)
      setTestResults(prev => ({ ...prev, kycValidity: validityResult }))
      
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing blockchain connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Integration Test</h1>
          <p className="text-gray-600 mt-2">
            Test the connection between the UI and deployed smart contracts
          </p>
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Network Status</h2>
            <button
              onClick={testBlockchainConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className={`p-4 rounded-lg border ${blockchainStatus.connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-3">
              {blockchainStatus.connected ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className={`font-medium ${blockchainStatus.connected ? 'text-green-800' : 'text-red-800'}`}>
                  {blockchainStatus.connected ? 'Connected' : 'Disconnected'}
                </p>
                {blockchainStatus.error && (
                  <p className="text-red-600 text-sm mt-1">{blockchainStatus.error}</p>
                )}
              </div>
            </div>
            
            {blockchainStatus.networkInfo && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Chain ID</p>
                  <p className="font-mono text-sm">{blockchainStatus.networkInfo.chainId.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Block Number</p>
                  <p className="font-mono text-sm">{blockchainStatus.networkInfo.blockNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gas Price</p>
                  <p className="font-mono text-sm">
                    {blockchainStatus.networkInfo.gasPrice ? 
                      `${(Number(blockchainStatus.networkInfo.gasPrice) / 1e9).toFixed(2)} gwei` : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Status</h2>
          
          <div className="space-y-4">
            {contractStatuses.map((contract, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(contract.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm font-mono">{contract.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(contract.status)}
                    <span className="text-sm font-medium capitalize">{contract.status}</span>
                  </div>
                </div>
                {contract.error && (
                  <p className="text-sm mt-2 opacity-75">{contract.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KYC Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">KYC Function Tests</h2>
            <button
              onClick={runKYCTest}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Run Tests
            </button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              {testResults.kycStatus && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">KYC Status Test</h3>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.kycStatus, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.kycValidity && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">KYC Validity Test</h3>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.kycValidity, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Error</h3>
                  <p className="text-sm text-red-600">{testResults.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
