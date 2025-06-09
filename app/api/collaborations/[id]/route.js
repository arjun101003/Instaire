import { NextResponse } from "next/server"
import { verifyToken } from "../../../../lib/jwt"
import connectDB from "../../../../lib/mongodb"
import { BrandCampaign } from "../../../../models"

export async function GET(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can access collaborations" }, { status: 403 })
    }

    await connectDB()

    // Find the campaign where this influencer has an accepted invitation
    const campaign = await BrandCampaign.findById(unwrappedParams.id).populate("brandId", "name email brandData")

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if influencer has accepted invitation
    const invitation = campaign.invitations.find(
      (inv) => inv.influencerId.toString() === decoded.id && inv.status === "accepted",
    )

    if (!invitation) {
      return NextResponse.json({ error: "Collaboration not found or not accepted" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      collaboration: {
        _id: campaign._id,
        status: invitation.status,
        invitedAt: invitation.invitedAt,
        respondedAt: invitation.respondedAt,
        agreedPrice: invitation.agreedPrice,
        campaign: campaign.toObject(),
      },
    })
  } catch (error) {
    console.error("Collaboration fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch collaboration" }, { status: 500 })
  }
}
