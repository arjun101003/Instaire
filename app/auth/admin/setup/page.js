"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaShieldAlt, FaEye, FaEyeSlash, FaArrowLeft, FaSpinner, FaInfoCircle } from "react-icons/fa"

export default function AdminSetup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    setupKey: "admin123", // Pre-fill with default key
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [adminExists, setAdminExists] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkIfAdminExists()
  }, [])

  const checkIfAdminExists = async () => {
    try {
      const response = await fetch("/api/auth/admin/check")
      const data = await response.json()

      setAdminExists(data.exists)
      setCheckingAdmin(false)

      if (data.exists) {
        // If admin exists, show message and redirect after delay
        setTimeout(() => {
          router.push("/auth/admin/login")
        }, 3000)
      }
    } catch (error) {
      console.error("Failed to check admin existence:", error)
      setCheckingAdmin(false)
    }
  }

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        // Show success message and redirect to login
        alert("Admin account created successfully! You can now log in.")
        router.push("/auth/admin/login")
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (err) {
      setError("An error occurred during setup")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card card">
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FaSpinner
              className="spinning"
              style={{ fontSize: "48px", color: "var(--accent-gold)", marginBottom: "20px" }}
            />
            <h2>Checking admin status...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (adminExists) {
    return (
      <div className="auth-container">
        <div className="auth-card card">
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FaInfoCircle style={{ fontSize: "48px", color: "var(--accent-gold)", marginBottom: "20px" }} />
            <h2>Admin Already Exists</h2>
            <p style={{ marginBottom: "20px" }}>An admin account has already been created. Redirecting to login...</p>
            <Link href="/auth/admin/login" className="btn btn-primary">
              Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div style={{ fontSize: "48px", marginBottom: "16px", textAlign: "center", color: "var(--accent-gold)" }}>
            <FaShieldAlt />
          </div>
          <h1 className="auth-title">Admin Setup</h1>
          <p className="auth-subtitle">Create the first admin account</p>
        </div>

        {/* Info box about setup key */}
        <div
          style={{
            background: "rgba(255, 193, 7, 0.1)",
            border: "1px solid var(--accent-gold)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <FaInfoCircle style={{ color: "var(--accent-gold)" }} />
            <span style={{ fontWeight: "600", color: "var(--accent-gold)" }}>One-Time Setup</span>
          </div>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            This setup can only be performed once. The default setup key is <strong>admin123</strong> unless configured
            otherwise.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

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
              placeholder="Admin Name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              className="form-input"
              required
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
                placeholder="Minimum 8 characters"
                className="form-input"
                style={{ paddingRight: "50px" }}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
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
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setupKey" className="form-label">
              Setup Key
            </label>
            <input
              type="text"
              id="setupKey"
              name="setupKey"
              value={form.setupKey}
              onChange={handleInputChange}
              placeholder="Enter setup key"
              className="form-input"
              required
            />
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              Default key is "admin123" unless configured otherwise
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary social-btn"
            style={{
              background: "var(--gradient-accent)",
              borderColor: "var(--accent-gold)",
            }}
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" /> Creating Admin...
              </>
            ) : (
              <>
                <FaShieldAlt /> Create Admin Account
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>Secure Setup</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <Link
            href="/auth/admin/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              color: "var(--text-muted)",
              textDecoration: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              background: "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <FaArrowLeft size={12} /> Back to Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
