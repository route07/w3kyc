import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Add Tractsafe testnet configuration
export const tractsafeChain = {
  id: 35935,
  name: 'Tractsafe',
  network: 'tractsafe',
  nativeCurrency: {
    decimals: 18,
    name: 'Tractsafe',
    symbol: 'TS',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://tapi.tractsafe.com'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://tapi.tractsafe.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tractsafe Explorer',
      url: 'https://explorer.tractsafe.com',
    },
  },
  testnet: true,
};

// Only create config once - use singleton pattern
let configInstance: any = null;

export const config = (() => {
  if (!configInstance) {
    configInstance = getDefaultConfig({
      appName: 'W3KYC',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
      chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, tractsafeChain],
      ssr: true,
    });
  }
  return configInstance;
})();

// Prevent multiple initializations
if (typeof window !== 'undefined') {
  (window as any).__WAGMI_CONFIG_INITIALIZED__ = true;
}

// Export the same config as extendedConfig to avoid confusion
export const extendedConfig = config;
