import { NextResponse } from "next/server"
import { verifyToken } from "../../../../lib/jwt"
import connectDB from "../../../../lib/mongodb"
import { Draft } from "../../../../models"

export async function POST(request, { params }) {
  try {
    const unwrappedParams = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "brand") {
      return NextResponse.json({ error: "Only brands can review drafts" }, { status: 403 })
    }

    const { action, feedback } = await request.json()

    if (!["approve", "reject", "request_revision"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if ((action === "reject" || action === "request_revision") && !feedback) {
      return NextResponse.json({ error: "Feedback is required for rejection or revision request" }, { status: 400 })
    }

    await connectDB()

    const draft = await Draft.findById(unwrappedParams.id)
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    // Verify brand owns this draft
    if (draft.brandId.toString() !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update draft status based on action
    switch (action) {
      case "approve":
        draft.status = "approved"
        draft.approval.approvedBy = decoded.id
        draft.approval.approvedAt = new Date()
        break
      case "reject":
        draft.status = "rejected"
        draft.approval.rejectedBy = decoded.id
        draft.approval.rejectedAt = new Date()
        draft.approval.rejectionReason = feedback
        break
      case "request_revision":
        draft.status = "revision_requested"
        break
    }

    // Add feedback
    if (feedback) {
      draft.addFeedback(
        "brand",
        feedback,
        action === "approve" ? "approval" : action === "reject" ? "rejection" : "revision",
      )
    }

    await draft.save()

    return NextResponse.json({
      success: true,
      message: `Draft ${action.replace("_", " ")} successfully`,
      draft: draft,
    })
  } catch (error) {
    console.error("Draft review error:", error)
    return NextResponse.json({ error: "Failed to review draft" }, { status: 500 })
  }
}
