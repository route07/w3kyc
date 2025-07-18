// Export all models
export { User, type UserDocument } from './User';
export { Institution, type InstitutionDocument } from './Institution';
export { KYCDocument, type KYCDocumentDocument } from './KYCDocument';
export { RiskProfile, type RiskProfileDocument } from './RiskProfile';
export { AuditLog, type AuditLogDocument } from './AuditLog';
export { AdminUser, type AdminUserDocument } from './AdminUser';

// Export model names for reference
export const MODEL_NAMES = {
  USER: 'User',
  INSTITUTION: 'Institution',
  KYC_DOCUMENT: 'KYCDocument',
  RISK_PROFILE: 'RiskProfile',
  AUDIT_LOG: 'AuditLog',
  ADMIN_USER: 'AdminUser'
} as const; 