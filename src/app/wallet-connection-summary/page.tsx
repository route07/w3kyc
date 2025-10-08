'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function WalletConnectionSummaryPage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('Wallet Connection Summary Page Loaded')
    addLog(`Current Status - Connected: ${isConnected}, Address: ${address || 'None'}`)
    addLog(`User Status - Authenticated: ${isAuthenticated}, Email: ${user?.email || 'None'}`)
    addLog(`User Wallet: ${user?.walletAddress || 'None'}`)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Connection Summary</h1>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Status</h2>
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
              <p><strong>Auto-Connect:</strong> {isConnected && isAuthenticated && !user?.walletAddress ? 'Should Trigger' : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Methods */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection Methods</h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. Login Page</h3>
              <p className="text-sm text-blue-800 mb-2">Uses RainbowKit ConnectButton with auto-connect feature</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Manual wallet connection via RainbowKit</li>
                <li>Auto-saves to database when user is authenticated</li>
                <li>Manual "Sign in with Wallet" button</li>
              </ul>
              <Link href="/auth/login" className="text-xs text-blue-600 hover:text-blue-500">
                Test Login Page →
              </Link>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. Dashboard Connect Button</h3>
              <p className="text-sm text-green-800 mb-2">Redirects to dedicated connect-wallet page</p>
              <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                <li>Button redirects to /connect-wallet page</li>
                <li>Uses RainbowKit ConnectButton</li>
                <li>Auto-saves to database when user is authenticated</li>
              </ul>
              <Link href="/dashboard" className="text-xs text-green-600 hover:text-green-500">
                Test Dashboard →
              </Link>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. KYC Onboarding</h3>
              <p className="text-sm text-purple-800 mb-2">Uses direct window.ethereum API calls</p>
              <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                <li>Direct window.ethereum.request() calls</li>
                <li>Auto-saves to database during onboarding</li>
                <li>Integrated into KYC flow</li>
              </ul>
              <Link href="/onboarding" className="text-xs text-purple-600 hover:text-purple-500">
                Test KYC Onboarding →
              </Link>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">4. Connect Wallet Page</h3>
              <p className="text-sm text-yellow-800 mb-2">Dedicated wallet connection page</p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>Uses RainbowKit ConnectButton</li>
                <li>Step-by-step connection process</li>
                <li>Auto-saves to database when user is authenticated</li>
              </ul>
              <Link href="/connect-wallet" className="text-xs text-yellow-600 hover:text-yellow-500">
                Test Connect Wallet Page →
              </Link>
            </div>
          </div>
        </div>

        {/* Auto-Connect Feature */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Connect Feature</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Auto-Connect Active</h3>
              <p className="text-sm text-green-800 mb-2">
                When a user is authenticated and connects their wallet, it automatically gets saved to their account in the database.
              </p>
              <div className="text-xs text-green-700">
                <p><strong>Triggers when:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>User is authenticated (logged in)</li>
                  <li>Wallet is connected</li>
                  <li>User has no wallet in database</li>
                  <li>User has an email address</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔄 How It Works</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>User logs in with email/password</li>
                <li>User connects wallet via any method above</li>
                <li>Auto-connect detects: authenticated + wallet connected + no wallet in DB</li>
                <li>Automatically calls /api/auth/connect-wallet API</li>
                <li>Page refreshes to show updated user data</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => disconnect()}
                disabled={!isConnected}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Disconnect Wallet
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}