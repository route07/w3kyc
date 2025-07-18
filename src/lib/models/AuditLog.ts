import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog as AuditLogType } from '@/types';

export interface AuditLogDocument extends Omit<AuditLogType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    enum: [
      // User actions
      'USER_REGISTERED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_PROFILE_UPDATED',
      'USER_PASSWORD_CHANGED',
      
      // KYC actions
      'KYC_SUBMITTED',
      'KYC_APPROVED',
      'KYC_REJECTED',
      'KYC_UPDATED',
      'KYC_EXPIRED',
      
      // Document actions
      'DOCUMENT_UPLOADED',
      'DOCUMENT_VERIFIED',
      'DOCUMENT_REJECTED',
      'DOCUMENT_DELETED',
      
      // Risk assessment
      'RISK_ASSESSMENT_CREATED',
      'RISK_ASSESSMENT_UPDATED',
      'RISK_FACTOR_ADDED',
      
      // Wallet actions
      'WALLET_LINKED',
      'WALLET_UNLINKED',
      
      // Admin actions
      'ADMIN_LOGIN',
      'ADMIN_ACTION_PERFORMED',
      'USER_ACCESS_REVOKED',
      'USER_ACCESS_GRANTED',
      
      // System actions
      'SYSTEM_MAINTENANCE',
      'BACKUP_CREATED',
      'SECURITY_ALERT'
    ]
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v) || v === 'localhost';
      },
      message: 'Please enter a valid IP address'
    }
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: 500
  },
  onChainHash: {
    type: String,
    trim: true
  },
  sessionId: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ severity: 1 });
AuditLogSchema.index({ ipAddress: 1 });
AuditLogSchema.index({ onChainHash: 1 });

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

// TTL index to automatically delete old logs (optional)
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year

// Static method to get logs by user
AuditLogSchema.statics.findByUser = function(userId: string, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Static method to get logs by action
AuditLogSchema.statics.findByAction = function(action: string, limit = 50) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Static method to get logs by date range
AuditLogSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ timestamp: -1 })
    .populate('userId', 'firstName lastName email');
};

// Static method to get high severity logs
AuditLogSchema.statics.findHighSeverityLogs = function() {
  return this.find({
    severity: { $in: ['HIGH', 'CRITICAL'] }
  })
    .sort({ timestamp: -1 })
    .populate('userId', 'firstName lastName email');
};

// Static method to get logs by IP address
AuditLogSchema.statics.findByIPAddress = function(ipAddress: string) {
  return this.find({ ipAddress })
    .sort({ timestamp: -1 })
    .populate('userId', 'firstName lastName email');
};

// Instance method to mark as synced to blockchain
AuditLogSchema.methods.markAsSynced = function(blockchainHash: string) {
  this.onChainHash = blockchainHash;
  return this.save();
};

// Virtual for log age
AuditLogSchema.virtual('ageInMinutes').get(function(this: any) {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60));
});

// Virtual for log age in hours
AuditLogSchema.virtual('ageInHours').get(function(this: any) {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60));
});

// Virtual for log age in days
AuditLogSchema.virtual('ageInDays').get(function(this: any) {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60 * 24));
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema); 