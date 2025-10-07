'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DebugWalletLoginPage() {
  const { user, isAuthenticated, walletLogin } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testWalletConnect = async () => {
    addLog('Starting wallet connection test...')
    
    if (!connectors[0]) {
      addLog('ERROR: No wallet connectors available')
      setError('No wallet connectors available')
      return
    }

    setIsLoading(true)
    setError('')
    addLog(`Using connector: ${connectors[0].name}`)

    try {
      await connect({ connector: connectors[0] })
      addLog('SUCCESS: Wallet connected')
    } catch (error) {
      addLog(`ERROR: Wallet connection failed - ${error.message}`)
      setError(error.message)
      setIsLoading(false)
    }
  }

  const testWalletLogin = async () => {
    addLog('Starting wallet login test...')
    
    if (!address) {
      addLog('ERROR: No wallet address found')
      setError('No wallet address found')
      return
    }

    setIsLoading(true)
    setError('')
    addLog(`Wallet address: ${address}`)

    try {
      addLog('Calling walletLogin function...')
      const result = await walletLogin(address)
      addLog(`Wallet login result: ${JSON.stringify(result)}`)
      
      if (result.success) {
        addLog('SUCCESS: Wallet login successful!')
        addLog('Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        addLog(`ERROR: Wallet login failed - ${result.error}`)
        setError(result.error || 'Wallet login failed')
      }
    } catch (error) {
      addLog(`NETWORK ERROR: ${error.message}`)
      setError(error.message)
    } finally {
      addLog('Setting loading to false')
      setIsLoading(false)
    }
  }

  const testApiDirectly = async () => {
    if (!address) {
      addLog('ERROR: No wallet address for API test')
      return
    }

    addLog('Testing API directly...')
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address })
      })

      addLog(`API response status: ${response.status}`)
      const data = await response.json()
      addLog(`API response data: ${JSON.stringify(data, null, 2)}`)
      
      if (data.success) {
        addLog('SUCCESS: API call successful!')
      } else {
        addLog(`ERROR: API call failed - ${data.error}`)
        setError(data.error)
      }
    } catch (error) {
      addLog(`API ERROR: ${error.message}`)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setError('')
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Authenticated: ${isAuthenticated}`)
    addLog(`Wallet Connected: ${isConnected}`)
    addLog(`Address: ${address || 'None'}`)
    addLog(`Connectors: ${connectors.length}`)
  }, [isAuthenticated, isConnected, address, connectors.length])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Wallet Login</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Connectors:</strong> {connectors.length}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Status</h2>
            <div className="space-y-2 text-sm">
              {error ? (
                <p className="text-red-600 font-medium">{error}</p>
              ) : (
                <p className="text-green-600">No errors</p>
              )}
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Prerequisites</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• You must have an existing account with a connected wallet</li>
                <li>• Use the connect-wallet page to link your wallet to an account first</li>
                <li>• Then test the wallet login here</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4">
              {!isConnected ? (
                <button
                  onClick={testWalletConnect}
                  disabled={isLoading || connectors.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={testWalletLogin}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Logging in...' : 'Test Wallet Login'}
                  </button>
                  <button
                    onClick={testApiDirectly}
                    disabled={isLoading}
                    className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Testing...' : 'Test API Directly'}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              <button
                onClick={clearLogs}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting a wallet and testing login.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Login Page
          </Link>
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Wallet First
          </Link>
        </div>
      </div>
    </div>
  )
}