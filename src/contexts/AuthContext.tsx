'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

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
  role?: string;
  isAdmin?: boolean;
  adminLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  walletLogin: (walletAddress: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  connectEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
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
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!user;

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth from localStorage:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Memoize the login function to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
        // Set user data
        const userData = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          walletAddress: result.user.walletAddress,
          kycStatus: result.user.kycStatus,
          role: result.user.role,
          isAdmin: result.user.isAdmin,
          adminLevel: result.user.adminLevel,
          authMethod: 'web2' as const,
          isEmailVerified: true,
          isWalletConnected: false,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        };
        
        setUser(userData);
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const walletLogin = useCallback(async (walletAddress: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Set user data
        const userData = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          walletAddress: result.user.walletAddress,
          kycStatus: result.user.kycStatus,
          role: result.user.role,
          isAdmin: result.user.isAdmin,
          adminLevel: result.user.adminLevel,
          authMethod: 'web3' as const,
          isEmailVerified: false,
          isWalletConnected: true,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        };
        
        setUser(userData);
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Wallet login error:', error);
      return { success: false, error: 'Wallet login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> => {
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
        const userData = {
          ...result.user,
          authMethod: 'web2' as const,
          isEmailVerified: true,
          isWalletConnected: false,
        };
        setUser(userData);
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }, []);


  const connectEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
        const userData = {
          ...result.user,
          authMethod: 'hybrid' as const,
          isEmailVerified: true,
          isWalletConnected: true,
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Email connection failed' };
    }
  }, [user?.walletAddress]);

  const logout = useCallback(async (): Promise<void> => {
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
      localStorage.removeItem('auth_user');
      
      // Redirect to main page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
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
        const userData = {
          ...result.user,
          authMethod: user?.authMethod || 'web2' as const,
          isEmailVerified: user?.isEmailVerified || false,
          isWalletConnected: user?.isWalletConnected || false,
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  }, []);

  // Verify session with server if we have a token
  useEffect(() => {
    if (!isInitialized) return;

    const verifySession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token || !user) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setUser(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.error('Session verification error:', error);
      }
    };

    verifySession();
  }, [isInitialized, user]);


  // Refresh user data from server
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userData = {
            ...data.user,
            authMethod: user?.authMethod || 'web2' as const,
            isEmailVerified: user?.isEmailVerified || false,
            isWalletConnected: !!data.user.walletAddress,
          };
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user?.authMethod, user?.isEmailVerified]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    walletLogin,
    signup,
    connectEmail,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
