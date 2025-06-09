import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { Draft } from "@/models"
import connectDB from "@/lib/mongodb"

export async function GET() {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const drafts = await Draft.find({ influencerId: decoded.userId }).populate("campaignId", "title description")

    return NextResponse.json({ success: true, drafts }, { status: 200 })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { campaignId, title, contentType, caption, mediaUrls, notes } = await req.json()

    const newDraft = new Draft({
      campaignId,
      influencerId: decoded.userId,
      title,
      contentType,
      caption,
      mediaUrls: mediaUrls || [],
      notes,
      status: "pending",
    })

    await newDraft.save()

    return NextResponse.json({ message: "Draft submitted successfully", draft: newDraft }, { status: 201 })
  } catch (error) {
    console.error("Error creating draft:", error)
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
  }
}
