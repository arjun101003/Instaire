"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState("")
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndRedirect()
  }, [])

  const checkAuthAndRedirect = async () => {
    try {
      console.log("=== DASHBOARD: Starting auth check ===")
      setDebugInfo("Checking authentication...")

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("Dashboard auth response status:", response.status)
      console.log("Dashboard auth response headers:", Object.fromEntries(response.headers.entries()))

      setDebugInfo(`Auth response: ${response.status}`)
      setAuthChecked(true)

      if (!response.ok) {
        console.log("Auth response not OK, redirecting to signin")
        setDebugInfo("Not authenticated, redirecting...")
        router.replace("/auth/signin")
        return
      }

      const data = await response.json()
      console.log("Dashboard auth data:", data)
      setDebugInfo(`Auth data received: ${JSON.stringify(data)}`)

      if (data.authenticated && data.user) {
        const { role } = data.user
        console.log("User role:", role)
        setDebugInfo(`User role: ${role}, redirecting...`)

        // Immediate redirect without delay
        switch (role) {
          case "influencer":
            console.log("Redirecting to influencer dashboard")
            router.replace("/dashboard/influencer")
            break
          case "brand":
            console.log("Redirecting to brand dashboard")
            router.replace("/dashboard/brand")
            break
          case "admin":
            console.log("Redirecting to admin dashboard")
            router.replace("/admin")
            break
          default:
            console.log("Unknown role, redirecting to signin")
            router.replace("/auth/signin")
        }
      } else {
        console.log("User not authenticated, redirecting to signin")
        setDebugInfo("User not authenticated")
        router.replace("/auth/signin")
      }
    } catch (error) {
      console.error("Dashboard auth check failed:", error)
      setError("Failed to check authentication: " + error.message)
      setDebugInfo(`Error: ${error.message}`)
      setAuthChecked(true)
      router.replace("/auth/signin")
    } finally {
      setLoading(false)
    }
  }

  // Show loading until auth is checked
  if (!authChecked || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "10px",
            }}
          >
            Loading Dashboard...
          </div>
          <div style={{ color: "#666", marginBottom: "20px" }}>
            Checking your credentials and redirecting you to the right place
          </div>
          {debugInfo && (
            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#666",
                fontFamily: "monospace",
                textAlign: "left",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              <strong>Debug Info:</strong>
              <br />
              {debugInfo}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  // Don't render anything if redirecting
  return null
}
