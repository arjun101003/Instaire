"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./drafts.module.css"

export default function BrandDrafts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("campaignId")

  const [drafts, setDrafts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "all")

  useEffect(() => {
    fetchCampaigns()
    fetchDrafts()
  }, [campaignId])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns")
      }

      const data = await response.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
      } else {
        throw new Error(data.error || "Failed to load campaigns")
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const fetchDrafts = async () => {
    try {
      setLoading(true)

      let url = "/api/brand/drafts"
      if (campaignId) {
        url += `?campaignId=${campaignId}`
        setSelectedCampaign(campaignId)
      }

      const response = await fetch(url, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch drafts")
      }

      const data = await response.json()
      if (data.success) {
        setDrafts(data.drafts || [])
      } else {
        throw new Error(data.error || "Failed to load drafts")
      }
    } catch (error) {
      console.error("Error fetching drafts:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignChange = (e) => {
    const value = e.target.value
    setSelectedCampaign(value)

    if (value === "all") {
      router.push("/dashboard/brand/drafts")
    } else {
      router.push(`/dashboard/brand/drafts?campaignId=${value}`)
    }
  }

  const handleReviewDraft = async (draftId, status, feedback = "") => {
    try {
      const response = await fetch(`/api/brand/drafts/${draftId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status, feedback }),
      })

      if (!response.ok) {
        throw new Error("Failed to review draft")
      }

      const data = await response.json()
      if (data.success) {
        // Update the local state to reflect the change
        setDrafts(drafts.map((draft) => (draft._id === draftId ? { ...draft, status, feedback } : draft)))

        alert(`Draft ${status === "approved" ? "approved" : "sent back for changes"}!`)
      } else {
        throw new Error(data.error || "Failed to review draft")
      }
    } catch (error) {
      console.error("Error reviewing draft:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const promptForFeedback = (draftId) => {
    const feedback = prompt("Please provide feedback for the influencer:")
    if (feedback !== null) {
      handleReviewDraft(draftId, "changes_requested", feedback)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending Review</span>
      case "approved":
        return <span className={`${styles.badge} ${styles.approvedBadge}`}>Approved</span>
      case "changes_requested":
        return <span className={`${styles.badge} ${styles.changesBadge}`}>Changes Requested</span>
      case "posted":
        return <span className={`${styles.badge} ${styles.postedBadge}`}>Posted</span>
      default:
        return <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending</span>
    }
  }

  // Filter drafts based on selected tab and campaign
  const filteredDrafts = drafts.filter((draft) => {
    if (activeTab !== "all" && draft.status !== activeTab) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading drafts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDrafts} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Content Drafts</h1>
        <Link href="/dashboard/brand" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="campaignFilter">Filter by Campaign</label>
            <select
              id="campaignFilter"
              value={selectedCampaign}
              onChange={handleCampaignChange}
              className={styles.campaignSelect}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Drafts ({drafts.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "pending" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Review ({drafts.filter((d) => d.status === "pending").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "approved" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved ({drafts.filter((d) => d.status === "approved").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "changes_requested" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("changes_requested")}
        >
          Changes Requested ({drafts.filter((d) => d.status === "changes_requested").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "posted" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("posted")}
        >
          Posted ({drafts.filter((d) => d.status === "posted").length})
        </button>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📝</div>
          <h3>No drafts found</h3>
          <p>
            {activeTab === "all"
              ? "There are no content drafts submitted yet."
              : `You don't have any ${activeTab.replace("_", " ")} drafts.`}
          </p>
          <Link href="/dashboard/brand/campaigns" className={styles.createButton}>
            View My Campaigns
          </Link>
        </div>
      ) : (
        <div className={styles.draftsList}>
          {filteredDrafts.map((draft) => (
            <div key={draft._id} className={styles.draftCard}>
              <div className={styles.draftHeader}>
                <h3>{draft.title}</h3>
                {getStatusBadge(draft.status)}
              </div>

              <div className={styles.draftDetails}>
                <div className={styles.draftContent}>
                  <p className={styles.draftCaption}>
                    {draft.content.substring(0, 150)}
                    {draft.content.length > 150 ? "..." : ""}
                  </p>

                  {draft.mediaUrls && draft.mediaUrls.length > 0 && (
                    <div className={styles.mediaPreview}>
                      {draft.mediaUrls.slice(0, 3).map((url, index) => (
                        <div key={index} className={styles.mediaItem}>
                          <img src={url || "/placeholder.svg"} alt={`Media ${index + 1}`} />
                        </div>
                      ))}
                      {draft.mediaUrls.length > 3 && (
                        <div className={styles.mediaMore}>+{draft.mediaUrls.length - 3} more</div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.draftMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Campaign</span>
                    <span className={styles.metaValue}>{draft.campaignId.title}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Influencer</span>
                    <span className={styles.metaValue}>{draft.influencerId.instagramUsername}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Content Type</span>
                    <span className={styles.metaValue}>
                      {draft.contentType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Submitted</span>
                    <span className={styles.metaValue}>{formatDate(draft.createdAt)}</span>
                  </div>
                </div>

                {draft.feedback && (
                  <div className={styles.feedback}>
                    <h4>Your Feedback</h4>
                    <p>{draft.feedback}</p>
                  </div>
                )}

                {draft.notes && (
                  <div className={styles.notes}>
                    <h4>Influencer Notes</h4>
                    <p>{draft.notes}</p>
                  </div>
                )}
              </div>

              <div className={styles.draftActions}>
                <Link href={`/dashboard/brand/drafts/${draft._id}`} className={styles.viewButton}>
                  View Details
                </Link>

                {draft.status === "pending" && (
                  <>
                    <button onClick={() => handleReviewDraft(draft._id, "approved")} className={styles.approveButton}>
                      Approve
                    </button>
                    <button onClick={() => promptForFeedback(draft._id)} className={styles.requestButton}>
                      Request Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
