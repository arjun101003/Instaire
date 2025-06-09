import mongoose from "mongoose"

const DraftSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandCampaign",
      required: true,
      index: true, // Single index for filtering
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Single index for filtering
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Single index for filtering
    },
    // Draft Content
    content: {
      type: {
        type: String,
        enum: ["post", "story", "reel", "igtv"],
        required: true,
      },
      caption: {
        type: String,
        required: true,
      },
      hashtags: [String],
      mentions: [String],
      media: [
        {
          type: String, // image, video
          url: String,
          thumbnailUrl: String,
          duration: Number, // for videos
        },
      ],
      scheduledTime: Date,
    },
    // Draft Status
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "revision_requested", "published"],
      default: "draft",
      index: true, // Single index for filtering
    },
    // Feedback & Approval
    feedback: [
      {
        from: {
          type: String,
          enum: ["brand", "influencer"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["comment", "approval", "rejection", "revision"],
          default: "comment",
        },
      },
    ],
    // Approval Details
    approval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedAt: Date,
      rejectionReason: String,
    },
    // Revision History
    revisions: [
      {
        version: Number,
        content: {
          caption: String,
          hashtags: [String],
          mentions: [String],
          media: [
            {
              type: String,
              url: String,
              thumbnailUrl: String,
            },
          ],
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    // Publication Details
    publication: {
      publishedAt: Date,
      instagramPostId: String,
      instagramUrl: String,
      metrics: {
        likes: Number,
        comments: Number,
        shares: Number,
        saves: Number,
        reach: Number,
        impressions: Number,
        lastUpdated: Date,
      },
    },
    // Deadlines
    deadlines: {
      draftSubmission: {
        type: Date,
        required: true,
        index: true, // Single index for filtering overdue drafts
      },
      finalApproval: {
        type: Date,
        required: true,
      },
      publication: {
        type: Date,
        required: true,
      },
    },
    // Additional Notes
    notes: {
      influencerNotes: String,
      brandNotes: String,
      internalNotes: String, // For admin use
    },
  },
  {
    timestamps: true,
    // Add index on createdAt for sorting
    index: { createdAt: -1 },
  },
)

// Virtual for current version number
DraftSchema.virtual("currentVersion").get(function () {
  return this.revisions.length + 1
})

// Method to check if draft is overdue
DraftSchema.methods.isOverdue = function () {
  const now = new Date()
  if (this.status === "draft" || this.status === "revision_requested") {
    return now > this.deadlines.draftSubmission
  }
  if (this.status === "submitted" || this.status === "under_review") {
    return now > this.deadlines.finalApproval
  }
  if (this.status === "approved") {
    return now > this.deadlines.publication
  }
  return false
}

// Method to add feedback
DraftSchema.methods.addFeedback = function (from, message, type = "comment") {
  this.feedback.push({
    from,
    message,
    type,
    timestamp: new Date(),
  })
}

// Method to create revision
DraftSchema.methods.createRevision = function (newContent, notes) {
  this.revisions.push({
    version: this.currentVersion,
    content: {
      caption: this.content.caption,
      hashtags: this.content.hashtags,
      mentions: this.content.mentions,
      media: this.content.media,
    },
    notes: notes,
  })

  // Update current content
  this.content = { ...this.content, ...newContent }
  this.status = "submitted"
}

// Remove duplicate indexes - only keep necessary ones
// campaignId, influencerId, brandId, status, deadlines.draftSubmission already have index: true
// createdAt index is defined in schema options

export default mongoose.models.Draft || mongoose.model("Draft", DraftSchema)
