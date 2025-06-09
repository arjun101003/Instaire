"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./find-influencers.module.css"

export default function FindInfluencers() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [invitingIds, setInvitingIds] = useState(new Set())

  // Filter state
  const [filters, setFilters] = useState({
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    maxEngagement: "",
    category: "",
    search: "",
  })

  useEffect(() => {
    // Load influencers on initial page load
    handleSearch()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (filters.minFollowers) queryParams.append("minFollowers", filters.minFollowers)
      if (filters.maxFollowers) queryParams.append("maxFollowers", filters.maxFollowers)
      if (filters.minEngagement) queryParams.append("minEngagement", filters.minEngagement)
      if (filters.maxEngagement) queryParams.append("maxEngagement", filters.maxEngagement)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.search) queryParams.append("search", filters.search)

      console.log("Fetching influencers with filters:", filters)

      const response = await fetch(`/api/brand/influencers?${queryParams.toString()}`, {
        credentials: "include",
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch influencers")
      }

      const data = await response.json()
      console.log("Influencers data:", data)

      setInfluencers(data.influencers || [])
    } catch (error) {
      console.error("Error fetching influencers:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (influencerId) => {
    setInvitingIds(new Set([...invitingIds, influencerId]))

    try {
      // For now, just show success message
      // TODO: Implement campaign selection and invitation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Invitation sent successfully! (Demo mode)")
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setInvitingIds(new Set([...invitingIds].filter((id) => id !== influencerId)))
    }
  }

  const resetFilters = () => {
    setFilters({
      minFollowers: "",
      maxFollowers: "",
      minEngagement: "",
      maxEngagement: "",
      category: "",
      search: "",
    })
    // Reload all influencers
    setTimeout(() => handleSearch(), 100)
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

  const formatPrice = (price) => {
    if (!price) return "₹0"
    return `₹${price.toLocaleString("en-IN")}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Find Influencers</h1>
        <p>Discover and connect with influencers that match your campaign needs</p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <h2>Filter Influencers</h2>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Username, bio, or collaborations"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="minFollowers">Min Followers</label>
            <input
              type="number"
              id="minFollowers"
              name="minFollowers"
              value={filters.minFollowers}
              onChange={handleFilterChange}
              placeholder="e.g. 10000"
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="maxFollowers">Max Followers</label>
            <input
              type="number"
              id="maxFollowers"
              name="maxFollowers"
              value={filters.maxFollowers}
              onChange={handleFilterChange}
              placeholder="e.g. 500000"
              min="0"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="minEngagement">Min Engagement Rate (%)</label>
            <input
              type="number"
              id="minEngagement"
              name="minEngagement"
              value={filters.minEngagement}
              onChange={handleFilterChange}
              placeholder="e.g. 2.0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="maxEngagement">Max Engagement Rate (%)</label>
            <input
              type="number"
              id="maxEngagement"
              name="maxEngagement"
              value={filters.maxEngagement}
              onChange={handleFilterChange}
              placeholder="e.g. 10.0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="category">Content Category</label>
            <select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="Fashion">Fashion</option>
              <option value="Tech">Tech</option>
              <option value="Fitness">Fitness</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Beauty">Beauty</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Gaming">Gaming</option>
              <option value="Music">Music</option>
              <option value="Art">Art</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button type="button" onClick={resetFilters} className={styles.resetButton}>
            Reset Filters
          </button>
          <button type="button" onClick={handleSearch} className={styles.searchButton} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <h2>Search Results</h2>
          <span className={styles.resultsCount}>
            {loading ? "Searching..." : `${influencers.length} influencer${influencers.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p>Error: {error}</p>
            <button onClick={handleSearch} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Finding the perfect influencers for you...</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No influencers found matching your criteria</h3>
            <p>Try adjusting your filters to see more results</p>
            <button onClick={resetFilters} className={styles.resetButton}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={styles.influencerGrid}>
            {influencers.map((influencer) => (
              <div key={influencer._id} className={styles.influencerCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    <div className={styles.avatarPlaceholder}>
                      {influencer.instagramUsername?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>
                  <div className={styles.influencerInfo}>
                    <h3>@{influencer.instagramUsername || "unknown"}</h3>
                    <span className={styles.category}>{influencer.category || "N/A"}</span>
                  </div>
                </div>

                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatFollowers(influencer.followers)}</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {influencer.engagementRate ? influencer.engagementRate.toFixed(1) : "0.0"}%
                    </span>
                    <span className={styles.statLabel}>Engagement</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatPrice(influencer.estimatedPrice)}</span>
                    <span className={styles.statLabel}>Est. Price</span>
                  </div>
                </div>

                <div className={styles.bio}>
                  <p>{influencer.bio || "No bio available"}</p>
                </div>

                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleInvite(influencer._id)}
                    className={styles.inviteButton}
                    disabled={invitingIds.has(influencer._id)}
                  >
                    {invitingIds.has(influencer._id) ? "Sending..." : "Invite"}
                  </button>
                  {influencer.slug && (
                    <a
                      href={`/i/${influencer.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewProfileButton}
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
