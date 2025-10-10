import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import { User, KYCDocument } from '@/lib/models'
import { KYCSubmission } from '@/lib/models/KYCSubmission'

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await User.findById(authResult.userId)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await dbConnect()

    // Get current date and previous month for comparison
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calculate metrics
    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      approvedKYC,
      rejectedKYC,
      totalDocuments,
      ipfsFiles,
      lastMonthUsers,
      lastMonthKYC
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Active users (last 30 days)
      User.countDocuments({
        lastLoginAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Pending KYC
      KYCSubmission.countDocuments({ status: 'submitted' }),
      
      // Approved KYC
      User.countDocuments({ kycStatus: 'verified' }),
      
      // Rejected KYC
      User.countDocuments({ kycStatus: 'rejected' }),
      
      // Total documents
      KYCDocument.countDocuments(),
      
      // IPFS files (documents with IPFS hash)
      KYCDocument.countDocuments({ ipfsHash: { $exists: true, $ne: null } }),
      
      // Last month users for comparison
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      
      // Last month KYC approvals for comparison
      User.countDocuments({ 
        kycStatus: 'verified',
        kycApprovedAt: { $gte: lastMonth, $lt: thisMonth }
      })
    ])

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0
    const kycGrowth = lastMonthKYC > 0 ? ((approvedKYC - lastMonthKYC) / lastMonthKYC) * 100 : 0

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (approvedKYC / totalUsers) * 100 : 0

    // Mock revenue calculation (in a real app, this would come from actual transaction data)
    const revenue = approvedKYC * 25 // $25 per approved KYC

    // System alerts (mock data - in a real app, this would come from monitoring systems)
    const systemAlerts = 0 // This would be calculated based on actual system health

    const metrics = {
      totalUsers,
      activeUsers,
      pendingKYC,
      approvedKYC,
      rejectedKYC,
      totalDocuments,
      ipfsFiles,
      systemAlerts,
      revenue,
      conversionRate: Math.round(conversionRate * 10) / 10,
      userGrowth: Math.round(userGrowth * 10) / 10,
      kycGrowth: Math.round(kycGrowth * 10) / 10
    }

    return NextResponse.json({
      success: true,
      metrics
    })

  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch metrics'
    }, { status: 500 })
  }
}