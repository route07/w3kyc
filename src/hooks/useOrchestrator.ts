import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { 
  orchestratorService, 
  OnboardingStep, 
  OnboardingSession,
  getStepName,
  getStepDescription,
  isTerminalStep,
  getNextStep as getNextStepFromService
} from '@/lib/orchestrator-service';

export interface UseOrchestratorReturn {
  // Session state
  session: OnboardingSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Session actions
  startSession: () => Promise<{ success: boolean; txHash?: string; error?: string }>;
  executeStep: (step: OnboardingStep) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  cancelSession: () => Promise<{ success: boolean; txHash?: string; error?: string }>;
  
  // Session info
  isStepCompleted: (step: OnboardingStep) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  
  // Helper functions
  getCurrentStepName: () => string;
  getCurrentStepDescription: () => string;
  isCurrentStepTerminal: () => boolean;
  getNextStep: () => OnboardingStep;
  
  // Wallet info
  walletClient: any;
  
  // Contract info
  contractInfo: {
    owner: string;
    kycStorage: string;
    auditStorage: string;
    kycManager: string;
    didManager: string;
  } | null;
}

export function useOrchestrator(): UseOrchestratorReturn {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractInfo, setContractInfo] = useState<{
    owner: string;
    kycStorage: string;
    auditStorage: string;
    kycManager: string;
    didManager: string;
  } | null>(null);

  // Initialize orchestrator service with wallet
  useEffect(() => {
    if (walletClient && address) {
      orchestratorService.setSigner(walletClient).then(() => {
        setError(null);
      }).catch((err) => {
        console.error('Error setting up orchestrator service:', err);
        setError('Failed to connect to orchestrator service');
      });
    }
  }, [walletClient, address]);

  // Load contract info
  useEffect(() => {
    const loadContractInfo = async () => {
      try {
        const info = await orchestratorService.getContractInfo();
        setContractInfo(info);
      } catch (err) {
        console.error('Error loading contract info:', err);
      }
    };

    loadContractInfo();
  }, []);

  // Load session data
  const refreshSession = useCallback(async () => {
    if (!address) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionData = await orchestratorService.getSession(address);
      setSession(sessionData);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Load session on mount and when address changes
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Set up event listeners
  useEffect(() => {
    if (!address) return;

    const handleSessionStarted = (user: string, timestamp: number) => {
      if (user.toLowerCase() === address.toLowerCase()) {
        refreshSession();
      }
    };

    const handleStepCompleted = (user: string, step: number, timestamp: number) => {
      if (user.toLowerCase() === address.toLowerCase()) {
        refreshSession();
      }
    };

    const handleSessionCompleted = (user: string, timestamp: number) => {
      if (user.toLowerCase() === address.toLowerCase()) {
        refreshSession();
      }
    };

    const handleSessionFailed = (user: string, reason: string, timestamp: number) => {
      if (user.toLowerCase() === address.toLowerCase()) {
        refreshSession();
      }
    };

    // Add event listeners
    orchestratorService.onSessionStarted(handleSessionStarted);
    orchestratorService.onStepCompleted(handleStepCompleted);
    orchestratorService.onSessionCompleted(handleSessionCompleted);
    orchestratorService.onSessionFailed(handleSessionFailed);

    // Cleanup
    return () => {
      orchestratorService.removeAllListeners();
    };
  }, [address, refreshSession]);

  // Start session
  const startSession = useCallback(async () => {
    if (!address) {
      return { success: false, error: 'No wallet connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await orchestratorService.startSession();
      if (result.success) {
        await refreshSession();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, refreshSession]);

  // Execute step
  const executeStep = useCallback(async (step: OnboardingStep, stepData?: any) => {
    if (!address) {
      return { success: false, error: 'No wallet connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await orchestratorService.executeStep(step, stepData);
      if (result.success) {
        await refreshSession();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, refreshSession]);

  // Cancel session
  const cancelSession = useCallback(async () => {
    if (!address) {
      return { success: false, error: 'No wallet connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await orchestratorService.cancelSession();
      if (result.success) {
        await refreshSession();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [address, refreshSession]);

  // Check if step is completed
  const isStepCompleted = useCallback(async (step: OnboardingStep) => {
    if (!address) return false;

    try {
      return await orchestratorService.isStepCompleted(address, step);
    } catch (err) {
      console.error('Error checking step completion:', err);
      return false;
    }
  }, [address]);

  // Helper functions
  const getCurrentStepName = useCallback(() => {
    if (!session) return 'Not Started';
    return getStepName(session.currentStep);
  }, [session]);

  const getCurrentStepDescription = useCallback(() => {
    if (!session) return 'No active session';
    return getStepDescription(session.currentStep);
  }, [session]);

  const isCurrentStepTerminal = useCallback(() => {
    if (!session) return false;
    return isTerminalStep(session.currentStep);
  }, [session]);

  const getNextStep = useCallback((currentStep?: OnboardingStep) => {
    if (!session && !currentStep) return OnboardingStep.NOT_STARTED;
    const step = currentStep || session?.currentStep || OnboardingStep.NOT_STARTED;
    return getNextStepFromService(step);
  }, [session]);

  return {
    // Session state
    session,
    isLoading,
    error,
    
    // Session actions
    startSession,
    executeStep,
    cancelSession,
    
    // Session info
    isStepCompleted,
    refreshSession,
    
    // Helper functions
    getCurrentStepName,
    getCurrentStepDescription,
    isCurrentStepTerminal,
    getNextStep,
    
    // Wallet info
    walletClient,
    
    // Contract info
    contractInfo
  };
}