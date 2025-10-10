import dbConnect from './mongodb';
import { KYCSubmission, KYCSubmissionDocument } from './models/KYCSubmission';

export class KYCSubmissionService {
  private static async getModel() {
    await dbConnect();
    return KYCSubmission;
  }

  static async findByUserId(userId: string): Promise<KYCSubmissionDocument | null> {
    try {
      const KYCSubmissionModel = await this.getModel();
      return await KYCSubmissionModel.findOne({ userId }).lean();
    } catch (error) {
      console.error('Database error in findByUserId:', error);
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<KYCSubmissionDocument | null> {
    try {
      const KYCSubmissionModel = await this.getModel();
      return await KYCSubmissionModel.findOne({ email }).lean();
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw error;
    }
  }

  static async findDraftByUserId(userId: string): Promise<KYCSubmissionDocument | null> {
    try {
      const KYCSubmissionModel = await this.getModel();
      return await KYCSubmissionModel.findOne({ userId, status: 'draft' }).lean();
    } catch (error) {
      console.error('Database error in findDraftByUserId:', error);
      throw error;
    }
  }

  static async createOrUpdateDraft(userId: string, email: string, currentStep: number, userData: any): Promise<KYCSubmissionDocument> {
    try {
      const KYCSubmissionModel = await this.getModel();
      
      // Ensure userData has all required fields with defaults
      const completeUserData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || email,
        walletAddress: userData.walletAddress || '',
        jurisdiction: userData.jurisdiction || 'UK',
        investorType: userData.investorType || 'individual',
        eligibilityAnswers: userData.eligibilityAnswers || {},
        institutionDetails: userData.institutionDetails || {
          name: '',
          registrationNumber: '',
          country: '',
          address: { street: '', city: '', state: '', postalCode: '', country: '' },
          businessType: '',
          website: ''
        },
        uboDeclaration: userData.uboDeclaration || {
          hasUBO: false,
          uboDetails: []
        },
        directorsDeclaration: userData.directorsDeclaration || {
          hasDirectors: false,
          directors: []
        },
        documents: userData.documents || {},
        ipfsDocuments: userData.ipfsDocuments || [],
        kycStatus: userData.kycStatus || 'in_progress'
      };
      
      // Try to find existing draft
      let submission = await KYCSubmissionModel.findOne({ userId, status: 'draft' });
      
      if (submission) {
        // Update existing draft
        submission.currentStep = currentStep;
        submission.userData = completeUserData;
        submission.updatedAt = new Date();
        await submission.save();
        console.log('Updated existing KYC draft for user:', email);
      } else {
        // Create new draft
        submission = new KYCSubmissionModel({
          userId,
          email,
          currentStep,
          userData: completeUserData,
          status: 'draft'
        });
        await submission.save();
        console.log('Created new KYC draft for user:', email);
      }
      
      return submission;
    } catch (error) {
      console.error('Database error in createOrUpdateDraft:', error);
      throw error;
    }
  }

  static async submitKYC(userId: string): Promise<KYCSubmissionDocument | null> {
    try {
      const KYCSubmissionModel = await this.getModel();
      
      const submission = await KYCSubmissionModel.findOne({ userId, status: 'draft' });
      if (!submission) {
        throw new Error('No draft KYC submission found');
      }
      
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      submission.userData.kycStatus = 'pending_review';
      
      await submission.save();
      console.log('KYC submitted for user:', submission.email);
      
      return submission;
    } catch (error) {
      console.error('Database error in submitKYC:', error);
      throw error;
    }
  }

  static async updateStatus(userId: string, status: 'under_review' | 'approved' | 'rejected', reviewedBy?: string, rejectionReason?: string): Promise<KYCSubmissionDocument | null> {
    try {
      const KYCSubmissionModel = await this.getModel();
      
      const submission = await KYCSubmissionModel.findOne({ userId, status: { $in: ['submitted', 'under_review'] } });
      if (!submission) {
        throw new Error('No submitted KYC submission found');
      }
      
      submission.status = status;
      submission.reviewedAt = new Date();
      if (reviewedBy) submission.reviewedBy = reviewedBy;
      if (rejectionReason) submission.rejectionReason = rejectionReason;
      
      // Update userData kycStatus to match
      if (status === 'approved') {
        submission.userData.kycStatus = 'approved';
      } else if (status === 'rejected') {
        submission.userData.kycStatus = 'rejected';
      }
      
      await submission.save();
      console.log(`KYC status updated to ${status} for user:`, submission.email);
      
      return submission;
    } catch (error) {
      console.error('Database error in updateStatus:', error);
      throw error;
    }
  }

  static async findAll(status?: string): Promise<KYCSubmissionDocument[]> {
    try {
      const KYCSubmissionModel = await this.getModel();
      const query = status ? { status } : {};
      return await KYCSubmissionModel.find(query).sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error('Database error in findAll:', error);
      throw error;
    }
  }

  static async deleteDraft(userId: string): Promise<boolean> {
    try {
      const KYCSubmissionModel = await this.getModel();
      const result = await KYCSubmissionModel.deleteOne({ userId, status: 'draft' });
      console.log('Deleted KYC draft for user:', userId);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Database error in deleteDraft:', error);
      throw error;
    }
  }
}