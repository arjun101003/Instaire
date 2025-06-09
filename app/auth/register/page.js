"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaInstagram, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from "react-icons/fa"

export default function InfluencerRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
    setSuccess("")

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
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || "Registration successful! Redirecting to dashboard...")

        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
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

    // Clear messages when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  return (
    <div className="auth-container auth-container-instagram">
      <div className="auth-card card card-instagram">
        <div className="auth-header">
          <h1 className="auth-title gradient-text-instagram">Join Instaire</h1>
          <p className="auth-subtitle">Create your influencer account and start monetizing your content</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {success && (
          <div className="success-message" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCheckCircle />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="form-input form-input-instagram"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instagramUsername" className="form-label">
              Instagram Username
            </label>
            <input
              type="text"
              id="instagramUsername"
              name="instagramUsername"
              value={form.instagramUsername}
              onChange={handleInputChange}
              placeholder="your_instagram_handle"
              className="form-input form-input-instagram"
              required
              disabled={loading}
            />
            <small style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "6px", display: "block" }}>
              Only letters, numbers, dots, and underscores allowed
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="Create a secure password (min 6 characters)"
                className="form-input form-input-instagram"
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
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="form-input form-input-instagram"
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
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-instagram"
            style={{
              opacity: loading || success ? 0.7 : 1,
              cursor: loading || success ? "not-allowed" : "pointer",
            }}
          >
            <FaInstagram />
            {loading ? "Creating Account..." : success ? "Redirecting..." : "Create Influencer Account"}
          </button>
        </form>

        <div className="auth-features">
          <div className="feature feature-instagram">
            <div className="feature-icon">💰</div>
            <div>Earn money from your content and creativity</div>
          </div>
          <div className="feature feature-instagram">
            <div className="feature-icon">🌟</div>
            <div>Partner with premium brands worldwide</div>
          </div>
          <div className="feature feature-instagram">
            <div className="feature-icon">📈</div>
            <div>Grow your audience and engagement</div>
          </div>
          <div className="feature feature-instagram">
            <div className="feature-icon">🔒</div>
            <div>Secure platform with encrypted data</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/signin" className="auth-link auth-link-instagram">
              Sign in here
            </Link>
          </p>
        </div>

        <Link href="/auth/signin" className="btn btn-secondary" style={{ marginTop: "20px" }}>
          <FaArrowLeft />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
