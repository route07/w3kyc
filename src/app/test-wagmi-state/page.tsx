'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function TestWagmiStatePage() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testConnect = async () => {
    if (!connectors[0]) {
      addLog('ERROR: No connectors available')
      return
    }

    addLog(`Testing connection with: ${connectors[0].name}`)
    setIsLoading(true)

    try {
      await connect({ connector: connectors[0] })
      addLog('SUCCESS: Connect function completed')
    } catch (error) {
      addLog(`ERROR: Connect failed - ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDisconnect = () => {
    addLog('Testing disconnect...')
    disconnect()
    addLog('Disconnect called')
  }

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    addLog('Component mounted')
    addLog(`Initial state - isConnected: ${isConnected}, address: ${address || 'None'}`)
  }, [])

  useEffect(() => {
    addLog(`State changed - isConnected: ${isConnected}, address: ${address || 'None'}, connector: ${connector?.name || 'None'}`)
  }, [isConnected, address, connector])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Wagmi State</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wagmi State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>isConnected:</strong> {isConnected ? 'Yes' : 'No'}</p>
              <p><strong>address:</strong> {address || 'None'}</p>
              <p><strong>connector:</strong> {connector?.name || 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connectors</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Available:</strong> {connectors.length}</p>
              {connectors.map((c, i) => (
                <p key={i}><strong>{i + 1}:</strong> {c.name} ({c.type})</p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={testConnect}
                disabled={isLoading || connectors.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Test Connect'}
              </button>
              <button
                onClick={testDisconnect}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
              <button
                onClick={clearLogs}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* RainbowKit Connect Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">RainbowKit Connect Button</h2>
          <div className="flex justify-center">
            <ConnectButton />
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