import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import { User } from "@/models"

export async function GET() {
  try {
    console.log("=== AUTH ME API CALLED ===")

    // Get cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("Token found:", !!token)
    console.log("Token value:", token ? token.substring(0, 20) + "..." : "No token")

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({
        authenticated: false,
        error: "No token found",
      })
    }

    // Verify token
    let decoded
    try {
      decoded = await verifyToken(token)
      console.log("Token decoded successfully:", decoded)
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError)
      return NextResponse.json({
        authenticated: false,
        error: "Invalid token",
        details: tokenError.message,
      })
    }

    if (!decoded || !decoded.userId) {
      console.log("Invalid token payload - decoded:", decoded)
      return NextResponse.json({
        authenticated: false,
        error: "Invalid token payload",
        decoded: decoded, // Debug info
      })
    }

    // Connect to database
    await connectDB()
    console.log("Connected to database")

    // Get user from database
    const user = await User.findById(decoded.userId).lean()

    console.log(
      "User lookup result:",
      user
        ? {
            id: user._id,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            instagramUsername: user.instagramUsername,
          }
        : "No user found",
    )

    if (!user) {
      console.log("User not found in database")
      return NextResponse.json({
        authenticated: false,
        error: "User not found",
      })
    }

    // Check if user is active (default to true if not set)
    if (user.isActive === false) {
      console.log("User account is inactive")
      return NextResponse.json({
        authenticated: false,
        error: "Account inactive",
      })
    }

    console.log("Authentication successful for user:", user.name)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive !== false, // Default to true
        instagramUsername: user.instagramUsername,
        instagramData: user.instagramData,
        brandData: user.brandData,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("=== AUTH ME API ERROR ===")
    console.error("Error details:", error)
    console.error("Stack trace:", error.stack)

    return NextResponse.json({
      authenticated: false,
      error: "Authentication failed",
      details: error.message,
    })
  }
}
