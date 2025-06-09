"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FaInstagram,
  FaUsers,
  FaHeart,
  FaEnvelope,
  FaEdit,
  FaUser,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa"

export default function InfluencerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      console.log("Auth response status:", response.status)
      const data = await response.json()
      console.log("Auth response data:", data)

      setAuthChecked(true)

      if (response.ok && data.authenticated && data.user) {
        if (data.user.role === "influencer") {
          setUser(data.user)
          console.log("Influencer authenticated:", data.user)

          // Check if profile exists
          await checkProfile()
        } else {
          console.log("User is not an influencer, redirecting...")
          router.replace("/auth/signin")
        }
      } else {
        console.log("Not authenticated, redirecting to signin...")
        router.replace("/auth/signin")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Failed to check authentication")
      setAuthChecked(true)
      router.replace("/auth/signin")
    } finally {
      setLoading(false)
    }
  }

  const checkProfile = async () => {
    try {
      const response = await fetch("/api/influencer/profile", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Profile API response:", data)
        if (data.success && data.profile) {
          setProfile(data.profile)
          console.log("Profile loaded:", data.profile)
        } else {
          console.log("No profile found")
        }
      } else {
        console.log("Profile fetch failed:", response.status)
      }
    } catch (error) {
      console.error("Profile check failed:", error)
    }
  }

  const formatNumber = (num) => {
    if (!num || num === 0) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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

  // Show loading until auth is checked
  if (!authChecked || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(225, 48, 108, 0.2)",
            textAlign: "center",
            maxWidth: "400px",
            margin: "0 20px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #e1306c",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "10px",
              wordWrap: "break-word",
            }}
          >
            Loading Dashboard...
          </div>
          <div style={{ color: "#666", fontSize: "0.9rem" }}>Verifying your credentials...</div>
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
  if (!user || user.role !== "influencer") {
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
          background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(225, 48, 108, 0.2)",
            textAlign: "center",
            maxWidth: "400px",
            margin: "0 20px",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#e1306c",
              marginBottom: "10px",
              wordWrap: "break-word",
            }}
          >
            Error Loading Dashboard
          </div>
          <div style={{ color: "#666", marginBottom: "20px", fontSize: "0.9rem" }}>{error}</div>
          <button
            onClick={() => router.replace("/auth/signin")}
            style={{
              background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
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
        background: "linear-gradient(135deg, #fdf2f8 0%, #ede9fe 100%)",
        padding: "15px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            background: "white",
            padding: "20px 25px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(225, 48, 108, 0.1)",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ flex: "1", minWidth: "250px" }}>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                marginBottom: "5px",
                background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                wordWrap: "break-word",
                lineHeight: "1.2",
              }}
            >
              Welcome back, @{user?.instagramUsername}!
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "clamp(0.8rem, 2vw, 1rem)" }}>
              Manage your collaborations and grow your influence
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "50px",
                fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
                fontWeight: "600",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <FaUser size={14} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name?.length > 15 ? `${user.name.substring(0, 15)}...` : user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
              }}
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!profile && (
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <FaExclamationTriangle size={24} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 5px 0" }}>Complete Your Profile</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Set up your influencer profile to start receiving brand collaboration invitations
              </p>
            </div>
            <Link
              href="/dashboard/influencer/onboarding"
              style={{
                background: "white",
                color: "#f59e0b",
                padding: "10px 20px",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaEdit size={14} />
              Complete Now
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(225, 48, 108, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaInstagram size={24} />
              <div style={{ overflow: "hidden" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  @{user?.instagramUsername}
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)" }}>Instagram Profile</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #d946ef 0%, #ec4899 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(217, 70, 239, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUsers size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}>
                  {profile?.followers ? formatNumber(profile.followers) : "0"}
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)" }}>Followers</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(192, 132, 252, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaHeart size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}>
                  {profile?.engagementRate ? `${profile.engagementRate}%` : "0%"}
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)" }}>Engagement Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: "25px",
          }}
        >
          {/* Campaign Invitations */}
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(225, 48, 108, 0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h2 style={{ margin: 0, color: "#9d174d", fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)" }}>
                Campaign Invitations
              </h2>
              <span
                style={{
                  color: "#666",
                  background: "#fdf2f8",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                }}
              >
                {invitations.length} total
              </span>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "40px 15px",
                color: "#666",
              }}
            >
              <FaEnvelope size={48} style={{ marginBottom: "15px", opacity: 0.3, color: "#e1306c" }} />
              <h3 style={{ color: "#9d174d", marginBottom: "8px", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
                {profile ? "No invitations yet" : "Complete your profile first"}
              </h3>
              <p style={{ margin: "0 0 15px 0", fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)", lineHeight: "1.4" }}>
                {profile
                  ? "Brands will send you collaboration invitations once they discover your profile"
                  : "Complete your profile to start receiving brand collaboration invitations"}
              </p>
              {!profile ? (
                <Link
                  href="/dashboard/influencer/onboarding"
                  style={{
                    background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
                  }}
                >
                  <FaEdit size={14} /> Complete Profile
                </Link>
              ) : (
                <Link
                  href={`/i/${profile.slug}`}
                  target="_blank"
                  style={{
                    background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
                  }}
                >
                  <FaInstagram size={14} /> View Media Kit
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Profile Summary */}
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(225, 48, 108, 0.1)",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ marginBottom: "15px", color: "#9d174d", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
                Profile Summary
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#666", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>Profile Status</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: profile ? "#10b981" : "#f59e0b",
                      background: profile ? "#ecfdf5" : "#fff7ed",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
                    }}
                  >
                    {profile ? "Complete" : "Incomplete"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#666", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>Username</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#9d174d",
                      fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "120px",
                    }}
                  >
                    @{user?.instagramUsername}
                  </span>
                </div>
                {profile && (
                  <>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}
                    >
                      <span style={{ color: "#666", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>Category</span>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#9d174d",
                          fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                          textTransform: "capitalize",
                        }}
                      >
                        {profile.category}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}
                    >
                      <span style={{ color: "#666", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>Followers</span>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#9d174d",
                          fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                        }}
                      >
                        {formatNumber(profile.followers)}
                      </span>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#666", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>Member Since</span>
                  <span style={{ fontWeight: "bold", color: "#9d174d", fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(225, 48, 108, 0.1)",
              }}
            >
              <h3 style={{ marginBottom: "15px", color: "#9d174d", fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {!profile ? (
                  <Link
                    href="/dashboard/influencer/onboarding"
                    style={{
                      background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                      boxSizing: "border-box",
                    }}
                  >
                    <FaEdit size={14} /> Complete Profile
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard/influencer/onboarding"
                      style={{
                        background: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                        boxSizing: "border-box",
                      }}
                    >
                      <FaEdit size={14} /> Edit Profile
                    </Link>
                    <Link
                      href={`/i/${profile.slug}`}
                      target="_blank"
                      style={{
                        background: "linear-gradient(135deg, #d946ef 0%, #ec4899 100%)",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                        boxSizing: "border-box",
                      }}
                    >
                      <FaInstagram size={14} /> View Media Kit
                    </Link>
                  </>
                )}
                <a
                  href={`https://instagram.com/${user?.instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                    boxSizing: "border-box",
                  }}
                >
                  <FaInstagram size={14} /> View Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
