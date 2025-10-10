'use client'

import { useState } from 'react'
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface AdminGuideSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: React.ReactNode
  subsections?: AdminGuideSection[]
}

const AdminGuideContent = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [searchTerm, setSearchTerm] = useState('')

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const sections: AdminGuideSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Responsibilities</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                <span>User Management: Approve/reject user registrations and KYC applications</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                <span>KYC Processing: Review and verify identity documents</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                <span>Document Management: Monitor and manage IPFS document storage</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                <span>Blockchain Operations: Submit approved KYC data to blockchain</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                <span>Compliance: Maintain audit trails and regulatory compliance</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserGroupIcon className="w-6 h-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">User Management</h4>
              </div>
              <p className="text-sm text-gray-600">Manage user accounts, permissions, and access control</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-900">KYC Processing</h4>
              </div>
              <p className="text-sm text-gray-600">Review and approve identity verification applications</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CloudIcon className="w-6 h-6 text-purple-600 mr-2" />
                <h4 className="font-semibold text-gray-900">IPFS Management</h4>
              </div>
              <p className="text-sm text-gray-600">Monitor decentralized document storage</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">User Status Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-600">Verified users</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Pending</p>
                <p className="text-xs text-gray-600">Awaiting review</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Suspended</p>
                <p className="text-xs text-gray-600">Temporarily disabled</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Rejected</p>
                <p className="text-xs text-gray-600">KYC failed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">User Actions</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">View Profile</span>
                </li>
                <li className="flex items-center">
                  <CogIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Edit Details</span>
                </li>
                <li className="flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Suspend/Activate</span>
                </li>
                <li className="flex items-center">
                  <XCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Delete Account</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Search & Filter</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Search by email, wallet, name</span>
                </li>
                <li className="flex items-center">
                  <ChartBarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Filter by status, date</span>
                </li>
                <li className="flex items-center">
                  <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Bulk operations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'kyc-management',
      title: 'KYC Management',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">KYC Processing Workflow</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">1</div>
                <span className="text-blue-800">Access application from pending list</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">2</div>
                <span className="text-blue-800">Review uploaded documents for quality and authenticity</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">3</div>
                <span className="text-blue-800">Check AI-generated risk scores and assessment</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">4</div>
                <span className="text-blue-800">Make approval/rejection decision with reason</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">5</div>
                <span className="text-blue-800">Submit approved data to blockchain</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Application States</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Draft - User completing application</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Submitted - Ready for review</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Under Review - Being processed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Approved - Verification successful</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Rejected - Verification failed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Blockchain Submitted - On blockchain</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Rejection Reasons</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <span>Poor document quality (blurry images)</span>
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <span>Invalid or expired documents</span>
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <span>Incomplete information</span>
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <span>Suspicious activity indicators</span>
                </li>
                <li className="flex items-start">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                  <span>Compliance violations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'document-management',
      title: 'Document Management',
      icon: DocumentTextIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Document Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-900">Passport</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-900">Driver's License</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-900">Utility Bills</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-900">Bank Statements</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Actions</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">View document in viewer</span>
                </li>
                <li className="flex items-center">
                  <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Download document locally</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Mark as verified/rejected</span>
                </li>
                <li className="flex items-center">
                  <XCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Delete from system</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">IPFS Integration</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CloudIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span>Documents uploaded to IPFS after approval</span>
                </li>
                <li className="flex items-start">
                  <CloudIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span>Decentralized storage for security</span>
                </li>
                <li className="flex items-start">
                  <CloudIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span>View documents via IPFS gateway</span>
                </li>
                <li className="flex items-start">
                  <CloudIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span>Monitor storage usage and costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ipfs-management',
      title: 'IPFS Management',
      icon: CloudIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">IPFS Status Monitoring</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-purple-900">Node Status</p>
                <p className="text-xs text-purple-700">Online/Offline</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-purple-900">Storage Usage</p>
                <p className="text-xs text-purple-700">Total consumed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-purple-900">File Count</p>
                <p className="text-xs text-purple-700">Files stored</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ClockIcon className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm font-medium text-purple-900">Performance</p>
                <p className="text-xs text-purple-700">Upload/Download</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">IPFS Operations</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Pin files for persistence</span>
                </li>
                <li className="flex items-center">
                  <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-700">Unpin files to remove</span>
                </li>
                <li className="flex items-center">
                  <CogIcon className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Check connectivity</span>
                </li>
                <li className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-700">Browse stored files</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage Management</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <ChartBarIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Monitor storage consumption</span>
                </li>
                <li className="flex items-start">
                  <XCircleIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Cleanup unnecessary files</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Ensure data redundancy</span>
                </li>
                <li className="flex items-start">
                  <CogIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Manage storage expenses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: ExclamationTriangleIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3">Common Issues & Solutions</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-semibold text-red-900">User Cannot Login</h4>
                <ul className="text-sm text-red-800 mt-1 space-y-1">
                  <li>• Check if account is suspended</li>
                  <li>• Verify email address</li>
                  <li>• Reset password if needed</li>
                  <li>• Check for typos in credentials</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-semibold text-yellow-900">Document Upload Failed</h4>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Check file size (max 10MB)</li>
                  <li>• Verify file format (PDF, JPG, PNG)</li>
                  <li>• Check IPFS node status</li>
                  <li>• Try uploading again</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-semibold text-blue-900">IPFS Connection Error</h4>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• Check IPFS node status</li>
                  <li>• Verify network connectivity</li>
                  <li>• Restart IPFS service if needed</li>
                  <li>• Contact technical support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Procedures</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 text-sm">System Down</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1">
                    <li>• Check status page</li>
                    <li>• Contact technical team</li>
                    <li>• Notify users</li>
                    <li>• Document issue</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Security Breach</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1">
                    <li>• Suspend affected accounts</li>
                    <li>• Review audit logs</li>
                    <li>• Notify management</li>
                    <li>• Document incident</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Support Escalation</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-green-600">1</span>
                  </div>
                  <span className="text-sm text-gray-700">Level 1: Basic troubleshooting</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-yellow-600">2</span>
                  </div>
                  <span className="text-sm text-gray-700">Level 2: Advanced technical issues</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-red-600">3</span>
                  </div>
                  <span className="text-sm text-gray-700">Level 3: Critical system problems</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-purple-600">E</span>
                  </div>
                  <span className="text-sm text-gray-700">Emergency: 24/7 critical support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Guide</h1>
        <p className="text-gray-600 mb-6">
          Comprehensive guide for W3KYC platform administrators. Learn how to manage users, process KYC applications, and maintain system health.
        </p>
        
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search admin guide..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <div className="flex items-center">
                <section.icon className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has(section.id) && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="pt-4">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}

export default AdminGuideContent