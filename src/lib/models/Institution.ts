import mongoose, { Schema, Document } from 'mongoose';
import { Institution as InstitutionType, KYCStatus, Address, Director, UBO } from '@/types';

export interface InstitutionDocument extends Omit<InstitutionType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<Address>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const DirectorSchema = new Schema<Director>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        const date = new Date(v);
        return date instanceof Date && !isNaN(date.getTime());
      },
      message: 'Please enter a valid date of birth'
    }
  },
  nationality: { type: String, required: true, trim: true },
  passportNumber: { type: String, required: true, trim: true },
  address: { type: AddressSchema, required: true }
}, { _id: false });

const UBOSchema = new Schema<UBO>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        const date = new Date(v);
        return date instanceof Date && !isNaN(date.getTime());
      },
      message: 'Please enter a valid date of birth'
    }
  },
  nationality: { type: String, required: true, trim: true },
  ownershipPercentage: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  address: { type: AddressSchema, required: true }
}, { _id: false });

const InstitutionSchema = new Schema<InstitutionDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: AddressSchema,
    required: true
  },
  directors: {
    type: [DirectorSchema],
    required: true,
    validate: {
      validator: function(directors: Director[]) {
        return directors.length > 0;
      },
      message: 'At least one director is required'
    }
  },
  ultimateBeneficialOwners: {
    type: [UBOSchema],
    required: true,
    validate: {
      validator: function(ubos: UBO[]) {
        return ubos.length > 0;
      },
      message: 'At least one UBO is required'
    }
  },
  kycStatus: {
    type: String,
    enum: Object.values(KYCStatus),
    default: KYCStatus.PENDING,
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
InstitutionSchema.index({ name: 1 });
InstitutionSchema.index({ registrationNumber: 1 });
InstitutionSchema.index({ country: 1 });
InstitutionSchema.index({ kycStatus: 1 });
InstitutionSchema.index({ riskScore: 1 });
InstitutionSchema.index({ createdAt: -1 });

// Virtual for total ownership percentage
InstitutionSchema.virtual('totalOwnershipPercentage').get(function() {
  return this.ultimateBeneficialOwners.reduce((total, ubo) => total + ubo.ownershipPercentage, 0);
});

// Pre-save middleware to validate ownership percentages
InstitutionSchema.pre('save', function(next) {
  const totalOwnership = this.ultimateBeneficialOwners.reduce((total, ubo) => total + ubo.ownershipPercentage, 0);
  if (totalOwnership > 100) {
    return next(new Error('Total ownership percentage cannot exceed 100%'));
  }
  next();
});

export const Institution = mongoose.models.Institution || mongoose.model<InstitutionDocument>('Institution', InstitutionSchema); 