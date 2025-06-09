import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { BrandCampaign } from "@/models"
import connectDB from "@/lib/mongodb"

export async function POST(req, { params }) {
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

    const { campaignId } = params
    const { response } = await req.json() // "accepted" or "rejected"

    const campaign = await BrandCampaign.findById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Update invitation status
    const invitationIndex = campaign.invitedInfluencers.findIndex(
      (inv) => inv.influencerId.toString() === decoded.userId,
    )

    if (invitationIndex === -1) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    campaign.invitedInfluencers[invitationIndex].status = response
    campaign.invitedInfluencers[invitationIndex].respondedAt = new Date()

    await campaign.save()

    return NextResponse.json({ message: `Invitation ${response} successfully` }, { status: 200 })
  } catch (error) {
    console.error("Error responding to invitation:", error)
    return NextResponse.json({ error: "Failed to respond to invitation" }, { status: 500 })
  }
}
