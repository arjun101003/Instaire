import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    console.log("🔄 Starting password reset...")

    const { instagramUsername, newPassword } = await request.json()

    if (!instagramUsername || !newPassword) {
      return NextResponse.json({ success: false, error: "Username and new password are required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ instagramUsername: instagramUsername.toLowerCase().trim() })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Hash the new password ONCE
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password directly
    await User.updateOne({ _id: user._id }, { password: hashedPassword })

    console.log("✅ Password reset successful for user:", user.instagramUsername)

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now login with your new password.",
    })
  } catch (error) {
    console.error("❌ Password reset error:", error)
    return NextResponse.json({ success: false, error: "Password reset failed" }, { status: 500 })
  }
}
