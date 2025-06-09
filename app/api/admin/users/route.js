import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "../../../../lib/jwt"
import connectDB from "../../../../lib/mongodb"
import { User } from "../../../../models"

export async function GET(request) {
  try {
    console.log("=== ADMIN USERS API CALLED ===")

    // Get cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("Token found:", !!token)

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)
    console.log("Token decoded:", decoded)

    if (!decoded || decoded.role !== "admin") {
      console.log("Invalid token or not admin:", decoded)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") || "all"
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    console.log("Query params:", { role, search, page, limit })

    // Connect to database
    await connectDB()
    console.log("Connected to database")

    // Build query
    const query = {}

    if (role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "instagramData.username": { $regex: search, $options: "i" } },
        { "brandData.companyName": { $regex: search, $options: "i" } },
      ]
    }

    console.log("MongoDB query:", JSON.stringify(query))

    // Get total count
    const total = await User.countDocuments(query)
    console.log("Total users found:", total)

    // Get users with pagination
    const users = await User.find(query)
      .select("-password -instagramData.accessToken -instagramData.longLivedToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    console.log("Users fetched:", users.length)
    console.log(
      "Sample user:",
      users[0]
        ? {
            id: users[0]._id,
            name: users[0].name,
            email: users[0].email,
            role: users[0].role,
          }
        : "No users",
    )

    const totalPages = Math.ceil(total / limit)

    // Process users to ensure all required fields
    const processedUsers = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name || "Unknown User",
      email: user.email || "No Email",
      role: user.role || "unknown",
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt || new Date(),
      lastLogin: user.lastLogin || null,
      instagramData: user.instagramData || {},
      brandData: user.brandData || {},
    }))

    console.log("Processed users count:", processedUsers.length)

    return NextResponse.json({
      success: true,
      users: processedUsers,
      total,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("=== ADMIN USERS API ERROR ===")
    console.error("Error details:", error)
    console.error("Stack trace:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error.message,
        debug: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
