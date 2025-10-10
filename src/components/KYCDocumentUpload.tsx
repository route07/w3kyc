'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface KYCDocumentUploadProps {
  onUploadComplete: (document: any, file: File) => void
  onError: (error: string) => void
}

export default function KYCDocumentUpload({ onUploadComplete, onError }: KYCDocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<any>(null)
  const [documentType, setDocumentType] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setUploadedDocument(null)

    try {
      // Convert file to base64
      const fileBuffer = await file.arrayBuffer()
      const base64Data = Buffer.from(fileBuffer).toString('base64')

      const authToken = localStorage.getItem('auth_token')
      console.log('Uploading KYC document:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType,
        hasAuthToken: !!authToken
      })

      // Upload to KYC draft endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/kyc/documents/draft-upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          documentType: documentType || 'passport'
        })
      })

      console.log('KYC upload response status:', response.status)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        } catch (e) {
          console.warn('Could not parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadedDocument(result.document)
        onUploadComplete(result.document, file)
        console.log('✅ KYC document uploaded successfully:', result.document)
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('KYC upload error:', error)
      onError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [documentType, onUploadComplete, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="input-field"
        >
          <option value="">Select document type</option>
          <option value="passport">Passport</option>
          <option value="drivers_license">Driver&apos;s License</option>
          <option value="utility_bill">Utility Bill</option>
          <option value="bank_statement">Bank Statement</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Uploading to IPFS...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a document here'}
            </p>
            <p className="text-gray-600 mb-4">
              or click to select a file
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPEG, PNG, GIF, PDF (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Success */}
      {uploadedDocument && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-green-800 font-medium">Document uploaded successfully!</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p><strong>File:</strong> {uploadedDocument.fileName}</p>
            <p><strong>Type:</strong> {uploadedDocument.documentType}</p>
            <p><strong>Size:</strong> {(uploadedDocument.fileSize / 1024).toFixed(2)} KB</p>
            <p><strong>IPFS Hash:</strong> <code className="bg-green-100 px-1 rounded">{uploadedDocument.ipfsHash}</code></p>
            <p><strong>Status:</strong> {uploadedDocument.verificationStatus}</p>
          </div>
        </div>
      )}
    </div>
  )
}