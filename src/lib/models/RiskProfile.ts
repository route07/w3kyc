import mongoose, { Schema, Document } from 'mongoose';
import { RiskProfile as RiskProfileType, RiskScore, RiskFactor, RiskLevel } from '@/types';

export interface RiskProfileDocument extends Omit<RiskProfileType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const RiskScoreSchema = new Schema<RiskScore>({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  level: {
    type: String,
    enum: Object.values(RiskLevel),
    required: true
  },
  factors: [{
    type: String,
    trim: true
  }]
}, { _id: false });

const RiskFactorSchema = new Schema<RiskFactor>({
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: Object.values(RiskLevel),
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const RiskProfileSchema = new Schema<RiskProfileDocument>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  identityRisk: {
    type: RiskScoreSchema,
    required: true
  },
  industryRisk: {
    type: RiskScoreSchema,
    required: true
  },
  networkRisk: {
    type: RiskScoreSchema,
    required: true
  },
  securityRisk: {
    type: RiskScoreSchema,
    required: true
  },
  overallRisk: {
    type: RiskScoreSchema,
    required: true
  },
  riskFactors: {
    type: [RiskFactorSchema],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
RiskProfileSchema.index({ userId: 1 });
RiskProfileSchema.index({ 'overallRisk.score': -1 });
RiskProfileSchema.index({ 'overallRisk.level': 1 });
RiskProfileSchema.index({ lastUpdated: -1 });

// Compound indexes for risk analysis
RiskProfileSchema.index({ 'overallRisk.level': 1, lastUpdated: -1 });
RiskProfileSchema.index({ userId: 1, 'overallRisk.score': -1 });

// Pre-save middleware to update lastUpdated
RiskProfileSchema.pre('save', function(this: any, next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get high-risk profiles
RiskProfileSchema.statics.findHighRiskProfiles = function() {
  return this.find({
    $or: [
      { 'overallRisk.level': RiskLevel.HIGH },
      { 'overallRisk.level': RiskLevel.CRITICAL }
    ]
  }).populate('userId', 'firstName lastName email');
};

// Static method to get profiles by risk level
RiskProfileSchema.statics.findByRiskLevel = function(level: RiskLevel) {
  return this.find({ 'overallRisk.level': level }).populate('userId', 'firstName lastName email');
};

// Instance method to add risk factor
RiskProfileSchema.methods.addRiskFactor = function(factor: RiskFactor) {
  this.riskFactors.push(factor);
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to recalculate overall risk
RiskProfileSchema.methods.recalculateOverallRisk = function() {
  const scores = [
    this.identityRisk.score,
    this.industryRisk.score,
    this.networkRisk.score,
    this.securityRisk.score
  ];
  
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  let level: RiskLevel;
  if (averageScore >= 80) level = RiskLevel.CRITICAL;
  else if (averageScore >= 60) level = RiskLevel.HIGH;
  else if (averageScore >= 30) level = RiskLevel.MEDIUM;
  else level = RiskLevel.LOW;
  
  this.overallRisk = {
    score: Math.round(averageScore),
    level,
    factors: []
  };
  
  this.lastUpdated = new Date();
  return this.save();
};

// Virtual for risk trend (comparing with previous assessment)
RiskProfileSchema.virtual('riskTrend').get(function(this: any) {
  // This would need to be implemented with historical data
  return 'stable'; // 'increasing', 'decreasing', 'stable'
});

export const RiskProfile = mongoose.models.RiskProfile || mongoose.model<RiskProfileDocument>('RiskProfile', RiskProfileSchema); 