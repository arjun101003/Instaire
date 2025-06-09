import mongoose from "mongoose"

const InfluencerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    instagramUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    followers: {
      type: Number,
      required: true,
      min: 1,
    },
    avgLikes: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgComments: {
      type: Number,
      default: 0,
      min: 0,
    },
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: true,
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
    },
    monetizationMethod: {
      type: String,
      enum: ["sponsored-posts", "affiliate", "product-placement", "brand-ambassador", "events", "other"],
    },
    pastCollaborations: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    // Campaign tracking
    totalCampaigns: {
      type: Number,
      default: 0,
    },
    completedCampaigns: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
InfluencerProfileSchema.index({ category: 1 })
InfluencerProfileSchema.index({ followers: -1 })
InfluencerProfileSchema.index({ engagementRate: -1 })
InfluencerProfileSchema.index({ location: 1 })
InfluencerProfileSchema.index({ isActive: 1, profileCompleted: 1 })

// Virtual for estimated pricing
InfluencerProfileSchema.virtual("estimatedPrice").get(function () {
  if (!this.followers || !this.engagementRate) return 0
  // Formula: (Followers / 1000) × Engagement Rate × Base Rate (₹100)
  const price = Math.round((this.followers / 1000) * this.engagementRate * 100)
  return Math.max(price, 500) // Minimum ₹500
})

// Method to calculate engagement rate
InfluencerProfileSchema.methods.calculateEngagementRate = function () {
  if (!this.followers || this.followers === 0) return 0
  const totalEngagement = this.avgLikes + this.avgComments
  return Math.round((totalEngagement / this.followers) * 100 * 100) / 100 // Round to 2 decimal places
}

// Pre-save middleware to calculate engagement rate
InfluencerProfileSchema.pre("save", function (next) {
  if (this.followers && (this.avgLikes || this.avgComments)) {
    this.engagementRate = this.calculateEngagementRate()
  }
  next()
})

// Export using the Next.js pattern to prevent overwrite errors
export default mongoose.models.InfluencerProfile || mongoose.model("InfluencerProfile", InfluencerProfileSchema)
