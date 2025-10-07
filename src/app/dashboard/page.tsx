'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { XMarkIcon, UserIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication check
  useEffect(() => {
    if (!mounted) return;

    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  // Fetch KYC status
  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (user?.walletAddress || address) {
        try {
          const walletAddr = user?.walletAddress || address;
          const response = await fetch(`/api/kyc/submit?walletAddress=${walletAddr}`);
          if (response.ok) {
            const data = await response.json();
            setKycStatus(data);
          }
        } catch (error) {
          console.error('Error fetching KYC status:', error);
        }
      }
    };

    if (mounted && isAuthenticated && user) {
      fetchKYCStatus();
    }
  }, [mounted, isAuthenticated, user, address]);

  const handleLogout = async () => {
    try {
      if (isConnected) {
        disconnect();
      }
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show dashboard content
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">Your Web3 Identity Hub</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.email ? (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {user?.firstName || user?.email}!
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Wallet Connected</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-md"
                title="Disconnect & Logout"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <ShieldCheckIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome to your W3KYC Dashboard
                  </h2>
                  <p className="text-indigo-100 text-lg">
                    Your decentralized identity verification hub
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl">
                Manage your identity verification, view your KYC status, and access your blockchain credentials 
                in a secure, decentralized environment.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Info Card */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.authMethod === 'web2' ? 'Email' : 'Web3'}
                    </div>
                    <div className="text-sm text-gray-600">Account Type</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.authMethod === 'web2' ? 'Email Account' : 'Web3 Wallet'}
                  </span>
                </div>
              </div>
            </div>

            {/* KYC Status Card */}
            <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.kycStatus || 'Not Started'}
                    </div>
                    <div className="text-sm text-gray-600">KYC Status</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    user?.kycStatus === 'verified' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    user?.kycStatus === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.kycStatus === 'verified' ? 'Verified' :
                     user?.kycStatus === 'pending' ? 'Under Review' :
                     'Not Started'}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Status Card */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {isConnected ? 'Active' : 'Offline'}
                    </div>
                    <div className="text-sm text-gray-600">Wallet Status</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <UserIcon className="w-6 h-6 mr-3" />
                Account Information
              </h3>
              <p className="mt-1 text-indigo-100">
                Your account details and verification status
              </p>
            </div>
            <div className="divide-y divide-gray-200/50">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Email Address
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.email || 'Not provided'}
                </dd>
              </div>
              <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Full Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : 'Not provided'
                  }
                </dd>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Wallet Address
                </dt>
                <dd className="mt-1 text-sm font-mono text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.walletAddress || address || 'Not connected'}
                </dd>
              </div>
              <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  KYC Status
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.kycStatus === 'verified' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                      : user?.kycStatus === 'pending'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      user?.kycStatus === 'verified' ? 'bg-green-500' :
                      user?.kycStatus === 'pending' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    {user?.kycStatus === 'verified' ? 'Verified' :
                     user?.kycStatus === 'pending' ? 'Under Review' :
                     'Not Started'}
                  </span>
                </dd>
              </div>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                  Account Created
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'
                  }
                </dd>
              </div>
            </div>
          </div>

          {/* KYC Status Details */}
          {kycStatus && (
            <div className="bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-200/50 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 mr-3" />
                  KYC Verification Details
                </h3>
                <p className="mt-1 text-emerald-100">
                  Your current KYC verification status and details
                </p>
              </div>
              <div className="divide-y divide-gray-200/50">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Verification Status
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {kycStatus.status || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Risk Assessment
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${kycStatus.riskScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {kycStatus.riskScore || 0}%
                      </span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/onboarding')}
              className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Start KYC Process</span>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center space-x-3">
                <UserIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Update Profile</span>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={() => router.push('/blockchain-status')}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center space-x-3">
                <DocumentTextIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Blockchain Status</span>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}