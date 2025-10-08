import mongoose, { Schema, Document } from 'mongoose';

export interface KYCSubmissionDocument extends Document {
  userId: string;
  email: string;
  currentStep: number;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    walletAddress: string;
    jurisdiction: string;
    investorType: 'individual' | 'institutional' | 'retail' | 'accredited' | 'qualified';
    eligibilityAnswers: {
      [key: string]: boolean | string;
    };
    institutionDetails?: {
      name: string;
      registrationNumber: string;
      country: string;
      address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      businessType: string;
      website?: string;
    };
    uboDeclaration: {
      hasUBO: boolean;
      uboDetails: Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        nationality: string;
        ownershipPercentage: number;
        address: {
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
      }>;
    };
    directorsDeclaration: {
      hasDirectors: boolean;
      directors: Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        nationality: string;
        passportNumber: string;
        address: {
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
        position: string;
      }>;
    };
    documents: {
      passport?: File;
      addressProof?: File;
      selfie?: File;
      institutionRegistration?: File;
      uboDocuments?: File[];
      directorDocuments?: File[];
    };
    kycStatus: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KYCSubmissionSchema = new Schema<KYCSubmissionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  currentStep: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 10
  },
  userData: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, required: true },
    walletAddress: { type: String, required: false },
    jurisdiction: { type: String, default: 'UK' },
    investorType: {
      type: String,
      enum: ['individual', 'institutional', 'retail', 'accredited', 'qualified'],
      default: 'individual'
    },
    eligibilityAnswers: {
      type: Schema.Types.Mixed,
      default: {}
    },
    institutionDetails: {
      name: { type: String, required: false },
      registrationNumber: { type: String, required: false },
      country: { type: String, required: false },
      address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        postalCode: { type: String, required: false },
        country: { type: String, required: false }
      },
      businessType: { type: String, required: false },
      website: { type: String, required: false }
    },
    uboDeclaration: {
      hasUBO: { type: Boolean, default: false },
      uboDetails: [{
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        dateOfBirth: { type: String, required: false },
        nationality: { type: String, required: false },
        ownershipPercentage: { type: Number, required: false },
        address: {
          street: { type: String, required: false },
          city: { type: String, required: false },
          state: { type: String, required: false },
          postalCode: { type: String, required: false },
          country: { type: String, required: false }
        }
      }]
    },
    directorsDeclaration: {
      hasDirectors: { type: Boolean, default: false },
      directors: [{
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        dateOfBirth: { type: String, required: false },
        nationality: { type: String, required: false },
        passportNumber: { type: String, required: false },
        address: {
          street: { type: String, required: false },
          city: { type: String, required: false },
          state: { type: String, required: false },
          postalCode: { type: String, required: false },
          country: { type: String, required: false }
        },
        position: { type: String, required: false }
      }]
    },
    documents: {
      type: Schema.Types.Mixed,
      default: {}
    },
    kycStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'pending_review', 'approved', 'rejected'],
      default: 'not_started'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft',
    required: true
  },
  submittedAt: {
    type: Date,
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewedBy: {
    type: String,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
KYCSubmissionSchema.index({ userId: 1 });
KYCSubmissionSchema.index({ email: 1 });
KYCSubmissionSchema.index({ status: 1 });
KYCSubmissionSchema.index({ createdAt: -1 });

// Ensure only one draft per user
KYCSubmissionSchema.index({ userId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'draft' } });

export const KYCSubmission = mongoose.models.KYCSubmission || mongoose.model<KYCSubmissionDocument>('KYCSubmission', KYCSubmissionSchema);