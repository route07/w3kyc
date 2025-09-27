'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShieldCheckIcon, 
  CogIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const mockSections = [
  {
    id: 'userA',
    name: 'User A - KYC Complete',
    description: 'Fully verified user with blockchain credentials',
    path: '/userA',
    icon: ShieldCheckIcon,
    status: 'verified',
    color: 'green'
  },
  {
    id: 'userB',
    name: 'User B - KYC Not Done',
    description: 'New user who needs to complete verification',
    path: '/userB',
    icon: ExclamationTriangleIcon,
    status: 'not_started',
    color: 'orange'
  },
  {
    id: 'admin',
    name: 'Admin Dashboard',
    description: 'Administrative interface with all data',
    path: '/admin',
    icon: CogIcon,
    status: 'admin',
    color: 'blue'
  }
]

export default function MockNavigation() {
  const pathname = usePathname()

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600'
      case 'orange': return 'text-orange-600'
      case 'blue': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Web3 KYC Demo</h1>
              <p className="text-xs text-gray-500">Route07 Blockchain</p>
            </div>
          </div>

          {/* Admin Dashboard and Blockchain Status */}
          <div className="flex space-x-2">
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin'
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
              }`}
            >
              <CogIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
            
            <Link
              href="/blockchain-status"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/blockchain-status'
                  ? 'bg-green-100 text-green-900'
                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Blockchain</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                21 contracts
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {mockSections.slice(0, 2).map((section) => {
              const Icon = section.icon
              const isActive = pathname === section.path
              
              return (
                <Link
                  key={section.id}
                  href={section.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : getIconColor(section.color)}`} />
                  <span className="text-sm font-medium">{section.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(section.color)}`}>
                    {section.status}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Demo Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">Mock Data Demo</p>
              <p className="text-xs text-gray-500">Web3 KYC System</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 