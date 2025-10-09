'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWeb3, setShowWeb3] = useState(false);

  const { login, walletLogin, user, isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  // Handle wallet login when wallet is connected
  const handleWalletLogin = async () => {
    if (!address) {
      setError('No wallet address found');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await walletLogin(address);
      
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        // Check if the error is about wallet not found in database
        if (result.error && result.error.includes('No account found with this wallet address')) {
          setError('Wallet not registered. Please sign up with email first, then connect your wallet.');
        } else {
          setError(result.error || 'Wallet login failed');
        }
      }
    } catch (error) {
      setError('Wallet login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-connect wallet to user account when wallet connects and user is authenticated
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (isConnected && address && isAuthenticated && user?.email && !user?.walletAddress) {
        console.log('Auto-connecting wallet to user account...');
        try {
          const response = await fetch('/api/auth/connect-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ walletAddress: address })
          });

          const data = await response.json();
          if (data.success) {
            console.log('Wallet automatically connected to user account');
            // Refresh user data to show updated wallet address
            window.location.reload();
          } else {
            console.log('Auto-connect failed:', data.error);
          }
        } catch (error) {
          console.log('Auto-connect error:', error);
        }
      }
    };

    autoConnectWallet();
  }, [isConnected, address, isAuthenticated, user?.email, user?.walletAddress]);

  // No automatic wallet login - user must click the button manually

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {!showWeb3 ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowWeb3(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Or connect with wallet
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Connect with your wallet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your wallet to sign in to your existing account
                </p>
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Your wallet must be connected to an existing account. 
                    If you haven&apos;t registered yet, please sign up with email first, then connect your wallet.
                  </p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <ConnectButton />
                </div>
                
                {isConnected && address && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-800">
                          Wallet Connected: {address.substring(0, 6)}...{address.substring(38)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={handleWalletLogin}
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing in...
                          </div>
                        ) : (
                          'Sign in with Wallet'
                        )}
                      </button>
                      
                      <button
                        onClick={() => disconnect()}
                        className="w-full text-sm text-gray-600 hover:text-gray-500"
                      >
                        Use different wallet
                      </button>
                    </div>
                  </div>
                )}
                
                {isLoading && (
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Signing in...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                          {error.includes('Wallet not registered') && (
                            <div className="mt-3">
                              <p className="font-medium mb-2">To use wallet login:</p>
                              <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Sign up with your email address first</li>
                                <li>Then connect your wallet to your account</li>
                                <li>After that, you can use wallet login</li>
                              </ol>
                              <div className="mt-3">
                                <Link
                                  href="/auth/signup"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Sign Up with Email
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowWeb3(false)}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Or sign in with email
                </button>
                <div className="text-xs text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">
                    Sign up here
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}