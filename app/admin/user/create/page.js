"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaArrowLeft, FaShieldAlt, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa"

export default function CreateAdmin() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.user && data.user.role === "admin") {
        setUser(data.user)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setSubmitting(false)
      return
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/admin/users/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Admin account created successfully!")
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Failed to create admin account")
      }
    } catch (err) {
      setError("An error occurred while creating the admin account")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
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
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <Link href="/admin/users" className="btn btn-secondary">
            <FaArrowLeft /> Back to Users
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaShieldAlt style={{ color: "var(--accent-gold)", fontSize: "24px" }} />
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              Create Admin Account
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              background: "var(--accent-gold)",
              color: "var(--dark-bg)",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <FaUserPlus style={{ marginRight: "8px" }} />
            <strong>Creating a new admin account</strong>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div
              style={{
                background: "var(--accent-emerald)",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
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
                placeholder="Enter full name"
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
                placeholder="admin@company.com"
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
                  placeholder="Create a strong password"
                  className="form-input"
                  style={{ paddingRight: "50px" }}
                  required
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
              <small style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Password must be at least 8 characters long
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm the password"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn social-btn"
              style={{
                background: "var(--accent-gold)",
                color: "var(--dark-bg)",
                fontWeight: "600",
                width: "100%",
              }}
            >
              {submitting ? "Creating Admin..." : "Create Admin Account"}
            </button>
          </form>

          <div className="divider">
            <span>Admin Privileges</span>
          </div>

          <div style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>
            <p>🔒 Full access to admin dashboard</p>
            <p>👥 Can manage all users and campaigns</p>
            <p>🛡️ Can create additional admin accounts</p>
            <p>📊 Access to system analytics and reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}
