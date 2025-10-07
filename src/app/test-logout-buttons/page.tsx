'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function TestLogoutButtonsPage() {
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
          <p className="text-gray-600 mb-4">Please login to test logout buttons</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Logout Buttons Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Correct: Only One Logout Button</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Should see only ONE logout button in the top navigation bar</li>
                <li>• Should NOT see a logout button in the dashboard header</li>
                <li>• The logout button should be in the global navbar (top right)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">❌ Incorrect: Multiple Logout Buttons</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Should NOT see two logout buttons</li>
                <li>• Should NOT see logout button in dashboard header</li>
                <li>• Should NOT see duplicate logout functionality</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod}</p>
              <p><strong>Wallet Connected:</strong> {user?.walletAddress || address ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Address:</strong> {user?.walletAddress || address || 'Not connected'}</p>
            </div>
          </div>

          {/* Logout Button Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Logout Button Status</h2>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Global Navbar (Top Right)</p>
                <p className="text-xs text-blue-700">Should have ONE logout button</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Dashboard Header</p>
                <p className="text-xs text-gray-700">Should NOT have logout button</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Total Logout Buttons</p>
                <p className="text-xs text-green-700">Expected: 1 | Should be in navbar only</p>
              </div>
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
            href="/test-dashboard"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test Dashboard Status
          </Link>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">How to Test</h3>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>Look at the top navigation bar - you should see ONE logout button on the right side</li>
            <li>Go to the dashboard - you should NOT see a logout button in the dashboard header</li>
            <li>The dashboard header should only show: Welcome message, Wallet Connected (if applicable), and wallet disconnect button (if applicable)</li>
            <li>If you see two logout buttons, there's still a duplicate that needs to be removed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}