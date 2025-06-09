"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FaArrowLeft,
  FaUser,
  FaBullhorn,
  FaCalendar,
  FaCheck,
  FaTimes,
  FaEye,
  FaInstagram,
  FaGlobe,
  FaClock,
  FaImage,
  FaVideo,
  FaFileAlt,
} from "react-icons/fa"

export default function AdminDraftDetail({ params }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && id) {
      fetchDraft()
    }
  }, [user, id])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        router.push("/auth/admin/login")
        return
      }

      const data = await response.json()
      if (data.success && data.user && data.user.role === "admin") {
        setUser(data.user)
      } else {
        router.push("/auth/admin/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/admin/drafts/${id}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDraft(data.draft)
          setFeedback(data.draft.feedback || "")
          setAdminNotes(data.draft.adminNotes || "")
        }
      } else {
        router.push("/admin/drafts")
      }
    } catch (error) {
      console.error("Failed to fetch draft:", error)
      router.push("/admin/drafts")
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this draft?`)) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/drafts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          feedback,
          adminNotes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDraft(data.draft)
        }
      }
    } catch (error) {
      console.error("Failed to update draft:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "approved":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      case "published":
        return "#8b5cf6"
      default:
        return "#6b7280"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock />
      case "approved":
        return <FaCheck />
      case "rejected":
        return <FaTimes />
      case "published":
        return <FaGlobe />
      default:
        return <FaClock />
    }
  }

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "image":
        return <FaImage />
      case "video":
        return <FaVideo />
      case "story":
        return <FaInstagram />
      default:
        return <FaFileAlt />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
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
              Loading Draft Details...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Draft Not Found</h2>
            <p style={{ color: "var(--text-muted)" }}>The requested draft could not be found.</p>
            <Link href="/admin/drafts" className="btn" style={{ marginTop: "20px" }}>
              Back to Drafts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark-bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--dark-surface)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <Link
              href="/admin/drafts"
              className="btn"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "var(--text-muted)",
                padding: "8px 12px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaArrowLeft /> Back to Drafts
            </Link>
            <div>
              <h1 style={{ fontSize: "28px", margin: 0 }}>
                <span className="gradient-text">Draft Review</span>
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>Review and manage content submission</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "500",
                background: `${getStatusColor(draft.status)}20`,
                color: getStatusColor(draft.status),
                textTransform: "capitalize",
              }}
            >
              {getStatusIcon(draft.status)}
              {draft.status}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {draft.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updating}
                    className="btn"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid #10b981",
                      color: "#10b981",
                      padding: "8px 16px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating}
                    className="btn"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "30px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
            {/* Left Column - Draft Content */}
            <div>
              {/* Draft Details */}
              <div className="card" style={{ marginBottom: "30px" }}>
                <div style={{ padding: "30px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "24px", color: "var(--accent-gold)" }}>
                      {getContentTypeIcon(draft.contentType)}
                    </div>
                    <h2 style={{ fontSize: "24px", margin: 0 }}>{draft.title || "Untitled Draft"}</h2>
                  </div>

                  {draft.description && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "var(--text-muted)" }}>
                        Description
                      </h3>
                      <p style={{ lineHeight: "1.6" }}>{draft.description}</p>
                    </div>
                  )}

                  {draft.caption && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "var(--text-muted)" }}>Caption</h3>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          padding: "15px",
                          borderRadius: "8px",
                          borderLeft: "3px solid var(--accent-gold)",
                        }}
                      >
                        <p style={{ lineHeight: "1.6", margin: 0 }}>{draft.caption}</p>
                      </div>
                    </div>
                  )}

                  {draft.hashtags && draft.hashtags.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "var(--text-muted)" }}>Hashtags</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {draft.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            style={{
                              background: "rgba(245, 158, 11, 0.1)",
                              color: "var(--accent-gold)",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                            }}
                          >
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.mediaUrls && draft.mediaUrls.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "var(--text-muted)" }}>
                        Media Files
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "15px",
                        }}
                      >
                        {draft.mediaUrls.map((url, index) => (
                          <div
                            key={index}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            {url.includes("video") || url.includes(".mp4") ? (
                              <video
                                src={url}
                                controls
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                              />
                            ) : (
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Media ${index + 1}`}
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Feedback */}
              <div className="card">
                <div style={{ padding: "30px" }}>
                  <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Admin Review</h3>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>
                      Feedback for Creator
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the creator..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>
                      Internal Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Internal notes (not visible to creator)..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleStatusUpdate(draft.status)}
                    disabled={updating}
                    className="btn"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-gold), #f97316)",
                      color: "var(--dark-bg)",
                      padding: "10px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {updating ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata */}
            <div>
              {/* Creator Info */}
              <div className="card" style={{ marginBottom: "20px" }}>
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaUser style={{ color: "var(--accent-gold)" }} />
                    Creator
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: draft.influencerId?.profilePicture
                          ? `url(${draft.influencerId.profilePicture})`
                          : "var(--gradient-primary)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {!draft.influencerId?.profilePicture &&
                        (draft.influencerId?.name?.charAt(0) || "U").toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: "500", fontSize: "16px" }}>
                        {draft.influencerId?.name || "Unknown Creator"}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        @{draft.influencerId?.instagramUsername || "unknown"}
                      </div>
                    </div>
                  </div>

                  {draft.influencerId?.followerCount && (
                    <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      <strong>{draft.influencerId.followerCount.toLocaleString()}</strong> followers
                    </div>
                  )}

                  <Link
                    href={`/admin/users/${draft.influencerId?._id}`}
                    className="btn"
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "var(--text-primary)",
                      padding: "8px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <FaEye /> View Profile
                  </Link>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="card" style={{ marginBottom: "20px" }}>
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaBullhorn style={{ color: "var(--accent-gold)" }} />
                    Campaign
                  </h3>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ fontWeight: "500", fontSize: "16px", marginBottom: "5px" }}>
                      {draft.campaignId?.title || "Unknown Campaign"}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "10px" }}>
                      {draft.campaignId?.brand || "Unknown Brand"}
                    </div>
                    {draft.campaignId?.description && (
                      <p style={{ fontSize: "14px", lineHeight: "1.5", color: "var(--text-muted)" }}>
                        {draft.campaignId.description.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  {draft.campaignId?.categories && (
                    <div style={{ marginBottom: "15px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {draft.campaignId.categories.map((category, index) => (
                          <span
                            key={index}
                            style={{
                              background: "rgba(245, 158, 11, 0.1)",
                              color: "var(--accent-gold)",
                              padding: "2px 6px",
                              borderRadius: "10px",
                              fontSize: "11px",
                            }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/admin/campaigns/${draft.campaignId?._id}`}
                    className="btn"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "var(--text-primary)",
                      padding: "8px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <FaEye /> View Campaign
                  </Link>
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaCalendar style={{ color: "var(--accent-gold)" }} />
                    Timeline
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--accent-gold)",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "500" }}>Submitted</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {formatDate(draft.createdAt)}
                        </div>
                      </div>
                    </div>

                    {draft.reviewedAt && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: getStatusColor(draft.status),
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500" }}>Reviewed</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {formatDate(draft.reviewedAt)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--text-muted)",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "500" }}>Last Updated</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {formatDate(draft.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
