import { NextResponse } from "next/server"
import connectDB from "../../../../lib/mongodb"
import User from "../../../../models/User"
import { InstagramBusinessAPI } from "../../../../lib/instagram-business"
import { generateTokens } from "../../../../lib/jwt"

export async function POST(request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    console.log("Processing Instagram Business OAuth with code:", code.substring(0, 10) + "...")

    const igAPI = new InstagramBusinessAPI()

    // Exchange code for access token
    const tokenData = await igAPI.getAccessToken(code)

    if (!tokenData || tokenData.error) {
      console.error("Token exchange failed:", tokenData)
      return NextResponse.json(
        { error: tokenData?.error_message || "Failed to get access token from Instagram Business API" },
        { status: 400 },
      )
    }

    console.log("Instagram Business token exchange successful for user:", tokenData.user_id)

    const { access_token, user_id } = tokenData

    // Get long-lived token
    const longLivedToken = await igAPI.getLongLivedToken(access_token)

    // Get business profile
    const businessProfile = await igAPI.getBusinessProfile(longLivedToken || access_token)

    if (!businessProfile) {
      return NextResponse.json({ error: "Failed to fetch Instagram Business profile" }, { status: 400 })
    }

    console.log("Business profile fetched for user:", businessProfile.username)

    // Get business media with insights
    const businessMedia = await igAPI.getBusinessMedia(longLivedToken || access_token, 10)

    // Calculate engagement rate from actual data
    const engagementRate = igAPI.calculateEngagementRate(businessMedia, businessProfile.followers_count)

    // Calculate averages
    const totalLikes = businessMedia.reduce((sum, post) => sum + (post.like_count || 0), 0)
    const totalComments = businessMedia.reduce((sum, post) => sum + (post.comments_count || 0), 0)
    const averageLikes = businessMedia.length ? Math.round(totalLikes / businessMedia.length) : 0
    const averageComments = businessMedia.length ? Math.round(totalComments / businessMedia.length) : 0

    // Connect to database
    await connectDB()

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ "instagramData.userId": user_id }, { "instagramData.username": businessProfile.username }],
    })

    const instagramData = {
      username: businessProfile.username,
      userId: user_id,
      accessToken: access_token,
      longLivedToken: longLivedToken,
      followerCount: businessProfile.followers_count || 0,
      followingCount: businessProfile.follows_count || 0,
      mediaCount: businessProfile.media_count || 0,
      engagementRate: engagementRate,
      averageLikes: averageLikes,
      averageComments: averageComments,
      lastPosts: businessMedia.map((post) => ({
        id: post.id,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        thumbnailUrl: post.thumbnail_url,
        caption: post.caption || "",
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        timestamp: new Date(post.timestamp),
        permalink: post.permalink,
      })),
      profilePicture: businessProfile.profile_picture_url || "",
      biography: businessProfile.biography || "",
      website: businessProfile.website || "",
      accountType: businessProfile.account_type || "BUSINESS",
    }

    if (user) {
      // Update existing user
      user.instagramData = instagramData
      user.lastLogin = new Date()
      await user.save()
      console.log("Updated existing user:", user.email)
    } else {
      // Create new user
      user = await User.create({
        email: `${businessProfile.username}@instagram.business`,
        name: businessProfile.name || businessProfile.username,
        role: "influencer",
        instagramData: instagramData,
        lastLogin: new Date(),
      })
      console.log("Created new user:", user.email)
    }

    // Generate JWT tokens
    const tokens = generateTokens(user)

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instagramData: user.instagramData,
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
    console.error("Instagram Business auth error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
