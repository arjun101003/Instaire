import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: {
        unique: true,
        sparse: true, // Only index non-null values
      },
      required: function () {
        return this.role === "brand" || this.role === "admin"
      },
    },
    instagramUsername: {
      type: String,
      lowercase: true,
      trim: true,
      required: function () {
        return this.role === "influencer"
      },
      index: {
        unique: true,
        sparse: true,
      },
    },
    password: {
      type: String,
      required: function () {
        return this.role === "brand" || this.role === "admin" || this.role === "influencer"
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["influencer", "brand", "admin"],
      required: true,
      index: true,
    },
    instagramData: {
      username: String,
      userId: String,
      accessToken: String,
      longLivedToken: String,
      followerCount: Number,
      followingCount: Number,
      mediaCount: Number,
      engagementRate: Number,
      averageLikes: Number,
      averageComments: Number,
      lastPosts: [
        {
          id: String,
          mediaType: String,
          mediaUrl: String,
          thumbnailUrl: String,
          caption: String,
          likes: Number,
          comments: Number,
          timestamp: Date,
          permalink: String,
        },
      ],
      profilePicture: String,
      biography: String,
      website: String,
      accountType: String,
    },
    brandData: {
      companyName: String,
      domain: String,
      website: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
