'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface DocumentAnalysis {
  success: boolean
  extractedText: string
  confidence: number
  documentType: string
  validation: {
    isValid: boolean
    expiryDate?: string
    isExpired: boolean
    issues: string[]
  }
  aiAnalysis: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    flags: string[]
    recommendations: string[]
  }
}

interface DocumentUploadProps {
  onUploadComplete: (document: DocumentAnalysis) => void
  onError: (error: string) => void
}

export default function DocumentUpload({ onUploadComplete, onError }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [showOcrText, setShowOcrText] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setAnalysis(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      if (documentType) formData.append('documentType', documentType)
      if (description) formData.append('description', description)

      // Upload and process document
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysis(result.document)
        onUploadComplete(result.document)
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('Upload error:', error)
      onError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [documentType, description, onUploadComplete, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getValidationIcon = () => {
    if (!analysis) return null
    
    if (analysis.validation.isValid) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } else {
      return <XCircleIcon className="w-5 h-5 text-red-500" />
    }
  }

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

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the document..."
          className="input-field"
          rows={2}
        />
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
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Processing document with OCR...</p>
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

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Document Analysis Results</h3>
          
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <p className="text-gray-900 capitalize">{analysis.documentType.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OCR Confidence</label>
              <p className="text-gray-900">{Math.round(analysis.confidence)}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validation</label>
              <div className="flex items-center space-x-2">
                {getValidationIcon()}
                <span className={analysis.validation.isValid ? 'text-green-600' : 'text-red-600'}>
                  {analysis.validation.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Risk Analysis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Risk Assessment</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Risk Score</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(analysis.aiAnalysis.riskLevel)}`}>
                  {analysis.aiAnalysis.riskScore}/100 - {analysis.aiAnalysis.riskLevel.toUpperCase()}
                </span>
              </div>
              
              {analysis.aiAnalysis.flags.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flags</label>
                  <div className="space-y-1">
                    {analysis.aiAnalysis.flags.map((flag, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.aiAnalysis.recommendations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Validation Issues */}
          {analysis.validation.issues.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Validation Issues</label>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1">
                  {analysis.validation.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700">{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* OCR Extracted Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Extracted Text</label>
              <button
                onClick={() => setShowOcrText(!showOcrText)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {showOcrText ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            
            {showOcrText && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {analysis.extractedText || 'No text extracted'}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 