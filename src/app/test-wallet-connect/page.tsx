'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function TestWalletConnectPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const { address, isConnected } = useAccount()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setUserData({ error: 'No token found' })
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      setUserData({ error: 'Failed to fetch user data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

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
          <Link href="/test-login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Connection Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AuthContext User Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AuthContext User Data</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Wallet Address:</strong> {user?.walletAddress || 'Not connected'}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod}</p>
              <p><strong>Email Verified:</strong> {user?.isEmailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Connected:</strong> {user?.isWalletConnected ? 'Yes' : 'No'}</p>
              <p><strong>Role:</strong> {user?.role || 'Not set'}</p>
              <p><strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Fresh API User Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fresh API User Data</h2>
            <button
              onClick={fetchUserData}
              disabled={loading}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            
            {userData && (
              <div className="space-y-2">
                {userData.error ? (
                  <p className="text-red-600">{userData.error}</p>
                ) : (
                  <>
                    <p><strong>Success:</strong> {userData.success ? 'Yes' : 'No'}</p>
                    {userData.user && (
                      <>
                        <p><strong>ID:</strong> {userData.user.id}</p>
                        <p><strong>Email:</strong> {userData.user.email}</p>
                        <p><strong>Name:</strong> {userData.user.firstName} {userData.user.lastName}</p>
                        <p><strong>Wallet Address:</strong> {userData.user.walletAddress || 'Not connected'}</p>
                        <p><strong>Role:</strong> {userData.user.role || 'Not set'}</p>
                        <p><strong>Is Admin:</strong> {userData.user.isAdmin ? 'Yes' : 'No'}</p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Connection Status</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Wallet Connected (Wagmi):</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="font-medium">Wallet Address (Wagmi):</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {address || 'Not connected'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-medium">User Has Wallet:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                user?.walletAddress ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user?.walletAddress ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-medium">Wallet Address Match:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                address && user?.walletAddress && address.toLowerCase() === user.walletAddress.toLowerCase() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {address && user?.walletAddress 
                  ? (address.toLowerCase() === user.walletAddress.toLowerCase() ? 'Yes' : 'No') 
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Connect Wallet
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={refreshUser}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Refresh User Data
          </button>
        </div>
      </div>
    </div>
  )
}