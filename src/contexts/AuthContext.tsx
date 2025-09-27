'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export interface User {
  id: string;
  email?: string;
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  authMethod: 'web2' | 'web3' | 'hybrid';
  isEmailVerified: boolean;
  isWalletConnected: boolean;
  kycStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  connectWallet: () => Promise<{ success: boolean; error?: string }>;
  connectEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnection(address);
    } else if (!isConnected && user?.authMethod === 'web3') {
      // Wallet disconnected but user was web3 only
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  }, [isConnected, address]);

  const handleWalletConnection = async (walletAddress: string) => {
    try {
      // Check if wallet is already associated with an account
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.user) {
          // Existing user with this wallet
          setUser(result.user);
          localStorage.setItem('auth_token', result.token);
        } else {
          // New wallet user
          const newUser: User = {
            id: `wallet_${Date.now()}`,
            walletAddress,
            authMethod: 'web3',
            isEmailVerified: false,
            isWalletConnected: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const connectWallet = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // This will trigger the wallet connection via Rainbow
      // The actual connection is handled by the useEffect above
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Wallet connection failed' };
    }
  };

  const connectEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.walletAddress) {
        return { success: false, error: 'No wallet connected' };
      }

      const response = await fetch('/api/auth/connect-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Email connection failed' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      if (isConnected) {
        disconnect();
      }
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    connectWallet,
    connectEmail,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};