import dbConnect from './mongodb';
import { User, IUser } from './models/User';
import bcrypt from 'bcryptjs';
import { KYCStatus } from '@/types';

export class DatabaseUserService {
  private static async getModel() {
    await dbConnect();
    return User;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const UserModel = await this.getModel();
      return await UserModel.findOne({ email }).lean();
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<IUser | null> {
    try {
      const UserModel = await this.getModel();
      
      // Check if the ID is a valid MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.error('Invalid ObjectId format:', id);
        return null;
      }
      
      return await UserModel.findById(id).lean();
    } catch (error) {
      console.error('Database error in findById:', error);
      return null; // Return null instead of throwing to prevent crashes
    }
  }

  static async findByWalletAddress(walletAddress: string): Promise<IUser | null> {
    try {
      const UserModel = await this.getModel();
      return await UserModel.findOne({ walletAddress }).lean();
    } catch (error) {
      console.error('Database error in findByWalletAddress:', error);
      throw error;
    }
  }

  static async create(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    walletAddress?: string;
  }): Promise<IUser> {
    try {
      const UserModel = await this.getModel();
      
      // Create user with all required fields
      const user = new UserModel({
        email: userData.email,
        password: userData.password, // Raw password - will be hashed by pre-save middleware
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        dateOfBirth: '', // Required by schema but can be empty for MVP
        nationality: '', // Required by schema but can be empty for MVP
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        phoneNumber: '', // Required by schema but can be empty for MVP
        walletAddress: userData.walletAddress || null,
        kycStatus: KYCStatus.NOT_STARTED,
        riskScore: 0,
      });

      return await user.save();
    } catch (error) {
      console.error('Database error in create:', error);
      throw error;
    }
  }

  static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      const UserModel = await this.getModel();
      
      updateData.updatedAt = new Date();
      
      return await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();
    } catch (error) {
      console.error('Database error in update:', error);
      throw error;
    }
  }

  static async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Database error in verifyPassword:', error);
      throw error;
    }
  }

  static toPublicUser(user: IUser): any {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      walletAddress: user.walletAddress,
      kycStatus: user.kycStatus,
      riskScore: user.riskScore,
      role: user.role,
      isAdmin: user.isAdmin,
      adminLevel: user.adminLevel,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Add a method to clear user cache when user data changes
  static clearUserCache(userId: string): void {
    // This would be called when user data is updated
    // For now, we'll implement this in the API routes
  }

  // Find all admin users
  async findAdmins(): Promise<IUser[]> {
    try {
      await dbConnect();
      return await User.find({ isAdmin: true }).select('-password');
    } catch (error) {
      console.error('Error finding admins:', error);
      throw error;
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      return user ? user.isAdmin : false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Find all users
  async findAll(): Promise<IUser[]> {
    try {
      await dbConnect();
      return await User.find({}).select('-password');
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }
}
