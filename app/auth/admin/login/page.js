"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaShieldAlt, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa"

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("🔐 Attempting admin login with:", { email: form.email })

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      })

      console.log("📡 Login response status:", response.status)

      const data = await response.json()
      console.log("📊 Login response data:", data)

      if (response.ok && data.success) {
        console.log("✅ Login successful, redirecting to admin dashboard")
        // Force a hard redirect to ensure proper navigation
        window.location.href = "/admin"
      } else {
        console.error("❌ Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("💥 Login error:", err)
      setError("Network error occurred. Please try again.")
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
    if (error) setError("")
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <Link href="/auth/signin" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }}>
              <FaArrowLeft style={{ marginRight: "8px" }} /> Back
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--accent-gold)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                }}
              >
                <FaShieldAlt style={{ color: "var(--dark-bg)", fontSize: "24px" }} />
              </div>
            </div>
          </div>

          <h1 className="auth-title">
            <span className="gradient-text">Admin Portal</span>
          </h1>
          <p className="auth-subtitle">Secure access for system administrators</p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#ef4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Administrator Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="admin@company.com"
              className="form-input"
              required
              disabled={loading}
              autoComplete="email"
            />
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
                placeholder="Enter your admin password"
                className="form-input"
                style={{ paddingRight: "50px" }}
                required
                disabled={loading}
                autoComplete="current-password"
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
                  fontSize: "16px",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.email.trim() || !form.password.trim()}
            className="btn"
            style={{
              width: "100%",
              background: loading ? "rgba(245, 158, 11, 0.5)" : "linear-gradient(135deg, var(--accent-gold), #f97316)",
              color: "var(--dark-bg)",
              fontWeight: "600",
              fontSize: "16px",
              padding: "14px 24px",
              boxShadow: loading ? "none" : "0 4px 15px rgba(245, 158, 11, 0.3)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading || !form.email.trim() || !form.password.trim() ? 0.7 : 1,
            }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid var(--dark-bg)",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Authenticating...
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <FaShieldAlt />
                Access Admin Portal
              </div>
            )}
          </button>
        </form>

        <div className="divider">
          <span>Administrator Access</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Need to set up the first admin account?
          </p>
          <Link
            href="/auth/admin/setup"
            style={{
              color: "var(--accent-gold)",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
          >
            First-time Setup →
          </Link>
        </div>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            <p
              style={{
                margin: "0 0 4px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              🔒 <strong>Secure Access:</strong> All admin actions are logged
            </p>
            <p style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              🛡️ <strong>Protected:</strong> Unauthorized access is monitored
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
