import Tesseract from 'tesseract.js'
import sharp from 'sharp'
import { createWorker } from 'tesseract.js'

export interface DocumentAnalysisResult {
  success: boolean
  extractedText: string
  confidence: number
  documentType: 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'unknown'
  validationResult: {
    isValid: boolean
    expiryDate?: Date
    isExpired: boolean
    issues: string[]
  }
  aiAnalysis: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    flags: string[]
    recommendations: string[]
  }
}

export interface DocumentValidationRules {
  requireExpiryDate: boolean
  maxExpiryDays: number
  requiredFields: string[]
  forbiddenKeywords: string[]
}

export class DocumentProcessor {
  private worker: Tesseract.Worker | null = null

  constructor() {
    this.initializeWorker()
  }

  private async initializeWorker() {
    try {
      this.worker = await createWorker('eng')
      console.log('OCR Worker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error)
    }
  }

  /**
   * Process uploaded document and extract information
   */
  async processDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<DocumentAnalysisResult> {
    try {
      // Convert file to image if needed
      const imageBuffer = await this.convertToImage(fileBuffer, mimeType)
      
      // Extract text using OCR
      const ocrResult = await this.extractText(imageBuffer)
      
      // Determine document type
      const documentType = this.identifyDocumentType(fileName, ocrResult.text)
      
      // Validate document
      const validationResult = this.validateDocument(ocrResult.text, documentType)
      
      // Perform AI analysis
      const aiAnalysis = await this.performAIAnalysis(ocrResult.text, documentType)
      
      return {
        success: true,
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence,
        documentType,
        validationResult,
        aiAnalysis
      }
    } catch (error) {
      console.error('Document processing failed:', error)
      return {
        success: false,
        extractedText: '',
        confidence: 0,
        documentType: 'unknown',
        validationResult: {
          isValid: false,
          isExpired: false,
          issues: ['Document processing failed']
        },
        aiAnalysis: {
          riskScore: 100,
          riskLevel: 'high',
          flags: ['Processing error'],
          recommendations: ['Please upload a clearer image or try again']
        }
      }
    }
  }

  /**
   * Convert various file formats to image for OCR processing
   */
  private async convertToImage(fileBuffer: Buffer, mimeType: string): Promise<Buffer> {
    if (mimeType.startsWith('image/')) {
      // Already an image, optimize it for OCR
      return await sharp(fileBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer()
    } else if (mimeType === 'application/pdf') {
      // For PDFs, we'll return the buffer as-is for now
      // In a full implementation, you'd convert PDF pages to images
      console.log('PDF processing not fully implemented - treating as image')
      return fileBuffer
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }
  }

  /**
   * Extract text from image using OCR
   */
  private async extractText(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    try {
      const result = await this.worker.recognize(imageBuffer)
      return {
        text: result.data.text,
        confidence: result.data.confidence
      }
    } catch (error) {
      console.error('OCR extraction failed:', error)
      throw error
    }
  }

  /**
   * Identify document type based on filename and content
   */
  private identifyDocumentType(fileName: string, extractedText: string): DocumentAnalysisResult['documentType'] {
    const lowerFileName = fileName.toLowerCase()
    const lowerText = extractedText.toLowerCase()

    // Check for passport indicators
    if (
      lowerFileName.includes('passport') ||
      lowerText.includes('passport') ||
      lowerText.includes('nationality') ||
      lowerText.includes('date of issue') ||
      lowerText.includes('authority')
    ) {
      return 'passport'
    }

    // Check for driver's license indicators
    if (
      lowerFileName.includes('license') ||
      lowerFileName.includes('dl') ||
      lowerText.includes('driver') ||
      lowerText.includes('license') ||
      lowerText.includes('class')
    ) {
      return 'drivers_license'
    }

    // Check for utility bill indicators
    if (
      lowerFileName.includes('utility') ||
      lowerFileName.includes('bill') ||
      lowerText.includes('electricity') ||
      lowerText.includes('water') ||
      lowerText.includes('gas') ||
      lowerText.includes('utility')
    ) {
      return 'utility_bill'
    }

    // Check for bank statement indicators
    if (
      lowerFileName.includes('bank') ||
      lowerFileName.includes('statement') ||
      lowerText.includes('account') ||
      lowerText.includes('balance') ||
      lowerText.includes('transaction')
    ) {
      return 'bank_statement'
    }

    return 'unknown'
  }

  /**
   * Validate document based on type and content
   */
  private validateDocument(extractedText: string, documentType: string): DocumentAnalysisResult['validationResult'] {
    const issues: string[] = []
    let isValid = true
    let expiryDate: Date | undefined
    let isExpired = false

    // Extract expiry date
    const expiryDateMatch = extractedText.match(/(?:expiry|expires|valid until|expiration).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (expiryDateMatch) {
      try {
        expiryDate = new Date(expiryDateMatch[1])
        const today = new Date()
        isExpired = expiryDate < today
      } catch (error) {
        issues.push('Could not parse expiry date')
      }
    } else {
      issues.push('No expiry date found')
    }

    // Document type specific validation
    switch (documentType) {
      case 'passport':
        if (!extractedText.match(/passport|nationality|date of issue/i)) {
          issues.push('Document does not appear to be a valid passport')
          isValid = false
        }
        break

      case 'drivers_license':
        if (!extractedText.match(/driver|license|class/i)) {
          issues.push('Document does not appear to be a valid driver\'s license')
          isValid = false
        }
        break

      case 'utility_bill':
        if (!extractedText.match(/utility|electricity|water|gas|bill/i)) {
          issues.push('Document does not appear to be a valid utility bill')
          isValid = false
        }
        break

      case 'bank_statement':
        if (!extractedText.match(/bank|account|balance|statement/i)) {
          issues.push('Document does not appear to be a valid bank statement')
          isValid = false
        }
        break

      default:
        issues.push('Document type could not be determined')
        isValid = false
    }

    // Check for suspicious content
    const suspiciousKeywords = ['fake', 'forged', 'copy', 'sample', 'test']
    for (const keyword of suspiciousKeywords) {
      if (extractedText.toLowerCase().includes(keyword)) {
        issues.push(`Document contains suspicious keyword: ${keyword}`)
        isValid = false
      }
    }

    return {
      isValid,
      expiryDate,
      isExpired,
      issues
    }
  }

  /**
   * Perform AI analysis on document content
   */
  private async performAIAnalysis(
    extractedText: string,
    documentType: string
  ): Promise<DocumentAnalysisResult['aiAnalysis']> {
    // This would integrate with our existing AI service
    // For now, we'll implement basic analysis logic
    
    const flags: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Check for data completeness
    const requiredFields = this.getRequiredFields(documentType)
    const missingFields = requiredFields.filter(field => 
      !extractedText.toLowerCase().includes(field.toLowerCase())
    )

    if (missingFields.length > 0) {
      flags.push(`Missing required fields: ${missingFields.join(', ')}`)
      riskScore += 20
    }

    // Check for data consistency
    if (this.hasInconsistentData(extractedText)) {
      flags.push('Inconsistent data detected')
      riskScore += 30
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(extractedText)) {
      flags.push('Suspicious patterns detected')
      riskScore += 40
    }

    // Generate recommendations
    if (riskScore > 50) {
      recommendations.push('Document requires manual review')
    }
    if (missingFields.length > 0) {
      recommendations.push('Please ensure all required information is clearly visible')
    }
    if (riskScore < 20) {
      recommendations.push('Document appears to be valid')
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (riskScore > 60) {
      riskLevel = 'high'
    } else if (riskScore > 30) {
      riskLevel = 'medium'
    }

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      flags,
      recommendations
    }
  }

  /**
   * Get required fields for document type
   */
  private getRequiredFields(documentType: string): string[] {
    switch (documentType) {
      case 'passport':
        return ['name', 'date of birth', 'nationality', 'passport number', 'date of issue']
      case 'drivers_license':
        return ['name', 'date of birth', 'license number', 'class', 'expiry']
      case 'utility_bill':
        return ['name', 'address', 'account number', 'bill date']
      case 'bank_statement':
        return ['name', 'account number', 'balance', 'statement date']
      default:
        return ['name', 'date']
    }
  }

  /**
   * Check for inconsistent data in document
   */
  private hasInconsistentData(text: string): boolean {
    // Check for multiple different names
    const nameMatches = text.match(/(?:name|full name):\s*([^\n\r]+)/gi)
    if (nameMatches && nameMatches.length > 1) {
      const names = nameMatches.map(match => match.replace(/(?:name|full name):\s*/i, '').trim())
      return names.some((name, index) => names.slice(index + 1).some(otherName => 
        name.toLowerCase() !== otherName.toLowerCase()
      ))
    }
    return false
  }

  /**
   * Check for suspicious patterns
   */
  private hasSuspiciousPatterns(text: string): boolean {
    const suspiciousPatterns = [
      /test\s+document/i,
      /sample\s+only/i,
      /not\s+for\s+official\s+use/i,
      /draft/i,
      /copy/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor() 