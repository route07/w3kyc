import mongoose, { Schema, Document } from 'mongoose';
import { KYCDocument as KYCDocumentType, DocumentType, DocumentVerificationStatus } from '@/types';

export interface KYCDocumentDocument extends Omit<KYCDocumentType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const KYCDocumentSchema = new Schema<KYCDocumentDocument>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: Object.values(DocumentType),
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    enum: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ]
  },
  ipfsHash: {
    type: String,
    required: true,
    trim: true
  },
  verificationStatus: {
    type: String,
    enum: Object.values(DocumentVerificationStatus),
    default: DocumentVerificationStatus.PENDING,
    required: true
  },
  ocrData: {
    type: Schema.Types.Mixed,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
KYCDocumentSchema.index({ userId: 1 });
KYCDocumentSchema.index({ documentType: 1 });
KYCDocumentSchema.index({ verificationStatus: 1 });
KYCDocumentSchema.index({ uploadedAt: -1 });
KYCDocumentSchema.index({ ipfsHash: 1 });

// Compound indexes for common queries
KYCDocumentSchema.index({ userId: 1, documentType: 1 });
KYCDocumentSchema.index({ userId: 1, verificationStatus: 1 });

// Virtual for document age
KYCDocumentSchema.virtual('ageInDays').get(function(this: any) {
  return Math.floor((Date.now() - this.uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update verifiedAt when status changes
KYCDocumentSchema.pre('save', function(this: any, next) {
  if (this.isModified('verificationStatus') && this.verificationStatus === DocumentVerificationStatus.VERIFIED) {
    this.verifiedAt = new Date();
  }
  next();
});

// Static method to get documents by user and type
KYCDocumentSchema.statics.findByUserAndType = function(userId: string, documentType: DocumentType) {
  return this.find({ userId, documentType }).sort({ uploadedAt: -1 });
};

// Static method to get pending documents
KYCDocumentSchema.statics.findPendingDocuments = function() {
  return this.find({ verificationStatus: DocumentVerificationStatus.PENDING }).populate('userId', 'firstName lastName email');
};

// Instance method to mark as verified
KYCDocumentSchema.methods.markAsVerified = function() {
  this.verificationStatus = DocumentVerificationStatus.VERIFIED;
  this.verifiedAt = new Date();
  return this.save();
};

// Instance method to mark as rejected
KYCDocumentSchema.methods.markAsRejected = function() {
  this.verificationStatus = DocumentVerificationStatus.REJECTED;
  return this.save();
};

export const KYCDocument = mongoose.models.KYCDocument || mongoose.model<KYCDocumentDocument>('KYCDocument', KYCDocumentSchema); 