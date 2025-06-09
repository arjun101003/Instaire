import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/mongodb"
import User from "../../../../../models/User"
import { validateBrandEmail, extractCompanyName } from "../../../../../lib/domain-validator"
import { generateTokens } from "../../../../../lib/jwt"

export async function POST(request) {
  try {
    const { email, password, name, companyName } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Validate brand email domain
    const validation = validateBrandEmail(email)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Extract company name from domain if not provided
    const finalCompanyName = companyName || extractCompanyName(validation.domain)

    // Create new brand user
    const user = await User.create({
      email: email.toLowerCase(),
      password: password,
      name: name,
      role: "brand",
      brandData: {
        companyName: finalCompanyName,
        domain: validation.domain,
        verified: false,
      },
      lastLogin: new Date(),
    })

    // Generate JWT tokens
    const tokens = generateTokens(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brandData: user.brandData,
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
    console.error("Brand registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
