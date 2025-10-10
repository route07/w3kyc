'use client'

import { useState, useEffect } from 'react'

interface IPFSFile {
  hash: string
  name: string
  size: number
  type: string
  pinned: boolean
}

const IPFS_NODES = [
  'http://65.109.136.54:5001',
  'http://65.109.136.54:5002'
]

export default function IPFSFilesPage() {
  const [files, setFiles] = useState<IPFSFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState(0)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const nodeUrl = IPFS_NODES[selectedNode]
      console.log(`Fetching files from node: ${nodeUrl}`)
      
      // Get pinned files
      const pinnedResponse = await fetch(`${nodeUrl}/api/v0/pin/ls`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!pinnedResponse.ok) {
        throw new Error(`Failed to fetch pinned files: ${pinnedResponse.status}`)
      }
      
      const pinnedData = await pinnedResponse.json()
      console.log('Pinned files:', pinnedData)
      
      // Get all files in the repo
      const repoResponse = await fetch(`${nodeUrl}/api/v0/repo/stat`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repo stats: ${repoResponse.status}`)
      }
      
      const repoData = await repoResponse.json()
      console.log('Repo stats:', repoData)
      
      // Convert pinned files to our format
      const fileList: IPFSFile[] = Object.keys(pinnedData.Keys || {}).map(hash => ({
        hash,
        name: `File-${hash.substring(0, 8)}`,
        size: 0, // We don't have size info from pin/ls
        type: 'unknown',
        pinned: true
      }))
      
      setFiles(fileList)
      
    } catch (err) {
      console.error('Error fetching files:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (hash: string) => {
    try {
      const nodeUrl = IPFS_NODES[selectedNode]
      const response = await fetch(`${nodeUrl}/api/v0/cat?arg=${hash}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `file-${hash.substring(0, 8)}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Error downloading file:', err)
      alert('Failed to download file: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [selectedNode])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">IPFS Files Browser</h1>
            
            {/* Node Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select IPFS Node
              </label>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {IPFS_NODES.map((node, index) => (
                  <option key={index} value={index}>
                    Node {index + 1}: {node}
                  </option>
                ))}
              </select>
            </div>

            {/* Controls */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Files'}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Files List */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Files on Node {selectedNode + 1} ({files.length} files)
              </h2>
              
              {files.length === 0 ? (
                <p className="text-gray-500">No files found on this node.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hash
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pinned
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {file.hash}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {file.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              file.pinned 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {file.pinned ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => downloadFile(file.hash)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}