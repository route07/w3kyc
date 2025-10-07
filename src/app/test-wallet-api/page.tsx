'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'

export default function TestWalletApiPage() {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [connecting, setConnecting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  const handleConnectWallet = async () => {
    if (!connectors[0]) {
      setResult({ success: false, error: 'No wallet connectors available' })
      return
    }

    setConnecting(true)
    setResult(null)

    try {
      await connect({ connector: connectors[0] })
    } catch (error) {
      setResult({
        success: false,
        error: `Failed to connect wallet: ${error.message}`
      })
      setConnecting(false)
    }
  }

  const handleSaveWallet = async () => {
    if (!address) {
      setResult({ success: false, error: 'No wallet address found' })
      return
    }

    setConnecting(true)
    setResult(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Saving wallet address:', address)
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
          message: 'Wallet saved to database successfully!'
        })
        
        // Refresh user data
        await refreshUser()
        await fetchUserData()
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to save wallet'
        })
      }
    } catch (error) {
      console.error('Error saving wallet:', error)
      setResult({
        success: false,
        error: `Network error: ${error.message}`
      })
    } finally {
      setConnecting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test wallet API</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wallet API</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auth Context User</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Wallet:</strong> {user?.walletAddress || 'None'}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fresh API User Data</h2>
            <button
              onClick={fetchUserData}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
            <div className="space-y-2 text-sm">
              {userData ? (
                <>
                  <p><strong>Success:</strong> {userData.success ? 'Yes' : 'No'}</p>
                  {userData.user && (
                    <>
                      <p><strong>ID:</strong> {userData.user.id}</p>
                      <p><strong>Email:</strong> {userData.user.email}</p>
                      <p><strong>Wallet:</strong> {userData.user.walletAddress || 'None'}</p>
                      <p><strong>Role:</strong> {userData.user.role}</p>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Click "Refresh Data" to load</p>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Wagmi Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            
            {address && (
              <div className="flex items-center space-x-4">
                <span className="font-medium">Address:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {address}
                </span>
              </div>
            )}

            <div className="flex space-x-4">
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting || connectors.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveWallet}
                    disabled={connecting}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {connecting ? 'Saving...' : 'Save Wallet to DB'}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Disconnect
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
                  <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                ) : (
                  <div className="w-5 h-5 bg-red-400 rounded-full"></div>
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