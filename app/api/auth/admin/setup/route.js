import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User } from "@/models"
import { generateTokens } from "@/lib/jwt"

export async function POST(request) {
  try {
    const { setupKey, name, email, password, confirmPassword } = await request.json()

    // Validate setup key
    const expectedSetupKey = "admin123"
    if (setupKey !== expectedSetupKey) {
      return NextResponse.json({ success: false, error: "Invalid setup key" }, { status: 401 })
    }

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    await connectDB()

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: "Admin account already exists" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    // Create admin user
    const adminUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
      isActive: true,
      profileCompleted: true,
    })

    await adminUser.save()

    // Generate JWT tokens
    const tokens = generateTokens(adminUser)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
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
    console.error("Admin setup error:", error)
    return NextResponse.json({ success: false, error: "Failed to create admin account" }, { status: 500 })
  }
}
