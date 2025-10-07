'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
  onSwitchToWeb3?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToSignup, 
  onSwitchToWeb3 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const result = await login(formData.email, formData.password);
      
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting to dashboard');
        // Use window.location instead of router.push to ensure clean navigation
        window.location.href = '/dashboard';
      } else {
        console.log('Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, formData.password, login, isLoading]);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger form submission programmatically
    const form = document.getElementById('login-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form 
          id="login-form"
          onSubmit={handleSubmit} 
          className="space-y-6"
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onSwitchToWeb3}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Connect with Wallet Instead
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
