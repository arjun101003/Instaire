import { NextResponse } from "next/server"
import { verifyToken } from "../../../../lib/jwt"
import connectDB from "../../../../lib/mongodb"
import { InfluencerProfile } from "../../../../models"
import { calculateInfluencerPrice, calculateEngagementRate } from "../../../../lib/pricing"

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "brand") {
      return NextResponse.json({ error: "Only brands can access this endpoint" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Parse filters
    const category = searchParams.get("category")
    const minFollowers = Number.parseInt(searchParams.get("minFollowers")) || 0
    const maxFollowers = Number.parseInt(searchParams.get("maxFollowers")) || 10000000
    const minEngagement = Number.parseFloat(searchParams.get("minEngagement")) || 0
    const maxEngagement = Number.parseFloat(searchParams.get("maxEngagement")) || 100
    const location = searchParams.get("location")
    const search = searchParams.get("search")

    // Pagination
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const skip = (page - 1) * limit

    await connectDB()

    // Build query
    const query = {
      isActive: true,
      profileCompleted: true,
    }

    if (category) {
      query.category = category
    }

    if (minFollowers || maxFollowers) {
      query.followers = {
        $gte: minFollowers,
        $lte: maxFollowers,
      }
    }

    if (minEngagement || maxEngagement) {
      query.engagementRate = {
        $gte: minEngagement,
        $lte: maxEngagement,
      }
    }

    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    if (search) {
      query.$or = [
        { instagramUsername: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { pastCollaborations: { $regex: search, $options: "i" } },
      ]
    }

    // Execute query
    const influencers = await InfluencerProfile.find(query)
      .populate("userId", "name email")
      .sort({ followers: -1, engagementRate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await InfluencerProfile.countDocuments(query)

    // Format response
    const formattedInfluencers = influencers.map((influencer) => {
      // Calculate engagement rate if not stored
      const engagementRate =
        influencer.engagementRate ||
        calculateEngagementRate(influencer.avgLikes, influencer.avgComments, influencer.followers)

      // Calculate estimated price
      const estimatedPrice = calculateInfluencerPrice(influencer.followers, engagementRate)

      return {
        _id: influencer._id,
        userId: influencer.userId._id,
        name: influencer.userId.name,
        instagramUsername: influencer.instagramUsername,
        followers: influencer.followers,
        avgLikes: influencer.avgLikes,
        avgComments: influencer.avgComments,
        engagementRate: engagementRate,
        category: influencer.category,
        location: influencer.location,
        estimatedPrice: estimatedPrice, // Only visible to brands
        bio: influencer.bio,
        slug: influencer.slug,
        mediaKitUrl: `/i/${influencer.slug}`,
      }
    })

    return NextResponse.json({
      success: true,
      influencers: formattedInfluencers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        category,
        minFollowers,
        maxFollowers,
        minEngagement,
        maxEngagement,
        location,
        search,
      },
    })
  } catch (error) {
    console.error("Influencers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch influencers" }, { status: 500 })
  }
}
