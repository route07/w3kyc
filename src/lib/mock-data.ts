import { mockUsers, MockUser } from './mock-data/users'
import { mockKYCSubmissions, MockKYCSubmission } from './mock-data/kyc-submissions'
import { mockRiskProfiles, MockRiskProfile } from './mock-data/risk-profiles'
import { mockInstitutions, MockInstitution } from './mock-data/institutions'
import { mockAuditLogs, MockAuditLog } from './mock-data/audit-logs'
import { mockDocuments, MockDocument } from './mock-data/documents'

// Export all mock data
export {
  mockUsers,
  mockKYCSubmissions,
  mockRiskProfiles,
  mockInstitutions,
  mockAuditLogs,
  mockDocuments
}

// Helper functions
export const getMockUserById = (id: string) => mockUsers.find(user => user.id === id)
export const getMockKYCByUserId = (userId: string) => mockKYCSubmissions.find(kyc => kyc.userId === userId)
export const getMockRiskProfileByUserId = (userId: string) => mockRiskProfiles.find(profile => profile.userId === userId)
export const getMockInstitutionById = (id: string) => mockInstitutions.find(inst => inst.id === id)
export const getMockAuditLogsByUserId = (userId: string) => mockAuditLogs.filter(log => log.userId === userId)
export const getMockDocumentsByUserId = (userId: string) => mockDocuments.filter(doc => doc.userId === userId)

// Get all KYC submissions for admin dashboard
export const getMockKYCSubmissions = () => mockKYCSubmissions

// Get all pending KYC submissions for admin dashboard
export const getPendingKYCSubmissions = () => mockKYCSubmissions.filter(kyc => kyc.status === 'pending')

// Get high-risk profiles for admin review
export const getHighRiskProfiles = () => mockRiskProfiles.filter(profile => profile.riskLevel === 'high')

// Get statistics for dashboard
export const getDashboardStats = () => ({
  totalUsers: mockUsers.length,
  totalKYCSubmissions: mockKYCSubmissions.length,
  pendingKYC: mockKYCSubmissions.filter(kyc => kyc.status === 'pending').length,
  approvedKYC: mockKYCSubmissions.filter(kyc => kyc.status === 'approved').length,
  rejectedKYC: mockKYCSubmissions.filter(kyc => kyc.status === 'rejected').length,
  highRiskProfiles: mockRiskProfiles.filter(profile => profile.riskLevel === 'high').length,
  averageRiskScore: Math.round(
    mockRiskProfiles.reduce((sum, profile) => sum + profile.riskScore, 0) / mockRiskProfiles.length
  )
})

// Legacy exports for backward compatibility
export const mockRiskAssessmentData = mockRiskProfiles.map((profile: MockRiskProfile) => ({
  id: profile.id,
  userId: profile.userId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  riskScore: profile.riskScore,
  riskLevel: profile.riskLevel,
  assessmentDate: profile.assessmentDate,
  lastUpdated: profile.lastUpdated,
  identityRisk: profile.identityRisk,
  industryRisk: profile.industryRisk,
  networkRisk: profile.networkRisk,
  securityRisk: profile.securityRisk,
  documentAnalysis: profile.documentAnalysis,
  webIntelligence: profile.webIntelligence,
  recommendations: profile.recommendations,
  riskFactors: profile.riskFactors,
  complianceStatus: profile.complianceStatus
}))

// Enhanced mock data for AI services
export const getMockWebIntelligence = (userId: string) => {
  const profile = mockRiskProfiles.find((p: MockRiskProfile) => p.userId === userId)
  if (!profile) return null
  
  return {
    userId,
    socialMediaPresence: profile.webIntelligence.socialMediaPresence,
    onlineReputation: profile.webIntelligence.onlineReputation,
    newsMentions: profile.webIntelligence.newsMentions,
    findings: profile.webIntelligence.findings,
    sentimentAnalysis: profile.webIntelligence.sentimentAnalysis,
    lastUpdated: profile.lastUpdated
  }
}

export const getMockDocumentAnalysis = (userId: string) => {
  const documents = mockDocuments.filter((d: MockDocument) => d.userId === userId)
  if (documents.length === 0) return null
  
  return {
    userId,
    totalDocuments: documents.length,
    verifiedDocuments: documents.filter((d: MockDocument) => d.status === 'verified').length,
    pendingDocuments: documents.filter((d: MockDocument) => d.status === 'pending').length,
    rejectedDocuments: documents.filter((d: MockDocument) => d.status === 'rejected').length,
    averageConfidence: documents.reduce((sum: number, doc: MockDocument) => sum + (doc.ocrResults?.confidence || 0), 0) / documents.length,
    documents: documents.map((doc: MockDocument) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      status: doc.status,
      confidence: doc.ocrResults?.confidence || 0,
      extractedData: doc.ocrResults?.extractedData || {},
      verificationNotes: doc.verificationNotes
    }))
  }
}

// Mock data for API responses
export const getMockKYCDashboardData = (userId: string) => {
  const user = getMockUserById(userId)
  const kyc = getMockKYCByUserId(userId)
  const riskProfile = getMockRiskProfileByUserId(userId)
  const auditLogs = getMockAuditLogsByUserId(userId)
  const documents = getMockDocumentsByUserId(userId)
  
  if (!user) return null
  
  return {
    user,
    kyc,
    riskProfile,
    auditLogs: auditLogs.slice(0, 10), // Last 10 audit logs
    documents,
    stats: {
      totalDocuments: documents.length,
      verifiedDocuments: documents.filter((d: MockDocument) => d.status === 'verified').length,
      pendingDocuments: documents.filter((d: MockDocument) => d.status === 'pending').length,
      totalAuditLogs: auditLogs.length,
      lastActivity: auditLogs[0]?.timestamp || user.updatedAt
    }
  }
}

export const getMockAdminDashboardData = () => {
  const pendingKYC = getPendingKYCSubmissions()
  const highRiskProfiles = getHighRiskProfiles()
  const stats = getDashboardStats()
  
  return {
    stats,
    pendingKYC: pendingKYC.map((kyc: MockKYCSubmission) => ({
      id: kyc.id,
      userId: kyc.userId,
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      email: kyc.email,
      investorType: kyc.investorType,
      submittedAt: kyc.submittedAt,
      riskScore: kyc.riskScore,
      riskLevel: kyc.riskLevel,
      documentCount: kyc.documents.length
    })),
    highRiskProfiles: highRiskProfiles.map((profile: MockRiskProfile) => ({
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      riskScore: profile.riskScore,
      riskLevel: profile.riskLevel,
      assessmentDate: profile.assessmentDate,
      riskFactors: profile.riskFactors.filter((f: any) => f.mitigationRequired)
    })),
    recentActivity: mockAuditLogs
      .sort((a: MockAuditLog, b: MockAuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
  }
}

// Export types for use in components
export type { MockUser, MockKYCSubmission, MockRiskProfile, MockInstitution, MockAuditLog, MockDocument } 