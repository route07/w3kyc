import mongoose, { Schema, Document } from 'mongoose';
import { AdminUser as AdminUserType, AdminRole, Permission } from '@/types';

export interface AdminUserDocument extends Omit<AdminUserType, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<AdminUserDocument>({
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
  role: {
    type: String,
    enum: Object.values(AdminRole),
    default: AdminRole.VIEWER,
    required: true
  },
  permissions: {
    type: [String],
    enum: Object.values(Permission),
    default: []
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.twoFactorSecret;
      return ret;
    }
  }
});

// Indexes for better query performance
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1 });
AdminUserSchema.index({ isActive: 1 });
AdminUserSchema.index({ permissions: 1 });
AdminUserSchema.index({ lastLogin: -1 });

// Compound indexes
AdminUserSchema.index({ isActive: 1, role: 1 });
AdminUserSchema.index({ email: 1, isActive: 1 });

// Virtual for full name
AdminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for is locked
AdminUserSchema.virtual('isLocked').get(function() {
  return this.lockedUntil && this.lockedUntil > new Date();
});

// Pre-save middleware to hash password
AdminUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if admin has permission
AdminUserSchema.methods.hasPermission = function(permission: Permission): boolean {
  return this.permissions.includes(permission) || this.role === AdminRole.SUPER_ADMIN;
};

// Method to check if admin has any of the permissions
AdminUserSchema.methods.hasAnyPermission = function(permissions: Permission[]): boolean {
  return this.role === AdminRole.SUPER_ADMIN || 
         permissions.some(permission => this.permissions.includes(permission));
};

// Method to check if admin has all permissions
AdminUserSchema.methods.hasAllPermissions = function(permissions: Permission[]): boolean {
  return this.role === AdminRole.SUPER_ADMIN || 
         permissions.every(permission => this.permissions.includes(permission));
};

// Method to add permission
AdminUserSchema.methods.addPermission = function(permission: Permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Method to remove permission
AdminUserSchema.methods.removePermission = function(permission: Permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Method to record failed login attempt
AdminUserSchema.methods.recordFailedLogin = function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

// Method to reset failed login attempts
AdminUserSchema.methods.resetFailedLoginAttempts = function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

// Method to record successful login
AdminUserSchema.methods.recordSuccessfulLogin = function() {
  this.lastLogin = new Date();
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  return this.save();
};

// Static method to get admins by role
AdminUserSchema.statics.findByRole = function(role: AdminRole) {
  return this.find({ role, isActive: true });
};

// Static method to get active admins
AdminUserSchema.statics.findActiveAdmins = function() {
  return this.find({ isActive: true });
};

// Static method to get admins with permission
AdminUserSchema.statics.findByPermission = function(permission: Permission) {
  return this.find({
    $or: [
      { role: AdminRole.SUPER_ADMIN },
      { permissions: permission }
    ],
    isActive: true
  });
};

export const AdminUser = mongoose.models.AdminUser || mongoose.model<AdminUserDocument>('AdminUser', AdminUserSchema); 