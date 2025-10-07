'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
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
          <p className="text-gray-600">Please login to test admin access</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AuthContext User Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AuthContext User Data</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Role:</strong> {user?.role || 'Not set'}</p>
              <p><strong>Is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Admin Level:</strong> {user?.adminLevel || 'Not set'}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod}</p>
              <p><strong>Email Verified:</strong> {user?.isEmailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Connected:</strong> {user?.isWalletConnected ? 'Yes' : 'No'}</p>
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
                        <p><strong>Role:</strong> {userData.user.role || 'Not set'}</p>
                        <p><strong>Is Admin:</strong> {userData.user.isAdmin ? 'Yes' : 'No'}</p>
                        <p><strong>Admin Level:</strong> {userData.user.adminLevel || 'Not set'}</p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admin Access Test */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Access Test</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Can access admin dashboard:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                user?.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user?.isAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="font-medium">Admin Level:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                user?.adminLevel === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                user?.adminLevel ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.adminLevel || 'None'}
              </span>
            </div>

            <div className="mt-4">
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}