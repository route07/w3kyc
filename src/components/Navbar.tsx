'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  LinkIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      if (isConnected) {
        disconnect()
      }
      // The logout function in AuthContext already redirects to '/'
      // But we'll also ensure it here as a fallback
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to main page
      router.push('/')
    }
  }

  const handleDisconnect = () => {
    if (isConnected) {
      disconnect()
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W3</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Web3 KYC</h1>
                <p className="text-xs text-gray-500">Identity Verification</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/" 
              className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  href="/dashboard" 
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  href="/kyc/web3-onboarding" 
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>KYC</span>
                </Link>
                
                <Link 
                  href="/user-guide" 
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span>Guide</span>
                </Link>
                
                {user?.isAdmin && (
                  <Link 
                    href="/admin" 
                    className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <CogIcon className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {user?.isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Admin
                    </span>
                  )}
                </div>

                {/* Wallet Status */}
                {isConnected && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Wallet</p>
                    <p className="text-xs font-mono text-gray-700">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {isConnected && (
                    <button
                      onClick={handleDisconnect}
                      className="group flex items-center space-x-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="group flex items-center space-x-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link 
                href="/" 
                className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    href="/kyc/web3-onboarding" 
                    className="group flex items-center space-x-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 block px-3 py-3 rounded-lg text-base font-medium shadow-md transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>KYC</span>
                  </Link>
                  
                  <Link 
                    href="/user-guide" 
                    className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpenIcon className="w-5 h-5" />
                    <span>Guide</span>
                  </Link>
                  
                  {user?.isAdmin && (
                    <Link 
                      href="/admin" 
                      className="group flex items-center space-x-3 text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CogIcon className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.isAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  {isConnected && (
                    <div className="px-3 py-2">
                      <p className="text-xs text-gray-500">Wallet</p>
                      <p className="text-xs font-mono text-gray-700">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </div>
                  )}
                  
                  <div className="px-3 py-2 space-y-2">
                    {isConnected && (
                      <button
                        onClick={() => {
                          handleDisconnect()
                          setIsMenuOpen(false)
                        }}
                        className="group flex items-center space-x-2 w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Disconnect Wallet</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="group flex items-center space-x-2 w-full text-left px-3 py-3 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    href="/auth/login"
                    className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="group flex items-center space-x-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 block px-3 py-3 rounded-lg text-base font-medium shadow-md transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}