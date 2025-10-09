'use client';

import React, { useState, useEffect } from 'react';
import { web3ContractServices } from '@/lib/web3-contract-services';

interface DIDManagementPanelProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const DIDManagementPanel: React.FC<DIDManagementPanelProps> = ({ onError, onSuccess }) => {
  const [subjectAddress, setSubjectAddress] = useState('');
  const [didDocument, setDidDocument] = useState('');
  const [userDIDs, setUserDIDs] = useState<string[]>([]);
  const [selectedDID, setSelectedDID] = useState('');
  const [didInfo, setDidInfo] = useState<{ document: string; active: boolean } | null>(null);
  const [credentialType, setCredentialType] = useState('');
  const [credentialData, setCredentialData] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDID = async () => {
    if (!subjectAddress || !didDocument) {
      onError('Please enter subject address and DID document');
      return;
    }

    setLoading(true);
    try {
      const didId = await web3ContractServices.createDID(subjectAddress, didDocument);
      onSuccess(`DID created successfully: ${didId}`);
      setDidDocument('');
      await loadUserDIDs();
    } catch (err) {
      onError('Failed to create DID');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadUserDIDs = async () => {
    if (!subjectAddress) {
      onError('Please enter a subject address');
      return;
    }

    setLoading(true);
    try {
      const dids = await web3ContractServices.getDIDsBySubject(subjectAddress);
      setUserDIDs(dids);
    } catch (err) {
      onError('Failed to load user DIDs');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDIDInfo = async () => {
    if (!selectedDID) {
      onError('Please select a DID');
      return;
    }

    setLoading(true);
    try {
      const info = await web3ContractServices.getDID(selectedDID);
      setDidInfo({
        document: info[0],
        active: info[1]
      });
    } catch (err) {
      onError('Failed to load DID information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDID = async () => {
    if (!selectedDID || !didDocument) {
      onError('Please select a DID and enter new document');
      return;
    }

    setLoading(true);
    try {
      await web3ContractServices.updateDID(selectedDID, didDocument);
      onSuccess('DID updated successfully');
      await handleLoadDIDInfo();
    } catch (err) {
      onError('Failed to update DID');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDID = async () => {
    if (!selectedDID) {
      onError('Please select a DID');
      return;
    }

    setLoading(true);
    try {
      await web3ContractServices.revokeDID(selectedDID);
      onSuccess('DID revoked successfully');
      await handleLoadDIDInfo();
    } catch (err) {
      onError('Failed to revoke DID');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCredential = async () => {
    if (!selectedDID || !credentialType || !credentialData) {
      onError('Please fill in all credential fields');
      return;
    }

    setLoading(true);
    try {
      const expiresAtTimestamp = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0;
      const credentialId = await web3ContractServices.issueCredential(
        selectedDID,
        credentialType,
        credentialData,
        expiresAtTimestamp
      );
      onSuccess(`Credential issued successfully: ${credentialId}`);
      setCredentialType('');
      setCredentialData('');
      setExpiresAt('');
    } catch (err) {
      onError('Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDIDs = async () => {
    if (subjectAddress) {
      try {
        const dids = await web3ContractServices.getDIDsBySubject(subjectAddress);
        setUserDIDs(dids);
      } catch (err) {
        console.error('Failed to load DIDs:', err);
      }
    }
  };

  useEffect(() => {
    loadUserDIDs();
  }, [subjectAddress]);

  return (
    <div className="space-y-6">
      {/* Create DID */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New DID</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Address</label>
            <input
              type="text"
              value={subjectAddress}
              onChange={(e) => setSubjectAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">DID Document (JSON)</label>
            <textarea
              value={didDocument}
              onChange={(e) => setDidDocument(e.target.value)}
              placeholder='{"@context": "https://www.w3.org/ns/did/v1", "id": "did:example:123", ...}'
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCreateDID}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create DID'}
          </button>
        </div>
      </div>

      {/* User DIDs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User DIDs</h3>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={subjectAddress}
              onChange={(e) => setSubjectAddress(e.target.value)}
              placeholder="Enter subject address to load DIDs"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLoadUserDIDs}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load DIDs'}
            </button>
          </div>

          {userDIDs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select DID</label>
              <select
                value={selectedDID}
                onChange={(e) => setSelectedDID(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a DID</option>
                {userDIDs.map((did, index) => (
                  <option key={index} value={did}>
                    {did}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* DID Management */}
      {selectedDID && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">DID Management</h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={handleLoadDIDInfo}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Load Info
              </button>
              <button
                onClick={handleUpdateDID}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Update DID
              </button>
              <button
                onClick={handleRevokeDID}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Revoke DID
              </button>
            </div>

            {didInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">DID Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status: </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      didInfo.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {didInfo.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Document: </span>
                    <pre className="text-xs text-gray-700 mt-1 overflow-auto max-h-32">
                      {JSON.stringify(JSON.parse(didInfo.document), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issue Credential */}
      {selectedDID && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Credential</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Credential Type</label>
              <input
                type="text"
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
                placeholder="e.g., passport, drivers_license"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credential Data (JSON)</label>
              <textarea
                value={credentialData}
                onChange={(e) => setCredentialData(e.target.value)}
                placeholder='{"type": "passport", "number": "123456", "issuer": "Government"}'
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleIssueCredential}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Issuing...' : 'Issue Credential'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DIDManagementPanel;