'use client';

import Link from 'next/link'
import { useEffect } from 'react'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CubeIcon,
  ArrowRightIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const { address, isConnected } = useAccount()

  // Auto-connect wallet to user account when wallet connects and user is authenticated
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (isConnected && address && isAuthenticated && user?.email && !user?.walletAddress) {
        console.log('Auto-connecting wallet to user account on main page...');
        try {
          const response = await fetch('/api/auth/connect-wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ walletAddress: address })
          });

          const data = await response.json();
          if (data.success) {
            console.log('Wallet automatically connected to user account');
            // Refresh user data to show updated wallet address
            window.location.reload();
          } else {
            console.log('Auto-connect failed:', data.error);
          }
        } catch (error) {
          console.log('Auto-connect error:', error);
        }
      }
    };

    autoConnectWallet();
  }, [isConnected, address, isAuthenticated, user?.email, user?.walletAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Web3 KYC
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Demo
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of decentralized identity verification with blockchain-powered KYC, 
            AI risk assessment, and reusable credentials on the Tractsafe blockchain.
          </p>
          
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">All 5 smart contracts successfully deployed on Tractsafe testnet!</span>
            </div>
            <p className="text-sm text-green-700 mt-2 text-center">
              London EVM compatibility resolved • 100% deployment success • Production ready
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <div className="inline-flex">
                  <ConnectButton />
                </div>
              </>
            )}
            <Link 
              href="/blockchain-status"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              View Status
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Web3 KYC Solution
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built on Tractsafe blockchain with comprehensive smart contracts, 
              AI-powered risk assessment, and seamless user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Smart Contract KYC</h4>
              <p className="text-gray-600 mb-4">
                Decentralized KYC verification using 5 deployed smart contracts on Tractsafe blockchain.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• KYCDataStorage</li>
                <li>• TenantConfigStorage</li>
                <li>• AuditLogStorage</li>
                <li>• InputValidator</li>
                <li>• BoundsChecker</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">AI Risk Assessment</h4>
              <p className="text-gray-600 mb-4">
                Advanced AI-powered risk scoring and compliance checking for comprehensive user verification.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Real-time risk scoring</li>
                <li>• Compliance validation</li>
                <li>• Document verification</li>
                <li>• Jurisdiction support</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Integration</h4>
              <p className="text-gray-600 mb-4">
                Seamless Web3 wallet integration with RainbowKit and full blockchain functionality.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Wallet connection</li>
                <li>• Transaction signing</li>
                <li>• Multi-chain support</li>
                <li>• Gas optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Live on Tractsafe
            </h3>
            <p className="text-lg text-gray-600">
              Fully deployed and operational smart contract system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600">Smart Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Deployment Success</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">London</div>
              <div className="text-gray-600">EVM Version</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">Live</div>
              <div className="text-gray-600">Production Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Web3 KYC?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of decentralized identity verification. 
            Connect your wallet or create an account to get started.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <div className="inline-flex">
                  <ConnectButton />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}