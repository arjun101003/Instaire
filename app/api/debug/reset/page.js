import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST() {
  try {
    await connectDB()

    // Delete all influencer users
    const result = await User.deleteMany({ role: "influencer" })

    console.log(`Reset complete. Deleted ${result.deletedCount} influencer users.`)

    return NextResponse.json({
      success: true,
      message: `Reset complete. Deleted ${result.deletedCount} influencer users.`,
    })
  } catch (error) {
    console.error("Reset error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
