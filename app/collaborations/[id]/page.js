"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FaArrowLeft,
  FaCalendar,
  FaDollarSign,
  FaUpload,
  FaVideo,
  FaInstagram,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEdit,
} from "react-icons/fa"

export default function CollaborationDetails({ params }) {
  const unwrappedParams = React.use(params)
  const [collaboration, setCollaboration] = useState(null)
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDraftForm, setShowDraftForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCollaboration()
    fetchDrafts()
  }, [unwrappedParams.id])

  const fetchCollaboration = async () => {
    try {
      const response = await fetch(`/api/collaborations/${unwrappedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setCollaboration(data.collaboration)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch collaboration")
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`/api/collaborations/${unwrappedParams.id}/drafts`)
      const data = await response.json()

      if (data.success) {
        setDrafts(data.drafts)
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FaCheckCircle style={{ color: "var(--accent-emerald)" }} />
      case "rejected":
        return <FaTimesCircle style={{ color: "var(--primary-pink)" }} />
      case "under_review":
        return <FaHourglassHalf style={{ color: "var(--accent-gold)" }} />
      case "revision_requested":
        return <FaEdit style={{ color: "var(--primary-purple)" }} />
      default:
        return <FaHourglassHalf style={{ color: "var(--text-muted)" }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "var(--accent-emerald)"
      case "rejected":
        return "var(--primary-pink)"
      case "under_review":
        return "var(--accent-gold)"
      case "revision_requested":
        return "var(--primary-purple)"
      default:
        return "var(--text-muted)"
    }
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Loading Collaboration...
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
            <h2 style={{ color: "var(--primary-pink)" }}>Error</h2>
            <p style={{ color: "var(--text-muted)" }}>{error}</p>
            <Link href="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
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
          <Link href="/dashboard" className="btn btn-secondary">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>
              {collaboration.campaign.title}
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Collaboration with {collaboration.campaign.brand.brandData.companyName}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
          {/* Main Content */}
          <div>
            {/* Campaign Details */}
            <div className="card" style={{ marginBottom: "30px" }}>
              <h2 style={{ marginBottom: "20px" }}>Campaign Details</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                {collaboration.campaign.description}
              </p>

              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}
              >
                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaDollarSign /> Budget Range
                  </h4>
                  <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {formatPrice(collaboration.campaign.budget.minBudget)} -{" "}
                    {formatPrice(collaboration.campaign.budget.maxBudget)}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaCalendar /> Content Deadline
                  </h4>
                  <p style={{ fontSize: "1.1rem" }}>{formatDate(collaboration.campaign.timeline.contentDeadline)}</p>
                </div>

                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaInstagram /> Content Type
                  </h4>
                  <p style={{ fontSize: "1.1rem", textTransform: "capitalize" }}>
                    {collaboration.campaign.requirements.contentType} (
                    {collaboration.campaign.requirements.numberOfPosts} post
                    {collaboration.campaign.requirements.numberOfPosts > 1 ? "s" : ""})
                  </p>
                </div>
              </div>

              {collaboration.campaign.requirements.guidelines && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>Content Guidelines</h4>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {collaboration.campaign.requirements.guidelines}
                  </p>
                </div>
              )}
            </div>

            {/* Drafts Section */}
            <div className="card">
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
              >
                <h2 style={{ margin: 0 }}>Content Drafts</h2>
                <button onClick={() => setShowDraftForm(true)} className="btn btn-primary">
                  <FaUpload /> Submit New Draft
                </button>
              </div>

              {drafts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <FaUpload size={48} style={{ marginBottom: "20px", opacity: 0.5 }} />
                  <h3>No drafts submitted yet</h3>
                  <p>Submit your first draft to get feedback from the brand</p>
                  <button
                    onClick={() => setShowDraftForm(true)}
                    className="btn btn-primary"
                    style={{ marginTop: "20px" }}
                  >
                    <FaUpload /> Submit Draft
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {drafts.map((draft) => (
                    <div
                      key={draft._id}
                      className="card"
                      style={{ background: "var(--dark-surface)", padding: "20px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                            Draft #{draft.currentVersion || 1}
                            {getStatusIcon(draft.status)}
                          </h3>
                          <p
                            style={{
                              color: getStatusColor(draft.status),
                              margin: 0,
                              textTransform: "capitalize",
                              fontWeight: "600",
                            }}
                          >
                            {draft.status.replace("_", " ")}
                          </p>
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                          Submitted: {formatDate(draft.createdAt)}
                        </div>
                      </div>

                      <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ marginBottom: "10px" }}>Caption</h4>
                        <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{draft.content.caption}</p>
                      </div>

                      {draft.content.hashtags && draft.content.hashtags.length > 0 && (
                        <div style={{ marginBottom: "15px" }}>
                          <h4 style={{ marginBottom: "10px" }}>Hashtags</h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {draft.content.hashtags.map((hashtag, index) => (
                              <span
                                key={index}
                                style={{
                                  background: "var(--primary-purple)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  fontSize: "14px",
                                }}
                              >
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {draft.content.media && draft.content.media.length > 0 && (
                        <div style={{ marginBottom: "15px" }}>
                          <h4 style={{ marginBottom: "10px" }}>Media</h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                              gap: "10px",
                            }}
                          >
                            {draft.content.media.map((media, index) => (
                              <div
                                key={index}
                                style={{
                                  position: "relative",
                                  aspectRatio: "1",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  background: "var(--dark-bg)",
                                }}
                              >
                                {media.type === "image" ? (
                                  <img
                                    src={media.url || "/placeholder.svg?height=150&width=150"}
                                    alt="Draft media"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "var(--dark-surface)",
                                    }}
                                  >
                                    <FaVideo size={24} style={{ color: "var(--text-muted)" }} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Section */}
                      {draft.feedback && draft.feedback.length > 0 && (
                        <div
                          style={{
                            marginTop: "20px",
                            padding: "15px",
                            background: "var(--dark-bg)",
                            borderRadius: "8px",
                          }}
                        >
                          <h4 style={{ marginBottom: "15px" }}>Feedback</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {draft.feedback.map((feedback, index) => (
                              <div
                                key={index}
                                style={{ padding: "10px", background: "var(--dark-surface)", borderRadius: "6px" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                  <span style={{ fontWeight: "600", textTransform: "capitalize" }}>
                                    {feedback.from}
                                  </span>
                                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {formatDate(feedback.timestamp)}
                                  </span>
                                </div>
                                <p style={{ margin: 0, color: "var(--text-muted)" }}>{feedback.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        {draft.status === "revision_requested" && (
                          <button onClick={() => setShowDraftForm(true)} className="btn btn-primary">
                            <FaEdit /> Submit Revision
                          </button>
                        )}
                        {draft.status === "approved" && !draft.publication?.publishedAt && (
                          <button className="btn btn-primary">
                            <FaInstagram /> Mark as Posted
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Collaboration Status */}
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "20px" }}>Collaboration Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Status</span>
                  <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>{collaboration.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Drafts Submitted</span>
                  <span style={{ fontWeight: "bold" }}>{drafts.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Approved Drafts</span>
                  <span style={{ fontWeight: "bold", color: "var(--accent-emerald)" }}>
                    {drafts.filter((d) => d.status === "approved").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "20px" }}>Important Dates</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Content Deadline</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    {formatDate(collaboration.campaign.timeline.contentDeadline)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Publish Date</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    {formatDate(collaboration.campaign.timeline.publishDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Contact */}
            <div className="card">
              <h3 style={{ marginBottom: "20px" }}>Brand Contact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Company</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{collaboration.campaign.brand.brandData.companyName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Contact</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{collaboration.campaign.brand.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Submission Modal */}
      {showDraftForm && (
        <DraftSubmissionModal
          collaborationId={unwrappedParams.id}
          onClose={() => setShowDraftForm(false)}
          onSubmit={() => {
            setShowDraftForm(false)
            fetchDrafts()
          }}
        />
      )}
    </div>
  )
}

// Draft Submission Modal Component
function DraftSubmissionModal({ collaborationId, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState({
    caption: "",
    hashtags: [],
    mentions: [],
    media: [],
  })
  const [tempHashtag, setTempHashtag] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/collaborations/${collaborationId}/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      const data = await response.json()

      if (data.success) {
        onSubmit()
      } else {
        setError(data.error || "Failed to submit draft")
      }
    } catch (err) {
      setError("An error occurred while submitting draft")
    } finally {
      setLoading(false)
    }
  }

  const addHashtag = () => {
    if (tempHashtag.trim() && !draft.hashtags.includes(tempHashtag.trim())) {
      setDraft({
        ...draft,
        hashtags: [...draft.hashtags, tempHashtag.trim()],
      })
      setTempHashtag("")
    }
  }

  const removeHashtag = (index) => {
    setDraft({
      ...draft,
      hashtags: draft.hashtags.filter((_, i) => i !== index),
    })
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Submit Draft</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Caption *</label>
            <textarea
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              placeholder="Write your post caption..."
              className="form-input"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hashtags</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                value={tempHashtag}
                onChange={(e) => setTempHashtag(e.target.value)}
                placeholder="Add hashtag (without #)"
                className="form-input"
                style={{ flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addHashtag()
                  }
                }}
              />
              <button type="button" onClick={addHashtag} className="btn btn-secondary">
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {draft.hashtags.map((hashtag, index) => (
                <span
                  key={index}
                  style={{
                    background: "var(--primary-purple)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  #{hashtag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(index)}
                    style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Media Upload</label>
            <div
              style={{
                border: "2px dashed var(--primary-purple)",
                borderRadius: "8px",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <FaUpload size={32} style={{ marginBottom: "10px" }} />
              <p>Drag and drop your images/videos here</p>
              <p style={{ fontSize: "14px" }}>Or click to browse files</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Submitting..." : "Submit Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
