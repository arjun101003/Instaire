import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth-middleware"
import { connectToDatabase } from "@/lib/mongodb"
import { Draft } from "@/models/Draft"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 })
    }

    const draft = await Draft.findById(id)
      .populate("influencerId", "name email instagramUsername profilePicture followerCount")
      .populate("campaignId", "title description brand budget categories")
      .lean()

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      draft,
    })
  } catch (error) {
    console.error("❌ Admin draft fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch draft" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 })
    }

    const { status, feedback, adminNotes } = body

    const updateData = {
      updatedAt: new Date(),
    }

    if (status) {
      updateData.status = status
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = authResult.user.id
    }

    if (feedback) {
      updateData.feedback = feedback
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    const draft = await Draft.findByIdAndUpdate(id, updateData, { new: true })
      .populate("influencerId", "name email instagramUsername")
      .populate("campaignId", "title brand")

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Draft updated successfully",
      draft,
    })
  } catch (error) {
    console.error("❌ Admin draft update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update draft" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid draft ID" }, { status: 400 })
    }

    const draft = await Draft.findByIdAndDelete(id)

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully",
    })
  } catch (error) {
    console.error("❌ Admin draft delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete draft" }, { status: 500 })
  }
}
