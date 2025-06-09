import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import { BrandCampaign } from "@/models"

export async function GET(request) {
  try {
    console.log("=== ADMIN CAMPAIGNS API CALLED ===")

    // Get cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("Token found:", !!token)

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)
    console.log("Token decoded:", decoded)

    if (!decoded || decoded.role !== "admin") {
      console.log("Invalid token or not admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Connect to database
    await connectDB()
    console.log("Connected to database")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    console.log("Query params:", { page, limit, search, status })

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "brand.name": { $regex: search, $options: "i" } },
      ]
    }
    if (status && status !== "all") {
      query.status = status
    }

    console.log("Database query:", JSON.stringify(query))

    // Get campaigns with pagination
    const skip = (page - 1) * limit
    const campaigns = await BrandCampaign.find(query)
      .populate("brandId", "name email brandData")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log("Campaigns found:", campaigns.length)
    console.log(
      "First campaign sample:",
      campaigns[0]
        ? {
            id: campaigns[0]._id,
            title: campaigns[0].title,
            status: campaigns[0].status,
          }
        : "No campaigns",
    )

    // Get total count
    const total = await BrandCampaign.countDocuments(query)
    console.log("Total campaigns:", total)

    // Format campaigns for response
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign._id.toString(),
      title: campaign.title,
      description: campaign.description,
      categories: campaign.categories || [],
      budget: campaign.budget || {},
      status: campaign.status || "draft",
      brand: {
        id: campaign.brandId?._id?.toString(),
        name: campaign.brandId?.name || campaign.brand?.name || "Unknown Brand",
        email: campaign.brandId?.email || campaign.brand?.email,
        website: campaign.brandId?.brandData?.website || campaign.brand?.website,
      },
      invitations: {
        sent: campaign.invitations?.length || 0,
        accepted: campaign.invitations?.filter((inv) => inv.status === "accepted")?.length || 0,
        pending: campaign.invitations?.filter((inv) => inv.status === "pending")?.length || 0,
      },
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    }))

    console.log("Formatted campaigns count:", formattedCampaigns.length)

    return NextResponse.json({
      campaigns: formattedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      debug: {
        query: JSON.stringify(query),
        totalFound: campaigns.length,
        totalInDB: total,
      },
    })
  } catch (error) {
    console.error("=== ADMIN CAMPAIGNS API ERROR ===")
    console.error("Error details:", error)
    console.error("Stack trace:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
        details: error.message,
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
        },
      },
      { status: 500 },
    )
  }
}
