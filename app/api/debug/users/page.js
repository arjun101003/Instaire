import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectDB()

    // Get all users
    const users = await User.find({})

    // Map to safe format
    const safeUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      instagramUsername: user.instagramUsername,
      role: user.role,
      hasPassword: !!user.password,
      passwordHash: user.password ? user.password.substring(0, 20) + "..." : null,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    }))

    return NextResponse.json({ success: true, users: safeUsers })
  } catch (error) {
    console.error("Debug users error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    await connectDB()

    // Find user
    const user = await User.findOne({
      $or: [{ email: username?.toLowerCase() }, { instagramUsername: username?.toLowerCase() }],
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        searchedFor: username?.toLowerCase(),
      })
    }

    // Test password
    const passwordMatch = await bcrypt.compare(password, user.password)

    // Create test hash
    const testHash = await bcrypt.hash(password, 12)
    const testMatch = await bcrypt.compare(password, testHash)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        instagramUsername: user.instagramUsername,
        role: user.role,
        passwordHash: user.password ? user.password.substring(0, 20) + "..." : null,
      },
      passwordTest: {
        inputPassword: password,
        passwordMatch: passwordMatch,
        testHash: testHash.substring(0, 20) + "...",
        testMatch: testMatch,
      },
    })
  } catch (error) {
    console.error("Debug password error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
