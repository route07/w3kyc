'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function TestWalletPersistencePage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const [logs, setLogs] = useState<string[]>([])
  const [walletInDb, setWalletInDb] = useState<boolean | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const checkWalletInDatabase = async () => {
    if (!address) {
      addLog('No wallet address to check')
      setWalletInDb(null)
      return
    }

    addLog(`Checking if wallet ${address} is in database...`)
    
    try {
      const response = await fetch(`/api/debug-user?email=${user?.email}`)
      const data = await response.json()
      
      if (data.walletAddress === address) {
        addLog('✅ Wallet is connected to user account in database')
        setWalletInDb(true)
      } else {
        addLog('❌ Wallet is NOT connected to user account in database')
        addLog(`User wallet in DB: ${data.walletAddress || 'None'}`)
        addLog(`Current wallet: ${address}`)
        setWalletInDb(false)
      }
    } catch (error) {
      addLog(`Error checking database: ${error.message}`)
      setWalletInDb(null)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Initial state - isConnected: ${isConnected}, address: ${address || 'None'}`)
    addLog(`Authenticated: ${isAuthenticated}, user: ${user?.email || 'None'}`)
  }, [])

  useEffect(() => {
    if (isConnected && address && isAuthenticated) {
      addLog('Wallet connected and user authenticated - checking database...')
      checkWalletInDatabase()
    } else if (isConnected && address && !isAuthenticated) {
      addLog('Wallet connected but user not authenticated')
      setWalletInDb(null)
    } else {
      addLog('Wallet not connected')
      setWalletInDb(null)
    }
  }, [isConnected, address, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wallet Persistence</h1>

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
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Wallet in DB:</strong> {
                walletInDb === null ? 'Unknown' : 
                walletInDb ? 'Yes' : 'No'
              }</p>
              <p><strong>Match:</strong> {
                user?.walletAddress === address ? 'Yes' : 'No'
              }</p>
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
                onClick={checkWalletInDatabase}
                disabled={!isConnected || !isAuthenticated}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Check Database
              </button>
              
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

        {/* Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis</h2>
          <div className="space-y-4">
            {isConnected && address && isAuthenticated && walletInDb === false && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Wallet Not in Database</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Your wallet is connected but not linked to your account in the database.
                </p>
                <div className="text-xs text-yellow-700">
                  <p><strong>This means:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Wallet connected via RainbowKit (persistent)</li>
                    <li>But not saved to your user account</li>
                    <li>You need to use the connect-wallet page to link them</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <Link
                    href="/connect-wallet"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    Connect Wallet to Account
                  </Link>
                </div>
              </div>
            )}

            {isConnected && address && isAuthenticated && walletInDb === true && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Wallet Properly Connected</h3>
                <p className="text-sm text-green-800">
                  Your wallet is connected and properly linked to your account in the database.
                </p>
              </div>
            )}

            {isConnected && address && !isAuthenticated && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Wallet Connected, Not Authenticated</h3>
                <p className="text-sm text-blue-800">
                  Your wallet is connected but you're not logged in. Please log in first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting wallet and checking database.</p>
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
            Go to Login
          </Link>
          <Link
            href="/connect-wallet"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    </div>
  )
}