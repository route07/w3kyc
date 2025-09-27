'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function ConnectPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, connectEmail } = useAuth();
  const { isConnected, address } = useAccount();

  const handleConnectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      setIsLoading(false);
      return;
    }

    const result = await connectEmail(email, password);
    
    if (result.success) {
      setSuccess('Email connected successfully!');
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || 'Failed to connect email');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect Your Accounts
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Link your wallet and email for a seamless experience
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Email: {user?.email ? 'Connected' : 'Not connected'}
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                Wallet: {isConnected ? `Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Not connected'}
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Wallet</h3>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>

          {/* Email Connection */}
          {isConnected && !user?.email && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Email</h3>
              <form onSubmit={handleConnectEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Create a password"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect Email'}
                </button>
              </form>
            </div>
          )}

          {/* Already Connected */}
          {user?.email && isConnected && (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                ✅ Both email and wallet are connected!
              </div>
              <p className="mt-2 text-sm text-gray-600">
                You can now use either method to sign in.
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-500">
            ← Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}