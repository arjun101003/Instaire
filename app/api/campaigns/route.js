import { NextResponse } from "next/server"
import { verifyToken } from "../../../lib/jwt"
import connectDB from "../../../lib/mongodb"
import { BrandCampaign } from "../../../models"

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const campaigns = await BrandCampaign.find({ brandId: decoded.userId })
      .sort({ createdAt: -1 })
      .populate("brandId", "name email brandData")

    // Add virtual fields
    const campaignsWithVirtuals = campaigns.map((campaign) => ({
      ...campaign.toObject(),
      totalInvitations: campaign.invitations.length,
      acceptedInvitations: campaign.invitations.filter((inv) => inv.status === "accepted").length,
    }))

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithVirtuals,
    })
  } catch (error) {
    console.error("Campaigns fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("Decoded token:", decoded) // Debug log

    await connectDB()

    // Get user from database to check role
    const User = (await import("../../../models/User")).default
    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User role:", user.role) // Debug log

    if (user.role !== "brand") {
      return NextResponse.json(
        {
          error: `Only brands can create campaigns. Your role: ${user.role}`,
        },
        { status: 403 },
      )
    }

    const campaignData = await request.json()

    // Validation
    if (!campaignData.title || !campaignData.description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    if (
      !campaignData.timeline.applicationDeadline ||
      !campaignData.timeline.contentDeadline ||
      !campaignData.timeline.publishDate
    ) {
      return NextResponse.json({ error: "All timeline dates are required" }, { status: 400 })
    }

    if (campaignData.budget.minBudget >= campaignData.budget.maxBudget) {
      return NextResponse.json({ error: "Maximum budget must be greater than minimum budget" }, { status: 400 })
    }

    const campaign = await BrandCampaign.create({
      ...campaignData,
      brandId: decoded.userId,
      status: "draft",
    })

    await campaign.populate("brandId", "name email brandData")

    return NextResponse.json({
      success: true,
      campaign: campaign.toObject(),
    })
  } catch (error) {
    console.error("Campaign creation error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
