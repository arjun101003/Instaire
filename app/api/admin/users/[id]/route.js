import { NextResponse } from "next/server"
import { verifyToken } from "../../../../../lib/jwt"
import connectDB from "../../../../../lib/mongodb"
import { User } from "../../../../../models"

export async function DELETE(request, { params }) {
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

    await connectDB()

    // Check if user exists
    const user = await User.findById(unwrappedParams.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting other admins
    if (user.role === "admin" && user._id.toString() !== decoded.id) {
      return NextResponse.json({ error: "Cannot delete other admin users" }, { status: 403 })
    }

    // Delete the user
    await User.findByIdAndDelete(unwrappedParams.id)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
