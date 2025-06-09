import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { BrandCampaign } from "@/models"
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
    if (!decoded || !decoded.userId || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find campaigns where this influencer is invited
    const campaigns = await BrandCampaign.find({
      "invitedInfluencers.influencerId": decoded.userId,
    }).populate("brandId", "name email")

    return NextResponse.json({ success: true, campaigns }, { status: 200 })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
