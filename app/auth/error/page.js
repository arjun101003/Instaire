"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FaExclamationTriangle, FaArrowLeft } from "react-icons/fa"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access denied. Please use a company email address."
      case "Verification":
        return "The verification token has expired or has already been used."
      default:
        return "An error occurred during authentication."
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div
            style={{
              fontSize: "48px",
              color: "var(--primary-pink)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            <FaExclamationTriangle />
          </div>
          <h1 className="auth-title">Authentication Error</h1>
          <p className="auth-subtitle">{getErrorMessage(error)}</p>
        </div>

        <div className="error-message">
          <strong>Error:</strong> {error || "Unknown error"}
        </div>

        <Link href="/auth/signin" className="btn btn-primary social-btn">
          <FaArrowLeft />
          Back to Sign In
        </Link>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  )
}
