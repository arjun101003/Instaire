import mongoose from "mongoose"

const BrandCampaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Single index for filtering
    },
    // Campaign Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Campaign Filters/Requirements
    filters: {
      categories: [
        {
          type: String,
          enum: [
            "fashion",
            "beauty",
            "lifestyle",
            "fitness",
            "food",
            "travel",
            "tech",
            "gaming",
            "business",
            "education",
            "entertainment",
            "health",
            "parenting",
            "pets",
            "sports",
            "art",
            "music",
            "photography",
            "other",
          ],
          index: true, // Single index for filtering
        },
      ],
      minFollowers: {
        type: Number,
        default: 1000,
      },
      maxFollowers: {
        type: Number,
        default: 1000000,
      },
      minEngagementRate: {
        type: Number,
        default: 1,
        min: 0,
        max: 100,
      },
      audienceAge: [
        {
          type: String,
          enum: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
        },
      ],
      audienceGender: {
        type: String,
        enum: ["male", "female", "mixed", "any"],
        default: "any",
      },
      location: {
        countries: [String],
        cities: [String],
      },
    },
    // Budget & Pricing
    budget: {
      minBudget: {
        type: Number,
        required: true,
      },
      maxBudget: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    // Campaign Timeline
    timeline: {
      applicationDeadline: {
        type: Date,
        required: true,
        index: true, // Single index for filtering
      },
      contentDeadline: {
        type: Date,
        required: true,
      },
      publishDate: {
        type: Date,
        required: true,
      },
      campaignEndDate: Date,
    },
    // Campaign Requirements
    requirements: {
      contentType: {
        type: String,
        enum: ["post", "story", "reel", "igtv", "multiple"],
        required: true,
      },
      numberOfPosts: {
        type: Number,
        default: 1,
        min: 1,
      },
      hashtags: [String],
      mentions: [String],
      guidelines: String,
      doNotMention: [String],
    },
    // Invited Influencers
    invitations: [
      {
        influencerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected", "completed"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: Date,
        agreedPrice: Number,
        notes: String,
      },
    ],
    // Campaign Status
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "cancelled"],
      default: "draft",
      index: true, // Single index for filtering
    },
    // Campaign Metrics (filled after completion)
    metrics: {
      totalReach: Number,
      totalImpressions: Number,
      totalEngagement: Number,
      totalClicks: Number,
      conversionRate: Number,
      roi: Number,
    },
    // Campaign Settings
    settings: {
      autoApprove: {
        type: Boolean,
        default: false,
      },
      requireDraft: {
        type: Boolean,
        default: true,
      },
      allowNegotiation: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    // Add index on createdAt for sorting
    index: { createdAt: -1 },
  },
)

// Virtual for total invited influencers
BrandCampaignSchema.virtual("totalInvitations").get(function () {
  return this.invitations.length
})

// Virtual for accepted invitations
BrandCampaignSchema.virtual("acceptedInvitations").get(function () {
  return this.invitations.filter((inv) => inv.status === "accepted").length
})

// Method to check if campaign is active
BrandCampaignSchema.methods.isActive = function () {
  return this.status === "active" && new Date() <= this.timeline.applicationDeadline
}

// Method to check if campaign is expired
BrandCampaignSchema.methods.isExpired = function () {
  return new Date() > this.timeline.applicationDeadline
}

// Remove duplicate indexes - only keep necessary ones
// brandId, status, timeline.applicationDeadline already have index: true
// filters.categories already has index: true
// createdAt index is defined in schema options

export default mongoose.models.BrandCampaign || mongoose.model("BrandCampaign", BrandCampaignSchema)
