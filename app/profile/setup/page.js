"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaArrowLeft, FaUser, FaInstagram, FaGlobe, FaSave } from "react-icons/fa"
import { CATEGORIES, AGE_GROUPS, GENDER_OPTIONS, THEME_COLORS } from "../../../lib/constants"

export default function ProfileSetup() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [profile, setProfile] = useState({
    categories: {
      primary: "",
      secondary: [],
    },
    audience: {
      ageGroup: "",
      gender: "",
      location: {
        country: "",
        cities: [],
      },
    },
    pricing: {
      customPrice: "",
    },
    mediaKit: {
      bio: "",
      achievements: [],
      pastBrands: [],
      contactEmail: "",
      isPublic: false,
      customization: {
        theme: "purple",
        showPricing: true,
      },
    },
  })

  const [tempInputs, setTempInputs] = useState({
    achievement: "",
    brand: "",
    city: "",
  })

  useEffect(() => {
    checkAuth()
  }, []) // Remove dependencies to prevent infinite loop

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.user && data.user.role === "influencer") {
        setUser(data.user)
        await fetchProfile()
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

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (data.success && data.profile) {
        setProfile({
          categories: data.profile.categories || { primary: "", secondary: [] },
          audience: data.profile.audience || { ageGroup: "", gender: "", location: { country: "", cities: [] } },
          pricing: data.profile.pricing || { customPrice: "" },
          mediaKit: data.profile.mediaKit || {
            bio: "",
            achievements: [],
            pastBrands: [],
            contactEmail: "",
            isPublic: false,
            customization: { theme: "purple", showPricing: true },
          },
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const handleInputChange = (section, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleNestedInputChange = (section, subsection, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }))
  }

  const handleArrayAdd = (section, field, value) => {
    if (value.trim()) {
      setProfile((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...(prev[section][field] || []), value.trim()],
        },
      }))
    }
  }

  const handleArrayRemove = (section, field, index) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }))
  }

  const handleCategoryToggle = (category) => {
    const isSelected = profile.categories.secondary.includes(category)
    if (isSelected) {
      setProfile((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          secondary: prev.categories.secondary.filter((c) => c !== category),
        },
      }))
    } else {
      setProfile((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          secondary: [...prev.categories.secondary, category],
        },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Profile updated successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (err) {
      setError("An error occurred while updating profile")
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
              Loading Profile...
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
          <Link href="/dashboard" className="btn btn-secondary">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              Complete Your Profile
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Set up your influencer profile and media kit</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaUser style={{ color: "var(--primary-purple)" }} />
              Basic Information
            </h2>

            <div className="form-group">
              <label className="form-label">Bio for Media Kit</label>
              <textarea
                value={profile.mediaKit.bio}
                onChange={(e) => handleInputChange("mediaKit", "bio", e.target.value)}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                className="form-input"
                rows={4}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Primary Category *</label>
                <select
                  value={profile.categories.primary}
                  onChange={(e) => handleInputChange("categories", "primary", e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select primary category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  value={profile.mediaKit.contactEmail}
                  onChange={(e) => handleInputChange("mediaKit", "contactEmail", e.target.value)}
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Secondary Categories</label>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}
              >
                {CATEGORIES.filter((cat) => cat !== profile.categories.primary).map((category) => (
                  <label
                    key={category}
                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={profile.categories.secondary.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      style={{ accentColor: "var(--primary-purple)" }}
                    />
                    <span style={{ textTransform: "capitalize" }}>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaInstagram style={{ color: "var(--primary-purple)" }} />
              Audience Demographics
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Primary Age Group</label>
                <select
                  value={profile.audience.ageGroup}
                  onChange={(e) => handleInputChange("audience", "ageGroup", e.target.value)}
                  className="form-input"
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Audience Gender</label>
                <select
                  value={profile.audience.gender}
                  onChange={(e) => handleInputChange("audience", "gender", e.target.value)}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.filter((g) => g !== "any").map((gender) => (
                    <option key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Location</label>
                <input
                  type="text"
                  value={profile.audience.location.country}
                  onChange={(e) => handleNestedInputChange("audience", "location", "country", e.target.value)}
                  placeholder="e.g., India"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Top Cities</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={tempInputs.city}
                  onChange={(e) => setTempInputs({ ...tempInputs, city: e.target.value })}
                  placeholder="Add a city"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd("audience", "location.cities", tempInputs.city)
                    setTempInputs({ ...tempInputs, city: "" })
                  }}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.audience.location.cities.map((city, index) => (
                  <span
                    key={index}
                    style={{
                      background: "var(--dark-surface)",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {city}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("audience", "location.cities", index)}
                      style={{ background: "none", border: "none", color: "var(--primary-pink)", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements & Past Work */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaGlobe style={{ color: "var(--primary-purple)" }} />
              Achievements & Past Work
            </h2>

            <div className="form-group">
              <label className="form-label">Achievements</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={tempInputs.achievement}
                  onChange={(e) => setTempInputs({ ...tempInputs, achievement: e.target.value })}
                  placeholder="e.g., Featured in XYZ Magazine"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd("mediaKit", "achievements", tempInputs.achievement)
                    setTempInputs({ ...tempInputs, achievement: "" })
                  }}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {profile.mediaKit.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    style={{
                      background: "var(--dark-surface)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{achievement}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("mediaKit", "achievements", index)}
                      style={{ background: "none", border: "none", color: "var(--primary-pink)", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Past Brand Collaborations</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={tempInputs.brand}
                  onChange={(e) => setTempInputs({ ...tempInputs, brand: e.target.value })}
                  placeholder="e.g., Nike, Adidas"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleArrayAdd("mediaKit", "pastBrands", tempInputs.brand)
                    setTempInputs({ ...tempInputs, brand: "" })
                  }}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.mediaKit.pastBrands.map((brand, index) => (
                  <span
                    key={index}
                    style={{
                      background: "var(--gradient-primary)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {brand}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("mediaKit", "pastBrands", index)}
                      style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Media Kit Settings */}
          <div className="card" style={{ marginBottom: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaSave style={{ color: "var(--primary-purple)" }} />
              Pricing & Media Kit Settings
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Custom Price per Post (₹)</label>
                <input
                  type="number"
                  value={profile.pricing.customPrice}
                  onChange={(e) => handleInputChange("pricing", "customPrice", e.target.value)}
                  placeholder="Leave empty for auto-calculation"
                  className="form-input"
                  min="500"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Media Kit Theme</label>
                <select
                  value={profile.mediaKit.customization.theme}
                  onChange={(e) => handleNestedInputChange("mediaKit", "customization", "theme", e.target.value)}
                  className="form-input"
                >
                  {THEME_COLORS.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={profile.mediaKit.isPublic}
                  onChange={(e) => handleInputChange("mediaKit", "isPublic", e.target.checked)}
                  style={{ accentColor: "var(--primary-purple)" }}
                />
                <span>Make my media kit public</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={profile.mediaKit.customization.showPricing}
                  onChange={(e) =>
                    handleNestedInputChange("mediaKit", "customization", "showPricing", e.target.checked)
                  }
                  style={{ accentColor: "var(--primary-purple)" }}
                />
                <span>Show pricing on media kit</span>
              </label>
            </div>

            {profile.mediaKit.isPublic && user?.instagramData?.username && (
              <div
                style={{ marginTop: "15px", padding: "15px", background: "var(--dark-surface)", borderRadius: "8px" }}
              >
                <p style={{ color: "var(--text-muted)", marginBottom: "5px" }}>
                  Your public media kit will be available at:
                </p>
                <Link
                  href={`/i/${user.instagramData.username}`}
                  target="_blank"
                  style={{ color: "var(--primary-purple)", textDecoration: "none", fontWeight: "600" }}
                >
                  {window.location.origin}/i/{user.instagramData.username}
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <FaSave />
              {saving ? "Saving Profile..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
