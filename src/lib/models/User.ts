import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType, KYCStatus, Address } from '@/types';

export interface UserDocument extends Omit<UserType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<Address>({
  street: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: String, required: false }
}, { _id: false });

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty for MVP
        const date = new Date(v);
        return date instanceof Date && !isNaN(date.getTime());
      },
      message: 'Please enter a valid date of birth'
    }
  },
  nationality: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    type: AddressSchema,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  walletAddress: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty for MVP
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Please enter a valid Ethereum address'
    }
  },
  kycStatus: {
    type: String,
    enum: Object.values(KYCStatus),
    default: KYCStatus.NOT_STARTED,
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
// Note: Removed duplicate indexes that were already defined in schema fields
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ kycStatus: 1 });
UserSchema.index({ riskScore: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema); 