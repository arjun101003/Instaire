"use client"

import { useState } from "react"
import Link from "next/link"
import { FaKey, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa"

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    instagramUsername: "",
    newPassword: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/influencer/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setForm({ instagramUsername: "", newPassword: "" })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Password reset failed")
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
    if (error) setError("")
    if (success) setSuccess("")
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <h1 className="auth-title gradient-text">Reset Password</h1>
          <p className="auth-subtitle">Reset your password to fix login issues</p>
        </div>

        {error && (
          <div
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

        {success && (
          <div
            style={{
              background: "linear-gradient(135deg, #51cf66, #40c057)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCheckCircle />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="your_instagram_username"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary social-btn"
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <FaKey />
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            href="/auth/signin"
            style={{ color: "var(--primary-purple)", textDecoration: "none", fontWeight: "600" }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
