'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface NodeStatus {
  url: string
  status: 'online' | 'offline' | 'checking'
  responseTime?: number
  error?: string
}

const IPFS_NODES = [
  'http://65.109.136.54:5001',
  'http://65.109.136.54:5002'
]

export default function IPFSStatusPage() {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkNodeStatus = async (nodeUrl: string): Promise<NodeStatus> => {
    const startTime = Date.now()
    
    try {
      // Check if node is responding
      const response = await fetch(`${nodeUrl}/api/v0/version`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        return {
          url: nodeUrl,
          status: 'online',
          responseTime
        }
      } else {
        return {
          url: nodeUrl,
          status: 'offline',
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        url: nodeUrl,
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const checkAllNodes = async () => {
    setIsChecking(true)
    setNodeStatuses(IPFS_NODES.map(url => ({ url, status: 'checking' })))

    const statuses = await Promise.all(
      IPFS_NODES.map(nodeUrl => checkNodeStatus(nodeUrl))
    )

    setNodeStatuses(statuses)
    setIsChecking(false)
  }

  useEffect(() => {
    checkAllNodes()
  }, [])

  const getStatusIcon = (status: NodeStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'offline':
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      case 'checking':
        return <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />
    }
  }

  const getStatusColor = (status: NodeStatus['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50'
      case 'offline':
        return 'text-red-600 bg-red-50'
      case 'checking':
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IPFS Node Status</h1>
          <p className="mt-2 text-gray-600">
            Monitor the status of your private IPFS nodes
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={checkAllNodes}
            disabled={isChecking}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Refresh Status'
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nodeStatuses.map((node, index) => (
            <div key={node.url} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(node.status)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Node {index + 1}
                    </h3>
                    <p className="text-sm text-gray-500">{node.url}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>

              <div className="mt-4">
                {node.status === 'online' && node.responseTime && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Response Time:</span> {node.responseTime}ms
                  </div>
                )}
                
                {node.status === 'offline' && node.error && (
                  <div className="text-sm text-red-600">
                    <span className="font-medium">Error:</span> {node.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">IPFS Configuration</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Primary Node:</span> {IPFS_NODES[0]}</p>
            <p><span className="font-medium">Secondary Node:</span> {IPFS_NODES[1]}</p>
            <p><span className="font-medium">Failover:</span> Enabled (automatic)</p>
            <p><span className="font-medium">Pinning:</span> Enabled for persistence</p>
          </div>
        </div>
      </div>
    </div>
  )
}