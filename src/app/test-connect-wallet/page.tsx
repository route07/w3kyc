'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import { WalletIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function TestConnectWalletPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [connecting, setConnecting] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    data?: unknown;
    error?: string;
    [key: string]: unknown;
  } | null>(null)
  const [debugInfo, setDebugInfo] = useState<{
    isAuthenticated: boolean;
    user?: {
      id: string;
      email: string;
      [key: string]: unknown;
    };
    isConnected: boolean;
    address?: string;
    [key: string]: unknown;
  } | null>(null)

  // Debug info
  useEffect(() => {
    setDebugInfo({
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        isWalletConnected: user.isWalletConnected
      } : null,
      wagmi: {
        address,
        isConnected,
        connectorsCount: connectors.length,
        connectors: connectors.map(c => ({ name: c.name, id: c.id }))
      }
    })
  }, [isAuthenticated, user, address, isConnected, connectors])

  const handleConnectWallet = async () => {
    console.log('Connecting wallet...')
    setConnecting(true)
    setResult(null)

    try {
      if (connectors.length === 0) {
        throw new Error('No wallet connectors available')
      }

      console.log('Available connectors:', connectors.map(c => c.name))
      console.log('Using connector:', connectors[0].name)

      await connect({ connector: connectors[0] })
      console.log('Wallet connected successfully')
    } catch (error) {
      console.error('Wallet connection error:', error)
      setResult({
        success: false,
        error: `Failed to connect wallet: ${error.message || 'Unknown error'}`
      })
      setConnecting(false)
    }
  }

  const handleVerifyWallet = async () => {
    if (!address) {
      setResult({
        success: false,
        error: 'No wallet address found'
      })
      return
    }

    console.log('Verifying wallet:', address)
    setConnecting(true)
    setResult(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Sending request to connect wallet API...')
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ walletAddress: address })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setResult({
          success: true,
          message: 'Wallet connected successfully!',
          walletAddress: address
        })
        
        // Refresh user data
        await refreshUser()
        console.log('User data refreshed')
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to connect wallet'
        })
      }
    } catch (error) {
      console.error('Wallet verification error:', error)
      setResult({
        success: false,
        error: `Network error: ${error.message}`
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setResult(null)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wallet Connection</h1>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Status</h2>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'Not set'}</p>
              <p><strong>Wagmi Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Wagmi Address:</strong> {address || 'Not connected'}</p>
              <p><strong>Connectors Available:</strong> {connectors.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-4">
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting || connectors.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">Wallet Connected: {address}</p>
                  <button
                    onClick={handleVerifyWallet}
                    disabled={connecting}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {connecting ? 'Verifying...' : 'Verify & Link Wallet'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Messages */}
        {result && (
          <div className={`p-4 rounded-lg ${
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

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/connect-wallet')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Connect Wallet Page
          </button>
        </div>
      </div>
    </div>
  )
}