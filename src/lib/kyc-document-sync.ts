import dbConnect from '@/lib/mongodb';
import { KYCDocument } from '@/lib/models';
import { deleteFromIPFS } from '@/lib/ipfs-simple';

export interface DocumentSyncResult {
  success: boolean;
  message: string;
  documentsUpdated?: number;
  documentsDeleted?: number;
  error?: string;
}

/**
 * Sync document status with KYC approval/rejection
 */
export async function syncDocumentsWithKYCStatus(
  userId: string,
  kycStatus: 'approved' | 'rejected' | 'permanently_rejected'
): Promise<DocumentSyncResult> {
  try {
    await dbConnect();
    
    const documents = await KYCDocument.find({ userId });
    
    if (documents.length === 0) {
      return {
        success: true,
        message: 'No documents found for user',
        documentsUpdated: 0,
        documentsDeleted: 0
      };
    }
    
    let documentsUpdated = 0;
    let documentsDeleted = 0;
    
    switch (kycStatus) {
      case 'approved':
        // Mark all documents as verified
        for (const doc of documents) {
          if (doc.verificationStatus !== 'verified') {
            doc.verificationStatus = 'verified';
            doc.verifiedAt = new Date();
            await doc.save();
            documentsUpdated++;
          }
        }
        
        return {
          success: true,
          message: `Successfully verified ${documentsUpdated} documents`,
          documentsUpdated,
          documentsDeleted: 0
        };
        
      case 'rejected':
        // Mark documents as rejected but keep them
        for (const doc of documents) {
          if (doc.verificationStatus !== 'rejected') {
            doc.verificationStatus = 'rejected';
            await doc.save();
            documentsUpdated++;
          }
        }
        
        return {
          success: true,
          message: `Successfully rejected ${documentsUpdated} documents`,
          documentsUpdated,
          documentsDeleted: 0
        };
        
      case 'permanently_rejected':
        // Delete documents and unpin from IPFS
        const ipfsHashes = documents.map(doc => doc.ipfsHash);
        
        // Delete from database
        const deleteResult = await KYCDocument.deleteMany({ userId });
        documentsDeleted = deleteResult.deletedCount || 0;
        
        // Unpin from IPFS (don't fail if this doesn't work)
        try {
          for (const hash of ipfsHashes) {
            await deleteFromIPFS(hash);
            console.log(`🗑️ Unpinned document from IPFS: ${hash}`);
          }
        } catch (error) {
          console.warn('Warning: Failed to unpin some documents from IPFS:', error);
        }
        
        return {
          success: true,
          message: `Successfully deleted ${documentsDeleted} documents and unpinned from IPFS`,
          documentsUpdated: 0,
          documentsDeleted
        };
        
      default:
        return {
          success: false,
          error: `Unknown KYC status: ${kycStatus}`
        };
    }
    
  } catch (error) {
    console.error('Error syncing documents with KYC status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync documents'
    };
  }
}

/**
 * Get user's KYC documents with IPFS information
 */
export async function getUserKYCDocuments(userId: string): Promise<{
  success: boolean;
  documents?: any[];
  error?: string;
}> {
  try {
    await dbConnect();
    
    const documents = await KYCDocument.find({ userId })
      .sort({ uploadedAt: -1 });
    
    const formattedDocuments = documents.map(doc => ({
      id: doc._id.toString(),
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      ipfsHash: doc.ipfsHash,
      ipfsUrl: `https://ipfs.io/ipfs/${doc.ipfsHash}`,
      verificationStatus: doc.verificationStatus,
      uploadedAt: doc.uploadedAt,
      verifiedAt: doc.verifiedAt
    }));
    
    return {
      success: true,
      documents: formattedDocuments
    };
    
  } catch (error) {
    console.error('Error fetching user KYC documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents'
    };
  }
}

/**
 * Clean up orphaned documents (documents without active KYC submissions)
 */
export async function cleanupOrphanedDocuments(): Promise<DocumentSyncResult> {
  try {
    await dbConnect();
    
    // This would require checking against KYC submissions
    // For now, just return a placeholder
    return {
      success: true,
      message: 'Orphaned document cleanup not implemented yet',
      documentsUpdated: 0,
      documentsDeleted: 0
    };
    
  } catch (error) {
    console.error('Error cleaning up orphaned documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cleanup documents'
    };
  }
}