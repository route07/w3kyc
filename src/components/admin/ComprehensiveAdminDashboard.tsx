'use client';

import React, { useState, useEffect } from 'react';
import { web3ContractServices } from '@/lib/web3-contract-services';
import KYCManagementPanel from './KYCManagementPanel';
import DIDManagementPanel from './DIDManagementPanel';
import SystemManagementPanel from './SystemManagementPanel';

interface ContractStatus {
  [key: string]: boolean;
}

interface KYCStatistics {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
}

interface AuditLog {
  user: string;
  eventType: string;
  details: string;
  timestamp: number;
}

const ComprehensiveAdminDashboard: React.FC = () => {
  const [contractStatus, setContractStatus] = useState<ContractStatus>({});
  const [kycStats, setKycStats] = useState<KYCStatistics | null>(null);
  const [pendingKYCRequests, setPendingKYCRequests] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'did' | 'system'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load contract status
      const status = web3ContractServices.getContractStatus();
      setContractStatus(status);

      // Load KYC statistics
      try {
        const stats = await web3ContractServices.getKYCStatistics();
        setKycStats({
          totalUsers: Number(stats[0]),
          verifiedUsers: Number(stats[1]),
          pendingUsers: Number(stats[2]),
          rejectedUsers: Number(stats[3])
        });
      } catch (err) {
        console.log('KYC stats not available');
      }

      // Load pending KYC requests
      try {
        const pending = await web3ContractServices.getPendingKYCRequests();
        setPendingKYCRequests(pending);
      } catch (err) {
        console.log('Pending KYC requests not available');
      }

      // Load emergency mode status
      try {
        const emergency = await web3ContractServices.isEmergencyMode();
        setEmergencyMode(emergency);
      } catch (err) {
        console.log('Emergency status not available');
      }

      // Load feature flags
      const featureList = ['kyc_verification', 'did_management', 'multisig', 'governance'];
      const featureStatus: Record<string, boolean> = {};
      
      for (const feature of featureList) {
        try {
          const enabled = await web3ContractServices.isFeatureEnabled(feature);
          featureStatus[feature] = enabled;
        } catch (err) {
          featureStatus[feature] = false;
        }
      }
      setFeatures(featureStatus);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (userAddress: string) => {
    try {
      await web3ContractServices.approveKYC(userAddress);
      await loadDashboardData();
    } catch (err) {
      setError('Failed to approve KYC');
    }
  };

  const handleRejectKYC = async (userAddress: string, reason: string) => {
    try {
      await web3ContractServices.rejectKYC(userAddress, reason);
      await loadDashboardData();
    } catch (err) {
      setError('Failed to reject KYC');
    }
  };

  const handleToggleEmergency = async () => {
    try {
      if (emergencyMode) {
        // Note: EmergencyManager doesn't have deactivateEmergencyMode in our simplified version
        setError('Emergency deactivation not implemented');
      } else {
        await web3ContractServices.activateEmergencyMode();
        setEmergencyMode(true);
      }
    } catch (err) {
      setError('Failed to toggle emergency mode');
    }
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    try {
      await web3ContractServices.setFeature(feature, enabled);
      setFeatures(prev => ({ ...prev, [feature]: enabled }));
    } catch (err) {
      setError(`Failed to toggle feature: ${feature}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comprehensive admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Web3 KYC Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Complete control over all 19 deployed contracts</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', description: 'System overview and status' },
              { id: 'kyc', name: 'KYC Management', description: 'KYC verification and data management' },
              { id: 'did', name: 'DID Management', description: 'Decentralized identity management' },
              { id: 'system', name: 'System Management', description: 'System controls and configuration' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <p className="text-xs text-gray-400 mt-1">{tab.description}</p>
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

        {/* Contract Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Status</h3>
            <div className="space-y-2">
              {Object.entries(contractStatus).map(([contract, status]) => (
                <div key={contract} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{contract}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Statistics */}
          {kycStats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-semibold">{kycStats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className="font-semibold text-green-600">{kycStats.verifiedUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{kycStats.pendingUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{kycStats.rejectedUsers}</span>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emergency Mode</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  emergencyMode ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {emergencyMode ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button
                onClick={handleToggleEmergency}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                  emergencyMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {emergencyMode ? 'Deactivate Emergency' : 'Activate Emergency'}
              </button>
            </div>
          </div>
        </div>

        {/* Pending KYC Requests */}
        {pendingKYCRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending KYC Requests</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingKYCRequests.map((userAddress, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{userAddress}</p>
                      <p className="text-sm text-gray-500">Pending verification</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveKYC(userAddress)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) handleRejectKYC(userAddress, reason);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feature Flags Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Flags Management</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{feature.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature(feature, !enabled)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      enabled
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contract Functions Quick Access */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Contract Functions Quick Access</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* KYC Functions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">KYC Management</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Verify KYC
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Update KYC Status
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Get KYC Statistics
                  </button>
                </div>
              </div>

              {/* DID Functions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">DID Management</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Create DID
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Issue Credential
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Verify Credential
                  </button>
                </div>
              </div>

              {/* System Functions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">System Management</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Multisig Management
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Compliance Check
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    Governance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

            {/* Refresh Button */}
            <div className="mt-8 text-center">
              <button
                onClick={loadDashboardData}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Refresh Dashboard
              </button>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <KYCManagementPanel 
            onError={setError}
            onSuccess={(message) => {
              setError(null);
              // You could add a success state here
            }}
          />
        )}

        {activeTab === 'did' && (
          <DIDManagementPanel 
            onError={setError}
            onSuccess={(message) => {
              setError(null);
              // You could add a success state here
            }}
          />
        )}

        {activeTab === 'system' && (
          <SystemManagementPanel 
            onError={setError}
            onSuccess={(message) => {
              setError(null);
              // You could add a success state here
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;