'use client'

import { useState, useEffect } from 'react'
import { AdminLevel } from '@/types'
import { 
  ShieldCheckIcon, 
  UserIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isAdmin: boolean
  adminLevel: AdminLevel
  createdAt: string
}

interface AdminListProps {
  onRefresh?: () => void
}

export default function AdminList({ onRefresh }: AdminListProps) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/assign', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setAdmins(result.admins)
        setError('')
      } else {
        setError(result.error || 'Failed to fetch admins')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAdminLevelColor = (level: AdminLevel) => {
    switch (level) {
      case AdminLevel.BASIC:
        return 'bg-gray-100 text-gray-800'
      case AdminLevel.MODERATOR:
        return 'bg-blue-100 text-blue-800'
      case AdminLevel.MANAGER:
        return 'bg-purple-100 text-purple-800'
      case AdminLevel.SUPER_ADMIN:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAdminLevelIcon = (level: AdminLevel) => {
    switch (level) {
      case AdminLevel.SUPER_ADMIN:
        return '👑'
      case AdminLevel.MANAGER:
        return '🔧'
      case AdminLevel.MODERATOR:
        return '🛡️'
      case AdminLevel.BASIC:
        return '👤'
      default:
        return '👤'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Admin Users</h3>
            <p className="text-sm text-gray-500">{admins.length} admin(s) found</p>
          </div>
        </div>
        <button
          onClick={fetchAdmins}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="text-center py-8">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No admin users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">
                      {getAdminLevelIcon(admin.adminLevel)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAdminLevelColor(admin.adminLevel)}`}
                    >
                      {admin.adminLevel.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{admin.email}</p>
                  <p className="text-xs text-gray-400">
                    Added: {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // TODO: Implement edit functionality
                    console.log('Edit admin:', admin.id)
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit admin"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement remove functionality
                    console.log('Remove admin:', admin.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Remove admin"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}