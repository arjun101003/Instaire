import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../../lib/jwt"
import connectDB from "../../../../../../lib/mongodb"
import { User } from "../../../../../../models"

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

    const { isActive } = await request.json()

    await connectDB()

    // Check if user exists
    const user = await User.findById(unwrappedParams.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deactivating other admins
    if (user.role === "admin" && user._id.toString() !== decoded.id && !isActive) {
      return NextResponse.json({ error: "Cannot deactivate other admin users" }, { status: 403 })
    }

    // Update user status
    user.isActive = isActive
    await user.save()

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("Admin user status update error:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
