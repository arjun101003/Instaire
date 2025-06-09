import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function verifyAuth(request) {
  try {
    // Get token from cookies - await the cookies() function
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "Authentication required" }
    }

    // Verify token - now returns payload directly
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return { success: false, error: "Invalid token" }
    }

    // Connect to database
    await connectDB()

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Check if user is active
    if (!user.isActive) {
      return { success: false, error: "User account is inactive" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function withAuth(handler) {
  return async (request) => {
    const authResult = await verifyAuth(request)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Add user to request
    request.user = authResult.user

    return handler(request)
  }
}
