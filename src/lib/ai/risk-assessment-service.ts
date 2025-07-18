import dbConnect from '@/lib/mongodb';
import { User, RiskProfile, KYCDocument, AuditLog } from '@/lib/models';
import { 
  performRiskAssessment, 
  analyzeDocument, 
  analyzeWebData,
  convertToRiskProfile,
  generateRiskFactors,
  validateRiskAssessment
} from './deepseek';
import { 
  gatherWebIntelligence, 
  searchSanctionsLists, 
  searchDataBreaches 
} from './web-scraper';
import { verifyKYCOnChain, createAuditLogOnChain } from '@/lib/blockchain';

/**
 * Comprehensive risk assessment service
 */
export class RiskAssessmentService {
  
  /**
   * Perform complete risk assessment for a user
   */
  static async assessUserRisk(userId: string): Promise<any> {
    try {
      await dbConnect();
      
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user documents
      const documents = await KYCDocument.find({ userId });
      
      // Get existing risk profile
      const riskProfile = await RiskProfile.findOne({ userId });
      
      console.log(`Starting risk assessment for user: ${userId}`);
      
      // Step 1: Gather web intelligence
      const webIntelligence = await this.gatherWebIntelligence(user);
      
      // Step 2: Analyze documents with AI
      const documentAnalyses = await this.analyzeDocuments(documents, user);
      
      // Step 3: Perform comprehensive risk assessment
      const riskAssessment = await this.performComprehensiveAssessment(
        user, 
        documents, 
        webIntelligence,
        documentAnalyses
      );
      
      // Step 4: Update risk profile
      const updatedRiskProfile = await this.updateRiskProfile(
        userId, 
        riskAssessment, 
        webIntelligence,
        documentAnalyses
      );
      
      // Step 5: Update user risk score
      await this.updateUserRiskScore(userId, riskAssessment.overallRisk.score);
      
      // Step 6: Create audit log
      await this.createRiskAssessmentAudit(userId, riskAssessment, webIntelligence);
      
      // Step 7: Update blockchain if user has wallet
      if (user.walletAddress) {
        await this.updateBlockchainRiskScore(user.walletAddress, riskAssessment.overallRisk.score);
      }
      
      return {
        success: true,
        riskProfile: updatedRiskProfile,
        webIntelligence,
        documentAnalyses,
        assessment: riskAssessment,
      };
      
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    }
  }
  
  /**
   * Gather web intelligence for a user
   */
  private static async gatherWebIntelligence(user: any): Promise<any> {
    try {
      console.log('Gathering web intelligence...');
      
      const intelligence = await gatherWebIntelligence({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        address: user.address,
        // Add company info if available
        company: user.company || null,
      });
      
      console.log('Web intelligence gathered successfully');
      return intelligence;
      
    } catch (error) {
      console.error('Web intelligence gathering failed:', error);
      // Return empty intelligence to continue assessment
      return {
        personInfo: null,
        sanctions: [],
        dataBreaches: [],
        riskScore: 0,
        riskLevel: 'low',
        confidence: 0,
        sources: [],
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Analyze all user documents with AI
   */
  private static async analyzeDocuments(documents: any[], user: any): Promise<any[]> {
    try {
      console.log(`Analyzing ${documents.length} documents...`);
      
      const analyses = [];
      
      for (const document of documents) {
        try {
          const analysis = await analyzeDocument(
            {
              documentType: document.documentType,
              fileName: document.fileName,
              ocrData: document.ocrData,
              verificationStatus: document.verificationStatus,
              ipfsHash: document.ipfsHash,
            },
            {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              nationality: user.nationality,
            }
          );
          
          analyses.push({
            documentId: document._id,
            documentType: document.documentType,
            analysis,
          });
          
          // Update document with AI analysis
          document.ocrData = {
            ...document.ocrData,
            aiAnalysis: analysis,
          };
          await document.save();
          
        } catch (error) {
          console.error(`Document analysis failed for ${document.documentType}:`, error);
          analyses.push({
            documentId: document._id,
            documentType: document.documentType,
            analysis: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      console.log('Document analysis completed');
      return analyses;
      
    } catch (error) {
      console.error('Document analysis failed:', error);
      return [];
    }
  }
  
  /**
   * Perform comprehensive risk assessment
   */
  private static async performComprehensiveAssessment(
    user: any,
    documents: any[],
    webIntelligence: any,
    documentAnalyses: any[]
  ): Promise<any> {
    try {
      console.log('Performing comprehensive risk assessment...');
      
      // Prepare data for AI assessment
      const assessmentData = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          nationality: user.nationality,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          phoneNumber: user.phoneNumber,
        },
        documents: documentAnalyses.map(analysis => ({
          type: analysis.documentType,
          analysis: analysis.analysis,
        })),
        webIntelligence: {
          personInfo: webIntelligence.personInfo,
          sanctions: webIntelligence.sanctions,
          dataBreaches: webIntelligence.dataBreaches,
          riskIndicators: webIntelligence.personInfo?.riskIndicators || [],
        },
      };
      
      // Perform AI risk assessment
      const assessment = await performRiskAssessment(
        assessmentData.user,
        assessmentData.documents,
        assessmentData.webIntelligence
      );
      
      // Validate assessment response
      if (!validateRiskAssessment(assessment)) {
        throw new Error('Invalid risk assessment response from AI');
      }
      
      console.log('Risk assessment completed successfully');
      return assessment;
      
    } catch (error) {
      console.error('Comprehensive risk assessment failed:', error);
      throw error;
    }
  }
  
  /**
   * Update risk profile with new assessment
   */
  private static async updateRiskProfile(
    userId: string,
    assessment: any,
    webIntelligence: any,
    documentAnalyses: any[]
  ): Promise<any> {
    try {
      console.log('Updating risk profile...');
      
      // Generate risk factors
      const riskFactors = generateRiskFactors(assessment);
      
      // Add web intelligence factors
      if (webIntelligence.personInfo?.riskIndicators) {
        webIntelligence.personInfo.riskIndicators.forEach((indicator: any) => {
          riskFactors.push({
            type: indicator.type,
            description: indicator.description,
            severity: indicator.severity,
            source: indicator.source,
            timestamp: new Date(),
          });
        });
      }
      
      // Add document analysis factors
      documentAnalyses.forEach(analysis => {
        if (analysis.analysis?.fraudIndicators?.indicators?.length) {
          riskFactors.push({
            type: 'document_fraud',
            description: analysis.analysis.fraudIndicators.indicators.join(', '),
            severity: analysis.analysis.fraudIndicators.riskLevel || 'medium',
            source: 'document_analysis',
            timestamp: new Date(),
          });
        }
      });
      
      // Convert to risk profile format
      const riskProfileData = convertToRiskProfile(assessment, userId, riskFactors);
      
      // Update or create risk profile
      let riskProfile = await RiskProfile.findOne({ userId });
      
      if (riskProfile) {
        // Update existing profile
        Object.assign(riskProfile, riskProfileData);
        await riskProfile.save();
      } else {
        // Create new profile
        riskProfile = new RiskProfile(riskProfileData);
        await riskProfile.save();
      }
      
      console.log('Risk profile updated successfully');
      return riskProfile;
      
    } catch (error) {
      console.error('Risk profile update failed:', error);
      throw error;
    }
  }
  
  /**
   * Update user risk score
   */
  private static async updateUserRiskScore(userId: string, riskScore: number): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { riskScore });
      console.log(`User risk score updated to: ${riskScore}`);
    } catch (error) {
      console.error('Failed to update user risk score:', error);
    }
  }
  
  /**
   * Create audit log for risk assessment
   */
  private static async createRiskAssessmentAudit(
    userId: string,
    assessment: any,
    webIntelligence: any
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        userId,
        action: 'RISK_ASSESSMENT_UPDATED',
        details: {
          overallRiskScore: assessment.overallRisk.score,
          overallRiskLevel: assessment.overallRisk.level,
          identityRiskScore: assessment.identityRisk.score,
          industryRiskScore: assessment.industryRisk.score,
          networkRiskScore: assessment.networkRisk.score,
          securityRiskScore: assessment.securityRisk.score,
          webIntelligenceScore: webIntelligence.riskScore,
          webIntelligenceConfidence: webIntelligence.confidence,
          sources: webIntelligence.sources,
          timestamp: new Date().toISOString(),
        },
        severity: assessment.overallRisk.level === 'critical' ? 'CRITICAL' : 'HIGH',
      });
      
      await auditLog.save();
      console.log('Risk assessment audit log created');
      
    } catch (error) {
      console.error('Failed to create risk assessment audit log:', error);
    }
  }
  
  /**
   * Update blockchain risk score
   */
  private static async updateBlockchainRiskScore(walletAddress: string, riskScore: number): Promise<void> {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_KYCVERIFICATION_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('KYC contract address not configured');
        return;
      }
      
      // Note: This would require the contract to have a function to update risk scores
      // For now, we'll just log the intention
      console.log(`Blockchain risk score update for ${walletAddress}: ${riskScore}`);
      
      // In production, you would call:
      // await updateRiskScoreOnChain(contractAddress, walletAddress, riskScore);
      
    } catch (error) {
      console.error('Failed to update blockchain risk score:', error);
    }
  }
  
  /**
   * Get risk assessment summary for a user
   */
  static async getRiskSummary(userId: string): Promise<any> {
    try {
      await dbConnect();
      
      const user = await User.findById(userId);
      const riskProfile = await RiskProfile.findOne({ userId });
      const documents = await KYCDocument.find({ userId });
      
      if (!user || !riskProfile) {
        throw new Error('User or risk profile not found');
      }
      
      return {
        userId,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          kycStatus: user.kycStatus,
          riskScore: user.riskScore,
        },
        riskProfile: {
          overallRisk: riskProfile.overallRisk,
          identityRisk: riskProfile.identityRisk,
          industryRisk: riskProfile.industryRisk,
          networkRisk: riskProfile.networkRisk,
          securityRisk: riskProfile.securityRisk,
          riskFactors: riskProfile.riskFactors.slice(-5), // Last 5 factors
          lastUpdated: riskProfile.lastUpdated,
        },
        documentCount: documents.length,
        verifiedDocuments: documents.filter(doc => doc.verificationStatus === 'verified').length,
      };
      
    } catch (error) {
      console.error('Failed to get risk summary:', error);
      throw error;
    }
  }
  
  /**
   * Get high-risk users for admin review
   */
  static async getHighRiskUsers(limit: number = 50): Promise<any[]> {
    try {
      // Use mock data for PoC if no API key or in development
      if (!process.env.DEEPSEEK_API_KEY || process.env.NODE_ENV === 'development') {
        console.log('Using mock data for high-risk users');
        const { MOCK_HIGH_RISK_USERS } = await import('./mock-data');
        return MOCK_HIGH_RISK_USERS.slice(0, limit);
      }

      await dbConnect();
      
      const highRiskProfiles = await RiskProfile.find({
        $or: [
          { 'overallRisk.level': 'high' },
          { 'overallRisk.level': 'critical' }
        ]
      })
      .populate('userId', 'firstName lastName email kycStatus')
      .sort({ 'overallRisk.score': -1 })
      .limit(limit);
      
      return highRiskProfiles.map(profile => ({
        userId: profile.userId,
        riskScore: profile.overallRisk.score,
        riskLevel: profile.overallRisk.level,
        riskFactors: profile.riskFactors.slice(-3), // Last 3 factors
        lastUpdated: profile.lastUpdated,
      }));
      
    } catch (error) {
      console.error('Failed to get high-risk users:', error);
      throw error;
    }
  }
  
  /**
   * Trigger risk assessment for all pending users
   */
  static async assessPendingUsers(): Promise<any> {
    try {
      // Use mock data for PoC if no API key or in development
      if (!process.env.DEEPSEEK_API_KEY || process.env.NODE_ENV === 'development') {
        console.log('Using mock data for bulk assessment');
        const { MOCK_BULK_ASSESSMENT_RESULTS } = await import('./mock-data');
        return MOCK_BULK_ASSESSMENT_RESULTS;
      }

      await dbConnect();
      
      const pendingUsers = await User.find({
        kycStatus: 'in_progress',
        riskScore: { $lt: 50 } // Only assess users with low risk scores
      }).limit(10); // Process in batches
      
      const results = [];
      
      for (const user of pendingUsers) {
        try {
          const result = await this.assessUserRisk(user._id.toString());
          results.push({
            userId: user._id,
            success: true,
            riskScore: result.assessment.overallRisk.score,
          });
        } catch (error) {
          results.push({
            userId: user._id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      return {
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
      
    } catch (error) {
      console.error('Failed to assess pending users:', error);
      throw error;
    }
  }
} 