'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function TestDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
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
          <p className="text-gray-600 mb-4">Please login to test dashboard</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Status Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod}</p>
              <p><strong>Email Verified:</strong> {user?.isEmailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Connected (User):</strong> {user?.isWalletConnected ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Address (User):</strong> {user?.walletAddress || 'Not set'}</p>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2">
              <p><strong>Wagmi Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Wagmi Address:</strong> {address || 'Not connected'}</p>
              <p><strong>Should Show Wallet Connected:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  (user?.walletAddress || address) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(user?.walletAddress || address) ? 'Yes' : 'No'}
                </span>
              </p>
              <p><strong>Should Show Connect Button:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  !user?.walletAddress && !address ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {!user?.walletAddress && !address ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected Dashboard Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Header Section</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Should always show &quot;Welcome, [Name]!&quot; message</li>
                <li>• Should show &quot;Wallet Connected&quot; only if user has wallet</li>
                <li>• Should show &quot;Logout&quot; button (not &quot;Disconnect&quot;)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Profile Section</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Should show wallet address if connected</li>
                <li>• Should show &quot;Connect Wallet&quot; button if no wallet</li>
                <li>• Should show &quot;Disconnect&quot; button if wallet connected</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Wallet Connection Card</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Should only show if no wallet is connected</li>
                <li>• Should be hidden if wallet is already connected</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    </div>
  )
}