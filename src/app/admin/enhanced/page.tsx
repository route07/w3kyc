'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminMetrics from '@/components/admin/AdminMetrics'
import AdminCharts from '@/components/admin/AdminCharts'
import { 
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function EnhancedAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState([])
  const [systemAlerts, setSystemAlerts] = useState([])

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/auth/login')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user?.isAdmin) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    // Load recent activity and system alerts
    // This would be replaced with actual API calls
    setRecentActivity([
      { id: 1, user: 'John Doe', action: 'KYC approved', time: '2 minutes ago', type: 'success' },
      { id: 2, user: 'Jane Smith', action: 'Document uploaded', time: '5 minutes ago', type: 'info' },
      { id: 3, user: 'Bob Johnson', action: 'KYC rejected', time: '10 minutes ago', type: 'error' }
    ])

    setSystemAlerts([
      { id: 1, type: 'warning', message: 'IPFS node connection slow', time: '5 minutes ago' },
      { id: 2, type: 'error', message: 'Database connection timeout', time: '15 minutes ago' },
      { id: 3, type: 'info', message: 'Scheduled maintenance completed', time: '1 hour ago' }
    ])
  }

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

  const actions = (
    <div className="flex items-center space-x-3">
      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <PlusIcon className="w-4 h-4 mr-2" />
        New User
      </button>
      <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        Export Data
      </button>
      <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
        <FunnelIcon className="w-4 h-4 mr-2" />
        Filters
      </button>
    </div>
  )

  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Welcome back, manage your platform efficiently"
      actions={actions}
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

        {/* Quick Actions and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Review Pending KYC</p>
                  <p className="text-sm text-gray-500">23 applications waiting</p>
                </div>
              </button>
              <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Approve KYC</p>
                  <p className="text-sm text-gray-500">Bulk approve verified users</p>
                </div>
              </button>
              <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">System Health</p>
                  <p className="text-sm text-gray-500">Check system status</p>
                </div>
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
              <BellIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
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

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">Database</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">IPFS Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">Blockchain</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">API Services</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}