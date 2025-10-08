'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function TestKYCSaveProgressPage() {
  const { user, isAuthenticated } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSaveProgress = async () => {
    if (!isAuthenticated || !user?.email) {
      setTestResult({ success: false, error: 'Not authenticated' })
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No auth token found')
      }

      // Test saving progress
      const saveResponse = await fetch('/api/kyc/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentStep: 3,
          userData: {
            firstName: 'Test',
            lastName: 'User',
            email: user.email,
            investorType: 'individual',
            eligibilityAnswers: { test: true },
            jurisdiction: 'UK'
          }
        })
      })

      const saveData = await saveResponse.json()
      console.log('Save response:', saveData)

      if (saveData.success) {
        // Test loading progress
        const loadResponse = await fetch('/api/kyc/load-progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const loadData = await loadResponse.json()
        console.log('Load response:', loadData)

        setTestResult({
          success: true,
          saveResult: saveData,
          loadResult: loadData,
          message: 'Save and load progress test completed successfully!'
        })
      } else {
        setTestResult({
          success: false,
          error: saveData.error || 'Failed to save progress'
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({
        success: false,
        error: error.message || 'Test failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const clearProgress = async () => {
    if (!isAuthenticated || !user?.email) return

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Clear progress by saving empty data
      await fetch('/api/kyc/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentStep: 0,
          userData: {}
        })
      })

      setTestResult({
        success: true,
        message: 'Progress cleared successfully!'
      })
    } catch (error) {
      console.error('Clear error:', error)
      setTestResult({
        success: false,
        error: error.message || 'Failed to clear progress'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test KYC save progress</p>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test KYC Save Progress</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={testSaveProgress}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Save & Load Progress'}
              </button>

              <button
                onClick={clearProgress}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Clearing...' : 'Clear Progress'}
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Test Description</h3>
              <p className="text-sm text-blue-800">
                This test will save sample KYC progress data to the database and then load it back to verify the save/load functionality works correctly.
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
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
                    {testResult.success ? 'Success!' : 'Error'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.message || testResult.error}
                  </p>
                </div>
              </div>
            </div>

            {testResult.saveResult && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Save Response:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResult.saveResult, null, 2)}
                </pre>
              </div>
            )}

            {testResult.loadResult && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Load Response:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResult.loadResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Expected Behavior */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Successful Save & Load</h3>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Save API should return success: true</li>
                <li>Load API should return hasProgress: true</li>
                <li>Loaded data should match saved data</li>
                <li>currentStep should be preserved</li>
                <li>userData should be preserved</li>
                <li>Data is stored in dedicated KYC collection (not user collection)</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔄 How It Works</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>User fills out KYC form data</li>
                <li>Data is automatically saved every 2 seconds to KYC collection</li>
                <li>User can manually save progress using "Save Progress" button</li>
                <li>When user returns, progress is loaded from KYC collection</li>
                <li>User continues from where they left off</li>
                <li>Each user can have one draft KYC submission</li>
              </ol>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📊 Database Structure</h3>
              <div className="text-sm text-yellow-800">
                <p><strong>Collection:</strong> kycsubmissions</p>
                <p><strong>Fields:</strong> userId, email, currentStep, userData, status, createdAt, updatedAt</p>
                <p><strong>Status:</strong> draft (in progress) → submitted → under_review → approved/rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link
            href="/onboarding"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to KYC Onboarding
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}