'use client'

import { useState, useEffect } from 'react'
import { mockRiskProfiles, getDashboardStats } from '@/lib/mock-data'

interface RiskProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  assessmentDate: string
  lastUpdated: string
  identityRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
  }
  industryRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
  }
  networkRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
  }
  securityRisk: {
    score: number
    factors: Array<{
      factor: string
      impact: 'low' | 'medium' | 'high'
      description: string
      resolved: boolean
    }>
  }
  documentAnalysis: {
    authenticity: number
    completeness: number
    quality: number
    findings: string[]
  }
  webIntelligence: {
    socialMediaPresence: number
    onlineReputation: number
    newsMentions: number
    findings: string[]
    sentimentAnalysis: {
      overall: 'positive' | 'neutral' | 'negative'
      score: number
      keyTopics: string[]
    }
  }
  recommendations: string[]
  riskFactors: Array<{
    category: string
    factor: string
    impact: 'low' | 'medium' | 'high'
    description: string
    mitigationRequired: boolean
  }>
  complianceStatus: {
    amlCompliant: boolean
    kycCompliant: boolean
    regulatoryChecks: Array<{
      jurisdiction: string
      status: 'pass' | 'fail' | 'pending'
      notes: string
    }>
  }
}

interface DashboardStats {
  totalUsers: number;
  approvedKYC: number;
  pendingKYC: number;
  highRiskProfiles: number;
}

export default function DemoPage() {
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<RiskProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(null)
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use mock data instead of API call
    const loadMockData = () => {
      try {
        setRiskProfiles(mockRiskProfiles)
        setFilteredProfiles(mockRiskProfiles)
        setStats(getDashboardStats())
        setLoading(false)
      } catch (error) {
        console.error('Error loading mock data:', error)
        setRiskProfiles([])
        setFilteredProfiles([])
        setStats(null)
        setLoading(false)
      }
    }

    loadMockData()
  }, [])

  useEffect(() => {
    let filtered = riskProfiles

    // Filter by risk level
    if (filterRiskLevel !== 'all') {
      filtered = filtered.filter(profile => profile.riskLevel === filterRiskLevel)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProfiles(filtered)
  }, [riskProfiles, filterRiskLevel, searchTerm])

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskLevelBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 border-green-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'high': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mock data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Risk Assessment Demo</h1>
              <p className="mt-2 text-gray-600">Comprehensive risk profiling using AI and web intelligence</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{riskProfiles.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved KYC</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approvedKYC}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingKYC}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Risk</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.highRiskProfiles}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Profiles
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="risk-level" className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                id="risk-level"
                value={filterRiskLevel}
                onChange={(e) => setFilterRiskLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Profiles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getRiskLevelBgColor(profile.riskLevel)}`}
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(profile.riskLevel)}`}>
                    {profile.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Risk Score</span>
                      <span className="font-medium">{profile.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          profile.riskScore < 30 ? 'bg-green-500' :
                          profile.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${profile.riskScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Identity Risk</span>
                      <p className="font-medium">{profile.identityRisk.score}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Industry Risk</span>
                      <p className="font-medium">{profile.industryRisk.score}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Network Risk</span>
                      <p className="font-medium">{profile.networkRisk.score}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Security Risk</span>
                      <p className="font-medium">{profile.securityRisk.score}/100</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Assessment Date</span>
                      <span className="font-medium">
                        {new Date(profile.assessmentDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No profiles found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Risk Profile: {selectedProfile.firstName} {selectedProfile.lastName}
              </h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedProfile.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Score:</span>
                      <p className="font-medium">{selectedProfile.riskScore}/100</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Level:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(selectedProfile.riskLevel)}`}>
                        {selectedProfile.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Analysis</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Authenticity:</span>
                      <p className="font-medium">{selectedProfile.documentAnalysis.authenticity}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Completeness:</span>
                      <p className="font-medium">{selectedProfile.documentAnalysis.completeness}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Quality:</span>
                      <p className="font-medium">{selectedProfile.documentAnalysis.quality}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Web Intelligence</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Social Media:</span>
                      <p className="font-medium">{selectedProfile.webIntelligence.socialMediaPresence}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reputation:</span>
                      <p className="font-medium">{selectedProfile.webIntelligence.onlineReputation}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">News Mentions:</span>
                      <p className="font-medium">{selectedProfile.webIntelligence.newsMentions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProfile.riskFactors.map((factor, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{factor.category}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(factor.impact)}`}>
                          {factor.impact.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{factor.factor}</p>
                      <p className="text-xs text-gray-500">{factor.description}</p>
                      {factor.mitigationRequired && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Mitigation Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedProfile.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Compliance Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">AML Compliance</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProfile.complianceStatus.amlCompliant ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {selectedProfile.complianceStatus.amlCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">KYC Compliance</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProfile.complianceStatus.kycCompliant ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {selectedProfile.complianceStatus.kycCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 