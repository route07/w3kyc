'use client'

import { useState } from 'react'

export default function DebugUserPage() {
  const [email, setEmail] = useState('ayoubshadi75@gmail.com')
  const [userData, setUserData] = useState<{
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      [key: string]: unknown;
    };
    error?: string;
    [key: string]: unknown;
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/debug-user?email=${email}`)
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      setUserData({ error: 'Failed to fetch user data' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug User Data</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fetch User from Database</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
            <button
              onClick={fetchUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch User'}
            </button>
          </div>

          {userData && (
            <div className="mt-4">
              {userData.error ? (
                <div className="text-red-600">{userData.error}</div>
              ) : (
                <div className="space-y-2">
                  <p><strong>ID:</strong> {userData._id}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                  <p><strong>Role:</strong> {userData.role || 'Not set'}</p>
                  <p><strong>Is Admin:</strong> {userData.isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Admin Level:</strong> {userData.adminLevel || 'Not set'}</p>
                  <p><strong>Created:</strong> {userData.createdAt}</p>
                  <p><strong>Updated:</strong> {userData.updatedAt}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <div>
              <a
                href="/test-login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
              >
                Test Login
              </a>
              <a
                href="/test-admin"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-4"
              >
                Test Admin Access
              </a>
              <a
                href="/admin"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}