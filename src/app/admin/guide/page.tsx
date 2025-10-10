'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdminGuideContent from '@/components/AdminGuideContent'
import { 
  BookOpenIcon,
  ArrowLeftIcon,
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function AdminGuidePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [mounted, isLoading, isAuthenticated, user, router])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const quickLinks = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'KYC Management',
      description: 'Process KYC applications',
      icon: ShieldCheckIcon,
      href: '/admin/kyc',
      color: 'bg-green-500'
    },
    {
      title: 'Document Viewer',
      description: 'View and manage documents',
      icon: DocumentTextIcon,
      href: '/admin/document-viewer',
      color: 'bg-purple-500'
    },
    {
      title: 'IPFS Status',
      description: 'Monitor decentralized storage',
      icon: CloudIcon,
      href: '/admin/ipfs-status',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Admin
              </button>
              <div className="flex items-center">
                <BookOpenIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Guide</h1>
                  <p className="text-sm text-gray-600">W3KYC Platform Administration</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => router.push(link.href)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-center mb-2">
                  <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform`}>
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{link.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Guide Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AdminGuideContent />
        </div>
      </div>
    </div>
  )
}