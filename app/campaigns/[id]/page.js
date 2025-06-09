"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaArrowLeft, FaUsers, FaCalendar, FaDollarSign, FaEye, FaUserPlus, FaInstagram, FaHeart } from "react-icons/fa"

export default function CampaignDetails({ params }) {
  const unwrappedParams = React.use(params)
  const [campaign, setCampaign] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviting, setInviting] = useState({})
  const router = useRouter()

  useEffect(() => {
    console.log("Campaign Details - ID:", unwrappedParams.id)
    fetchCampaign()
    fetchInfluencers()
  }, [unwrappedParams.id])

  const fetchCampaign = async () => {
    try {
      console.log("Fetching campaign:", unwrappedParams.id)
      const response = await fetch(`/api/campaigns/${unwrappedParams.id}`, {
        credentials: "include",
      })
      console.log("Campaign response status:", response.status)

      const data = await response.json()
      console.log("Campaign response data:", data)

      if (response.ok && data.success) {
        setCampaign(data.campaign)
        console.log("Campaign set successfully:", data.campaign)
      } else {
        setError(data.error || "Failed to fetch campaign")
        console.error("Campaign fetch failed:", data.error)
      }
    } catch (err) {
      console.error("Campaign fetch error:", err)
      setError("Failed to fetch campaign")
    }
  }

  const fetchInfluencers = async () => {
    try {
      console.log("Fetching influencers for campaign:", unwrappedParams.id)
      const response = await fetch(`/api/campaigns/${unwrappedParams.id}/recommendations`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setInfluencers(data.influencers || [])
        console.log("Influencers loaded:", data.influencers?.length || 0)
      } else {
        console.error("Influencers fetch error:", data.error)
      }
    } catch (err) {
      console.error("Failed to fetch influencers:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (influencerId) => {
    setInviting({ ...inviting, [influencerId]: true })

    try {
      const response = await fetch(`/api/campaigns/${unwrappedParams.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ influencerId }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh campaign data to show updated invitations
        fetchCampaign()
        // Update influencer list to show invited status
        setInfluencers((prev) => prev.map((inf) => (inf._id === influencerId ? { ...inf, invited: true } : inf)))
      } else {
        alert(data.error || "Failed to send invitation")
      }
    } catch (err) {
      console.error("Invite error:", err)
      alert("Failed to send invitation")
    } finally {
      setInviting({ ...inviting, [influencerId]: false })
    }
  }

  const formatPrice = (price) => `₹${price?.toLocaleString("en-IN") || "0"}`

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFollowers = (count) => {
    if (!count) return "0"
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Loading Campaign...
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
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Campaign ID: {unwrappedParams.id}</p>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Check browser console for more details</p>
            </div>
            <Link href="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "var(--primary-pink)" }}>Campaign Not Found</h2>
            <p style={{ color: "var(--text-muted)" }}>
              The campaign you're looking for doesn't exist or you don't have access to it.
            </p>
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Campaign ID: {unwrappedParams.id}</p>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Check browser console for debugging information
              </p>
            </div>
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
              {campaign.title || "Untitled Campaign"}
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Status: {campaign.status || "Unknown"} • Created: {formatDate(campaign.createdAt)}
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
                {campaign.description || "No description available"}
              </p>

              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}
              >
                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaDollarSign /> Budget Range
                  </h4>
                  <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {formatPrice(campaign.budget?.minBudget)} - {formatPrice(campaign.budget?.maxBudget)}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaCalendar /> Application Deadline
                  </h4>
                  <p style={{ fontSize: "1.1rem" }}>{formatDate(campaign.timeline?.applicationDeadline)}</p>
                </div>

                <div>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>
                    <FaUsers /> Content Type
                  </h4>
                  <p style={{ fontSize: "1.1rem", textTransform: "capitalize" }}>
                    {campaign.requirements?.contentType || "N/A"} ({campaign.requirements?.numberOfPosts || 0} post
                    {(campaign.requirements?.numberOfPosts || 0) > 1 ? "s" : ""})
                  </p>
                </div>
              </div>

              {campaign.filters?.categories?.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ color: "var(--primary-purple)", marginBottom: "10px" }}>Target Categories</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {campaign.filters.categories.map((category) => (
                      <span
                        key={category}
                        style={{
                          background: "var(--gradient-primary)",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            <div className="card">
              <h2 style={{ marginBottom: "20px" }}>Recommended Influencers</h2>

              {influencers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <FaUsers size={48} style={{ marginBottom: "20px", opacity: 0.5 }} />
                  <h3>No matching influencers found</h3>
                  <p>Try adjusting your campaign filters to find more influencers</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {influencers.map((influencer) => (
                    <div
                      key={influencer._id}
                      className="card"
                      style={{ background: "var(--dark-surface)", padding: "20px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "20px", flex: 1 }}>
                          {/* Profile Picture */}
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              background: "var(--gradient-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2rem",
                              color: "white",
                            }}
                          >
                            <FaInstagram />
                          </div>

                          {/* Influencer Info */}
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: "0 0 5px 0" }}>@{influencer.instagramUsername || "unknown"}</h3>
                            <p style={{ color: "var(--text-muted)", margin: "0 0 15px 0" }}>
                              {influencer.name || "Unknown"} • {influencer.category || "N/A"}
                            </p>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                gap: "15px",
                              }}
                            >
                              <div>
                                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Followers</span>
                                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>
                                  {formatFollowers(influencer.followers)}
                                </p>
                              </div>
                              <div>
                                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Engagement</span>
                                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>
                                  {influencer.engagementRate?.toFixed(1) || "N/A"}%
                                </p>
                              </div>
                              <div>
                                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Avg. Likes</span>
                                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>
                                  <FaHeart style={{ color: "var(--primary-pink)", marginRight: "5px" }} />
                                  {formatFollowers(influencer.avgLikes)}
                                </p>
                              </div>
                              <div>
                                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Estimated Price</span>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                    color: "var(--accent-emerald)",
                                  }}
                                >
                                  {formatPrice(influencer.estimatedPrice || 0)}
                                </p>
                                <small style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                  Based on engagement & followers
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {influencer.invited ||
                          (campaign.invitations &&
                            campaign.invitations.some((inv) => inv.influencerId === influencer._id)) ? (
                            <button className="btn btn-secondary" disabled>
                              Invited
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInvite(influencer._id)}
                              disabled={inviting[influencer._id]}
                              className="btn btn-primary"
                            >
                              <FaUserPlus />
                              {inviting[influencer._id] ? "Inviting..." : "Invite"}
                            </button>
                          )}
                          <Link href={`/i/${influencer.slug}`} target="_blank" className="btn btn-secondary">
                            <FaEye /> View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Campaign Stats */}
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "20px" }}>Campaign Stats</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Invitations</span>
                  <span style={{ fontWeight: "bold" }}>{campaign.invitations?.length || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Accepted</span>
                  <span style={{ fontWeight: "bold", color: "var(--accent-emerald)" }}>
                    {campaign.invitations?.filter((inv) => inv.status === "accepted").length || 0}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Pending</span>
                  <span style={{ fontWeight: "bold", color: "var(--accent-gold)" }}>
                    {campaign.invitations?.filter((inv) => inv.status === "pending").length || 0}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Rejected</span>
                  <span style={{ fontWeight: "bold", color: "var(--primary-pink)" }}>
                    {campaign.invitations?.filter((inv) => inv.status === "rejected").length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 style={{ marginBottom: "20px" }}>Timeline</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Application Deadline</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{formatDate(campaign.timeline?.applicationDeadline)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Content Deadline</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{formatDate(campaign.timeline?.contentDeadline)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Publish Date</span>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{formatDate(campaign.timeline?.publishDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
