import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User } from "@/models"

export async function GET() {
  try {
    await connectDB()

    // Check if any admin user exists
    const adminExists = await User.findOne({ role: "admin" })

    return NextResponse.json({
      exists: !!adminExists,
      count: adminExists ? 1 : 0,
    })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json(
      {
        exists: false,
        error: "Failed to check admin existence",
      },
      { status: 500 },
    )
  }
}
