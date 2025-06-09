"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaInstagram, FaUsers, FaChartLine, FaSave, FaArrowLeft } from "react-icons/fa"
import { CATEGORIES, MONETIZATION_METHODS } from "../../../../lib/constants"

export default function InfluencerOnboarding() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [profile, setProfile] = useState({
    instagramUsername: "",
    followers: "",
    avgLikes: "",
    avgComments: "",
    engagementRate: "",
    category: "",
    monetizationMethod: "",
    pastCollaborations: "",
    bio: "",
    location: "",
  })

  useEffect(() => {
    checkAuthAndProfile()
  }, [])

  const checkAuthAndProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.role === "influencer") {
          setUser(data.user)

          // Check if profile already exists
          const profileResponse = await fetch("/api/influencer/profile", {
            credentials: "include",
          })

          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (profileData.success && profileData.profile) {
              // Profile exists, redirect to dashboard
              router.push("/dashboard/influencer")
              return
            }
          }

          // Pre-fill Instagram username if available
          if (data.user.instagramUsername) {
            setProfile((prev) => ({
              ...prev,
              instagramUsername: data.user.instagramUsername,
            }))
          }
        } else {
          router.push("/auth/signin")
        }
      } else {
        router.push("/auth/signin")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/signin")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-calculate engagement rate
    if (field === "followers" || field === "avgLikes" || field === "avgComments") {
      const followers = field === "followers" ? Number.parseInt(value) : Number.parseInt(profile.followers)
      const likes = field === "avgLikes" ? Number.parseInt(value) : Number.parseInt(profile.avgLikes)
      const comments = field === "avgComments" ? Number.parseInt(value) : Number.parseInt(profile.avgComments)

      if (followers && (likes || comments)) {
        const engagement = (((likes + comments) / followers) * 100).toFixed(2)
        setProfile((prev) => ({
          ...prev,
          engagementRate: engagement,
        }))
      }
    }

    // Auto-generate slug from Instagram username
    if (field === "instagramUsername") {
      setProfile((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]/g, ""),
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    // Validation
    if (!profile.instagramUsername || !profile.followers || !profile.category) {
      setError("Please fill in all required fields")
      setSaving(false)
      return
    }

    try {
      const response = await fetch("/api/influencer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Profile created successfully! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard/influencer")
        }, 2000)
      } else {
        setError(data.error || "Failed to create profile")
      }
    } catch (err) {
      setError("An error occurred while creating profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <Link href="/dashboard/influencer" className="btn btn-secondary">
            <FaArrowLeft /> Skip for Now
          </Link>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              Complete Your Profile
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Set up your influencer profile to start receiving brand collaborations
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Instagram Info */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaInstagram style={{ color: "var(--primary-purple)" }} />
              Instagram Information
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Instagram Username *</label>
                <input
                  type="text"
                  value={profile.instagramUsername}
                  onChange={(e) => handleInputChange("instagramUsername", e.target.value)}
                  placeholder="your_username"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell brands about yourself and your content style..."
                className="form-input"
                rows={3}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaChartLine style={{ color: "var(--primary-purple)" }} />
              Account Statistics
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Followers Count *</label>
                <input
                  type="number"
                  value={profile.followers}
                  onChange={(e) => handleInputChange("followers", e.target.value)}
                  placeholder="10000"
                  className="form-input"
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Likes</label>
                <input
                  type="number"
                  value={profile.avgLikes}
                  onChange={(e) => handleInputChange("avgLikes", e.target.value)}
                  placeholder="500"
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Comments</label>
                <input
                  type="number"
                  value={profile.avgComments}
                  onChange={(e) => handleInputChange("avgComments", e.target.value)}
                  placeholder="50"
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Engagement Rate (%)</label>
                <input
                  type="number"
                  value={profile.engagementRate}
                  onChange={(e) => handleInputChange("engagementRate", e.target.value)}
                  placeholder="5.2"
                  className="form-input"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <small style={{ color: "var(--text-muted)" }}>Auto-calculated from likes and comments</small>
              </div>
            </div>
          </div>

          {/* Content & Business */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaUsers style={{ color: "var(--primary-purple)" }} />
              Content & Business
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Primary Category *</label>
                <select
                  value={profile.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monetization Method</label>
                <select
                  value={profile.monetizationMethod}
                  onChange={(e) => handleInputChange("monetizationMethod", e.target.value)}
                  className="form-input"
                >
                  <option value="">Select method</option>
                  {MONETIZATION_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Mumbai, India"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Past Collaborations</label>
              <textarea
                value={profile.pastCollaborations}
                onChange={(e) => handleInputChange("pastCollaborations", e.target.value)}
                placeholder="List brands you've worked with (e.g., Nike, Adidas, Local Restaurant...)"
                className="form-input"
                rows={3}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/dashboard/influencer" className="btn btn-secondary">
              Skip for Now
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <FaSave />
              {saving ? "Creating Profile..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
