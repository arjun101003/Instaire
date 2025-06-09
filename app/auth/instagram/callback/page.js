"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FaInstagram, FaSpinner } from "react-icons/fa"

export default function InstagramCallback() {
  const [status, setStatus] = useState("processing")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const error = searchParams.get("error")

      if (error) {
        setStatus("error")
        setError("Instagram authentication was cancelled or failed")
        return
      }

      if (!code) {
        setStatus("error")
        setError("No authorization code received")
        return
      }

      try {
        const response = await fetch("/api/auth/instagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setError(data.error || "Authentication failed")
        }
      } catch (err) {
        setStatus("error")
        setError("An error occurred during authentication")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {status === "processing" && (
              <div style={{ color: "var(--primary-purple)" }}>
                <FaSpinner className="spinning" />
              </div>
            )}
            {status === "success" && (
              <div style={{ color: "var(--accent-emerald)" }}>
                <FaInstagram />
              </div>
            )}
            {status === "error" && <div style={{ color: "var(--primary-pink)" }}>❌</div>}
          </div>

          <h1 className="auth-title">
            {status === "processing" && "Connecting Instagram..."}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </h1>

          <p className="auth-subtitle">
            {status === "processing" && "We're fetching your Instagram Business data"}
            {status === "success" && "Redirecting to your dashboard..."}
            {status === "error" && error}
          </p>
        </div>

        {status === "processing" && (
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <p>✓ Verifying Instagram Business account</p>
            <p>✓ Fetching follower count and engagement data</p>
            <p>✓ Analyzing recent posts</p>
            <p>✓ Setting up your profile</p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="/auth/signin" className="btn btn-primary">
              Try Again
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
