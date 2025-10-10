'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletIcon } from '@heroicons/react/24/outline';

export default function Web3KYCLink() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleWeb3KYC = async () => {
    setIsLoading(true);
    try {
      // Dynamic import to prevent SSR issues
      const { default: Web3KYC } = await import('@/app/kyc/web3-onboarding/page');
      router.push('/kyc/web3-onboarding');
    } catch (error) {
      console.error('Error loading Web3 KYC:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWeb3KYC}
      disabled={isLoading}
      className="group relative bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/20 rounded-lg">
          <WalletIcon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h4 className="font-semibold text-lg">
            {isLoading ? 'Loading...' : 'Web3 KYC'}
          </h4>
          <p className="text-sm text-purple-100">
            {isLoading ? 'Please wait...' : 'Blockchain-powered verification'}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}