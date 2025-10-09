'use client';

import React, { useState, useEffect } from 'react';
import { web3ContractServices } from '@/lib/web3-contract-services';

interface KYCData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  documentType: string;
  documentNumber: string;
  dateOfBirth: number;
  status: number;
  verifiedAt: number;
}

interface KYCManagementPanelProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const KYCManagementPanel: React.FC<KYCManagementPanelProps> = ({ onError, onSuccess }) => {
  const [userAddress, setUserAddress] = useState('');
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [kycStatus, setKycStatus] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const statusLabels = {
    0: 'Pending',
    1: 'Verified',
    2: 'Rejected',
    3: 'Expired'
  };

  const statusColors = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    loadPendingRequests();
    loadStatistics();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const requests = await web3ContractServices.getPendingKYCRequests();
      setPendingRequests(requests);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await web3ContractServices.getKYCStatistics();
      setStatistics({
        totalUsers: Number(stats[0]),
        verifiedUsers: Number(stats[1]),
        pendingUsers: Number(stats[2]),
        rejectedUsers: Number(stats[3])
      });
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleLookupUser = async () => {
    if (!userAddress) {
      onError('Please enter a user address');
      return;
    }

    setLoading(true);
    try {
      const [data, status] = await Promise.all([
        web3ContractServices.getKYCData(userAddress),
        web3ContractServices.getKYCStatus(userAddress)
      ]);
      
      setKycData(data);
      setKycStatus(Number(status));
    } catch (err) {
      onError('Failed to lookup user data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (address: string) => {
    setLoading(true);
    try {
      await web3ContractServices.approveKYC(address);
      onSuccess('KYC approved successfully');
      await loadPendingRequests();
      await loadStatistics();
    } catch (err) {
      onError('Failed to approve KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectKYC = async (address: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await web3ContractServices.rejectKYC(address, reason);
      onSuccess('KYC rejected successfully');
      await loadPendingRequests();
      await loadStatistics();
    } catch (err) {
      onError('Failed to reject KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: number) => {
    if (!userAddress) {
      onError('Please enter a user address');
      return;
    }

    setLoading(true);
    try {
      await web3ContractServices.updateKYCStatus(userAddress, newStatus);
      onSuccess('KYC status updated successfully');
      await handleLookupUser();
    } catch (err) {
      onError('Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Verified</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.verifiedUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pendingUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{statistics.rejectedUsers}</p>
          </div>
        </div>
      )}

      {/* User Lookup */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Lookup</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="Enter user address (0x...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLookupUser}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>

        {/* User Data Display */}
        {kycData && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{kycData.firstName} {kycData.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{kycData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{kycData.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                <p className="mt-1 text-sm text-gray-900">{kycData.documentType}</p>
              </div>
            </div>

            {/* Status Management */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  statusColors[kycStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                }`}>
                  {statusLabels[kycStatus as keyof typeof statusLabels] || 'Unknown'}
                </span>
              </div>
              <div className="flex space-x-2">
                <select
                  onChange={(e) => handleUpdateStatus(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Update Status</option>
                  <option value="0">Pending</option>
                  <option value="1">Verified</option>
                  <option value="2">Rejected</option>
                  <option value="3">Expired</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending KYC Requests</h3>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((address, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{address}</p>
                  <p className="text-sm text-gray-500">Awaiting verification</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveKYC(address)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectKYC(address)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCManagementPanel;