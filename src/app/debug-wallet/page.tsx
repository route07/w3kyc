'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugWalletPage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Connectors available: ${connectors.length}`)
    addLog(`Wagmi connected: ${isConnected}`)
    addLog(`Address: ${address || 'None'}`)
  }, [connectors.length, isConnected, address])

  const handleConnect = async () => {
    addLog('Attempting to connect wallet...')
    try {
      if (connectors.length === 0) {
        addLog('ERROR: No connectors available')
        return
      }
      
      addLog(`Using connector: ${connectors[0].name}`)
      await connect({ connector: connectors[0] })
      addLog('SUCCESS: Wallet connected')
    } catch (error) {
      addLog(`ERROR: ${error.message}`)
    }
  }

  const handleDisconnect = () => {
    addLog('Disconnecting wallet...')
    disconnect()
    addLog('Wallet disconnected')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet Connection Debug</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Wallet:</strong> {user?.walletAddress || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wagmi Status</h2>
            <div className="space-y-2">
              <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Address:</strong> {address || 'None'}</p>
              <p><strong>Connectors:</strong> {connectors.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
            <div className="space-y-2">
              <p><strong>WalletConnect ID:</strong> {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'Set' : 'Not Set'}</p>
              <p><strong>RPC URL:</strong> {process.env.NEXT_PUBLIC_RPC_URL ? 'Set' : 'Not Set'}</p>
              <p><strong>Chain ID:</strong> {process.env.NEXT_PUBLIC_CHAIN_ID || 'Not Set'}</p>
            </div>
          </div>
        </div>

        {/* Connectors Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Connectors</h2>
          {connectors.length === 0 ? (
            <p className="text-red-600">No wallet connectors available. This usually means:</p>
          ) : (
            <div className="space-y-2">
              {connectors.map((connector, index) => (
                <div key={connector.id} className="p-3 bg-gray-50 rounded">
                  <p><strong>Name:</strong> {connector.name}</p>
                  <p><strong>ID:</strong> {connector.id}</p>
                  <p><strong>Type:</strong> {connector.type}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure you have a wallet extension installed (MetaMask, Coinbase Wallet, etc.)</li>
              <li>• Refresh the page if connectors don't appear</li>
              <li>• Check browser console for errors</li>
              <li>• Try a different browser if issues persist</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={connectors.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Connect Wallet
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Disconnect Wallet
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Try connecting a wallet.</p>
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