"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaArrowLeft, FaCalendar, FaUsers, FaDollarSign } from "react-icons/fa"
import { CATEGORIES, CONTENT_TYPES } from "../../../lib/constants"

export default function CreateCampaign() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  const [campaign, setCampaign] = useState({
    title: "",
    description: "",
    filters: {
      categories: [],
      minFollowers: 1000,
      maxFollowers: 100000,
      minEngagementRate: 2,
      audienceAge: [],
      audienceGender: "any",
      location: {
        countries: [],
        cities: [],
      },
    },
    budget: {
      minBudget: 5000,
      maxBudget: 25000,
      currency: "INR",
    },
    timeline: {
      applicationDeadline: "",
      contentDeadline: "",
      publishDate: "",
    },
    requirements: {
      contentType: "post",
      numberOfPosts: 1,
      hashtags: [],
      mentions: [],
      guidelines: "",
    },
  })

  // Check authentication and user role
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Current user:", data.user) // Debug log
        setUser(data.user)

        if (data.user.role !== "brand") {
          setError(`Access denied. Only brands can create campaigns. Your role: ${data.user.role}`)
        }
      } else {
        router.push("/auth/signin")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/signin")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    setCampaign((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleArrayAdd = (section, field, value) => {
    if (value.trim()) {
      setCampaign((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], value.trim()],
        },
      }))
    }
  }

  const handleArrayRemove = (section, field, index) => {
    setCampaign((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Submitting campaign with user:", user) // Debug log

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(campaign),
      })

      const data = await response.json()
      console.log("Campaign creation response:", data) // Debug log

      if (data.success) {
        router.push(`/campaigns/${data.campaign._id}`)
      } else {
        setError(data.error || "Failed to create campaign")
      }
    } catch (err) {
      console.error("Campaign creation error:", err)
      setError("An error occurred while creating the campaign")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user || user.role !== "brand") {
    return (
      <div style={{ minHeight: "100vh", padding: "20px" }}>
        <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
          <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
            Access Denied
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
            Only brand accounts can create campaigns.
            {user && ` Your current role: ${user.role}`}
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <Link href="/dashboard" className="btn btn-secondary">
              Go to Dashboard
            </Link>
            <Link href="/auth/signin" className="btn btn-primary">
              Switch Account
            </Link>
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
          <Link href="/dashboard" className="btn btn-secondary">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              Create Campaign
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Step {step} of 3 | Logged in as: {user?.email} ({user?.role})
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ color: step >= 1 ? "var(--primary-purple)" : "var(--text-muted)" }}>Basic Info</span>
            <span style={{ color: step >= 2 ? "var(--primary-purple)" : "var(--text-muted)" }}>Filters & Budget</span>
            <span style={{ color: step >= 3 ? "var(--primary-purple)" : "var(--text-muted)" }}>
              Timeline & Requirements
            </span>
          </div>
          <div style={{ background: "var(--dark-surface)", height: "4px", borderRadius: "2px" }}>
            <div
              style={{
                background: "var(--gradient-primary)",
                height: "100%",
                borderRadius: "2px",
                width: `${(step / 3) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="card">
              <h2 style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaUsers style={{ color: "var(--primary-purple)" }} />
                Campaign Basic Information
              </h2>

              <div className="form-group">
                <label className="form-label">Campaign Title *</label>
                <input
                  type="text"
                  value={campaign.title}
                  onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                  placeholder="e.g., Summer Fashion Collection Launch"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Description *</label>
                <textarea
                  value={campaign.description}
                  onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                  placeholder="Describe your campaign goals, brand values, and what you're looking for in influencers..."
                  className="form-input"
                  rows={5}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next: Filters & Budget
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Filters & Budget */}
          {step === 2 && (
            <div className="card">
              <h2 style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaDollarSign style={{ color: "var(--primary-purple)" }} />
                Influencer Filters & Budget
              </h2>

              {/* Categories */}
              <div className="form-group">
                <label className="form-label">Content Categories *</label>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}
                >
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={campaign.filters.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange("filters", "categories", [...campaign.filters.categories, category])
                          } else {
                            handleInputChange(
                              "filters",
                              "categories",
                              campaign.filters.categories.filter((c) => c !== category),
                            )
                          }
                        }}
                        style={{ accentColor: "var(--primary-purple)" }}
                      />
                      <span style={{ textTransform: "capitalize" }}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Follower Range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Minimum Followers</label>
                  <input
                    type="number"
                    value={campaign.filters.minFollowers}
                    onChange={(e) => handleInputChange("filters", "minFollowers", Number.parseInt(e.target.value))}
                    className="form-input"
                    min="100"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Followers</label>
                  <input
                    type="number"
                    value={campaign.filters.maxFollowers}
                    onChange={(e) => handleInputChange("filters", "maxFollowers", Number.parseInt(e.target.value))}
                    className="form-input"
                    min="1000"
                  />
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="form-group">
                <label className="form-label">Minimum Engagement Rate (%)</label>
                <input
                  type="number"
                  value={campaign.filters.minEngagementRate}
                  onChange={(e) => handleInputChange("filters", "minEngagementRate", Number.parseFloat(e.target.value))}
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Budget Range */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Minimum Budget (₹)</label>
                  <input
                    type="number"
                    value={campaign.budget.minBudget}
                    onChange={(e) => handleInputChange("budget", "minBudget", Number.parseInt(e.target.value))}
                    className="form-input"
                    min="500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Budget (₹)</label>
                  <input
                    type="number"
                    value={campaign.budget.maxBudget}
                    onChange={(e) => handleInputChange("budget", "maxBudget", Number.parseInt(e.target.value))}
                    className="form-input"
                    min="1000"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Previous
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next: Timeline
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline & Requirements */}
          {step === 3 && (
            <div className="card">
              <h2 style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCalendar style={{ color: "var(--primary-purple)" }} />
                Timeline & Content Requirements
              </h2>

              {/* Timeline */}
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}
              >
                <div className="form-group">
                  <label className="form-label">Application Deadline *</label>
                  <input
                    type="datetime-local"
                    value={campaign.timeline.applicationDeadline}
                    onChange={(e) => handleInputChange("timeline", "applicationDeadline", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content Deadline *</label>
                  <input
                    type="datetime-local"
                    value={campaign.timeline.contentDeadline}
                    onChange={(e) => handleInputChange("timeline", "contentDeadline", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publish Date *</label>
                  <input
                    type="datetime-local"
                    value={campaign.timeline.publishDate}
                    onChange={(e) => handleInputChange("timeline", "publishDate", e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Content Requirements */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Content Type *</label>
                  <select
                    value={campaign.requirements.contentType}
                    onChange={(e) => handleInputChange("requirements", "contentType", e.target.value)}
                    className="form-input"
                    required
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Posts</label>
                  <input
                    type="number"
                    value={campaign.requirements.numberOfPosts}
                    onChange={(e) =>
                      handleInputChange("requirements", "numberOfPosts", Number.parseInt(e.target.value))
                    }
                    className="form-input"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="form-group">
                <label className="form-label">Content Guidelines</label>
                <textarea
                  value={campaign.requirements.guidelines}
                  onChange={(e) => handleInputChange("requirements", "guidelines", e.target.value)}
                  placeholder="Specific requirements, brand guidelines, dos and don'ts..."
                  className="form-input"
                  rows={4}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Previous
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Creating Campaign..." : "Create Campaign"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
