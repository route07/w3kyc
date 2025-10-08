'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import Link from 'next/link'

export default function DebugWalletDbSavePage() {
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

  // Dashboard implementation (exact copy)
  const handleDashboardWalletConnect = async () => {
    try {
      addLog('🔵 Dashboard wallet connection started')
      setWalletConnecting(true);
      setWalletError(null);
      
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        addLog('🔵 Wallet provider detected, requesting accounts...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        addLog(`🔵 Accounts received: ${JSON.stringify(accounts)}`)
        
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          addLog(`🔵 Wallet address: ${walletAddress}`)
          
          // Save to database if user is authenticated
          const token = localStorage.getItem('auth_token');
          addLog(`🔵 Auth token found: ${!!token}`)
          
          if (token) {
            try {
              addLog('🔵 Sending wallet address to database...')
              const response = await fetch('/api/auth/connect-wallet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress })
              });

              addLog(`🔵 Database response status: ${response.status}`)
              const result = await response.json();
              addLog(`🔵 Database response: ${JSON.stringify(result)}`)
              
              if (result.success) {
                addLog('🔵 ✅ Wallet connected and saved to database successfully')
                // Refresh the page to show updated user data
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                addLog(`🔵 ❌ Database save failed: ${result.error}`)
                setWalletError(result.error || 'Failed to save wallet to database');
              }
            } catch (dbError) {
              addLog(`🔵 ❌ Database save error: ${dbError}`)
              setWalletError('Failed to save wallet to database');
            }
          } else {
            addLog('🔵 ❌ No authentication token found')
            setWalletError('No authentication token found');
          }
        } else {
          addLog('🔵 ❌ No accounts returned from wallet')
          setWalletError('No accounts returned from wallet');
        }
      } else {
        addLog('🔵 ❌ No wallet provider detected')
        setWalletError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      addLog(`🔵 ❌ Wallet connection error: ${error}`)
      setWalletError('Failed to connect wallet. Please try again.');
    } finally {
      setWalletConnecting(false);
    }
  };

  // KYC implementation (exact copy)
  const handleKYCWalletConnect = async () => {
    try {
      addLog('🟢 KYC wallet connection started')
      setWalletConnecting(true);
      setWalletError(null);
      
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        addLog('🟢 Wallet provider detected, requesting accounts...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        addLog(`🟢 Accounts received: ${JSON.stringify(accounts)}`)
        
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          addLog(`🟢 Wallet address: ${walletAddress}`)
          
          // Save to database if user is authenticated
          const token = localStorage.getItem('auth_token');
          addLog(`🟢 Auth token found: ${!!token}`)
          
          if (token) {
            try {
              addLog('🟢 Sending wallet address to database...')
              const response = await fetch('/api/auth/connect-wallet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress })
              });

              addLog(`🟢 Database response status: ${response.status}`)
              const result = await response.json();
              addLog(`🟢 Database response: ${JSON.stringify(result)}`)
              
              if (result.success) {
                addLog('🟢 ✅ Wallet connected and saved to database successfully')
                // Refresh the page to show updated user data
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                addLog(`🟢 ❌ Database save failed: ${result.error}`)
                setWalletError(result.error || 'Failed to save wallet to database');
              }
            } catch (dbError) {
              addLog(`🟢 ❌ Database save error: ${dbError}`)
              setWalletError('Failed to save wallet to database');
            }
          } else {
            addLog('🟢 ❌ No authentication token found')
            setWalletError('No authentication token found');
          }
        } else {
          addLog('🟢 ❌ No accounts returned from wallet')
          setWalletError('No accounts returned from wallet');
        }
      } else {
        addLog('🟢 ❌ No wallet provider detected')
        setWalletError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      addLog(`🟢 ❌ Wallet connection error: ${error}`)
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Wallet DB Save</h1>

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
                <li>Try both "Dashboard Connect" and "KYC Connect" buttons</li>
                <li>Compare the logs to see any differences</li>
                <li>Check if wallet gets saved to database</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDashboardWalletConnect}
                disabled={walletConnecting || !isAuthenticated}
                className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletConnecting ? 'Connecting...' : 'Dashboard Connect'}
              </button>
              
              <button
                onClick={handleKYCWalletConnect}
                disabled={walletConnecting || !isAuthenticated}
                className="px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletConnecting ? 'Connecting...' : 'KYC Connect'}
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
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to KYC Onboarding
          </Link>
        </div>
      </div>
    </div>
  )
}