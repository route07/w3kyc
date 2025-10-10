'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

// Simple chart component (in a real app, you'd use a proper charting library like Chart.js or Recharts)
const SimpleChart = ({ data, type = 'line', color = 'blue' }: { data: number[], type?: string, color?: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  return (
    <div className="h-32 flex items-end space-x-1">
      {data.map((value, index) => {
        const height = range > 0 ? ((value - min) / range) * 100 : 50
        return (
          <div
            key={index}
            className={`flex-1 bg-${color}-500 rounded-t`}
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

const AdminCharts = () => {
  const [chartData, setChartData] = useState({
    userGrowth: [120, 150, 180, 200, 250, 300, 350],
    kycApprovals: [45, 52, 48, 61, 55, 67, 73],
    documentUploads: [23, 28, 31, 35, 42, 38, 45],
    ipfsStorage: [1200, 1350, 1500, 1650, 1800, 1950, 2100]
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading chart data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <SimpleChart data={chartData.userGrowth} color="blue" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* KYC Approvals Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">KYC Approvals</h3>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <SimpleChart data={chartData.kycApprovals} color="green" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Document Uploads Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Document Uploads</h3>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <SimpleChart data={chartData.documentUploads} color="purple" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* IPFS Storage Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CloudIcon className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">IPFS Storage</h3>
            </div>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <SimpleChart data={chartData.ipfsStorage} color="indigo" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
        </div>
        <div className="space-y-3">
          {[
            { user: 'John Doe', action: 'KYC approved', time: '2 minutes ago', type: 'success' },
            { user: 'Jane Smith', action: 'Document uploaded', time: '5 minutes ago', type: 'info' },
            { user: 'Bob Johnson', action: 'KYC rejected', time: '10 minutes ago', type: 'error' },
            { user: 'Alice Brown', action: 'Account created', time: '15 minutes ago', type: 'info' },
            { user: 'Charlie Wilson', action: 'Document verified', time: '20 minutes ago', type: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm text-gray-900">{activity.user}</span>
                <span className="text-sm text-gray-600 ml-2">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminCharts