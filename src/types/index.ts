// User Types
export interface User {
  _id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: Address;
  phoneNumber: string;
  walletAddress?: string;
  kycStatus: KYCStatus;
  riskScore: number;
  role: UserRole;
  isAdmin: boolean;
  adminLevel?: AdminLevel;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AdminLevel {
  BASIC = 'basic',
  MODERATOR = 'moderator',
  MANAGER = 'manager',
  SUPER_ADMIN = 'super_admin'
}

export interface Institution {
  _id?: string;
  name: string;
  registrationNumber: string;
  country: string;
  address: Address;
  directors: Director[];
  ultimateBeneficialOwners: UBO[];
  kycStatus: KYCStatus;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Director {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  address: Address;
}

export interface UBO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  ownershipPercentage: number;
  address: Address;
}

// KYC Types
export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface KYCDocument {
  _id?: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  ipfsHash: string;
  verificationStatus: DocumentVerificationStatus;
  ocrData?: any;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export enum DocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  PROOF_OF_ADDRESS = 'proof_of_address',
  COMPANY_REGISTRATION = 'company_registration',
  ARTICLES_OF_ASSOCIATION = 'articles_of_association'
}

export enum DocumentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Risk Assessment Types
export interface RiskProfile {
  _id?: string;
  userId: string;
  identityRisk: RiskScore;
  industryRisk: RiskScore;
  networkRisk: RiskScore;
  securityRisk: RiskScore;
  overallRisk: RiskScore;
  riskFactors: RiskFactor[];
  lastUpdated: Date;
}

export interface RiskScore {
  score: number; // 0-100
  level: RiskLevel;
  factors: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskFactor {
  type: string;
  description: string;
  severity: RiskLevel;
  source: string;
  timestamp: Date;
}

// Blockchain Types
export interface OnChainKYC {
  userAddress: string;
  verificationHash: string;
  verificationDate: number;
  riskScore: number;
  isActive: boolean;
  expiresAt: number;
}

export interface AuditLog {
  _id?: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  onChainHash?: string;
  sessionId?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface KYCFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    phoneNumber: string;
  };
  address: Address;
  documents: KYCDocument[];
  sourceOfFunds: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    swiftCode: string;
  };
}

// Admin Types
export interface AdminUser {
  _id?: string;
  email: string;
  password?: string;
  role: AdminRole;
  permissions: Permission[];
  firstName: string;
  lastName: string;
  isActive?: boolean;
  lastLogin?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer'
}

export enum Permission {
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  VIEW_KYC = 'view_kyc',
  APPROVE_KYC = 'approve_kyc',
  REJECT_KYC = 'reject_kyc',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_RISK_PROFILES = 'view_risk_profiles',
  MANAGE_SETTINGS = 'manage_settings'
} 