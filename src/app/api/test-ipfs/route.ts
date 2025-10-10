import { NextRequest, NextResponse } from 'next/server'
import { uploadToIPFS } from '@/lib/ipfs-simple'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing IPFS upload...')
    
    // Create a test file
    const testContent = 'This is a test file for IPFS upload verification'
    const testBuffer = Buffer.from(testContent, 'utf-8')
    const testFileName = `test-${Date.now()}.txt`
    
    console.log(`[TEST] Uploading test file: ${testFileName}`)
    console.log(`[TEST] File size: ${testBuffer.length} bytes`)
    
    // Upload to IPFS
    const result = await uploadToIPFS(testBuffer, testFileName)
    
    console.log('✅ IPFS upload test successful:', result)
    
    return NextResponse.json({
      success: true,
      message: 'IPFS upload test successful',
      result
    })
    
  } catch (error) {
    console.error('❌ IPFS upload test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}