'use client'

import { useState, useEffect } from 'react'

interface Document {
  _id: string
  name: string
  type: string
  ipfsHash: string
  ipfsUrl: string
  ipfsNode: string
  status: string
  uploadedAt: string
  ocrResult: {
    extractedText: string
    confidence: number
    documentType: string
  }
  validation: {
    isValid: boolean
    issues: string[]
  }
}

export default function DocumentViewerPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched documents:', data)
      
      if (data.success && data.documents) {
        setDocuments(data.documents)
      } else {
        setDocuments([])
      }
      
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchFileContent = async (document: Document) => {
    setLoadingContent(true)
    setSelectedDoc(document)
    
    try {
      console.log(`Fetching content for document: ${document.name}`)
      console.log(`IPFS Hash: ${document.ipfsHash}`)
      console.log(`IPFS Node: ${document.ipfsNode}`)
      
      // Use the IPFS API to get the file content
      const response = await fetch(`${document.ipfsNode}/api/v0/cat?arg=${document.ipfsHash}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status}`)
      }
      
      const content = await response.text()
      setFileContent(content)
      
    } catch (err) {
      console.error('Error fetching file content:', err)
      setFileContent(`Error fetching file content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoadingContent(false)
    }
  }

  const downloadFile = async (document: Document) => {
    try {
      const response = await fetch(`${document.ipfsNode}/api/v0/cat?arg=${document.ipfsHash}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = document.name
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
    fetchDocuments()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Document Viewer</h1>
            
            {/* Controls */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Documents'}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Uploaded Documents ({documents.length} documents)
              </h2>
              
              {documents.length === 0 ? (
                <p className="text-gray-500">No documents found in database.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IPFS Hash
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {doc.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              doc.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : doc.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {doc.ipfsHash.substring(0, 16)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => fetchFileContent(doc)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadFile(doc)}
                              className="text-green-600 hover:text-green-900"
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

            {/* File Content Viewer */}
            {selectedDoc && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  File Content: {selectedDoc.name}
                </h3>
                
                {loadingContent ? (
                  <p className="text-gray-500">Loading file content...</p>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                      {fileContent || 'No content available'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}