"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./invitations.module.css"

export default function InfluencerInvitations() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const router = useRouter()

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/influencer/invitations", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch invitations")
      }

      const data = await response.json()
      if (data.success) {
        setInvitations(data.invitations || [])
      } else {
        throw new Error(data.error || "Failed to load invitations")
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationResponse = async (invitationId, status) => {
    try {
      const response = await fetch(`/api/influencer/invitations/${invitationId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update invitation")
      }

      const data = await response.json()
      if (data.success) {
        // Update the local state to reflect the change
        setInvitations(invitations.map((inv) => (inv._id === invitationId ? { ...inv, status } : inv)))

        if (status === "accepted") {
          alert("Invitation accepted! You can now submit content for this campaign.")
        } else {
          alert("Invitation declined.")
        }
      } else {
        throw new Error(data.error || "Failed to respond to invitation")
      }
    } catch (error) {
      console.error("Error responding to invitation:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const filteredInvitations = invitations.filter((inv) => inv.status === activeTab)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading invitations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchInvitations} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campaign Invitations</h1>
        <Link href="/dashboard/influencer" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "pending" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({invitations.filter((inv) => inv.status === "pending").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "accepted" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted ({invitations.filter((inv) => inv.status === "accepted").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "rejected" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected ({invitations.filter((inv) => inv.status === "rejected").length})
        </button>
      </div>

      {filteredInvitations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📬</div>
          <h3>No {activeTab} invitations</h3>
          <p>
            {activeTab === "pending"
              ? "You don't have any pending invitations at the moment."
              : activeTab === "accepted"
                ? "You haven't accepted any campaign invitations yet."
                : "You haven't rejected any campaign invitations yet."}
          </p>
        </div>
      ) : (
        <div className={styles.invitationsList}>
          {filteredInvitations.map((invitation) => (
            <div key={invitation._id} className={styles.invitationCard}>
              <div className={styles.invitationHeader}>
                <h3>{invitation.campaign.title}</h3>
                <span className={styles.invitationDate}>Invited: {formatDate(invitation.createdAt)}</span>
              </div>

              <div className={styles.invitationDetails}>
                <p className={styles.invitationDescription}>
                  {invitation.campaign.description.substring(0, 150)}
                  {invitation.campaign.description.length > 150 ? "..." : ""}
                </p>

                <div className={styles.invitationMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Brand:</span>
                    <span className={styles.metaValue}>{invitation.campaign.brandId.name}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Budget:</span>
                    <span className={styles.metaValue}>
                      {formatPrice(invitation.campaign.budget.minBudget)} -{" "}
                      {formatPrice(invitation.campaign.budget.maxBudget)}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Your Rate:</span>
                    <span className={styles.metaValue}>{formatPrice(invitation.estimatedPrice || 0)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Category:</span>
                    <span className={styles.metaValue}>{invitation.campaign.filters.categories.join(", ")}</span>
                  </div>
                </div>
              </div>

              {activeTab === "pending" && (
                <div className={styles.invitationActions}>
                  <button
                    onClick={() => handleInvitationResponse(invitation._id, "accepted")}
                    className={styles.acceptButton}
                  >
                    Accept Invitation
                  </button>
                  <button
                    onClick={() => handleInvitationResponse(invitation._id, "rejected")}
                    className={styles.rejectButton}
                  >
                    Decline
                  </button>
                </div>
              )}

              {activeTab === "accepted" && (
                <div className={styles.invitationActions}>
                  <Link
                    href={`/dashboard/influencer/drafts/create?campaignId=${invitation.campaign._id}`}
                    className={styles.submitButton}
                  >
                    Submit Draft
                  </Link>
                  <Link
                    href={`/dashboard/influencer/drafts?campaignId=${invitation.campaign._id}`}
                    className={styles.viewButton}
                  >
                    View Drafts
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
