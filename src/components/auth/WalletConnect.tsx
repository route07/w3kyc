'use client';

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';

interface WalletConnectProps {
  onSwitchToEmail?: () => void;
  onConnectSuccess?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onSwitchToEmail,
  onConnectSuccess 
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const result = await connectWallet();
      if (result.success) {
        onConnectSuccess?.();
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Connect Wallet</h2>
          <p className="text-gray-600 mt-2">Connect your Web3 wallet to get started</p>
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6">
                <div className="text-white text-4xl mb-2">🔗</div>
                <h3 className="text-white text-lg font-semibold">Web3 Authentication</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Connect your wallet for secure, decentralized access
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <ConnectButton />
              
              <div className="text-center">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={onSwitchToEmail}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Email Instead
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <h3 className="text-green-800 font-semibold">Wallet Connected</h3>
                  <p className="text-green-600 text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={onConnectSuccess}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Continue to Dashboard
              </button>
              
              <button
                onClick={handleDisconnect}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet, and more</p>
        </div>
      </div>
    </div>
  );
};