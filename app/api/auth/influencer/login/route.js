import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/mongodb"
import User from "../../../../../models/User"
import { generateTokens } from "../../../../../lib/jwt"

export async function POST(request) {
  try {
    const { instagramUsername, password } = await request.json()

    if (!instagramUsername || !password) {
      return NextResponse.json({ error: "Instagram username and password are required" }, { status: 400 })
    }

    await connectDB()

    // Find user by Instagram username
    const user = await User.findOne({ instagramUsername: instagramUsername.toLowerCase() })

    if (!user || user.role !== "influencer") {
      return NextResponse.json({ error: "Invalid Instagram username or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid Instagram username or password" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT tokens
    const tokens = await generateTokens(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        instagramUsername: user.instagramUsername,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Influencer login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
