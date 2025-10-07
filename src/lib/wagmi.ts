import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Add Route07 testnet configuration
export const route07Chain = {
  id: 3001,
  name: 'Route07',
  network: 'route07',
  nativeCurrency: {
    decimals: 18,
    name: 'Route07',
    symbol: 'R07',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.route07.com'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.route07.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Route07 Explorer',
      url: 'https://explorer.route07.com',
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
      chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, route07Chain],
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
