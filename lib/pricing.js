// Pricing calculation utilities
export const calculateInfluencerPrice = (followerCount, engagementRate, baseRate = 100) => {
  if (!followerCount || !engagementRate) return 0

  // Formula: (Followers / 1000) × Engagement Rate × Base Rate
  const price = Math.round((followerCount / 1000) * engagementRate * baseRate)

  // Minimum price of ₹500
  return Math.max(price, 500)
}

export const calculateEngagementRate = (avgLikes, avgComments, followers) => {
  if (!followers || followers === 0) return 0

  const totalEngagement = (avgLikes || 0) + (avgComments || 0)
  return Number(((totalEngagement / followers) * 100).toFixed(2))
}

export const getPriceRange = (minFollowers, maxFollowers, minEngagement, maxEngagement, baseRate = 100) => {
  const minPrice = calculateInfluencerPrice(minFollowers, minEngagement, baseRate)
  const maxPrice = calculateInfluencerPrice(maxFollowers, maxEngagement, baseRate)

  return {
    min: minPrice,
    max: maxPrice,
    currency: "INR",
  }
}

export const formatPrice = (price, currency = "INR") => {
  if (currency === "INR") {
    return `₹${price.toLocaleString("en-IN")}`
  }
  return `${currency} ${price.toLocaleString()}`
}
