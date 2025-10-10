'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminMetrics from '@/components/admin/AdminMetrics'
import AdminCharts from '@/components/admin/AdminCharts'

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/auth/login')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Welcome back, manage your platform efficiently"
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
              <p className="text-blue-100">Here's what's happening with your platform today.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Last login</p>
              <p className="text-lg font-semibold">2 hours ago</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <AdminMetrics />

        {/* Charts and Analytics */}
        <AdminCharts />

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/kyc?status=pending')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Review Pending KYC</p>
                  <p className="text-sm text-gray-500">23 applications waiting</p>
                </div>
              </button>
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </button>
              <button 
                onClick={() => router.push('/admin/system')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">System Health</p>
                  <p className="text-sm text-gray-500">Check system status</p>
                </div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">IPFS Node</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Blockchain</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-600">Slow</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">API Services</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { user: 'John Doe', action: 'KYC approved', time: '2 minutes ago', type: 'success' },
                { user: 'Jane Smith', action: 'Document uploaded', time: '5 minutes ago', type: 'info' },
                { user: 'Bob Johnson', action: 'KYC rejected', time: '10 minutes ago', type: 'error' },
                { user: 'Alice Brown', action: 'Account created', time: '15 minutes ago', type: 'info' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.user} - {activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}