import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { generateTokens } from "@/lib/jwt"

export async function POST(request) {
  try {
    console.log("🔐 Admin login API called")

    const body = await request.json()
    console.log("📝 Request body:", { email: body.email, hasPassword: !!body.password })

    const { email, password } = body

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    console.log("🔌 Connecting to database...")
    await connectDB()

    console.log("🔍 Looking for admin user with email:", email.toLowerCase())

    // Find admin user
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    })

    if (!user) {
      console.log("❌ Admin user not found")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin credentials",
        },
        { status: 401 },
      )
    }

    console.log("✅ Admin user found:", { id: user._id, email: user.email, isActive: user.isActive })

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ Admin account is deactivated")
      return NextResponse.json(
        {
          success: false,
          error: "Admin account is deactivated",
        },
        { status: 401 },
      )
    }

    // Verify password using the User model method
    console.log("🔑 Verifying password...")
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin credentials",
        },
        { status: 401 },
      )
    }

    console.log("✅ Password verified, generating token...")

    // Generate JWT token
    const tokens = await generateTokens(user)

    console.log("🎫 Token generated successfully")

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    })

    console.log("📅 Last login updated")

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set HTTP-only cookie with proper settings
    response.cookies.set("auth-token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    })

    console.log("🍪 Cookie set successfully")
    return response
  } catch (error) {
    console.error("💥 Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
