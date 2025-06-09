"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./influencers.module.css"

export default function BrandInfluencers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("campaignId")

  const [influencers, setInfluencers] = useState([])
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: "",
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    maxEngagement: "",
    search: "",
  })

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails()
    }
    fetchInfluencers()
  }, [campaignId])

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch campaign details")
      }

      const data = await response.json()
      if (data.success) {
        setCampaign(data.campaign)

        // Set filters based on campaign
        if (data.campaign.filters) {
          setFilters({
            ...filters,
            category: data.campaign.filters.categories[0] || "",
            minFollowers: data.campaign.filters.minFollowers || "",
            maxFollowers: data.campaign.filters.maxFollowers || "",
            minEngagement: data.campaign.filters.minEngagement || "",
            maxEngagement: data.campaign.filters.maxEngagement || "",
          })
        }
      } else {
        throw new Error(data.error || "Failed to load campaign")
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
      setError(error.message)
    }
  }

  const fetchInfluencers = async () => {
    try {
      setLoading(true)

      // Build query string from filters
      const queryParams = new URLSearchParams()

      if (filters.category) queryParams.append("category", filters.category)
      if (filters.minFollowers) queryParams.append("minFollowers", filters.minFollowers)
      if (filters.maxFollowers) queryParams.append("maxFollowers", filters.maxFollowers)
      if (filters.minEngagement) queryParams.append("minEngagement", filters.minEngagement)
      if (filters.maxEngagement) queryParams.append("maxEngagement", filters.maxEngagement)
      if (filters.search) queryParams.append("search", filters.search)

      const response = await fetch(`/api/brand/influencers?${queryParams.toString()}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch influencers")
      }

      const data = await response.json()
      if (data.success) {
        setInfluencers(data.influencers || [])
      } else {
        throw new Error(data.error || "Failed to load influencers")
      }
    } catch (error) {
      console.error("Error fetching influencers:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const applyFilters = (e) => {
    e.preventDefault()
    fetchInfluencers()
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      minFollowers: "",
      maxFollowers: "",
      minEngagement: "",
      maxEngagement: "",
      search: "",
    })

    // If we're in a campaign context, restore campaign filters
    if (campaign && campaign.filters) {
      setFilters({
        category: campaign.filters.categories[0] || "",
        minFollowers: campaign.filters.minFollowers || "",
        maxFollowers: campaign.filters.maxFollowers || "",
        minEngagement: campaign.filters.minEngagement || "",
        maxEngagement: campaign.filters.maxEngagement || "",
        search: "",
      })
    }
  }

  const handleInvite = async (influencerId) => {
    if (!campaignId) {
      alert("Please select a campaign first")
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ influencerId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send invitation")
      }

      const data = await response.json()
      if (data.success) {
        alert("Invitation sent successfully!")

        // Update local state to reflect the invitation
        setInfluencers(influencers.map((inf) => (inf._id === influencerId ? { ...inf, invited: true } : inf)))
      } else {
        throw new Error(data.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count
  }

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading influencers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchInfluencers} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Discover Influencers</h1>
          {campaign && (
            <p className={styles.campaignTitle}>
              For Campaign: <strong>{campaign.title}</strong>
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          {campaignId && (
            <Link href={`/campaigns/${campaignId}`} className={styles.secondaryLink}>
              Back to Campaign
            </Link>
          )}
          <Link href="/dashboard/brand" className={styles.backLink}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <h2>Filter Influencers</h2>
        <form onSubmit={applyFilters} className={styles.filtersForm}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty</option>
                <option value="fitness">Fitness</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="tech">Tech</option>
                <option value="gaming">Gaming</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="search">Search</label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name, username, bio..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Followers</label>
              <div className={styles.rangeInputs}>
                <input
                  type="number"
                  name="minFollowers"
                  value={filters.minFollowers}
                  onChange={handleFilterChange}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  name="maxFollowers"
                  value={filters.maxFollowers}
                  onChange={handleFilterChange}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Engagement Rate (%)</label>
              <div className={styles.rangeInputs}>
                <input
                  type="number"
                  name="minEngagement"
                  value={filters.minEngagement}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  step="0.1"
                />
                <span>to</span>
                <input
                  type="number"
                  name="maxEngagement"
                  value={filters.maxEngagement}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button type="button" onClick={resetFilters} className={styles.resetButton}>
              Reset Filters
            </button>
            <button type="submit" className={styles.applyButton}>
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {!campaignId && (
        <div className={styles.campaignAlert}>
          <div className={styles.alertIcon}>ℹ️</div>
          <div className={styles.alertContent}>
            <h3>Select a Campaign</h3>
            <p>To invite influencers, please select a campaign first.</p>
            <Link href="/dashboard/brand" className={styles.alertButton}>
              View My Campaigns
            </Link>
          </div>
        </div>
      )}

      {influencers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <h3>No influencers found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className={styles.influencersList}>
          {influencers.map((influencer) => (
            <div key={influencer._id} className={styles.influencerCard}>
              <div className={styles.influencerHeader}>
                <div className={styles.influencerAvatar}>
                  {influencer.profileImage ? (
                    <img src={influencer.profileImage || "/placeholder.svg"} alt={influencer.instagramUsername} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {influencer.instagramUsername.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.influencerInfo}>
                  <h3>{influencer.instagramUsername}</h3>
                  <span className={styles.category}>{influencer.category}</span>
                </div>
              </div>

              <div className={styles.influencerStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatFollowers(influencer.followers)}</span>
                  <span className={styles.statLabel}>Followers</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{influencer.engagementRate.toFixed(1)}%</span>
                  <span className={styles.statLabel}>Engagement</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatPrice(influencer.estimatedPrice)}</span>
                  <span className={styles.statLabel}>Est. Price</span>
                </div>
              </div>

              <div className={styles.influencerBio}>
                <p>
                  {influencer.bio
                    ? influencer.bio.substring(0, 100) + (influencer.bio.length > 100 ? "..." : "")
                    : "No bio available"}
                </p>
              </div>

              <div className={styles.influencerActions}>
                <Link href={`/i/${influencer.slug}`} target="_blank" className={styles.viewButton}>
                  View Profile
                </Link>

                {campaignId && (
                  <button
                    onClick={() => handleInvite(influencer._id)}
                    className={styles.inviteButton}
                    disabled={influencer.invited}
                  >
                    {influencer.invited ? "Invited" : "Send Invite"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
