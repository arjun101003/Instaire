import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import { User, BrandCampaign, Draft } from "@/models"

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    console.log("📊 Fetching comprehensive admin statistics...")

    // Enhanced user statistics
    const totalUsers = await User.countDocuments()
    const totalInfluencers = await User.countDocuments({ role: "influencer" })
    const totalBrands = await User.countDocuments({ role: "brand" })

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
    })

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    // Enhanced campaign statistics
    const totalCampaigns = await BrandCampaign.countDocuments()
    const activeCampaigns = await BrandCampaign.countDocuments({ status: "active" })
    const completedCampaigns = await BrandCampaign.countDocuments({ status: "completed" })
    const draftCampaigns = await BrandCampaign.countDocuments({ status: "draft" })

    // Enhanced draft statistics
    const totalDrafts = await Draft.countDocuments()
    const pendingDrafts = await Draft.countDocuments({ status: "pending" })
    const approvedDrafts = await Draft.countDocuments({ status: "approved" })

    // Get recent users for display
    const recentUsers = await User.find()
      .select("name email role createdAt lastLogin isActive instagramData brandData")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get recent campaigns for display
    const recentCampaigns = await BrandCampaign.find()
      .populate("brandId", "name email brandData")
      .select("title description status createdAt filters budget")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get pending drafts for display
    const recentDrafts = await Draft.find({ status: "pending" })
      .populate("influencerId", "name instagramData")
      .populate("campaignId", "title")
      .select("content status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)

    // System health calculation
    let systemHealth = "excellent"
    if (totalUsers < 10) systemHealth = "warning"
    if (activeCampaigns === 0 && totalCampaigns > 0) systemHealth = "good"
    if (totalUsers === 0) systemHealth = "critical"

    const stats = {
      // User metrics
      totalUsers,
      totalInfluencers,
      totalBrands,
      activeUsers,
      recentSignups,

      // Campaign metrics
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      draftCampaigns,

      // Draft metrics
      totalDrafts,
      pendingDrafts,
      approvedDrafts,

      // System health
      systemHealth,

      // Real data for display
      recentUsers,
      recentCampaigns,
      recentDrafts,

      // System metrics (you can make these dynamic later)
      serverLoad: Math.floor(Math.random() * 50) + 20, // Random between 20-70%
      databaseSize: "1.2 GB",
      apiRequests: Math.floor(Math.random() * 2000) + 1000,
      errorRate: (Math.random() * 0.1).toFixed(2),
    }

    console.log("✅ Admin stats compiled:", stats)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Admin stats error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
