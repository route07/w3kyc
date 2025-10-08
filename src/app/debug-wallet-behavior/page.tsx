'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function DebugWalletBehaviorPage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  
  const [logs, setLogs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testDisconnect = () => {
    addLog('Testing disconnect...')
    disconnect()
    addLog('Disconnect called')
  }

  const testLogout = async () => {
    addLog('Testing logout...')
    // Simulate logout by clearing local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    addLog('Local storage cleared')
  }

  useEffect(() => {
    setMounted(true)
    addLog('Component mounted')
  }, [])

  useEffect(() => {
    if (mounted) {
      addLog(`Wallet state changed - isConnected: ${isConnected}, address: ${address || 'None'}, connector: ${connector?.name || 'None'}`)
    }
  }, [isConnected, address, connector, mounted])

  useEffect(() => {
    if (mounted) {
      addLog(`Auth state changed - isAuthenticated: ${isAuthenticated}, user: ${user?.email || 'None'}`)
    }
  }, [isAuthenticated, user, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Wallet Behavior</h1>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Connector:</strong> {connector?.name || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auth Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
              <p><strong>Auth Method:</strong> {user?.authMethod || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Storage</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Auth Token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
              <p><strong>Auth User:</strong> {localStorage.getItem('auth_user') ? 'Present' : 'Missing'}</p>
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
                onClick={testDisconnect}
                disabled={!isConnected}
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Disconnect Wallet
              </button>
              
              <button
                onClick={testLogout}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Auth Data
              </button>
              
              <button
                onClick={clearLogs}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
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
              <h3 className="font-semibold text-green-900 mb-2">✅ Correct Behavior</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Wallet should NOT auto-connect on page load</li>
                <li>• User must manually click ConnectButton to connect</li>
                <li>• Disconnect should work and clear wallet state</li>
                <li>• Logout should clear auth data but not affect wallet</li>
                <li>• Wallet connection should persist across page refreshes (if user connected it)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">❌ Incorrect Behavior</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Wallet auto-connecting without user action</li>
                <li>• Wallet connecting but not saving to database</li>
                <li>• Disconnect not working properly</li>
                <li>• Wallet auto-reconnecting after logout</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting/disconnecting wallet.</p>
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
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}