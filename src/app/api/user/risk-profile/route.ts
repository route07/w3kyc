import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getMockRiskProfileByUserId } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // For MVP, use mock data
    const riskProfile = getMockRiskProfileByUserId(decoded.userId || 'user-001')
    
    if (!riskProfile) {
      return NextResponse.json(
        { error: 'Risk profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(riskProfile)
  } catch (error) {
    console.error('Error fetching risk profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 