import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import InfluencerProfile from "@/models/InfluencerProfile"
import connectDB from "@/lib/mongodb"

export async function GET() {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const profile = await InfluencerProfile.findOne({ userId: decoded.userId })

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile }, { status: 200 })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("Token from cookie:", token ? "Found" : "Not found")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log("Decoded token:", decoded)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token - No userId" }, { status: 401 })
    }

    const body = await req.json()
    console.log("Request body:", body)

    const {
      instagramUsername,
      followers,
      avgLikes,
      avgComments,
      category,
      monetizationMethod,
      pastCollaborations,
      bio,
      location,
    } = body

    // Validation
    if (!instagramUsername || !followers || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Auto-generate slug from Instagram username
    const slug = instagramUsername.toLowerCase().replace(/[^a-z0-9]/g, "")

    // Check if profile already exists for this user
    const existingProfile = await InfluencerProfile.findOne({ userId: decoded.userId })
    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 400 })
    }

    // Check if slug already exists
    const existingSlug = await InfluencerProfile.findOne({ slug })
    if (existingSlug) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    const profileData = {
      userId: decoded.userId,
      instagramUsername,
      followers: Number.parseInt(followers),
      avgLikes: avgLikes ? Number.parseInt(avgLikes) : 0,
      avgComments: avgComments ? Number.parseInt(avgComments) : 0,
      category,
      monetizationMethod: monetizationMethod || "",
      pastCollaborations: pastCollaborations || "",
      bio: bio || "",
      location: location || "",
      slug,
      profileCompleted: true,
      isActive: true,
    }

    console.log("Creating profile with data:", profileData)

    const newProfile = new InfluencerProfile(profileData)
    await newProfile.save()

    console.log("Profile created successfully:", newProfile._id)

    return NextResponse.json(
      {
        success: true,
        message: "Profile created successfully",
        profile: newProfile,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      {
        error: "Failed to create profile",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
