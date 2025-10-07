'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestLogoutPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [testResult, setTestResult] = useState<string>('')

  const testLogout = async () => {
    setTestResult('Testing logout...')
    
    try {
      await logout()
      setTestResult('✅ Logout successful! Should redirect to main page.')
      
      // Check if we're redirected
      setTimeout(() => {
        if (window.location.pathname === '/') {
          setTestResult('✅ Logout successful! Redirected to main page.')
        } else {
          setTestResult('❌ Logout successful but not redirected. Current path: ' + window.location.pathname)
        }
      }, 1000)
      
    } catch (error) {
      setTestResult('❌ Logout failed: ' + error.message)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test logout functionality</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Logout Functionality</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Logout</h2>
          <div className="space-y-4">
            <button
              onClick={testLogout}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Logout
            </button>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  testResult.includes('✅') ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Correct Logout Flow</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• User should be logged out from the system</li>
                <li>• Local storage should be cleared (auth_token, auth_user)</li>
                <li>• User should be redirected to the main page (/)</li>
                <li>• User context should be reset to null</li>
                <li>• Wallet should be disconnected (if connected)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go to Main Page
          </Link>
        </div>
      </div>
    </div>
  )
}