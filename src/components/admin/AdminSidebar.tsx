'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ServerIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      current: pathname === '/admin'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'KYC Management',
      href: '/admin/kyc',
      icon: ShieldCheckIcon,
      current: pathname.startsWith('/admin/kyc')
    },
    {
      name: 'Documents',
      href: '/admin/documents',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/admin/documents')
    },
    {
      name: 'IPFS Management',
      href: '/admin/ipfs',
      icon: CloudIcon,
      current: pathname.startsWith('/admin/ipfs')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: pathname.startsWith('/admin/analytics')
    },
    {
      name: 'System Health',
      href: '/admin/system',
      icon: ServerIcon,
      current: pathname.startsWith('/admin/system')
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: ClipboardDocumentListIcon,
      current: pathname.startsWith('/admin/audit')
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: BellIcon,
      current: pathname.startsWith('/admin/notifications')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      current: pathname.startsWith('/admin/settings')
    },
    {
      name: 'Admin Guide',
      href: '/admin/guide',
      icon: BookOpenIcon,
      current: pathname.startsWith('/admin/guide')
    }
  ]

  const quickActions = [
    {
      name: 'Pending KYC',
      href: '/admin/kyc?status=pending',
      icon: ExclamationTriangleIcon,
      count: 12,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      name: 'System Alerts',
      href: '/admin/system',
      icon: ServerIcon,
      count: 3,
      color: 'text-red-600 bg-red-100'
    },
    {
      name: 'New Users',
      href: '/admin/users?filter=new',
      icon: UserGroupIcon,
      count: 8,
      color: 'text-blue-600 bg-blue-100'
    }
  ]

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <action.icon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{action.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${action.color}`}>
                  {action.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-semibold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">admin@w3kyc.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSidebar