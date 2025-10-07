'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function TestLoginImportsPage() {
  const { user, isAuthenticated, login, walletLogin } = useAuth()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Import Test Successful!</h1>
        <p className="text-gray-600 mb-4">All imports are working correctly</p>
        
        <div className="space-y-2 text-sm">
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          <p><strong>Address:</strong> {address || 'None'}</p>
          <p><strong>Connectors:</strong> {connectors.length}</p>
        </div>

        <div className="mt-6">
          <ConnectButton />
        </div>
      </div>
    </div>
  )
}