import { NextResponse } from "next/server"
import { verifyToken } from "../../../../lib/jwt"
import connectDB from "../../../../lib/mongodb"
import { User, BrandCampaign, Draft } from "../../../../models"

export async function GET(request) {
  try {
    const cookieStore = await request.cookies
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    // Get all stats in parallel for better performance
    const [totalUsers, totalInfluencers, totalBrands, totalCampaigns, activeCampaigns, totalDrafts] = await Promise.all(
      [
        User.countDocuments({}),
        User.countDocuments({ role: "influencer" }),
        User.countDocuments({ role: "brand" }),
        BrandCampaign.countDocuments({}),
        BrandCampaign.countDocuments({ status: "active" }),
        Draft.countDocuments({ status: "pending" }),
      ],
    )

    const stats = {
      totalUsers,
      totalInfluencers,
      totalBrands,
      totalCampaigns,
      activeCampaigns,
      totalDrafts,
      version: "54",
      lastUpdated: new Date().toISOString(),
    }

    console.log("✅ Admin stats fetched successfully:", stats)

    return NextResponse.json({
      success: true,
      stats,
      message: "Stats fetched successfully",
    })
  } catch (error) {
    console.error("❌ Admin stats error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin statistics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
