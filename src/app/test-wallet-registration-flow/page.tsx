'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function TestWalletRegistrationFlowPage() {
  const { user, isAuthenticated, walletLogin } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testWalletLogin = async () => {
    if (!address) {
      setTestResult({ success: false, error: 'No wallet address found' })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const result = await walletLogin(address)
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wallet Registration Flow</h1>

        {/* Flow Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Flow</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Sign up with email</h3>
                <p className="text-sm text-gray-600">Create an account using email and password</p>
                <Link href="/auth/signup" className="text-xs text-blue-600 hover:text-blue-500">
                  Go to Signup →
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Connect wallet</h3>
                <p className="text-sm text-gray-600">Link your Web3 wallet to your account</p>
                <Link href="/connect-wallet" className="text-xs text-blue-600 hover:text-blue-500">
                  Go to Connect Wallet →
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Test wallet login</h3>
                <p className="text-sm text-gray-600">Verify you can login with wallet only</p>
                <Link href="/auth/login" className="text-xs text-blue-600 hover:text-blue-500">
                  Go to Login →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Match:</strong> {user?.walletAddress === address ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Test Wallet Login */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Wallet Login</h2>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            
            {isConnected && address && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-green-800">
                    Wallet Connected: {address.substring(0, 6)}...{address.substring(38)}
                  </span>
                </div>
              </div>
            )}

            {isConnected && address && (
              <div className="text-center">
                <button
                  onClick={testWalletLogin}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Testing...' : 'Test Wallet Login'}
                </button>
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <div className="w-5 h-5 bg-green-400 rounded-full"></div>
                    ) : (
                      <div className="w-5 h-5 bg-red-400 rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Success!' : 'Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResult.success ? testResult.message : testResult.error}
                    </p>
                    {!testResult.success && testResult.error?.includes('No account found') && (
                      <div className="mt-3 text-xs text-red-600">
                        <p className="font-medium">This means:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Your wallet is not connected to any account</li>
                          <li>You need to sign up with email first</li>
                          <li>Then connect your wallet to that account</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Connect Wallet
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}