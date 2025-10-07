import { KYCStatus } from '@/types';
import dbConnect from './mongodb';
import { User } from './models/User';

export interface DatabaseUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  walletAddress: string | null;
  kycStatus: KYCStatus;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export class DatabaseUserService {
  static async findByEmail(email: string): Promise<DatabaseUser | null> {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    return user ? this.toDatabaseUser(user) : null;
  }

  static async findByWalletAddress(walletAddress: string): Promise<DatabaseUser | null> {
    await dbConnect();
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() }).select('-password');
    return user ? this.toDatabaseUser(user) : null;
  }

  static async findById(id: string): Promise<DatabaseUser | null> {
    await dbConnect();
    const user = await User.findById(id).select('-password');
    return user ? this.toDatabaseUser(user) : null;
  }

  static async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    walletAddress?: string | null;
    kycStatus?: KYCStatus;
  }): Promise<DatabaseUser> {
    await dbConnect();
    
    const newUser = new User({
      email: userData.email.toLowerCase(),
      password: userData.password, // Will be hashed by pre-save middleware
      firstName: userData.firstName,
      lastName: userData.lastName,
      walletAddress: userData.walletAddress?.toLowerCase() || null,
      kycStatus: userData.kycStatus || KYCStatus.NOT_STARTED,
      riskScore: 0
    });

    const savedUser = await newUser.save();
    return this.toDatabaseUser(savedUser);
  }

  static async update(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    await dbConnect();
    
    const user = await User.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    return user ? this.toDatabaseUser(user) : null;
  }

  static async updateByEmail(email: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    await dbConnect();
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    return user ? this.toDatabaseUser(user) : null;
  }

  static async updateByWalletAddress(walletAddress: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    await dbConnect();
    
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    return user ? this.toDatabaseUser(user) : null;
  }

  static async verifyPassword(email: string, password: string): Promise<boolean> {
    await dbConnect();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return false;
    
    return await user.comparePassword(password);
  }

  static async getAll(): Promise<DatabaseUser[]> {
    await dbConnect();
    const users = await User.find({}).select('-password');
    return users.map(user => this.toDatabaseUser(user));
  }

  static async delete(id: string): Promise<boolean> {
    await dbConnect();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  static async count(): Promise<number> {
    await dbConnect();
    return await User.countDocuments();
  }

  private static toDatabaseUser(user: any): DatabaseUser {
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      walletAddress: user.walletAddress,
      kycStatus: user.kycStatus,
      riskScore: user.riskScore || 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toPublicUser(user: DatabaseUser): Omit<DatabaseUser, '_id'> & { id: string } {
    const { _id, ...rest } = user;
    return { id: _id, ...rest };
  }
}