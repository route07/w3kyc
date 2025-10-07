'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestWeb3LoginPage() {
  const { user, isAuthenticated, walletLogin } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const [logs, setLogs] = useState<string[]>([])
  const [testResult, setTestResult] = useState<any>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testWalletConnect = async () => {
    if (!connectors[0]) {
      addLog('ERROR: No wallet connectors available')
      setTestResult({ success: false, error: 'No wallet connectors available' })
      return
    }

    addLog('Connecting wallet...')
    try {
      await connect({ connector: connectors[0] })
      addLog('Wallet connected successfully')
    } catch (error) {
      addLog(`Wallet connection error: ${error.message}`)
      setTestResult({ success: false, error: error.message })
    }
  }

  const testWalletLogin = async () => {
    if (!address) {
      addLog('ERROR: No wallet address found')
      setTestResult({ success: false, error: 'No wallet address found' })
      return
    }

    addLog(`Testing wallet login with address: ${address}`)
    setTestResult(null)

    try {
      const result = await walletLogin(address)
      
      if (result.success) {
        addLog('SUCCESS: Wallet login successful')
        setTestResult({ success: true, message: 'Wallet login successful!' })
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        addLog(`ERROR: Wallet login failed - ${result.error}`)
        setTestResult({ success: false, error: result.error })
      }
    } catch (error) {
      addLog(`NETWORK ERROR: ${error.message}`)
      setTestResult({ success: false, error: error.message })
    }
  }

  const clearLogs = () => {
    setLogs([])
    setTestResult(null)
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Authenticated: ${isAuthenticated}`)
    addLog(`Wallet Connected: ${isConnected}`)
    addLog(`Address: ${address || 'None'}`)
    addLog(`Connectors: ${connectors.length}`)
  }, [isAuthenticated, isConnected, address, connectors.length])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Web3 Login</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
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

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Web3 Login</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Prerequisites</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You must have an existing account with a connected wallet</li>
                <li>• The wallet must be connected to your account in the database</li>
                <li>• If you don't have a wallet connected, use the connect-wallet page first</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4">
              {!isConnected ? (
                <button
                  onClick={testWalletConnect}
                  disabled={connectors.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={testWalletLogin}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Test Wallet Login
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
              <button
                onClick={clearLogs}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Successful Web3 Login</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• User should be authenticated with wallet address</li>
                <li>• Auth method should be 'web3'</li>
                <li>• User should be redirected to dashboard</li>
                <li>• User data should be loaded from database</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">❌ Failed Web3 Login</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• "No account found with this wallet address" - wallet not connected to any account</li>
                <li>• "Invalid wallet address format" - malformed address</li>
                <li>• Network errors - API or database issues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting a wallet and testing login.</p>
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
            href="/auth/login"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Login Page
          </Link>
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Wallet First
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}