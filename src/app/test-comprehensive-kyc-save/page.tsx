'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function TestComprehensiveKYCSavePage() {
  const { user, isAuthenticated } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addTestResult = (test: string, success: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testSaveProgress = async (step: number, userData: any) => {
    if (!isAuthenticated || !user?.email) {
      addTestResult(`Step ${step} Save`, false, 'Not authenticated')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        addTestResult(`Step ${step} Save`, false, 'No auth token')
        return
      }

      const response = await fetch('/api/kyc/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentStep: step,
          userData
        })
      })

      const data = await response.json()
      if (data.success) {
        addTestResult(`Step ${step} Save`, true, `Saved step ${step} with ${Object.keys(userData).length} fields`)
      } else {
        addTestResult(`Step ${step} Save`, false, data.error || 'Save failed')
      }
    } catch (error) {
      addTestResult(`Step ${step} Save`, false, error.message || 'Network error')
    }
  }

  const testLoadProgress = async () => {
    if (!isAuthenticated || !user?.email) {
      addTestResult('Load Progress', false, 'Not authenticated')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        addTestResult('Load Progress', false, 'No auth token')
        return
      }

      const response = await fetch('/api/kyc/load-progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        if (data.hasProgress) {
          addTestResult('Load Progress', true, `Loaded step ${data.progress.currentStep} with ${Object.keys(data.progress.userData).length} fields`)
        } else {
          addTestResult('Load Progress', true, 'No saved progress found (expected for new users)')
        }
      } else {
        addTestResult('Load Progress', false, data.error || 'Load failed')
      }
    } catch (error) {
      addTestResult('Load Progress', false, error.message || 'Network error')
    }
  }

  const runComprehensiveTest = async () => {
    setLoading(true)
    setTestResults([])

    // Test data for different steps
    const testData = {
      step1: {
        firstName: 'John',
        lastName: 'Doe',
        email: user?.email || 'test@example.com',
        jurisdiction: 'UK'
      },
      step2: {
        investorType: 'individual'
      },
      step3: {
        eligibilityAnswers: {
          us_citizen: false,
          eu_resident: true,
          accredited_status: false,
          pep_status: false,
          sanctions: false
        }
      },
      step4: {
        institutionDetails: {
          name: 'Test Company Ltd',
          registrationNumber: '12345678',
          country: 'UK',
          address: {
            street: '123 Test Street',
            city: 'London',
            state: 'England',
            postalCode: 'SW1A 1AA',
            country: 'UK'
          },
          businessType: 'Technology',
          website: 'https://testcompany.com'
        }
      },
      step5: {
        uboDeclaration: {
          hasUBO: true,
          uboDetails: [{
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1980-01-01',
            nationality: 'UK',
            ownershipPercentage: 25,
            address: {
              street: '456 UBO Street',
              city: 'Manchester',
              state: 'England',
              postalCode: 'M1 1AA',
              country: 'UK'
            }
          }]
        }
      },
      step6: {
        directorsDeclaration: {
          hasDirectors: true,
          directors: [{
            firstName: 'Bob',
            lastName: 'Smith',
            dateOfBirth: '1975-05-15',
            nationality: 'UK',
            passportNumber: 'P123456789',
            address: {
              street: '789 Director Lane',
              city: 'Birmingham',
              state: 'England',
              postalCode: 'B1 1AA',
              country: 'UK'
            },
            position: 'CEO'
          }]
        }
      }
    }

    // Test each step
    for (const [stepName, data] of Object.entries(testData)) {
      const stepNumber = parseInt(stepName.replace('step', ''))
      await testSaveProgress(stepNumber, { ...testData.step1, ...data })
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between saves
    }

    // Test loading progress
    await testLoadProgress()

    setLoading(false)
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

      addTestResult('Clear Progress', true, 'Progress cleared successfully')
    } catch (error) {
      addTestResult('Clear Progress', false, error.message || 'Failed to clear progress')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test comprehensive KYC save functionality</p>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Comprehensive KYC Save Functionality</h1>

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
                onClick={runComprehensiveTest}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Running Tests...' : 'Run Comprehensive Test'}
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
              <h3 className="font-semibold text-blue-900 mb-2">Comprehensive Test Description</h3>
              <p className="text-sm text-blue-800 mb-2">
                This test will simulate a complete KYC flow by saving data for each step and then loading it back.
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Step 1: Personal Information (name, email, jurisdiction)</li>
                <li>Step 2: Investor Type selection</li>
                <li>Step 3: Eligibility questionnaire answers</li>
                <li>Step 4: Institution details (if applicable)</li>
                <li>Step 5: UBO declaration</li>
                <li>Step 6: Directors declaration</li>
                <li>Load: Retrieve all saved progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run Comprehensive Test" to start.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        result.success ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.test}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expected Behavior */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Successful Comprehensive Save</h3>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>All 6 steps should save successfully to database</li>
                <li>Each step should preserve its specific data</li>
                <li>Load should retrieve the complete saved progress</li>
                <li>Data should be stored in kycsubmissions collection</li>
                <li>Each save should update the same document (not create duplicates)</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔄 Save Triggers</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Auto-save:</strong> Every 1 second when userData changes</li>
                <li><strong>Step completion:</strong> Immediate save when user completes a step</li>
                <li><strong>Form typing:</strong> Real-time save as user types in forms</li>
                <li><strong>Manual save:</strong> User can click "Save Progress" button</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📊 Database Verification</h3>
              <div className="text-sm text-yellow-800">
                <p>Check your MongoDB database for:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><strong>Collection:</strong> kycsubmissions</li>
                  <li><strong>Document:</strong> One per user (userId + status: 'draft')</li>
                  <li><strong>Fields:</strong> currentStep, userData (with all form data), updatedAt</li>
                  <li><strong>Updates:</strong> Same document updated multiple times, not duplicated</li>
                </ul>
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
            href="/test-kyc-save-progress"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Basic Save Test
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}