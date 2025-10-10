'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'

export default function DebugWalletApiPage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [logs, setLogs] = useState<string[]>([])
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    data?: unknown;
    error?: string;
    [key: string]: unknown;
  } | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testWalletApi = async () => {
    addLog('Starting wallet API test...')
    
    if (!isAuthenticated) {
      addLog('ERROR: Not authenticated')
      setTestResult({ success: false, error: 'Not authenticated' })
      return
    }

    if (!address) {
      addLog('ERROR: No wallet address')
      setTestResult({ success: false, error: 'No wallet address' })
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      addLog('ERROR: No auth token')
      setTestResult({ success: false, error: 'No auth token' })
      return
    }

    addLog(`Testing with wallet: ${address}`)
    addLog(`Using token: ${token.substring(0, 20)}...`)

    try {
      addLog('Sending request to /api/auth/connect-wallet...')
      
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ walletAddress: address })
      })

      addLog(`Response status: ${response.status}`)
      
      const data = await response.json()
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`)
      
      setTestResult(data)
      
      if (data.success) {
        addLog('SUCCESS: Wallet saved to database')
      } else {
        addLog(`ERROR: ${data.error}`)
      }
      
    } catch (error) {
      addLog(`NETWORK ERROR: ${error.message}`)
      setTestResult({ success: false, error: error.message })
    }
  }

  const testUserData = async () => {
    addLog('Testing user data fetch...')
    
    const token = localStorage.getItem('auth_token')
    if (!token) {
      addLog('ERROR: No auth token for user data test')
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      addLog(`User data response: ${JSON.stringify(data, null, 2)}`)
      
    } catch (error) {
      addLog(`User data error: ${error.message}`)
    }
  }

  const handleConnectWallet = async () => {
    if (!connectors[0]) {
      addLog('ERROR: No wallet connectors available')
      return
    }

    addLog('Connecting wallet...')
    try {
      await connect({ connector: connectors[0] })
      addLog('Wallet connected successfully')
    } catch (error) {
      addLog(`Wallet connection error: ${error.message}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setTestResult(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">Please login to test wallet API</p>
          <button
            onClick={() => router.push('/test-login')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Wallet API</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Connectors:</strong> {connectors.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Result</h2>
            <div className="space-y-2 text-sm">
              {testResult ? (
                <>
                  <p><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</p>
                  {testResult.error && (
                    <p><strong>Error:</strong> {testResult.error}</p>
                  )}
                  {testResult.message && (
                    <p><strong>Message:</strong> {testResult.message}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No test run yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={connectors.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <button
                  onClick={testWalletApi}
                  className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Test Wallet API
                </button>
                <button
                  onClick={testUserData}
                  className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Test User Data
                </button>
                <button
                  onClick={() => disconnect()}
                  className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Disconnect Wallet
                </button>
              </>
            )}
            <button
              onClick={clearLogs}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting a wallet and testing the API.</p>
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