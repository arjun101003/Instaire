import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../lib/jwt"
import connectDB from "../../../../../lib/mongodb"
import { BrandCampaign, User } from "../../../../../models"

export async function POST(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "brand") {
      return NextResponse.json({ error: "Only brands can send invitations" }, { status: 403 })
    }

    const { influencerId } = await request.json()

    if (!influencerId) {
      return NextResponse.json({ error: "Influencer ID is required" }, { status: 400 })
    }

    await connectDB()

    // Get campaign
    const campaign = await BrandCampaign.findById(unwrappedParams.id)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user owns this campaign
    if (campaign.brandId.toString() !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if influencer exists
    const influencer = await User.findById(influencerId)
    if (!influencer || influencer.role !== "influencer") {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 })
    }

    // Check if already invited
    const existingInvitation = campaign.invitations.find((inv) => inv.influencerId.toString() === influencerId)
    if (existingInvitation) {
      return NextResponse.json({ error: "Influencer already invited" }, { status: 400 })
    }

    // Add invitation
    campaign.invitations.push({
      influencerId: influencerId,
      status: "pending",
      invitedAt: new Date(),
    })

    await campaign.save()

    // TODO: Send email notification to influencer
    console.log(`Invitation sent to influencer ${influencer.name} for campaign ${campaign.title}`)

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    })
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}
