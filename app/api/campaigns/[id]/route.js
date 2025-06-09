import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import { BrandCampaign } from "@/models"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    console.log("Campaign API - ID:", id)
    console.log("Campaign API - Token:", token ? "Present" : "Missing")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log("Campaign API - Decoded token:", decoded)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Get campaign details
    const campaign = await BrandCampaign.findById(id)
    console.log("Campaign API - Found campaign:", campaign ? "Yes" : "No")

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user owns this campaign or is admin
    const isOwner = campaign.brandId.toString() === decoded.userId
    const isAdmin = decoded.role === "admin"

    console.log("Campaign API - Brand ID:", campaign.brandId.toString())
    console.log("Campaign API - User ID:", decoded.userId)
    console.log("Campaign API - Is Owner:", isOwner)
    console.log("Campaign API - Is Admin:", isAdmin)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      campaign: campaign,
    })
  } catch (error) {
    console.error("Campaign fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}
