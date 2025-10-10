import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IDocument extends MongoDocument {
  userId: mongoose.Types.ObjectId
  name: string
  type: string
  description?: string
  mimeType: string
  size: number
  ipfsHash: string
  ipfsUrl: string
  ipfsNode?: string
  ocrResult: {
    extractedText: string
    confidence: number
    documentType: string
  }
  validation: {
    isValid: boolean
    expiryDate?: Date
    isExpired: boolean
    issues: string[]
  }
  aiAnalysis: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    flags: string[]
    recommendations: string[]
  }
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  uploadedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  reviewNotes?: string
}

const DocumentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['passport', 'drivers_license', 'utility_bill', 'bank_statement', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  ipfsUrl: {
    type: String,
    required: true
  },
  ipfsNode: {
    type: String,
    required: false
  },
  ocrResult: {
    extractedText: {
      type: String,
      default: ''
    },
    confidence: {
      type: Number,
      default: 0
    },
    documentType: {
      type: String,
      default: 'other'
    }
  },
  validation: {
    isValid: {
      type: Boolean,
      default: false
    },
    expiryDate: {
      type: Date
    },
    isExpired: {
      type: Boolean,
      default: false
    },
    issues: [{
      type: String
    }]
  },
  aiAnalysis: {
    riskScore: {
      type: Number,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    flags: [{
      type: String
    }],
    recommendations: [{
      type: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes for better query performance
DocumentSchema.index({ userId: 1, uploadedAt: -1 })
DocumentSchema.index({ status: 1 })
DocumentSchema.index({ 'validation.isExpired': 1 })

// Virtual for document age
DocumentSchema.virtual('age').get(function() {
  return Date.now() - this.uploadedAt.getTime()
})

// Method to check if document needs review
DocumentSchema.methods.needsReview = function(): boolean {
  return this.status === 'pending' && 
         (this.aiAnalysis.riskScore > 50 || !this.validation.isValid)
}

// Method to mark as reviewed
DocumentSchema.methods.markReviewed = function(
  reviewerId: mongoose.Types.ObjectId,
  status: 'approved' | 'rejected',
  notes?: string
) {
  this.status = status
  this.reviewedAt = new Date()
  this.reviewedBy = reviewerId
  if (notes) {
    this.reviewNotes = notes
  }
}

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema) 