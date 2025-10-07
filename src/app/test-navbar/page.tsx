'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function TestNavbarPage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Navbar Test Page</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                {user && (
                  <>
                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Admin Level:</strong> {user.adminLevel || 'N/A'}</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Navigation Test</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 font-medium">Home</div>
                </a>
                <a href="/dashboard" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                  <div className="text-green-600 font-medium">Dashboard</div>
                </a>
                <a href="/admin" className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
                  <div className="text-red-600 font-medium">Admin</div>
                </a>
                <a href="/onboarding" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                  <div className="text-purple-600 font-medium">KYC</div>
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Logo Test</h2>
              <p className="text-gray-600">
                The logo in the navbar should be clickable and take you to the home page.
                Try clicking on the "W3" logo in the navbar above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}