'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugTokenPage() {
  const { user, isAuthenticated } = useAuth()
  const [tokenData, setTokenData] = useState(null)
  const [dbData, setDbData] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkToken = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setTokenData({ error: 'No token found' })
        return
      }

      // Decode JWT token
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const decoded = JSON.parse(jsonPayload)
      setTokenData(decoded)

      // Get fresh data from database
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDbData(data)

    } catch (error) {
      setTokenData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const clearAndRelogin = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('userEmail')
    window.location.href = '/auth/login'
  }

  useEffect(() => {
    checkToken()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Token vs Database Debug</h1>
          
          <div className="mb-6">
            <button
              onClick={checkToken}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              {loading ? 'Checking...' : 'Refresh Check'}
            </button>
            <button
              onClick={clearAndRelogin}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear & Re-login
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">JWT Token Data</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm">{JSON.stringify(tokenData, null, 2)}</pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Database Data (via /api/auth/me)</h2>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm">{JSON.stringify(dbData, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Auth Context Data</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm">{JSON.stringify({
                isAuthenticated,
                user: user ? {
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  isAdmin: user.isAdmin,
                  adminLevel: user.adminLevel,
                  role: user.role
                } : null
              }, null, 2)}</pre>
            </div>
          </div>

          <div className="mt-6">
            <a href="/admin" className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center">
              Try Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}