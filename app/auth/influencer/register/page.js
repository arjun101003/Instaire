"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaInstagram, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa"

export default function InfluencerRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    instagramUsername: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("🔄 Starting registration process...")

    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // Validate Instagram username format
    const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/
    if (!usernameRegex.test(form.instagramUsername)) {
      setError("Instagram username can only contain letters, numbers, dots, and underscores")
      setLoading(false)
      return
    }

    try {
      console.log("📤 Sending registration request...")

      const requestData = {
        name: form.name.trim(),
        instagramUsername: form.instagramUsername.trim(),
        password: form.password,
      }

      const response = await fetch("/api/auth/influencer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📥 Response data:", data)

      if (data.success) {
        console.log("✅ Registration successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("❌ Registration failed:", data.error)
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      console.error("❌ Registration error:", err)
      setError(`Registration failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title gradient-text">Create Influencer Account</h1>
          <p className="auth-subtitle">Join Instaire to connect with amazing brands</p>
        </div>

        {error && (
          <div
            className="error-message"
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instagramUsername" className="form-label">
              Instagram Username *
            </label>
            <input
              type="text"
              id="instagramUsername"
              name="instagramUsername"
              value={form.instagramUsername}
              onChange={handleInputChange}
              placeholder="your_instagram_username"
              className="form-input"
              required
              disabled={loading}
            />
            <small style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              Only letters, numbers, dots, and underscores allowed
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                className="form-input"
                style={{ paddingRight: "50px" }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="form-input"
                style={{ paddingRight: "50px" }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary social-btn"
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <FaInstagram />
            {loading ? "Creating Account..." : "Create Influencer Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              style={{ color: "var(--primary-purple)", textDecoration: "none", fontWeight: "600" }}
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginTop: "16px" }}>
          <p>✓ Secure password encryption</p>
          <p>✓ Connect with top brands</p>
          <p>✓ Monetize your content</p>
        </div>

        <Link href="/auth/signin" className="btn btn-secondary" style={{ marginTop: "20px", width: "100%" }}>
          <FaArrowLeft />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
