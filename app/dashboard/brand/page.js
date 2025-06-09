"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FaBullhorn,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaEye,
  FaEdit,
  FaBuilding,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa"

export default function BrandDashboard() {
  const [user, setUser] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("Checking brand authentication...")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      console.log("Brand auth response status:", response.status)
      const data = await response.json()
      console.log("Brand auth response data:", data)

      setAuthChecked(true)

      if (response.ok && data.authenticated && data.user) {
        if (data.user.role === "brand") {
          setUser(data.user)
          fetchCampaigns()
          console.log("Brand authenticated:", data.user)
        } else {
          console.log("User is not a brand, redirecting...")
          router.replace("/auth/signin")
        }
      } else {
        console.log("Not authenticated, redirecting to signin...")
        router.replace("/auth/signin")
      }
    } catch (error) {
      console.error("Brand auth check failed:", error)
      setError("Failed to check authentication")
      setAuthChecked(true)
      router.replace("/auth/signin")
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCampaigns(data.campaigns || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.replace("/")
    } catch (error) {
      console.error("Logout failed:", error)
      router.replace("/")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`

  // Show loading until auth is checked
  if (!authChecked || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(220, 38, 38, 0.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #dc2626",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "10px",
            }}
          >
            Loading Brand Dashboard...
          </div>
          <div style={{ color: "#666" }}>Verifying your credentials...</div>
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

  // Don't render dashboard content if not authenticated
  if (!user || user.role !== "brand") {
    return null
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(220, 38, 38, 0.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#dc2626",
              marginBottom: "10px",
            }}
          >
            Error Loading Dashboard
          </div>
          <div style={{ color: "#666", marginBottom: "20px" }}>{error}</div>
          <button
            onClick={() => router.replace("/auth/signin")}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            background: "white",
            padding: "20px 30px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.1)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "5px",
                background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              Welcome back, {user?.brandData?.companyName || user?.name}!
            </h1>
            <p style={{ color: "#666", margin: 0 }}>Manage your campaigns and connect with influencers</p>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <FaBuilding />
              Brand Account
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
              color: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(220, 38, 38, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <FaBullhorn size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: "2rem" }}>{campaigns.length}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>Total Campaigns</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f87171 0%, #fb923c 100%)",
              color: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(248, 113, 113, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <FaUsers size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: "2rem" }}>{campaigns.filter((c) => c.status === "active").length}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>Active Campaigns</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fca5a5 0%, #fdba74 100%)",
              color: "#7f1d1d",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(252, 165, 165, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <FaChartLine size={32} />
              <div>
                <h3 style={{ margin: 0, fontSize: "2rem" }}>0</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>Total Collaborations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.1)",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#991b1b" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <Link
              href="/campaigns/create"
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                color: "white",
                textDecoration: "none",
                padding: "15px 20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "600",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              <FaPlus /> Create Campaign
            </Link>
            <Link
              href="/dashboard/brand/find-influencers"
              style={{
                background: "linear-gradient(135deg, #f87171 0%, #fb923c 100%)",
                color: "white",
                textDecoration: "none",
                border: "none",
                padding: "15px 20px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              <FaSearch /> Find Influencers
            </Link>
            <button
              style={{
                background: "linear-gradient(135deg, #fca5a5 0%, #fdba74 100%)",
                color: "#7f1d1d",
                border: "none",
                padding: "15px 20px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
            >
              <FaChartLine /> View Analytics
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, color: "#991b1b" }}>Recent Campaigns</h2>
            <span
              style={{
                color: "#666",
                background: "#fef2f2",
                padding: "5px 15px",
                borderRadius: "20px",
                fontSize: "14px",
              }}
            >
              {campaigns.length} total
            </span>
          </div>

          {campaigns.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#666",
              }}
            >
              <FaBullhorn size={64} style={{ marginBottom: "20px", opacity: 0.3, color: "#dc2626" }} />
              <h3 style={{ color: "#991b1b", marginBottom: "10px" }}>No campaigns yet</h3>
              <p style={{ margin: 0, marginBottom: "20px" }}>
                Create your first campaign to start collaborating with influencers
              </p>
              <Link
                href="/campaigns/create"
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                  color: "white",
                  textDecoration: "none",
                  padding: "12px 24px",
                  borderRadius: "50px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaPlus /> Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  style={{
                    padding: "20px",
                    border: "1px solid #fecaca",
                    borderRadius: "12px",
                    background: "#fef2f2",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)"
                    e.target.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 10px 0", color: "#991b1b" }}>{campaign.title}</h3>
                      <p style={{ color: "#666", margin: "0 0 15px 0" }}>{campaign.description.substring(0, 150)}...</p>
                      <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#666" }}>
                        <div>
                          <strong>Budget:</strong> {formatPrice(campaign.budget.minBudget)} -{" "}
                          {formatPrice(campaign.budget.maxBudget)}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <span
                            style={{
                              marginLeft: "5px",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: campaign.status === "active" ? "#dcfce7" : "#fff3cd",
                              color: campaign.status === "active" ? "#166534" : "#854d0e",
                            }}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div>
                          <strong>Created:</strong> {formatDate(campaign.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                      <Link
                        href={`/campaigns/${campaign._id}`}
                        style={{
                          background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                          color: "white",
                          textDecoration: "none",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaEye /> View
                      </Link>
                      <button
                        style={{
                          background: "linear-gradient(135deg, #f87171 0%, #fb923c 100%)",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
