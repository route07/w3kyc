import { NextRequest, NextResponse } from 'next/server'
import { contractFunctions } from '@/lib/contract-functions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      )
    }
    
    // Get audit logs and statistics
    const [auditLogs, auditStats] = await Promise.all([
      contractFunctions.getRecentUserAuditLogs(userAddress, limit),
      contractFunctions.getAuditStatistics()
    ])
    
    return NextResponse.json({
      success: true,
      userAddress,
      auditLogs,
      auditStats,
      contractAddresses: {
        kycManager: contractFunctions.getContractAddresses().KYCManager,
        auditLogStorage: contractFunctions.getContractAddresses().AuditLogStorage
      }
    })
    
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}