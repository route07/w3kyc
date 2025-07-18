import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { uploadToIPFS } from '@/lib/ipfs-simple'
import { documentProcessor, DocumentAnalysisResult } from '@/lib/ocr/document-processor'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user

    // Connect to database
    await connectDB()

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF' 
      }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process document with OCR and AI analysis
    console.log('Processing document with OCR...')
    const analysisResult = await documentProcessor.processDocument(
      buffer,
      file.name,
      file.type
    )

    // Upload to IPFS
    console.log('Uploading to IPFS...')
    const ipfsResult = await uploadToIPFS(buffer, file.name)

    // Create document record in database
    const { default: Document } = await import('@/lib/models/Document')
    
    const document = new Document({
      userId: user.id,
      name: file.name,
      type: documentType || analysisResult.documentType,
      description: description || '',
      mimeType: file.type,
      size: file.size,
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      ocrResult: {
        extractedText: analysisResult.extractedText,
        confidence: analysisResult.confidence,
        documentType: analysisResult.documentType
      },
      validation: {
        isValid: analysisResult.validationResult.isValid,
        expiryDate: analysisResult.validationResult.expiryDate,
        isExpired: analysisResult.validationResult.isExpired,
        issues: analysisResult.validationResult.issues
      },
      aiAnalysis: {
        riskScore: analysisResult.aiAnalysis.riskScore,
        riskLevel: analysisResult.aiAnalysis.riskLevel,
        flags: analysisResult.aiAnalysis.flags,
        recommendations: analysisResult.aiAnalysis.recommendations
      },
      status: analysisResult.validationResult.isValid ? 'pending' : 'rejected',
      uploadedAt: new Date()
    })

    await document.save()

    // Update user's document count
    const { default: User } = await import('@/lib/models/User')
    await User.findByIdAndUpdate(user.id, {
      $inc: { documentCount: 1 }
    })

    // Return success response with analysis results
    return NextResponse.json({
      success: true,
      document: {
        id: document._id,
        name: document.name,
        type: document.type,
        status: document.status,
        uploadedAt: document.uploadedAt,
        ocrResult: document.ocrResult,
        validation: document.validation,
        aiAnalysis: document.aiAnalysis
      },
      message: analysisResult.validationResult.isValid 
        ? 'Document uploaded and processed successfully' 
        : 'Document uploaded but validation failed'
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user

    // Connect to database
    await connectDB()

    // Get user's documents
    const { default: Document } = await import('@/lib/models/Document')
    const documents = await Document.find({ userId: user.id })
      .sort({ uploadedAt: -1 })
      .select('-__v')

    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        name: doc.name,
        type: doc.type,
        description: doc.description,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        ocrResult: doc.ocrResult,
        validation: doc.validation,
        aiAnalysis: doc.aiAnalysis
      }))
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
} 