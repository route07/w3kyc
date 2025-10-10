import { ethers } from 'ethers';

// Orchestrator Contract ABI (simplified version)
const ORCHESTRATOR_ABI = [
  // Events
  "event SessionStarted(address indexed user, uint256 timestamp)",
  "event StepCompleted(address indexed user, uint8 step, uint256 timestamp)",
  "event SessionCompleted(address indexed user, uint256 timestamp)",
  "event SessionFailed(address indexed user, string reason, uint256 timestamp)",
  
  // Functions
  "function startSession() external",
  "function executeStep(uint8 step) external",
  "function cancelSession() external",
  "function getSession(address user) external view returns (address sessionUser, uint8 currentStep, uint256 startTime, uint256 lastUpdate, bool isActive)",
  "function isStepCompleted(address user, uint8 step) external view returns (bool)",
  "function forceCompleteSession(address user) external",
  "function forceFailSession(address user, string reason) external",
  
  // View functions
  "function owner() external view returns (address)",
  "function kycStorage() external view returns (address)",
  "function auditStorage() external view returns (address)",
  "function kycManager() external view returns (address)",
  "function didManager() external view returns (address)"
];

// Onboarding Steps Enum
export enum OnboardingStep {
  NOT_STARTED = 0,
  REGISTRATION = 1,
  INVESTOR_TYPE_SELECTION = 2,
  ELIGIBILITY_CHECK = 3,
  DOCUMENT_UPLOAD = 4,
  FINAL_VERIFICATION = 5,
  COMPLETED = 6,
  FAILED = 7
}

// Session Interface
export interface OnboardingSession {
  sessionUser: string;
  currentStep: OnboardingStep;
  startTime: number;
  lastUpdate: number;
  isActive: boolean;
}

// Wallet Client type (from wagmi)
export interface WalletClient {
  account: { address: string };
  chain: { id: number };
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

// Orchestrator Service Class
export class OrchestratorService {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    
    // Initialize contract
    const contractAddress = process.env.NEXT_PUBLIC_ORCHESTRATOR_ADDRESS;
    if (!contractAddress) {
      throw new Error('NEXT_PUBLIC_ORCHESTRATOR_ADDRESS not found in environment variables');
    }
    
    this.contract = new ethers.Contract(contractAddress, ORCHESTRATOR_ABI, this.provider);
  }

  // Set signer for transactions using wallet client
  async setSigner(walletClient: WalletClient) {
    try {
      // Create a provider that uses the wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      this.signer = await provider.getSigner();
      this.contract = this.contract.connect(this.signer);
    } catch (error) {
      console.error('Error setting signer:', error);
      throw error;
    }
  }

  // Start a new KYC onboarding session
  async startSession(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not set. Please connect wallet first.');
      }

      const tx = await this.contract.startSession();
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error starting session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Execute a specific onboarding step
  async executeStep(step: OnboardingStep, stepData?: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not set. Please connect wallet first.');
      }

      console.log('🔍 Executing step on blockchain:');
      console.log('- Step:', step);
      console.log('- Step data:', stepData);
      console.log('- Signer address:', await this.signer.getAddress());
      console.log('- Contract address:', this.contract.target);

      // Check if there's an active session first
      const userAddress = await this.signer.getAddress();
      const session = await this.getSession(userAddress);
      console.log('🔍 Current session:', session);
      
      if (!session || !session.isActive) {
        throw new Error('No active session. Please start a session first.');
      }

      // For now, the simple orchestrator doesn't take step data
      // In a full implementation, this would encode the step data
      console.log('🔄 Calling executeStep on contract...');
      const tx = await this.contract.executeStep(step);
      console.log('✅ Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('❌ Error executing step:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cancel the current session
  async cancelSession(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not set. Please connect wallet first.');
      }

      const tx = await this.contract.cancelSession();
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error cancelling session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get session information
  async getSession(userAddress: string): Promise<OnboardingSession | null> {
    try {
      const session = await this.contract.getSession(userAddress);
      
      return {
        sessionUser: session.sessionUser,
        currentStep: Number(session.currentStep) as OnboardingStep,
        startTime: Number(session.startTime),
        lastUpdate: Number(session.lastUpdate),
        isActive: session.isActive
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Check if a step is completed
  async isStepCompleted(userAddress: string, step: OnboardingStep): Promise<boolean> {
    try {
      return await this.contract.isStepCompleted(userAddress, step);
    } catch (error) {
      console.error('Error checking step completion:', error);
      return false;
    }
  }

  // Admin functions
  async forceCompleteSession(userAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not set. Please connect wallet first.');
      }

      const tx = await this.contract.forceCompleteSession(userAddress);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error force completing session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async forceFailSession(userAddress: string, reason: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        throw new Error('Signer not set. Please connect wallet first.');
      }

      const tx = await this.contract.forceFailSession(userAddress, reason);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error force failing session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get contract information
  async getContractInfo(): Promise<{
    owner: string;
    kycStorage: string;
    auditStorage: string;
    kycManager: string;
    didManager: string;
  }> {
    try {
      const [owner, kycStorage, auditStorage, kycManager, didManager] = await Promise.all([
        this.contract.owner(),
        this.contract.kycStorage(),
        this.contract.auditStorage(),
        this.contract.kycManager(),
        this.contract.didManager()
      ]);

      return {
        owner,
        kycStorage,
        auditStorage,
        kycManager,
        didManager
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw error;
    }
  }

  // Listen to events
  onSessionStarted(callback: (user: string, timestamp: number) => void) {
    this.contract.on('SessionStarted', callback);
  }

  onStepCompleted(callback: (user: string, step: number, timestamp: number) => void) {
    this.contract.on('StepCompleted', callback);
  }

  onSessionCompleted(callback: (user: string, timestamp: number) => void) {
    this.contract.on('SessionCompleted', callback);
  }

  onSessionFailed(callback: (user: string, reason: string, timestamp: number) => void) {
    this.contract.on('SessionFailed', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Create singleton instance
export const orchestratorService = new OrchestratorService();

// Helper function to get step name
export function getStepName(step: OnboardingStep): string {
  switch (step) {
    case OnboardingStep.NOT_STARTED:
      return 'Not Started';
    case OnboardingStep.REGISTRATION:
      return 'Registration';
    case OnboardingStep.INVESTOR_TYPE_SELECTION:
      return 'Investor Type Selection';
    case OnboardingStep.ELIGIBILITY_CHECK:
      return 'Eligibility Check';
    case OnboardingStep.DOCUMENT_UPLOAD:
      return 'Document Upload';
    case OnboardingStep.FINAL_VERIFICATION:
      return 'Final Verification';
    case OnboardingStep.COMPLETED:
      return 'Completed';
    case OnboardingStep.FAILED:
      return 'Failed';
    default:
      return 'Unknown';
  }
}

// Helper function to get step description
export function getStepDescription(step: OnboardingStep): string {
  switch (step) {
    case OnboardingStep.NOT_STARTED:
      return 'KYC onboarding has not been started yet.';
    case OnboardingStep.REGISTRATION:
      return 'Complete your basic registration information.';
    case OnboardingStep.INVESTOR_TYPE_SELECTION:
      return 'Select your investor type (Individual, Institutional, or Corporate).';
    case OnboardingStep.ELIGIBILITY_CHECK:
      return 'Verify your eligibility based on jurisdiction and requirements.';
    case OnboardingStep.DOCUMENT_UPLOAD:
      return 'Upload required documents for verification.';
    case OnboardingStep.FINAL_VERIFICATION:
      return 'Final verification and approval process.';
    case OnboardingStep.COMPLETED:
      return 'KYC onboarding has been completed successfully.';
    case OnboardingStep.FAILED:
      return 'KYC onboarding has failed. Please contact support.';
    default:
      return 'Unknown step status.';
  }
}

// Helper function to check if step is terminal
export function isTerminalStep(step: OnboardingStep): boolean {
  return step === OnboardingStep.COMPLETED || step === OnboardingStep.FAILED || step === OnboardingStep.FINAL_VERIFICATION;
}

// Helper function to get next step
export function getNextStep(currentStep: OnboardingStep): OnboardingStep {
  switch (currentStep) {
    case OnboardingStep.NOT_STARTED:
      return OnboardingStep.REGISTRATION;
    case OnboardingStep.REGISTRATION:
      return OnboardingStep.INVESTOR_TYPE_SELECTION;
    case OnboardingStep.INVESTOR_TYPE_SELECTION:
      return OnboardingStep.ELIGIBILITY_CHECK;
    case OnboardingStep.ELIGIBILITY_CHECK:
      return OnboardingStep.DOCUMENT_UPLOAD;
    case OnboardingStep.DOCUMENT_UPLOAD:
      return OnboardingStep.FINAL_VERIFICATION;
    case OnboardingStep.FINAL_VERIFICATION:
      return OnboardingStep.COMPLETED;
    default:
      return OnboardingStep.FAILED;
  }
}