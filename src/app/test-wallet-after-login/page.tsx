'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import { WalletIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function TestWalletAfterLoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [connecting, setConnecting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Authenticated: ${isAuthenticated}`)
    addLog(`User: ${user?.email || 'None'}`)
    addLog(`Wagmi Connected: ${isConnected}`)
    addLog(`Address: ${address || 'None'}`)
    addLog(`Connectors: ${connectors.length}`)
  }, [isAuthenticated, user, isConnected, address, connectors.length])

  const handleConnectWallet = async () => {
    addLog('Attempting to connect wallet...')
    setConnecting(true)
    setResult(null)

    try {
      if (connectors.length === 0) {
        addLog('ERROR: No connectors available')
        setResult({
          success: false,
          error: 'No wallet connectors available'
        })
        return
      }
      
      addLog(`Using connector: ${connectors[0].name}`)
      await connect({ connector: connectors[0] })
      addLog('SUCCESS: Wallet connected')
      setResult({
        success: true,
        message: 'Wallet connected successfully!'
      })
    } catch (error) {
      addLog(`ERROR: ${error.message}`)
      setResult({
        success: false,
        error: `Failed to connect wallet: ${error.message}`
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    addLog('Disconnecting wallet...')
    disconnect()
    setResult(null)
    addLog('Wallet disconnected')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test wallet connection</p>
          <button
            onClick={() => router.push('/test-login')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wallet Connection After Login</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wagmi Status</h2>
            <div className="space-y-2">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Connectors:</strong> {connectors.length}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Wallet Connection</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleConnectWallet}
              disabled={connecting || connectors.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Disconnect Wallet
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Result Messages */}
        {result && (
          <div className={`mb-8 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className={`text-sm mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.success ? result.message : result.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting a wallet.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => router.push('/connect-wallet')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Connect Wallet Page
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}