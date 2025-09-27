'use client';

import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { WalletConnect } from '@/components/auth/WalletConnect';
import { ConnectEmailForm } from '@/components/auth/ConnectEmailForm';
import { useAccount } from 'wagmi';

type AuthMode = 'login' | 'signup' | 'wallet' | 'connect-email';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isConnected } = useAccount();

  const renderAuthComponent = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToWeb3={() => setMode('wallet')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={() => setMode('login')}
            onSwitchToWeb3={() => setMode('wallet')}
          />
        );
      case 'wallet':
        return (
          <WalletConnect
            onSwitchToEmail={() => setMode('login')}
            onConnectSuccess={() => {
              if (isConnected) {
                setMode('connect-email');
              }
            }}
          />
        );
      case 'connect-email':
        return (
          <ConnectEmailForm
            onSuccess={() => {
              // Redirect to dashboard or onboarding
              window.location.href = '/dashboard';
            }}
            onCancel={() => {
              // Skip email connection, go to dashboard
              window.location.href = '/dashboard';
            }}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToWeb3={() => setMode('wallet')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">W3</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            W3KYC
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Secure KYC verification for Web3
          </p>
        </div>

        {/* Auth Component */}
        {renderAuthComponent()}

        {/* Mode Indicators */}
        <div className="flex justify-center space-x-4 text-sm">
          <button
            onClick={() => setMode('login')}
            className={`px-3 py-1 rounded-full transition-colors ${
              mode === 'login'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-3 py-1 rounded-full transition-colors ${
              mode === 'signup'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Signup
          </button>
          <button
            onClick={() => setMode('wallet')}
            className={`px-3 py-1 rounded-full transition-colors ${
              mode === 'wallet'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Wallet
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-1">🔒</div>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-1">⚡</div>
              <span>Fast</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-1">🌐</div>
              <span>Web3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}