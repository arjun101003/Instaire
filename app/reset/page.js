"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ResetPage() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const resetDatabase = async () => {
    setLoading(true)
    setStatus("Resetting database...")

    try {
      // Simple fetch with error handling
      const response = await fetch("/api/debug/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      setStatus(`Success: ${data.message || "Reset complete"}`)
    } catch (error) {
      console.error("Reset error:", error)
      setStatus(`Error: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Database Reset Tool</h1>

      <div
        style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Reset All Influencer Users</h2>
        <p>This will delete all influencer accounts so you can start fresh.</p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            onClick={resetDatabase}
            disabled={loading}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontWeight: "bold",
            }}
          >
            {loading ? "Processing..." : "RESET DATABASE"}
          </button>
        </div>

        {status && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: status.includes("Error") ? "#f8d7da" : "#d4edda",
              color: status.includes("Error") ? "#721c24" : "#155724",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            {status}
          </div>
        )}
      </div>

      <div style={{ marginTop: "30px", background: "#e9ecef", padding: "20px", borderRadius: "10px" }}>
        <h3>After Reset:</h3>
        <ol style={{ lineHeight: "1.6" }}>
          <li>
            <a href="/auth/register" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>
              Register a new influencer account
            </a>
          </li>
          <li>
            <a href="/auth/signin" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>
              Sign in with your new account
            </a>
          </li>
        </ol>
      </div>
    </div>
  )
}
