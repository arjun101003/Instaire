import { NextResponse } from "next/server"
import connectDB from "../../../../lib/mongodb"
import InfluencerProfile from "../../../../models/InfluencerProfile"

export async function GET(request, { params }) {
  try {
    const unwrappedParams = await params
    const { slug } = unwrappedParams

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    await connectDB()

    const profile = await InfluencerProfile.findOne({
      slug: slug,
      isActive: true,
    }).populate("userId", "name email")

    if (!profile) {
      return NextResponse.json({ error: "Media kit not found or inactive" }, { status: 404 })
    }

    // Return public profile data
    const publicProfile = {
      _id: profile._id,
      instagramUsername: profile.instagramUsername,
      followers: profile.followers,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      engagementRate: profile.engagementRate,
      category: profile.category,
      monetizationMethod: profile.monetizationMethod,
      pastCollaborations: profile.pastCollaborations,
      pricing: profile.pricing,
      bio: profile.bio,
      location: profile.location,
      slug: profile.slug,
      user: {
        name: profile.userId.name,
      },
      createdAt: profile.createdAt,
    }

    return NextResponse.json({
      success: true,
      profile: publicProfile,
    })
  } catch (error) {
    console.error("Media kit fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch media kit" }, { status: 500 })
  }
}
