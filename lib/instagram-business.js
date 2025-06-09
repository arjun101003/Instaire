// Instagram Business API (Direct) utilities
export class InstagramBusinessAPI {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    this.redirectUri = `${process.env.NEXTAUTH_URL}/auth/instagram/callback`
  }

  // Get the authorization URL for Instagram Business API (Direct)
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope:
        "user_profile,user_media,instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish",
      response_type: "code",
    })

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async getAccessToken(code) {
    try {
      const formData = new FormData()
      formData.append("client_id", this.clientId)
      formData.append("client_secret", this.clientSecret)
      formData.append("grant_type", "authorization_code")
      formData.append("redirect_uri", this.redirectUri)
      formData.append("code", code)

      const response = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        console.error("Instagram Business API Error:", data)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting access token:", error)
      return null
    }
  }

  // Get long-lived access token (60 days)
  async getLongLivedToken(shortLivedToken) {
    try {
      const params = new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: this.clientSecret,
        access_token: shortLivedToken,
      })

      const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error("Long-lived token error:", data)
        return shortLivedToken
      }

      return data.access_token
    } catch (error) {
      console.error("Error getting long-lived token:", error)
      return shortLivedToken
    }
  }

  // Get Instagram Business account profile
  async getBusinessProfile(accessToken) {
    try {
      const fields = [
        "id",
        "username",
        "name",
        "biography",
        "website",
        "followers_count",
        "follows_count",
        "media_count",
        "profile_picture_url",
        "account_type",
      ].join(",")

      const response = await fetch(`https://graph.instagram.com/me?fields=${fields}&access_token=${accessToken}`)
      const data = await response.json()

      if (data.error) {
        console.error("Business profile fetch error:", data)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching business profile:", error)
      return null
    }
  }

  // Get Instagram Business account media with insights
  async getBusinessMedia(accessToken, limit = 10) {
    try {
      const fields = [
        "id",
        "media_type",
        "media_url",
        "thumbnail_url",
        "caption",
        "timestamp",
        "permalink",
        "like_count",
        "comments_count",
      ].join(",")

      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`,
      )
      const data = await response.json()

      if (data.error) {
        console.error("Business media fetch error:", data)
        return []
      }

      return data.data || []
    } catch (error) {
      console.error("Error fetching business media:", error)
      return []
    }
  }

  // Get media insights for business account
  async getMediaInsights(mediaId, accessToken) {
    try {
      const metrics = "engagement,impressions,reach,saved"
      const response = await fetch(
        `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`,
      )
      const data = await response.json()

      if (data.error) {
        console.error("Media insights error:", data)
        return null
      }

      return data.data || []
    } catch (error) {
      console.error("Error fetching media insights:", error)
      return null
    }
  }

  // Get account insights for business account
  async getAccountInsights(accessToken, period = "day", since, until) {
    try {
      const metrics = "impressions,reach,profile_views,website_clicks"
      const params = new URLSearchParams({
        metric: metrics,
        period: period,
        access_token: accessToken,
      })

      if (since) params.append("since", since)
      if (until) params.append("until", until)

      const response = await fetch(`https://graph.instagram.com/me/insights?${params.toString()}`)
      const data = await response.json()

      if (data.error) {
        console.error("Account insights error:", data)
        return null
      }

      return data.data || []
    } catch (error) {
      console.error("Error fetching account insights:", error)
      return null
    }
  }

  // Calculate engagement rate from actual business data
  calculateEngagementRate(posts, followerCount) {
    if (!posts.length || !followerCount) return 0

    const totalEngagement = posts.reduce((sum, post) => {
      const likes = post.like_count || 0
      const comments = post.comments_count || 0
      return sum + likes + comments
    }, 0)

    const averageEngagement = totalEngagement / posts.length
    const engagementRate = (averageEngagement / followerCount) * 100

    return Math.round(engagementRate * 100) / 100
  }
}
