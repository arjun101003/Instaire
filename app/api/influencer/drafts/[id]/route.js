import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import Draft from "@/models/Draft"
import connectDB from "@/lib/mongodb"

export async function PUT(req, { params }) {
  try {
    await connectDB()

    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "influencer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { status } = await req.json()

    // Only allow marking as "posted" if it's approved
    if (status === "posted") {
      const draft = await Draft.findById(id)
      if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 })
      }

      if (draft.influencerId.toString() !== decoded.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      if (draft.status !== "approved") {
        return NextResponse.json({ error: "Can only mark approved drafts as posted" }, { status: 400 })
      }

      draft.status = "posted"
      draft.postedAt = new Date()
      await draft.save()

      return NextResponse.json(
        {
          success: true,
          message: "Draft marked as posted successfully",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "Invalid status update" }, { status: 400 })
  } catch (error) {
    console.error("Error updating draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}
