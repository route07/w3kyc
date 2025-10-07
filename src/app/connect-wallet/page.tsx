'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import { WalletIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ConnectWalletPage() {
  const { user, isAuthenticated, isLoading, connectEmail, refreshUser } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [connecting, setConnecting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState<'connect' | 'verify' | 'success'>('connect')

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Handle wallet connection
  const handleConnectWallet = async () => {
    console.log('Connecting wallet...')
    console.log('Available connectors:', connectors.map(c => c.name))
    
    if (!connectors[0]) {
      console.error('No wallet connectors available')
      setResult({
        success: false,
        error: 'No wallet connectors available'
      })
      return
    }

    setConnecting(true)
    setResult(null)

    try {
      console.log('Using connector:', connectors[0].name)
      
      // Add timeout to prevent infinite connecting state
      const connectPromise = connect({ connector: connectors[0] })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
      console.log('Wallet connected successfully')
      setStep('verify')
    } catch (error) {
      console.error('Wallet connection error:', error)
      setResult({
        success: false,
        error: `Failed to connect wallet: ${error.message || 'Unknown error'}`
      })
    } finally {
      setConnecting(false)
    }
  }

  // Handle wallet verification and linking
  const handleVerifyWallet = async () => {
    console.log('Verifying wallet:', address)
    
    if (!address) {
      console.error('No wallet address found')
      setResult({
        success: false,
        error: 'No wallet address found'
      })
      return
    }

    setConnecting(true)
    setResult(null)

    try {
      const token = localStorage.getItem('auth_token')
      console.log('Auth token found:', !!token)
      
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
        console.log('Wallet connected successfully')
        console.log('Updated user data:', data.user)
        setResult({
          success: true,
          message: 'Wallet connected successfully!',
          walletAddress: address
        })
        setStep('success')
        
        // Refresh user data in context
        console.log('Refreshing user data...')
        await refreshUser()
        console.log('User data refreshed')
        
        // Also refresh the page to ensure state is updated
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        console.error('API error:', data.error)
        setResult({
          success: false,
          error: data.error || 'Failed to connect wallet'
        })
      }
    } catch (error) {
      console.error('Network error:', error)
      setResult({
        success: false,
        error: `Network error: ${error.message}`
      })
    } finally {
      setConnecting(false)
    }
  }

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect()
    setStep('connect')
    setResult(null)
  }

  // Handle retry connection
  const handleRetry = () => {
    setStep('connect')
    setResult(null)
    setConnecting(false)
  }

  // Auto-reset connecting state if stuck
  useEffect(() => {
    if (connecting) {
      const timeout = setTimeout(() => {
        console.log('Auto-resetting connecting state due to timeout')
        setConnecting(false)
        setResult({
          success: false,
          error: 'Connection timeout. Please try again.'
        })
      }, 35000) // 35 seconds timeout

      return () => clearTimeout(timeout)
    }
  }, [connecting])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600">
              Link your Web3 wallet to your account for enhanced security and features
            </p>
          </div>

          {/* Current User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Account</h3>
            <div className="text-sm text-gray-600">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              {user?.walletAddress && (
                <p><strong>Connected Wallet:</strong> {user.walletAddress}</p>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Step:</strong> {step}</p>
              <p><strong>Wagmi Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Wagmi Address:</strong> {address || 'None'}</p>
              <p><strong>Connectors:</strong> {connectors.length}</p>
              <p><strong>Connecting:</strong> {connecting ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Step 1: Connect Wallet */}
          {step === 'connect' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 1: Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Click the button below to connect your Web3 wallet
                </p>
              </div>

              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <WalletIcon className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </button>

              {/* Connection Error */}
              {result && !result.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{result.error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Verify Wallet */}
          {step === 'verify' && !isConnected && (
            <div className="space-y-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Connection Not Detected
                </h2>
                <p className="text-gray-600 mb-6">
                  Wallet connection was not successful. Please try again.
                </p>
              </div>

              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <WalletIcon className="w-5 h-5 mr-2" />
                Try Connecting Again
              </button>
            </div>
          )}

          {/* Step 2: Verify Wallet */}
          {step === 'verify' && isConnected && address && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Step 2: Verify Wallet Connection
                </h2>
                <p className="text-gray-600 mb-4">
                  Your wallet is connected. Click to verify and link it to your account.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                    <p className="text-xs text-green-600 font-mono">{address}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyWallet}
                  disabled={connecting}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Link Wallet'
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Wallet Connected Successfully!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your wallet has been linked to your account.
                </p>
                {result?.walletAddress && (
                  <p className="text-sm text-gray-500 font-mono bg-gray-100 rounded px-3 py-2">
                    {result.walletAddress}
                  </p>
                )}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Result Messages */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
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
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.success ? result.message : result.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}