import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../lib/jwt"
import connectDB from "../../../../../lib/mongodb"
import { Draft, BrandCampaign } from "../../../../../models"

export async function GET(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Verify access to this collaboration
    const campaign = await BrandCampaign.findById(unwrappedParams.id)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    let hasAccess = false
    if (decoded.role === "influencer") {
      hasAccess = campaign.invitations.some(
        (inv) => inv.influencerId.toString() === decoded.id && inv.status === "accepted",
      )
    } else if (decoded.role === "brand") {
      hasAccess = campaign.brandId.toString() === decoded.id
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch drafts for this campaign
    const query = { campaignId: unwrappedParams.id }
    if (decoded.role === "influencer") {
      query.influencerId = decoded.id
    }

    const drafts = await Draft.find(query)
      .sort({ createdAt: -1 })
      .populate("influencerId", "name instagramData")
      .populate("brandId", "name brandData")

    return NextResponse.json({
      success: true,
      drafts: drafts,
    })
  } catch (error) {
    console.error("Drafts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Only influencers can submit drafts" }, { status: 403 })
    }

    const draftData = await request.json()

    // Validation
    if (!draftData.caption) {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 })
    }

    await connectDB()

    // Verify collaboration exists and influencer has access
    const campaign = await BrandCampaign.findById(unwrappedParams.id)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const invitation = campaign.invitations.find(
      (inv) => inv.influencerId.toString() === decoded.id && inv.status === "accepted",
    )

    if (!invitation) {
      return NextResponse.json({ error: "Collaboration not found or not accepted" }, { status: 404 })
    }

    // Create draft
    const draft = await Draft.create({
      campaignId: unwrappedParams.id,
      influencerId: decoded.id,
      brandId: campaign.brandId,
      content: {
        type: campaign.requirements.contentType,
        caption: draftData.caption,
        hashtags: draftData.hashtags || [],
        mentions: draftData.mentions || [],
        media: draftData.media || [],
      },
      status: "submitted",
      deadlines: {
        draftSubmission: campaign.timeline.contentDeadline,
        finalApproval: campaign.timeline.publishDate,
        publication: campaign.timeline.publishDate,
      },
    })

    return NextResponse.json({
      success: true,
      draft: draft,
    })
  } catch (error) {
    console.error("Draft submission error:", error)
    return NextResponse.json({ error: "Failed to submit draft" }, { status: 500 })
  }
}
