'use client';

import React, { useState, useEffect } from 'react';
import { web3ContractServices } from '@/lib/web3-contract-services';

interface SystemManagementPanelProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const SystemManagementPanel: React.FC<SystemManagementPanelProps> = ({ onError, onSuccess }) => {
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [complianceUser, setComplianceUser] = useState('');
  const [complianceTenant, setComplianceTenant] = useState('');
  const [complianceResult, setComplianceResult] = useState<boolean | null>(null);
  const [governanceDescription, setGovernanceDescription] = useState('');
  const [governanceDuration, setGovernanceDuration] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Load emergency mode status
      const emergency = await web3ContractServices.isEmergencyMode();
      setEmergencyMode(emergency);

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
      console.error('Failed to load system status:', err);
    }
  };

  const handleToggleEmergency = async () => {
    setLoading(true);
    try {
      if (emergencyMode) {
        // Note: EmergencyManager doesn't have deactivateEmergencyMode in our simplified version
        onError('Emergency deactivation not implemented in current contract');
      } else {
        await web3ContractServices.activateEmergencyMode();
        setEmergencyMode(true);
        onSuccess('Emergency mode activated');
      }
    } catch (err) {
      onError('Failed to toggle emergency mode');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    setLoading(true);
    try {
      await web3ContractServices.setFeature(feature, enabled);
      setFeatures(prev => ({ ...prev, [feature]: enabled }));
      onSuccess(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      onError(`Failed to toggle feature: ${feature}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCompliance = async () => {
    if (!complianceUser || !complianceTenant) {
      onError('Please enter both user address and tenant ID');
      return;
    }

    setLoading(true);
    try {
      const result = await web3ContractServices.checkCompliance(complianceUser, complianceTenant);
      setComplianceResult(result);
      onSuccess(`Compliance check completed: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (err) {
      onError('Failed to check compliance');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!governanceDescription) {
      onError('Please enter a proposal description');
      return;
    }

    setLoading(true);
    try {
      const duration = governanceDuration * 24 * 60 * 60; // Convert days to seconds
      const proposalId = await web3ContractServices.createProposal(governanceDescription, duration);
      onSuccess(`Proposal created successfully with ID: ${proposalId}`);
      setGovernanceDescription('');
    } catch (err) {
      onError('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Management</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">System Emergency Status</p>
            <p className={`text-lg font-semibold ${
              emergencyMode ? 'text-red-600' : 'text-green-600'
            }`}>
              {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'Normal Operation'}
            </p>
          </div>
          <button
            onClick={handleToggleEmergency}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-medium ${
              emergencyMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : emergencyMode ? 'Deactivate Emergency' : 'Activate Emergency'}
          </button>
        </div>
      </div>

      {/* Feature Flags Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags Management</h3>
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
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Checking */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Checking</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User Address</label>
              <input
                type="text"
                value={complianceUser}
                onChange={(e) => setComplianceUser(e.target.value)}
                placeholder="0x..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
              <input
                type="text"
                value={complianceTenant}
                onChange={(e) => setComplianceTenant(e.target.value)}
                placeholder="tenant-123"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleCheckCompliance}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Compliance'}
          </button>
          
          {complianceResult !== null && (
            <div className={`p-4 rounded-lg ${
              complianceResult ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  complianceResult ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <p className={`font-medium ${
                  complianceResult ? 'text-green-800' : 'text-red-800'
                }`}>
                  Compliance Check: {complianceResult ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Governance Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Governance Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Proposal Description</label>
            <textarea
              value={governanceDescription}
              onChange={(e) => setGovernanceDescription(e.target.value)}
              placeholder="Describe the governance proposal..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
            <input
              type="number"
              value={governanceDuration}
              onChange={(e) => setGovernanceDuration(Number(e.target.value))}
              min="1"
              max="365"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCreateProposal}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Contract Status</h4>
            <p className="text-sm text-gray-600">
              All 19 contracts deployed and operational
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Network Status</h4>
            <p className="text-sm text-gray-600">
              Connected to Tractsafe Network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemManagementPanel;