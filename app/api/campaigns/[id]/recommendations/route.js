import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import { BrandCampaign, User } from "@/models"
import { calculateInfluencerPrice } from "@/lib/pricing"

export async function GET(request, { params }) {
  try {
    console.log("Recommendations API called with params:", params)

    const token = request.cookies.get("auth-token")?.value
    console.log("Token present:", !!token)

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log("Decoded token:", decoded)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Get campaign ID from params
    const { id } = params
    console.log("Campaign ID:", id)

    // Get campaign details
    const campaign = await BrandCampaign.findById(id)
    console.log("Campaign found:", !!campaign)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user owns this campaign
    if (campaign.brandId.toString() !== decoded.userId && decoded.role !== "admin") {
      console.log("Access denied. Campaign brandId:", campaign.brandId, "User ID:", decoded.userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    console.log("Campaign filters:", campaign.filters)

    // For testing, let's get all influencers first
    const allInfluencers = await User.find({ role: "influencer" }).select("name email instagramData").limit(20)

    console.log("Total influencers found:", allInfluencers.length)

    // Build query for influencers based on campaign filters
    const query = { role: "influencer" }

    // Only add follower filters if the campaign has them
    if (campaign.filters && campaign.filters.minFollowers) {
      if (!query.instagramData) query.instagramData = {}
      query["instagramData.followerCount"] = { $gte: campaign.filters.minFollowers || 0 }
    }

    if (campaign.filters && campaign.filters.maxFollowers) {
      if (!query.instagramData) query.instagramData = {}
      if (!query["instagramData.followerCount"]) query["instagramData.followerCount"] = {}
      query["instagramData.followerCount"].$lte = campaign.filters.maxFollowers || 10000000
    }

    if (campaign.filters && campaign.filters.minEngagementRate) {
      if (!query.instagramData) query.instagramData = {}
      query["instagramData.engagementRate"] = { $gte: campaign.filters.minEngagementRate || 0 }
    }

    console.log("Final query:", JSON.stringify(query))

    // Find matching influencers
    const influencers = await User.find(query)
      .select("name email instagramData")
      .limit(20) // Limit to 20 recommendations
      .sort({ "instagramData.followerCount": -1 }) // Sort by follower count

    console.log("Matching influencers found:", influencers.length)

    // Calculate estimated pricing for each influencer
    const influencersWithPricing = influencers.map((influencer) => {
      const followerCount = influencer.instagramData?.followerCount || 0
      const engagementRate = influencer.instagramData?.engagementRate || 0
      const estimatedPrice = calculateInfluencerPrice(followerCount, engagementRate)

      return {
        _id: influencer._id,
        name: influencer.name,
        instagramUsername: influencer.instagramData?.username || "unknown",
        followerCount: followerCount,
        engagementRate: engagementRate,
        estimatedPrice: estimatedPrice,
        // Check if already invited
        invited:
          campaign.invitations &&
          campaign.invitations.some(
            (inv) => inv.influencerId && inv.influencerId.toString() === influencer._id.toString(),
          ),
      }
    })

    // Filter by budget if specified
    let filteredInfluencers = influencersWithPricing
    if (campaign.budget && (campaign.budget.minBudget || campaign.budget.maxBudget)) {
      filteredInfluencers = influencersWithPricing.filter((inf) => {
        const minBudgetOk = !campaign.budget.minBudget || inf.estimatedPrice >= campaign.budget.minBudget
        const maxBudgetOk = !campaign.budget.maxBudget || inf.estimatedPrice <= campaign.budget.maxBudget
        return minBudgetOk && maxBudgetOk
      })
    }

    console.log("Final influencers after budget filter:", filteredInfluencers.length)

    return NextResponse.json({
      success: true,
      influencers: filteredInfluencers,
      total: filteredInfluencers.length,
    })
  } catch (error) {
    console.error("Recommendations fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recommendations",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
