"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaUsers, FaBullhorn, FaFileAlt, FaSignOutAlt, FaUserShield, FaCog } from "react-icons/fa"

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInfluencers: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDrafts: 0,
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats()
      fetchRecentData()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.authenticated && data.user && data.user.role === "admin") {
        setUser(data.user)
      } else {
        console.log("Not admin or auth failed:", data)
        router.push("/auth/admin/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Authentication failed")
      router.push("/auth/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      } else {
        console.error("❌ Failed to fetch stats:", response.status)
        const errorData = await response.json()
        console.error("❌ Stats error:", errorData)
      }
    } catch (error) {
      console.error("❌ Stats fetch error:", error)
    }
  }

  const fetchRecentData = async () => {
    try {
      // Fetch recent users
      const usersResponse = await fetch("/api/admin/users?limit=5", {
        credentials: "include",
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        if (usersData.success) {
          setRecentUsers(usersData.users || [])
        }
      }

      // Fetch recent campaigns
      const campaignsResponse = await fetch("/api/admin/campaigns?limit=5", {
        credentials: "include",
      })
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json()
        if (campaignsData.success) {
          setRecentCampaigns(campaignsData.campaigns || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch recent data:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/auth/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Loading Admin Dashboard...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--primary-pink)", fontSize: "18px", marginBottom: "20px" }}>Error: {error}</div>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", padding: "20px", background: "var(--dark-bg)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              Admin Portal 
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                padding: "8px 16px",
                background: "var(--primary-purple)",
                borderRadius: "20px",
                fontSize: "12px",
                color: "white",
                fontWeight: "600",
              }}
            >
              Admin Access
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: "30px" }}>
          <h3
            style={{
              marginBottom: "20px",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaCog /> Quick Actions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <Link
              href="/admin/users"
              className="btn"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--primary-purple), var(--primary-pink))",
                color: "white",
                border: "none",
              }}
            >
              <FaUsers /> Manage Users
            </Link>
            <Link
              href="/admin/campaigns"
              className="btn"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent-emerald), var(--accent-gold))",
                color: "white",
                border: "none",
              }}
            >
              <FaBullhorn /> Manage Campaigns
            </Link>
            <Link
              href="/admin/drafts"
              className="btn"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent-gold), var(--primary-pink))",
                color: "white",
                border: "none",
              }}
            >
              <FaFileAlt /> Review Drafts
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            className="card"
            style={{ background: "linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(139, 69, 19, 0.05))" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, var(--primary-purple), var(--primary-pink))",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(139, 69, 19, 0.3)",
                }}
              >
                <FaUsers style={{ fontSize: "28px", color: "white" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "2rem" }}>{stats.totalUsers}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: "500" }}>Total Users</p>
                <div style={{ fontSize: "12px", color: "var(--accent-emerald)", marginTop: "4px" }}>
                  All registered users
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ background: "linear-gradient(135deg, rgba(228, 64, 95, 0.1), rgba(228, 64, 95, 0.05))" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, var(--primary-pink), var(--accent-gold))",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(228, 64, 95, 0.3)",
                }}
              >
                <FaUserShield style={{ fontSize: "28px", color: "white" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "2rem" }}>{stats.totalInfluencers}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: "500" }}>Influencers</p>
                <div style={{ fontSize: "12px", color: "var(--primary-pink)", marginTop: "4px" }}>Content creators</div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, var(--accent-emerald), var(--primary-purple))",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                }}
              >
                <FaBullhorn style={{ fontSize: "28px", color: "white" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "2rem" }}>{stats.totalBrands}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: "500" }}>Brands</p>
                <div style={{ fontSize: "12px", color: "var(--accent-emerald)", marginTop: "4px" }}>
                  Marketing partners
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, var(--accent-gold), var(--primary-pink))",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                }}
              >
                <FaFileAlt style={{ fontSize: "28px", color: "white" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "2rem" }}>{stats.totalCampaigns}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: "500" }}>Campaigns</p>
                <div style={{ fontSize: "12px", color: "var(--accent-gold)", marginTop: "4px" }}>
                  {stats.activeCampaigns} active now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
          {/* Recent Users */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, color: "var(--text-primary)" }}>Recent Users</h3>
              <Link
                href="/admin/users"
                style={{
                  color: "var(--primary-purple)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                View All
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No users found</div>
            ) : (
              <div>
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      background: "linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(139, 69, 19, 0.02))",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--primary-purple), var(--primary-pink))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>{user.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "15px",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        background:
                          user.role === "influencer"
                            ? "linear-gradient(135deg, #E4405F, #fd1d1d)"
                            : user.role === "brand"
                              ? "linear-gradient(135deg, var(--primary-purple), var(--primary-pink))"
                              : "linear-gradient(135deg, var(--accent-gold), #f59e0b)",
                        color: "white",
                      }}
                    >
                      {user.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Campaigns */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, color: "var(--text-primary)" }}>Recent Campaigns</h3>
              <Link
                href="/admin/campaigns"
                style={{
                  color: "var(--primary-purple)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                View All
              </Link>
            </div>

            {recentCampaigns.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No campaigns found</div>
            ) : (
              <div>
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      background: "linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(139, 69, 19, 0.02))",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>{campaign.title}</div>
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "capitalize",
                          background:
                            campaign.status === "active"
                              ? "linear-gradient(135deg, var(--accent-emerald), #059669)"
                              : campaign.status === "draft"
                                ? "linear-gradient(135deg, #6b7280, #4b5563)"
                                : campaign.status === "paused"
                                  ? "linear-gradient(135deg, var(--accent-gold), #f59e0b)"
                                  : "linear-gradient(135deg, var(--primary-pink), #dc2626)",
                          color: "white",
                        }}
                      >
                        {campaign.status}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                      {campaign.description.substring(0, 60)}...
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div>Brand: {campaign.brandId.name}</div>
                      <div>Created: {formatDate(campaign.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
