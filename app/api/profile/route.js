import { NextResponse } from "next/server"
import { verifyToken } from "../../../lib/jwt"
import connectDB from "../../../lib/mongodb"
import { User, InfluencerProfile } from "../../../models"
import { calculateInfluencerPrice } from "../../../lib/pricing"

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can access this endpoint" }, { status: 403 })
    }

    await connectDB()

    const profile = await InfluencerProfile.findOne({ userId: decoded.id })

    return NextResponse.json({
      success: true,
      profile: profile || null,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can update profile" }, { status: 403 })
    }

    const profileData = await request.json()

    // Validation
    if (!profileData.categories?.primary) {
      return NextResponse.json({ error: "Primary category is required" }, { status: 400 })
    }

    await connectDB()

    // Get user data for stats
    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate slug if media kit is public
    let slug = null
    if (profileData.mediaKit?.isPublic && user.instagramData?.username) {
      const baseSlug = user.instagramData.username.toLowerCase()
      slug = baseSlug

      // Check if slug already exists for another user
      const existingProfile = await InfluencerProfile.findOne({
        "mediaKit.slug": slug,
        userId: { $ne: decoded.id },
      })

      if (existingProfile) {
        let counter = 1
        while (
          await InfluencerProfile.findOne({
            "mediaKit.slug": `${baseSlug}-${counter}`,
            userId: { $ne: decoded.id },
          })
        ) {
          counter++
        }
        slug = `${baseSlug}-${counter}`
      }
    }

    // Calculate pricing if not custom
    let calculatedPrice = 0
    if (user.instagramData?.followerCount && user.instagramData?.engagementRate) {
      calculatedPrice = calculateInfluencerPrice(user.instagramData.followerCount, user.instagramData.engagementRate)
    }

    // Prepare profile data
    const profileUpdate = {
      userId: decoded.id,
      stats: {
        followerCount: user.instagramData?.followerCount || 0,
        followingCount: user.instagramData?.followingCount || 0,
        mediaCount: user.instagramData?.mediaCount || 0,
        engagementRate: user.instagramData?.engagementRate || 0,
        averageLikes: user.instagramData?.averageLikes || 0,
        averageComments: user.instagramData?.averageComments || 0,
        lastUpdated: new Date(),
      },
      categories: profileData.categories,
      audience: profileData.audience,
      pricing: {
        baseRate: 100,
        calculatedPrice: calculatedPrice,
        customPrice: profileData.pricing?.customPrice ? Number.parseInt(profileData.pricing.customPrice) : null,
        currency: "INR",
      },
      recentPosts: user.instagramData?.lastPosts || [],
      mediaKit: {
        ...profileData.mediaKit,
        slug: profileData.mediaKit?.isPublic ? slug : null,
      },
    }

    // Update or create profile
    const profile = await InfluencerProfile.findOneAndUpdate({ userId: decoded.id }, profileUpdate, {
      new: true,
      upsert: true,
    })

    // Update user profile completion status
    await User.findByIdAndUpdate(decoded.id, { profileCompleted: true })

    return NextResponse.json({
      success: true,
      profile: profile,
      mediaKitUrl: slug ? `/i/${user.instagramData.username}` : null,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
