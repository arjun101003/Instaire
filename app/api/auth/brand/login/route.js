import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/mongodb"
import User from "../../../../../models/User"
import { validateBrandEmail } from "../../../../../lib/domain-validator"
import { generateTokens } from "../../../../../lib/jwt"

export async function POST(request) {
  try {
    console.log("=== BRAND LOGIN API CALLED ===")

    const body = await request.json()
    console.log("Request body:", body)

    const { email, password } = body

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate brand email domain
    const validation = validateBrandEmail(email)
    if (!validation.isValid) {
      console.log("Invalid brand email domain:", validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    console.log("Connecting to database...")
    await connectDB()

    // Find user by email
    console.log("Looking for user with email:", email.toLowerCase())
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (user.role !== "brand") {
      console.log("User is not a brand, role:", user.role)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    console.log("Checking password...")
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("Invalid password")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT tokens
    console.log("Generating tokens...")
    const tokens = await generateTokens(user)

    // Create response
    const responseData = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brandData: user.brandData,
        profileCompleted: user.profileCompleted,
      },
    }

    console.log("Login successful, returning:", responseData)

    const response = NextResponse.json(responseData)

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
    console.error("Brand login error:", error)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Login failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
