'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useOrchestrator } from '@/hooks/useOrchestrator';
import { OnboardingStep } from '@/lib/orchestrator-service';

interface OrchestratorManagementPanelProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface SessionInfo {
  user: string;
  currentStep: OnboardingStep;
  startTime: number;
  lastUpdate: number;
  isActive: boolean;
}

export default function OrchestratorManagementPanel({ onError, onSuccess }: OrchestratorManagementPanelProps) {
  const { contractInfo, isLoading } = useOrchestrator();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Mock sessions data (in real implementation, this would come from the contract)
  useEffect(() => {
    const mockSessions: SessionInfo[] = [
      {
        user: '0x1234567890123456789012345678901234567890',
        currentStep: OnboardingStep.REGISTRATION,
        startTime: Date.now() / 1000 - 3600, // 1 hour ago
        lastUpdate: Date.now() / 1000 - 1800, // 30 minutes ago
        isActive: true
      },
      {
        user: '0x2345678901234567890123456789012345678901',
        currentStep: OnboardingStep.DOCUMENT_UPLOAD,
        startTime: Date.now() / 1000 - 7200, // 2 hours ago
        lastUpdate: Date.now() / 1000 - 900, // 15 minutes ago
        isActive: true
      },
      {
        user: '0x3456789012345678901234567890123456789012',
        currentStep: OnboardingStep.COMPLETED,
        startTime: Date.now() / 1000 - 14400, // 4 hours ago
        lastUpdate: Date.now() / 1000 - 3600, // 1 hour ago
        isActive: false
      }
    ];
    setSessions(mockSessions);
  }, []);

  const getStepName = (step: OnboardingStep): string => {
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
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step) {
      case OnboardingStep.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case OnboardingStep.FAILED:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStepColor = (step: OnboardingStep): string => {
    switch (step) {
      case OnboardingStep.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OnboardingStep.FAILED:
        return 'bg-red-100 text-red-800';
      case OnboardingStep.REGISTRATION:
      case OnboardingStep.INVESTOR_TYPE_SELECTION:
      case OnboardingStep.ELIGIBILITY_CHECK:
      case OnboardingStep.DOCUMENT_UPLOAD:
      case OnboardingStep.FINAL_VERIFICATION:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (startTime: number, lastUpdate: number): string => {
    const duration = lastUpdate - startTime;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleForceComplete = async () => {
    if (!selectedUser) {
      onError('Please select a user');
      return;
    }

    setActionLoading(true);
    try {
      // In real implementation, this would call the orchestrator service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.user === selectedUser 
          ? { ...session, currentStep: OnboardingStep.COMPLETED, isActive: false }
          : session
      ));
      
      onSuccess('Session force completed successfully');
    } catch (error) {
      onError('Failed to force complete session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceFail = async () => {
    if (!selectedUser) {
      onError('Please select a user');
      return;
    }

    setActionLoading(true);
    try {
      // In real implementation, this would call the orchestrator service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.user === selectedUser 
          ? { ...session, currentStep: OnboardingStep.FAILED, isActive: false }
          : session
      ));
      
      onSuccess('Session force failed successfully');
    } catch (error) {
      onError('Failed to force fail session');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Information */}
      {contractInfo && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            Orchestrator Contract Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{contractInfo.owner}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">KYC Storage</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{contractInfo.kycStorage}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Audit Storage</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{contractInfo.auditStorage}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">KYC Manager</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{contractInfo.kycManager}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">DID Manager</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{contractInfo.didManager}</dd>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Active KYC Sessions
          </h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.user} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {session.user.slice(0, 6)}...{session.user.slice(-4)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStepIcon(session.currentStep)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getStepName(session.currentStep)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(session.startTime, session.lastUpdate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(session.lastUpdate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStepColor(session.currentStep)}`}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(session.user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Select
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Actions */}
      {selectedUser && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Session Actions
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Selected User: <span className="font-mono">{selectedUser.slice(0, 6)}...{selectedUser.slice(-4)}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleForceComplete}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Force Complete
              </button>
              <button
                onClick={handleForceFail}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Force Fail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessions.filter(s => s.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessions.filter(s => s.currentStep === OnboardingStep.COMPLETED).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Failed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessions.filter(s => s.currentStep === OnboardingStep.FAILED).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}