'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (user?.walletAddress || address) {
        try {
          const walletAddr = user?.walletAddress || address;
          const response = await fetch(`/api/kyc/submit?walletAddress=${walletAddr}`);
          const result = await response.json();
          if (result.success) {
            setKycStatus(result.data);
          }
        } catch (error) {
          console.error('Error fetching KYC status:', error);
        }
      }
    };

    fetchKYCStatus();
  }, [user, address]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">W3</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">W3KYC Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName || 'User'}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h3>
              <div className="space-y-2">
                {user?.email && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">Email:</span>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                )}
                {(user?.walletAddress || address) && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">Wallet:</span>
                    <span className="text-gray-900 font-mono text-sm">
                      {(user?.walletAddress || address)?.slice(0, 6)}...{(user?.walletAddress || address)?.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">Type:</span>
                  <span className="text-gray-900">
                    {user?.email && (user?.walletAddress || address) ? 'Hybrid' : 
                     user?.email ? 'Web2' : 'Web3'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">KYC Status</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getKYCStatusColor(kycStatus?.status || 'NONE')}`}>
                    {kycStatus?.status || 'Not Started'}
                  </span>
                </div>
                {kycStatus?.kycData?.jurisdiction && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">Jurisdiction:</span>
                    <span className="text-gray-900">{kycStatus.kycData.jurisdiction}</span>
                  </div>
                )}
                {kycStatus?.kycData?.riskScore && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">Risk Score:</span>
                    <span className="text-gray-900">{kycStatus.kycData.riskScore}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KYC Verification */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🆔</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">KYC Verification</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Complete your Know Your Customer verification process
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {kycStatus?.status === 'NONE' || !kycStatus?.status ? 'Start KYC' : 'View Status'}
            </button>
          </div>

          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">⚙️</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Profile Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your account information and preferences
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Profile
            </button>
          </div>

          {/* Blockchain Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⛓️</span>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Blockchain Status</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View deployed contracts and network status
            </p>
            <button
              onClick={() => router.push('/blockchain-status')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Status
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {kycStatus?.kycData && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📝</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">KYC Submission</p>
                    <p className="text-xs text-gray-500">
                      {kycStatus.kycData.createdAt ? 
                        new Date(kycStatus.kycData.createdAt).toLocaleDateString() : 
                        'Recently'
                      }
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(kycStatus.status)}`}>
                  {kycStatus.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}