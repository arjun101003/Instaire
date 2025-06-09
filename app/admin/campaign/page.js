"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "./campaigns.module.css"

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStatus, setActiveStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/campaigns", {
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
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (campaignId, status) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update campaign status")
      }

      const data = await response.json()
      if (data.success) {
        // Update the local state to reflect the change
        setCampaigns(campaigns.map((campaign) => (campaign._id === campaignId ? { ...campaign, status } : campaign)))
        alert(`Campaign status updated to ${status}!`)
      } else {
        throw new Error(data.error || "Failed to update campaign status")
      }
    } catch (error) {
      console.error("Error updating campaign status:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatBudget = (budget) => {
    if (!budget) return "N/A"
    return `₹${budget.minBudget.toLocaleString("en-IN")} - ₹${budget.maxBudget.toLocaleString("en-IN")}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className={`${styles.badge} ${styles.activeBadge}`}>Active</span>
      case "draft":
        return <span className={`${styles.badge} ${styles.draftBadge}`}>Draft</span>
      case "completed":
        return <span className={`${styles.badge} ${styles.completedBadge}`}>Completed</span>
      case "paused":
        return <span className={`${styles.badge} ${styles.pausedBadge}`}>Paused</span>
      default:
        return <span className={`${styles.badge} ${styles.draftBadge}`}>Draft</span>
    }
  }

  // Filter campaigns based on status and search term
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeStatus !== "all" && campaign.status !== activeStatus) {
      return false
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        campaign.title?.toLowerCase().includes(searchLower) ||
        campaign.description?.toLowerCase().includes(searchLower) ||
        campaign.brandId?.name?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading campaigns...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchCampaigns} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campaign Management</h1>
        <Link href="/admin" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="searchTerm">Search Campaigns</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description or brand"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeStatus === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveStatus("all")}
        >
          All Campaigns ({campaigns.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeStatus === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveStatus("active")}
        >
          Active ({campaigns.filter((c) => c.status === "active").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeStatus === "draft" ? styles.activeTab : ""}`}
          onClick={() => setActiveStatus("draft")}
        >
          Draft ({campaigns.filter((c) => c.status === "draft").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeStatus === "completed" ? styles.activeTab : ""}`}
          onClick={() => setActiveStatus("completed")}
        >
          Completed ({campaigns.filter((c) => c.status === "completed").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeStatus === "paused" ? styles.activeTab : ""}`}
          onClick={() => setActiveStatus("paused")}
        >
          Paused ({campaigns.filter((c) => c.status === "paused").length})
        </button>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📢</div>
          <h3>No campaigns found</h3>
          <p>
            {searchTerm
              ? "No campaigns match your search criteria."
              : activeStatus === "all"
                ? "There are no campaigns in the system yet."
                : `There are no ${activeStatus} campaigns.`}
          </p>
        </div>
      ) : (
        <div className={styles.campaignsTable}>
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Brand</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <div className={styles.campaignInfo}>
                      <h4>{campaign.title}</h4>
                      <p>{campaign.description?.substring(0, 80)}...</p>
                    </div>
                  </td>
                  <td>{campaign.brandId?.name || "N/A"}</td>
                  <td>{formatBudget(campaign.budget)}</td>
                  <td>{getStatusBadge(campaign.status)}</td>
                  <td>{formatDate(campaign.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link href={`/admin/campaigns/${campaign._id}`} className={styles.viewButton}>
                        View
                      </Link>

                      <div className={styles.dropdown}>
                        <button className={styles.statusButton}>Status ▼</button>
                        <div className={styles.dropdownContent}>
                          <button
                            onClick={() => handleStatusChange(campaign._id, "active")}
                            className={campaign.status === "active" ? styles.activeOption : ""}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleStatusChange(campaign._id, "draft")}
                            className={campaign.status === "draft" ? styles.activeOption : ""}
                          >
                            Draft
                          </button>
                          <button
                            onClick={() => handleStatusChange(campaign._id, "completed")}
                            className={campaign.status === "completed" ? styles.activeOption : ""}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(campaign._id, "paused")}
                            className={campaign.status === "paused" ? styles.activeOption : ""}
                          >
                            Paused
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
