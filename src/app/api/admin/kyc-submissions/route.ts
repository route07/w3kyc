import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getMockKYCSubmissions } from '@/lib/mock-data'

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

    // Check if user is admin (for MVP, assume all users are admin)
    // In production, you'd check user roles in the database

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // For MVP, use mock data
    const submissions = getMockKYCSubmissions()

    // Filter by status if provided
    let filteredSubmissions = submissions
    if (status) {
      filteredSubmissions = submissions.filter(sub => sub.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex)

    return NextResponse.json({
      submissions: paginatedSubmissions,
      pagination: {
        page,
        limit,
        total: filteredSubmissions.length,
        totalPages: Math.ceil(filteredSubmissions.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching KYC submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 