'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Web3StatusData {
  overall: {
    readinessPercentage: number;
    deployedContracts: number;
    totalContracts: number;
    status: 'ready' | 'partial' | 'not_ready';
  };
  contracts: {
    kycManager: {
      deployed: boolean;
      address: string;
      name: string;
      description: string;
    };
    didManager: {
      deployed: boolean;
      address: string;
      name: string;
      description: string;
    };
  };
  features: {
    kycVerification: boolean;
    didCredentials: boolean;
    ipfsStorage: boolean;
    multisigOperations: boolean;
    auditTrail: boolean;
  };
  recommendations: string[];
}

export default function Web3Status() {
  const [statusData, setStatusData] = useState<Web3StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeb3Status();
  }, []);

  const fetchWeb3Status = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/web3/status');
      const data = await response.json();
      
      if (data.success) {
        setStatusData(data.data);
      } else {
        setError(data.error || 'Failed to fetch Web3 status');
      }
    } catch (err) {
      setError('Network error while fetching Web3 status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Web3 Status Error</h3>
        </div>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={fetchWeb3Status}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!statusData) return null;

  const getStatusIcon = (deployed: boolean) => {
    return deployed ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Web3 Integration Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.overall.status)}`}>
            {statusData.overall.readinessPercentage}% Ready
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Deployed Contracts</span>
            <span>{statusData.overall.deployedContracts}/{statusData.overall.totalContracts}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${statusData.overall.readinessPercentage}%` }}
            ></div>
          </div>
        </div>

        <p className="text-gray-600">
          {statusData.overall.status === 'ready' 
            ? 'All core Web3 features are available!'
            : statusData.overall.status === 'partial'
            ? 'Some Web3 features are available. Deploy missing contracts for full functionality.'
            : 'Web3 features are not available. Please deploy the required contracts.'
          }
        </p>
      </div>

      {/* Contract Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Status</h3>
        <div className="space-y-4">
          {Object.entries(statusData.contracts).map(([key, contract]) => (
            <div key={key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              {getStatusIcon(contract.deployed)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{contract.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    contract.deployed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {contract.deployed ? 'Deployed' : 'Not Deployed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
                {contract.deployed && contract.address !== '0x0000000000000000000000000000000000000000' && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">{contract.address}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(statusData.features).map(([key, available]) => (
            <div key={key} className="flex items-center space-x-3">
              {available ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm ${available ? 'text-green-700' : 'text-red-700'}`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {statusData.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {statusData.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-yellow-700 text-sm">
                    • {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}