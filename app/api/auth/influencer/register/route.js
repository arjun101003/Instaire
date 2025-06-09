import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/mongodb"
import User from "../../../../../models/User"
import { generateTokens } from "../../../../../lib/jwt"

export async function POST(request) {
  try {
    const { name, instagramUsername, password } = await request.json()

    if (!name || !instagramUsername || !password) {
      return NextResponse.json({ error: "Name, Instagram username, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ instagramUsername: instagramUsername.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this Instagram username already exists" }, { status: 409 })
    }

    // Create new influencer user with a UNIQUE email field to avoid null collision
    const uniqueEmail = `${instagramUsername.toLowerCase()}@influencer.local`

    const user = await User.create({
      email: uniqueEmail, // This prevents the null duplicate error
      instagramUsername: instagramUsername.toLowerCase(),
      password: password,
      name: name,
      role: "influencer",
      profileCompleted: false,
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
    console.error("Influencer registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
