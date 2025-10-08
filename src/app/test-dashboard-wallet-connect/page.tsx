'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import Link from 'next/link'

export default function TestDashboardWalletConnectPage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const [logs, setLogs] = useState<string[]>([])
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  // Same wallet connection logic as KYC onboarding and dashboard
  const handleWalletConnect = async () => {
    try {
      addLog('Starting wallet connection...')
      setWalletConnecting(true);
      setWalletError(null);
      
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        addLog('Wallet provider detected, requesting accounts...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          addLog(`Wallet connected: ${walletAddress}`)
          
          // Save to database if user is authenticated
          const token = localStorage.getItem('auth_token');
          if (token) {
            addLog('Saving wallet to database...')
            try {
              const response = await fetch('/api/auth/connect-wallet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress })
              });

              const result = await response.json();
              if (result.success) {
                addLog('✅ Wallet connected and saved to database successfully!')
                // Refresh the page to show updated user data
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } else {
                addLog(`❌ Database save failed: ${result.error}`)
                setWalletError(result.error || 'Failed to save wallet to database');
              }
            } catch (dbError) {
              addLog(`❌ Database error: ${dbError}`)
              console.error('Database save failed:', dbError);
              setWalletError('Failed to save wallet to database');
            }
          } else {
            addLog('❌ No authentication token found')
            setWalletError('No authentication token found');
          }
        } else {
          addLog('❌ No accounts returned from wallet')
          setWalletError('No accounts returned from wallet');
        }
      } else {
        addLog('❌ No wallet provider detected')
        setWalletError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      addLog(`❌ Wallet connection error: ${error}`)
      console.error('Wallet connection error:', error);
      setWalletError('Failed to connect wallet. Please try again.');
    } finally {
      setWalletConnecting(false);
    }
  };

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Initial state - isConnected: ${isConnected}, address: ${address || 'None'}`)
    addLog(`Authenticated: ${isAuthenticated}, user: ${user?.email || 'None'}`)
    addLog(`User wallet: ${user?.walletAddress || 'None'}`)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Dashboard Wallet Connect</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auth Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Match:</strong> {user?.walletAddress === address ? 'Yes' : 'No'}</p>
              <p><strong>Connecting:</strong> {walletConnecting ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How to Test</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Make sure you're logged in (authenticated)</li>
                <li>Disconnect your wallet if it's connected</li>
                <li>Click "Connect Wallet" button below</li>
                <li>Watch the logs for step-by-step process</li>
                <li>Check if wallet gets saved to database</li>
              </ol>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Expected Behavior (Same as KYC Onboarding)</h3>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Uses window.ethereum.request() directly</li>
                <li>Requests user permission to connect</li>
                <li>Saves wallet address to database</li>
                <li>Refreshes page to show updated data</li>
                <li>Shows loading state during connection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="text-center">
              <button
                onClick={handleWalletConnect}
                disabled={walletConnecting || !isAuthenticated}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => disconnect()}
                disabled={!isConnected}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
              
              <button
                onClick={clearLogs}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {walletError && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{walletError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting wallet.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to KYC Onboarding
          </Link>
        </div>
      </div>
    </div>
  )
}