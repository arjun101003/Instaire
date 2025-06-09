import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../../lib/jwt"
import connectDB from "../../../../../../lib/mongodb"
import { BrandCampaign } from "../../../../../../models"

export async function PATCH(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!["draft", "active", "paused", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await connectDB()

    // Check if campaign exists
    const campaign = await BrandCampaign.findById(unwrappedParams.id)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Update campaign status
    campaign.status = status
    await campaign.save()

    return NextResponse.json({
      success: true,
      message: `Campaign status updated to ${status}`,
    })
  } catch (error) {
    console.error("Admin campaign status update error:", error)
    return NextResponse.json({ error: "Failed to update campaign status" }, { status: 500 })
  }
}
