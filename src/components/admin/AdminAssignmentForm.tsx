'use client'

import { useState } from 'react'
import { UserRole, AdminLevel } from '@/types'
import { 
  UserPlusIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface AdminAssignmentFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function AdminAssignmentForm({ onSuccess, onError }: AdminAssignmentFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    adminLevel: AdminLevel.BASIC
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Get current user email from localStorage or context
      const currentUserEmail = localStorage.getItem('userEmail') || 'system'
      
      const response = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          email: formData.email,
          adminLevel: formData.adminLevel,
          assignedBy: currentUserEmail
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result.message)
        setFormData({ email: '', adminLevel: AdminLevel.BASIC })
        onSuccess?.()
      } else {
        setError(result.error || 'Failed to assign admin role')
        onError?.(result.error || 'Failed to assign admin role')
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const adminLevelDescriptions = {
    [AdminLevel.BASIC]: 'Basic admin - Can view and moderate content',
    [AdminLevel.MODERATOR]: 'Moderator - Can manage users and content',
    [AdminLevel.MANAGER]: 'Manager - Can assign admin roles and manage system',
    [AdminLevel.SUPER_ADMIN]: 'Super Admin - Full system access and control'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserPlusIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assign Admin Role</h3>
          <p className="text-sm text-gray-500">Grant administrative privileges to users</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            User Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter user's email address"
          />
        </div>

        <div>
          <label htmlFor="adminLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Level
          </label>
          <select
            id="adminLevel"
            name="adminLevel"
            value={formData.adminLevel}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(AdminLevel).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {adminLevelDescriptions[formData.adminLevel]}
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setFormData({ email: '', adminLevel: AdminLevel.BASIC })
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Admin Role'}
          </button>
        </div>
      </form>
    </div>
  )
}