'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  description?: string
}

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, bgColor, description }: MetricCardProps) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />
      case 'decrease':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {change !== 0 && (
            <div className="flex items-center mt-2">
              {getChangeIcon()}
              <span className={`text-sm font-medium ml-1 ${getChangeColor()}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

const AdminMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    rejectedKYC: 0,
    totalDocuments: 0,
    ipfsFiles: 0,
    systemAlerts: 0,
    revenue: 0,
    conversionRate: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      // Simulate API calls - replace with actual API endpoints
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      } else {
        // Fallback to mock data
        setMetrics({
          totalUsers: 1247,
          activeUsers: 892,
          pendingKYC: 23,
          approvedKYC: 1156,
          rejectedKYC: 68,
          totalDocuments: 3421,
          ipfsFiles: 2890,
          systemAlerts: 3,
          revenue: 45680,
          conversionRate: 92.7
        })
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
      // Use mock data as fallback
      setMetrics({
        totalUsers: 1247,
        activeUsers: 892,
        pendingKYC: 23,
        approvedKYC: 1156,
        rejectedKYC: 68,
        totalDocuments: 3421,
        ipfsFiles: 2890,
        systemAlerts: 3,
        revenue: 45680,
        conversionRate: 92.7
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change={12.5}
          changeType="increase"
          icon={UserGroupIcon}
          color="text-blue-600"
          bgColor="bg-blue-100"
          description="Registered users"
        />
        
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          change={8.2}
          changeType="increase"
          icon={CheckCircleIcon}
          color="text-green-600"
          bgColor="bg-green-100"
          description="Users active in last 30 days"
        />
        
        <MetricCard
          title="Pending KYC"
          value={metrics.pendingKYC}
          change={-15.3}
          changeType="decrease"
          icon={ClockIcon}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
          description="Awaiting review"
        />
        
        <MetricCard
          title="Approved KYC"
          value={metrics.approvedKYC.toLocaleString()}
          change={18.7}
          changeType="increase"
          icon={ShieldCheckIcon}
          color="text-green-600"
          bgColor="bg-green-100"
          description="Successfully verified"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Rejected KYC"
          value={metrics.rejectedKYC}
          change={-5.2}
          changeType="decrease"
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          bgColor="bg-red-100"
          description="Failed verification"
        />
        
        <MetricCard
          title="Total Documents"
          value={metrics.totalDocuments.toLocaleString()}
          change={22.1}
          changeType="increase"
          icon={DocumentTextIcon}
          color="text-purple-600"
          bgColor="bg-purple-100"
          description="Uploaded files"
        />
        
        <MetricCard
          title="IPFS Files"
          value={metrics.ipfsFiles.toLocaleString()}
          change={19.8}
          changeType="increase"
          icon={CloudIcon}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
          description="Stored on IPFS"
        />
        
        <MetricCard
          title="System Alerts"
          value={metrics.systemAlerts}
          change={0}
          changeType="neutral"
          icon={ExclamationTriangleIcon}
          color="text-orange-600"
          bgColor="bg-orange-100"
          description="Active alerts"
        />
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Revenue"
          value={`$${metrics.revenue.toLocaleString()}`}
          change={25.3}
          changeType="increase"
          icon={CurrencyDollarIcon}
          color="text-green-600"
          bgColor="bg-green-100"
          description="Monthly revenue"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change={3.2}
          changeType="increase"
          icon={ChartBarIcon}
          color="text-blue-600"
          bgColor="bg-blue-100"
          description="KYC approval rate"
        />
      </div>
    </div>
  )
}

export default AdminMetrics