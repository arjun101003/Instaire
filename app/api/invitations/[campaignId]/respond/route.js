import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../lib/jwt"
import connectDB from "../../../../../lib/mongodb"
import { BrandCampaign } from "../../../../../models"

export async function POST(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can respond to invitations" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'accepted' or 'rejected'" }, { status: 400 })
    }

    await connectDB()

    // Find the campaign and invitation
    const campaign = await BrandCampaign.findById(unwrappedParams.campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const invitationIndex = campaign.invitations.findIndex((inv) => inv.influencerId.toString() === decoded.id)

    if (invitationIndex === -1) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    const invitation = campaign.invitations[invitationIndex]

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation has already been responded to" }, { status: 400 })
    }

    // Update invitation status
    campaign.invitations[invitationIndex].status = status
    campaign.invitations[invitationIndex].respondedAt = new Date()

    await campaign.save()

    // TODO: Send email notification to brand
    console.log(`Invitation ${status} by influencer ${decoded.id} for campaign ${campaign.title}`)

    return NextResponse.json({
      success: true,
      message: `Invitation ${status} successfully`,
    })
  } catch (error) {
    console.error("Invitation response error:", error)
    return NextResponse.json({ error: "Failed to respond to invitation" }, { status: 500 })
  }
}
