"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaInstagram, FaBuilding, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa"

export default function SignIn() {
  const [activeTab, setActiveTab] = useState("brand")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [brandForm, setBrandForm] = useState({
    email: "",
    password: "",
  })

  const [influencerForm, setInfluencerForm] = useState({
    instagramUsername: "",
    password: "",
  })

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()

  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("=== BRAND LOGIN ATTEMPT ===")
      console.log("Email:", brandForm.email)

      const response = await fetch("/api/auth/brand/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: brandForm.email,
          password: brandForm.password,
        }),
      })

      console.log("Brand login response status:", response.status)
      console.log("Brand login response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType)
        const text = await response.text()
        console.error("Response text:", text)
        setError("Server error: Invalid response format")
        return
      }

      const data = await response.json()
      console.log("Brand login response data:", data)

      if (data.success) {
        console.log("Brand login successful, user data:", data.user)
        console.log("User role:", data.user.role)

        // Direct redirect to brand dashboard
        if (data.user.role === "brand") {
          console.log("Redirecting directly to brand dashboard...")
          router.push("/dashboard/brand")
        } else {
          console.log("User role is not brand, redirecting to generic dashboard...")
          router.push("/dashboard")
        }
      } else {
        console.log("Brand login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Brand login error:", err)
      setError("Network error: Please check your connection and try again")
    } finally {
      setLoading(false)
    }
  }

  const handleInfluencerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("=== INFLUENCER LOGIN ATTEMPT ===")
      console.log("Instagram Username:", influencerForm.instagramUsername)

      const response = await fetch("/api/auth/influencer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          instagramUsername: influencerForm.instagramUsername,
          password: influencerForm.password,
        }),
      })

      console.log("Influencer login response status:", response.status)
      const data = await response.json()
      console.log("Influencer login response data:", data)

      if (data.success) {
        console.log("Influencer login successful, redirecting to influencer dashboard...")
        if (data.user.role === "influencer") {
          router.push("/dashboard/influencer")
        } else {
          router.push("/dashboard")
        }
      } else {
        console.log("Influencer login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Influencer login error:", err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("=== ADMIN LOGIN ATTEMPT ===")
      console.log("Admin Email:", adminForm.email)

      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: adminForm.email,
          password: adminForm.password,
        }),
      })

      console.log("Admin login response status:", response.status)
      const data = await response.json()
      console.log("Admin login response data:", data)

      if (data.success) {
        console.log("Admin login successful, redirecting to admin dashboard...")
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        console.log("Admin login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Admin login error:", err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleBrandInputChange = (e) => {
    setBrandForm({
      ...brandForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleInfluencerInputChange = (e) => {
    setInfluencerForm({
      ...influencerForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleAdminInputChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value,
    })
  }

  const getContainerClass = () => {
    if (activeTab === "brand") return "auth-container auth-container-brand"
    if (activeTab === "influencer") return "auth-container auth-container-instagram"
    return "auth-container"
  }

  const getCardClass = () => {
    if (activeTab === "brand") return "auth-card card card-brand"
    if (activeTab === "influencer") return "auth-card card card-instagram"
    return "auth-card card"
  }

  const getTitleClass = () => {
    if (activeTab === "brand") return "auth-title gradient-text-brand"
    if (activeTab === "influencer") return "auth-title gradient-text-instagram"
    return "auth-title gradient-text"
  }

  const getInputClass = () => {
    if (activeTab === "brand") return "form-input form-input-brand"
    if (activeTab === "influencer") return "form-input form-input-instagram"
    return "form-input"
  }

  const getLinkClass = () => {
    if (activeTab === "brand") return "auth-link auth-link-brand"
    if (activeTab === "influencer") return "auth-link auth-link-instagram"
    return "auth-link"
  }

  const getTabActiveClass = (tab) => {
    if (tab === activeTab) {
      if (tab === "brand") return "auth-tab active brand-active"
      if (tab === "influencer") return "auth-tab active instagram-active"
      return "auth-tab active"
    }
    return "auth-tab"
  }

  return (
    <div className={getContainerClass()}>
      <div className={getCardClass()}>
        <div className="auth-header">
          <h1 className={getTitleClass()}>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your journey with Instaire</p>
        </div>

        <div className="auth-tabs">
          <button className={getTabActiveClass("brand")} onClick={() => setActiveTab("brand")}>
            <FaBuilding />
            Brand
          </button>
          <button className={getTabActiveClass("influencer")} onClick={() => setActiveTab("influencer")}>
            <FaInstagram />
            Influencer
          </button>
          <button className={getTabActiveClass("admin")} onClick={() => setActiveTab("admin")}>
            <FaUserShield />
            Admin
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === "brand" && (
          <form onSubmit={handleBrandSubmit}>
            <div className="form-group">
              <label htmlFor="brand-email" className="form-label">
                Business Email
              </label>
              <input
                type="email"
                id="brand-email"
                name="email"
                value={brandForm.email}
                onChange={handleBrandInputChange}
                placeholder="your@company.com"
                className={getInputClass()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand-password" className="form-label">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="brand-password"
                  name="password"
                  value={brandForm.password}
                  onChange={handleBrandInputChange}
                  placeholder="Enter your secure password"
                  className={getInputClass()}
                  style={{ paddingRight: "50px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-brand">
              <FaBuilding />
              {loading ? "Signing In..." : "Sign In as Brand"}
            </button>

            <div className="auth-features">
              <div className="feature feature-brand">
                <div className="feature-icon">🚀</div>
                <div>Launch powerful marketing campaigns</div>
              </div>
              <div className="feature feature-brand">
                <div className="feature-icon">📊</div>
                <div>Track performance and analytics</div>
              </div>
              <div className="feature feature-brand">
                <div className="feature-icon">🤝</div>
                <div>Connect with top influencers</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                New to Instaire?{" "}
                <Link href="/auth/brand/register" className={getLinkClass()}>
                  Create your brand account
                </Link>
              </p>
            </div>
          </form>
        )}

        {activeTab === "influencer" && (
          <form onSubmit={handleInfluencerSubmit}>
            <div className="form-group">
              <label htmlFor="influencer-username" className="form-label">
                Instagram Username
              </label>
              <input
                type="text"
                id="influencer-username"
                name="instagramUsername"
                value={influencerForm.instagramUsername}
                onChange={handleInfluencerInputChange}
                placeholder="your_instagram_handle"
                className={getInputClass()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="influencer-password" className="form-label">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="influencer-password"
                  name="password"
                  value={influencerForm.password}
                  onChange={handleInfluencerInputChange}
                  placeholder="Enter your secure password"
                  className={getInputClass()}
                  style={{ paddingRight: "50px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-instagram">
              <FaInstagram />
              {loading ? "Signing In..." : "Sign In as Influencer"}
            </button>

            <div className="auth-features">
              <div className="feature feature-instagram">
                <div className="feature-icon">💰</div>
                <div>Monetize your content and creativity</div>
              </div>
              <div className="feature feature-instagram">
                <div className="feature-icon">🌟</div>
                <div>Collaborate with premium brands</div>
              </div>
              <div className="feature feature-instagram">
                <div className="feature-icon">📈</div>
                <div>Grow your audience and engagement</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                New to Instaire?{" "}
                <Link href="/auth/register" className={getLinkClass()}>
                  Join as an influencer
                </Link>
              </p>
            </div>
          </form>
        )}

        {activeTab === "admin" && (
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Admin Email
              </label>
              <input
                type="email"
                id="admin-email"
                name="email"
                value={adminForm.email}
                onChange={handleAdminInputChange}
                placeholder="admin@instaire.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Admin Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminInputChange}
                  placeholder="Enter admin password"
                  className="form-input"
                  style={{ paddingRight: "50px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn admin-btn">
              <FaUserShield />
              {loading ? "Signing In..." : "Access Admin Panel"}
            </button>

            <div className="auth-features">
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <div>Full platform administration access</div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
