"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FaUsers,
  FaBullhorn,
  FaChartLine,
  FaEye,
  FaEdit,
  FaShieldAlt,
  FaSync,
  FaArrowUp,
  FaCheckCircle,
  FaBell,
  FaCog,
  FaServer,
  FaDatabase,
  FaChartBar,
  FaUserShield,
} from "react-icons/fa"

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState([
    { id: 1, type: "user", message: "New user registration", time: "10 minutes ago" },
    { id: 2, type: "campaign", message: "Campaign status updated", time: "1 hour ago" },
    { id: 3, type: "system", message: "System update completed", time: "3 hours ago" },
  ])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInfluencers: 0,
    totalBrands: 0,
    activeUsers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    draftCampaigns: 0,
    totalDrafts: 0,
    pendingDrafts: 0,
    approvedDrafts: 0,
    recentSignups: 0,
    systemHealth: "excellent",
    serverLoad: 32,
    databaseSize: "1.2 GB",
    apiRequests: 1543,
    errorRate: 0.05,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authChecked && user) {
      fetchStats()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [authChecked, user])

  const checkAuth = async () => {
    try {
      console.log("🔐 Checking admin authentication...")
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        console.log("❌ Auth failed, redirecting to login")
        router.push("/auth/admin/login")
        return
      }

      const data = await response.json()
      console.log("✅ Auth data:", data)

      if (data.success && data.user && data.user.role === "admin") {
        console.log("🎉 Admin authenticated successfully")
        setUser(data.user)
        setAuthChecked(true)
      } else {
        console.log("⚠️ User is not admin, redirecting")
        router.push("/auth/admin/login")
      }
    } catch (error) {
      console.error("💥 Auth check failed:", error)
      router.push("/auth/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (manual = false) => {
    try {
      if (manual) setRefreshing(true)
      console.log("📊 Fetching admin stats...")

      const response = await fetch("/api/admin/stats", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
          setLastUpdated(new Date())
          console.log("✅ Stats loaded:", data.stats)
        }
      } else {
        console.error("❌ Failed to fetch stats:", response.status)
      }
    } catch (error) {
      console.error("💥 Failed to fetch stats:", error)
    } finally {
      if (manual) setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchStats(true)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/auth/admin/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/auth/admin/login")
    }
  }

  const formatTime = (date) => {
    if (!date) return "Never"
    return date.toLocaleTimeString()
  }

  const getHealthColor = (health) => {
    switch (health) {
      case "excellent":
        return "#10b981"
      case "good":
        return "#f59e0b"
      case "warning":
        return "#f97316"
      case "critical":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const calculateGrowthRate = (current, total) => {
    if (total === 0) return 0
    return Math.round((current / total) * 100)
  }

  // Show loading while checking auth
  if (loading || !authChecked) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "3px solid var(--accent-gold)",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Verifying Admin Access...
            </div>
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>Version 34 - Advanced Admin Portal</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render dashboard if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark-bg)" }}>
      {/* Admin Header */}
      <header
        style={{
          background: "var(--dark-surface)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "15px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUserShield style={{ color: "white", fontSize: "18px" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "18px", margin: 0 }}>
                <span className="gradient-text">Admin Portal</span>
                <span
                  style={{
                    fontSize: "12px",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "var(--accent-gold)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    marginLeft: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  v34
                </span>
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "12px" }}>
                Last updated: {formatTime(lastUpdated)}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ position: "relative" }}>
              <button
                className="btn"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <FaBell style={{ color: "var(--text-muted)" }} />
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "var(--accent-gold)",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.length}
                </span>
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid #10b981",
                color: "#10b981",
                padding: "8px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaSync style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info">
                <div style={{ fontWeight: "500", fontSize: "14px" }}>{user.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>Administrator</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn"
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid var(--accent-gold)",
                color: "var(--accent-gold)",
                padding: "8px 12px",
                fontSize: "13px",
              }}
            >
              <FaShieldAlt style={{ marginRight: "6px" }} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div
        style={{
          background: "var(--dark-surface)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0 20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", overflowX: "auto", gap: "5px" }}>
            <button
              onClick={() => setActiveTab("overview")}
              className={`btn ${activeTab === "overview" ? "active" : ""}`}
              style={{
                background: activeTab === "overview" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "overview" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "overview" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "overview" ? "600" : "normal",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`btn ${activeTab === "users" ? "active" : ""}`}
              style={{
                background: activeTab === "users" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "users" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "users" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "users" ? "600" : "normal",
              }}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`btn ${activeTab === "campaigns" ? "active" : ""}`}
              style={{
                background: activeTab === "campaigns" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "campaigns" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "campaigns" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "campaigns" ? "600" : "normal",
              }}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`btn ${activeTab === "content" ? "active" : ""}`}
              style={{
                background: activeTab === "content" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "content" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "content" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "content" ? "600" : "normal",
              }}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`btn ${activeTab === "system" ? "active" : ""}`}
              style={{
                background: activeTab === "system" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "system" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "system" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "system" ? "600" : "normal",
              }}
            >
              System
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`btn ${activeTab === "settings" ? "active" : ""}`}
              style={{
                background: activeTab === "settings" ? "rgba(245, 158, 11, 0.1)" : "transparent",
                border: "none",
                borderBottom: activeTab === "settings" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                borderRadius: 0,
                padding: "15px 20px",
                color: activeTab === "settings" ? "var(--accent-gold)" : "var(--text-muted)",
                fontWeight: activeTab === "settings" ? "600" : "normal",
              }}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: "30px 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* System Health Banner */}
              <div
                className="card"
                style={{
                  marginBottom: "30px",
                  background: `linear-gradient(135deg, ${getHealthColor(stats.systemHealth)}15, ${getHealthColor(
                    stats.systemHealth,
                  )}05)`,
                  border: `1px solid ${getHealthColor(stats.systemHealth)}30`,
                }}
              >
                <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px" }}>
                  <FaCheckCircle style={{ color: getHealthColor(stats.systemHealth), fontSize: "24px" }} />
                  <div>
                    <h3 style={{ margin: 0, color: getHealthColor(stats.systemHealth), textTransform: "capitalize" }}>
                      System Status: {stats.systemHealth}
                    </h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
                      All systems operational • Database connected • API responsive
                    </p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <Link
                      href="/admin/system"
                      className="btn"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: "var(--text-muted)",
                        padding: "6px 12px",
                        fontSize: "13px",
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "40px",
                }}
              >
                {/* Total Users */}
                <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                  <div style={{ color: "white", padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <FaUsers size={32} />
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaArrowUp size={12} />
                        <span style={{ fontSize: "12px", opacity: 0.9 }}>+{stats.recentSignups}</span>
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalUsers}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>Total Users</p>
                    <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.8 }}>
                      {stats.activeUsers} active users ({calculateGrowthRate(stats.activeUsers, stats.totalUsers)}%)
                    </div>
                  </div>
                </div>

                {/* Influencers */}
                <div className="card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                  <div style={{ color: "white", padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <FaUsers size={32} />
                      <FaCheckCircle size={16} style={{ opacity: 0.8 }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalInfluencers}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>Influencers</p>
                    <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.8 }}>
                      {calculateGrowthRate(stats.totalInfluencers, stats.totalUsers)}% of total users
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                  <div style={{ color: "white", padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <FaUsers size={32} />
                      <FaCheckCircle size={16} style={{ opacity: 0.8 }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalBrands}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>Brands</p>
                    <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.8 }}>
                      {calculateGrowthRate(stats.totalBrands, stats.totalUsers)}% of total users
                    </div>
                  </div>
                </div>

                {/* Campaigns */}
                <div className="card">
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <div style={{ fontSize: "2.5rem", color: "var(--accent-gold)" }}>
                        <FaBullhorn />
                      </div>
                      <div style={{ textAlign: "right", fontSize: "12px", color: "var(--text-muted)" }}>
                        <div>{stats.activeCampaigns} active</div>
                        <div>{stats.draftCampaigns} drafts</div>
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalCampaigns}</h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "16px" }}>Total Campaigns</p>
                    <div
                      style={{
                        marginTop: "15px",
                        background: "#f3f4f6",
                        borderRadius: "8px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--accent-gold)",
                          height: "100%",
                          width: `${calculateGrowthRate(stats.activeCampaigns, stats.totalCampaigns)}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Campaigns */}
                <div className="card">
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <div style={{ fontSize: "2.5rem", color: "#10b981" }}>
                        <FaChartLine />
                      </div>
                      <FaArrowUp style={{ color: "#10b981", fontSize: "16px" }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.activeCampaigns}</h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "16px" }}>Active Campaigns</p>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {stats.completedCampaigns} completed campaigns
                    </div>
                  </div>
                </div>

                {/* Drafts */}
                <div className="card">
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                      }}
                    >
                      <div style={{ fontSize: "2.5rem", color: "#f59e0b" }}>
                        <FaEdit />
                      </div>
                      <div style={{ textAlign: "right", fontSize: "12px", color: "var(--text-muted)" }}>
                        <div>{stats.pendingDrafts} pending</div>
                        <div>{stats.approvedDrafts} approved</div>
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700" }}>{stats.totalDrafts}</h3>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "16px" }}>Content Drafts</p>
                    <div
                      style={{
                        marginTop: "15px",
                        background: "#f3f4f6",
                        borderRadius: "8px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "#10b981",
                          height: "100%",
                          width: `${calculateGrowthRate(stats.approvedDrafts, stats.totalDrafts)}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Metrics */}
              <div style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>System Metrics</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div className="card">
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <FaServer style={{ color: "var(--accent-gold)" }} />
                        <h3 style={{ margin: 0, fontSize: "16px" }}>Server Load</h3>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.serverLoad}%</div>
                      <div
                        style={{
                          marginTop: "10px",
                          background: "#f3f4f6",
                          borderRadius: "8px",
                          height: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            background:
                              stats.serverLoad > 80 ? "#ef4444" : stats.serverLoad > 60 ? "#f59e0b" : "#10b981",
                            height: "100%",
                            width: `${stats.serverLoad}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <FaDatabase style={{ color: "var(--accent-gold)" }} />
                        <h3 style={{ margin: 0, fontSize: "16px" }}>Database Size</h3>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.databaseSize}</div>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                        Last backup: 3 hours ago
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <FaChartBar style={{ color: "var(--accent-gold)" }} />
                        <h3 style={{ margin: 0, fontSize: "16px" }}>API Requests</h3>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.apiRequests}</div>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                        Today's total
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <FaCheckCircle style={{ color: "var(--accent-gold)" }} />
                        <h3 style={{ margin: 0, fontSize: "16px" }}>Error Rate</h3>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.errorRate}%</div>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                        Last 24 hours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Quick Actions</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "30px",
                  }}
                >
                  {/* Users Management */}
                  <div className="card">
                    <div style={{ padding: "28px" }}>
                      <h2
                        style={{
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "22px",
                        }}
                      >
                        <FaUsers style={{ color: "var(--accent-gold)" }} />
                        User Management
                      </h2>
                      <p style={{ color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.6" }}>
                        Comprehensive user management with role-based access control and activity monitoring
                      </p>
                      <div
                        style={{
                          marginBottom: "24px",
                          padding: "12px",
                          background: "rgba(245, 158, 11, 0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                          <strong>{stats.totalUsers}</strong> total users • <strong>{stats.activeUsers}</strong> active
                        </div>
                      </div>
                      <Link
                        href="/admin/users"
                        className="btn"
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                          color: "var(--dark-bg)",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          textDecoration: "none",
                          padding: "12px",
                        }}
                      >
                        <FaEye /> Manage Users
                      </Link>
                    </div>
                  </div>

                  {/* Campaign Management */}
                  <div className="card">
                    <div style={{ padding: "28px" }}>
                      <h2
                        style={{
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "22px",
                        }}
                      >
                        <FaBullhorn style={{ color: "var(--accent-gold)" }} />
                        Campaign Management
                      </h2>
                      <p style={{ color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.6" }}>
                        Monitor campaigns, track performance, and manage brand-influencer collaborations
                      </p>
                      <div
                        style={{
                          marginBottom: "24px",
                          padding: "12px",
                          background: "rgba(245, 158, 11, 0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                          <strong>{stats.activeCampaigns}</strong> active • <strong>{stats.draftCampaigns}</strong>{" "}
                          drafts
                        </div>
                      </div>
                      <Link
                        href="/admin/campaigns"
                        className="btn"
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                          color: "var(--dark-bg)",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          textDecoration: "none",
                          padding: "12px",
                        }}
                      >
                        <FaEye /> Manage Campaigns
                      </Link>
                    </div>
                  </div>

                  {/* Content Management */}
                  <div className="card">
                    <div style={{ padding: "28px" }}>
                      <h2
                        style={{
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "22px",
                        }}
                      >
                        <FaEdit style={{ color: "var(--accent-gold)" }} />
                        Content Management
                      </h2>
                      <p style={{ color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.6" }}>
                        Review content drafts, moderate submissions, and ensure quality standards
                      </p>
                      <div
                        style={{
                          marginBottom: "24px",
                          padding: "12px",
                          background: "rgba(245, 158, 11, 0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                          <strong>{stats.pendingDrafts}</strong> pending review •{" "}
                          <strong>{stats.approvedDrafts}</strong> approved
                        </div>
                      </div>
                      <Link
                        href="/admin/drafts"
                        className="btn"
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                          color: "var(--dark-bg)",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          textDecoration: "none",
                          padding: "12px",
                        }}
                      >
                        <FaEye /> Manage Content
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>User Management</h2>
                <Link
                  href="/admin/users"
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                    color: "var(--dark-bg)",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  View All Users
                </Link>
              </div>
              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Recent Users</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>User</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Role</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Joined</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "var(--gradient-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                JD
                              </div>
                              <div>
                                <div style={{ fontWeight: "500" }}>John Doe</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>john@example.com</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "10px" }}>Influencer</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-emerald)",
                                color: "white",
                              }}
                            >
                              Active
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>2 days ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/users/123"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "var(--gradient-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                JS
                              </div>
                              <div>
                                <div style={{ fontWeight: "500" }}>Jane Smith</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>jane@example.com</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "10px" }}>Brand</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-emerald)",
                                color: "white",
                              }}
                            >
                              Active
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>3 days ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/users/124"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>Campaign Management</h2>
                <Link
                  href="/admin/campaigns"
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                    color: "var(--dark-bg)",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  View All Campaigns
                </Link>
              </div>
              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Recent Campaigns</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>Campaign</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Brand</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Created</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>Summer Collection Launch</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fashion, Lifestyle</div>
                          </td>
                          <td style={{ padding: "10px" }}>Fashion Brand Co.</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-emerald)",
                                color: "white",
                              }}
                            >
                              Active
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>1 week ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/campaigns/123"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>Product Review Campaign</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tech, Gadgets</div>
                          </td>
                          <td style={{ padding: "10px" }}>Tech Innovations Inc.</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-gold)",
                                color: "white",
                              }}
                            >
                              Draft
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>2 days ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/campaigns/124"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>Content Management</h2>
                <Link
                  href="/admin/drafts"
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                    color: "var(--dark-bg)",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  View All Content
                </Link>
              </div>
              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Pending Review</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>Content</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Creator</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Campaign</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Submitted</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>Product Showcase Video</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Video, 2:45</div>
                          </td>
                          <td style={{ padding: "10px" }}>@influencer1</td>
                          <td style={{ padding: "10px" }}>Summer Collection</td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>2 hours ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/drafts/123"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>Product Review Post</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Image, Caption</div>
                          </td>
                          <td style={{ padding: "10px" }}>@influencer2</td>
                          <td style={{ padding: "10px" }}>Tech Review</td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>5 hours ago</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <Link
                              href="/admin/drafts/124"
                              className="btn"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                              }}
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>System Health</h2>
                <button
                  onClick={handleRefresh}
                  className="btn"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid #10b981",
                    color: "#10b981",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  <FaSync style={{ marginRight: "6px" }} /> Refresh Status
                </button>
              </div>

              <div className="card" style={{ marginBottom: "20px" }}>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>System Status</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>API</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "var(--accent-emerald)",
                          }}
                        ></div>
                        <div style={{ fontWeight: "500" }}>Operational</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Database</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "var(--accent-emerald)",
                          }}
                        ></div>
                        <div style={{ fontWeight: "500" }}>Operational</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>
                        Authentication
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "var(--accent-emerald)",
                          }}
                        ></div>
                        <div style={{ fontWeight: "500" }}>Operational</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "5px" }}>Storage</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "var(--accent-emerald)",
                          }}
                        ></div>
                        <div style={{ fontWeight: "500" }}>Operational</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Recent System Events</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>Event</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>Database Backup</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Automated backup</div>
                          </td>
                          <td style={{ padding: "10px" }}>Maintenance</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-emerald)",
                                color: "white",
                              }}
                            >
                              Completed
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>3 hours ago</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px" }}>
                            <div style={{ fontWeight: "500" }}>System Update</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Version 34 deployment</div>
                          </td>
                          <td style={{ padding: "10px" }}>Update</td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                background: "var(--accent-emerald)",
                                color: "white",
                              }}
                            >
                              Completed
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontSize: "14px", color: "var(--text-muted)" }}>1 day ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>Admin Settings</h2>
                <button
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                    color: "var(--dark-bg)",
                    padding: "8px 16px",
                    fontSize: "14px",
                  }}
                >
                  <FaCog style={{ marginRight: "6px" }} /> Save Changes
                </button>
              </div>

              <div className="card" style={{ marginBottom: "20px" }}>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Account Settings</h3>
                  <div style={{ display: "grid", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>
                        Admin Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ""}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>System Configuration</h3>
                  <div style={{ display: "grid", gap: "20px" }}>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input type="checkbox" defaultChecked />
                        <span>Enable email notifications</span>
                      </label>
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input type="checkbox" defaultChecked />
                        <span>Auto-approve verified users</span>
                      </label>
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input type="checkbox" />
                        <span>Maintenance mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "300px",
            background: "var(--dark-surface)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "15px",
            zIndex: 1000,
            display: "none", // Hidden by default, can be toggled
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Recent Notifications</h4>
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "14px",
              }}
            >
              <div style={{ fontWeight: "500" }}>{notification.message}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>{notification.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
