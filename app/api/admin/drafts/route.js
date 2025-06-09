import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth-middleware"
import { connectToDatabase } from "@/lib/mongodb"
import { Draft } from "@/models/Draft"

export async function GET(request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const campaign = searchParams.get("campaign") || ""

    // Build filter query
    const filter = {}

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (status) {
      filter.status = status
    }

    if (campaign) {
      filter.campaignId = campaign
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get drafts with populated data
    const drafts = await Draft.find(filter)
      .populate("influencerId", "name email instagramUsername profilePicture")
      .populate("campaignId", "title brand")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalDrafts = await Draft.countDocuments(filter)
    const totalPages = Math.ceil(totalDrafts / limit)

    // Get status counts
    const statusCounts = await Draft.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])

    const statusStats = {
      all: totalDrafts,
      pending: 0,
      approved: 0,
      rejected: 0,
      published: 0,
    }

    statusCounts.forEach((item) => {
      if (item._id) {
        statusStats[item._id] = item.count
      }
    })

    return NextResponse.json({
      success: true,
      drafts,
      pagination: {
        currentPage: page,
        totalPages,
        totalDrafts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      statusStats,
    })
  } catch (error) {
    console.error("❌ Admin drafts fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch drafts" }, { status: 500 })
  }
}
