// Instagram OAuth utilities
export class InstagramAPI {
  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    this.redirectUri = `${process.env.NEXTAUTH_URL}/auth/instagram/callback`
  }

  // Get the authorization URL for Instagram OAuth
  getAuthorizationUrl() {
    return `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&scope=user_profile,user_media&response_type=code`
  }

  // Exchange authorization code for access token
  async getAccessToken(code) {
    try {
      const response = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          redirect_uri: this.redirectUri,
          code: code,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error getting access token:", error)
      return null
    }
  }

  // Get long-lived access token
  async getLongLivedToken(shortLivedToken) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${shortLivedToken}`,
      )
      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error("Error getting long-lived token:", error)
      return null
    }
  }

  // Get user profile information
  async getUserProfile(accessToken) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`,
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // Get user media
  async getUserMedia(accessToken, limit = 10) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&limit=${limit}&access_token=${accessToken}`,
      )
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching user media:", error)
      return []
    }
  }

  // Calculate engagement rate based on available data
  calculateEngagementRate(followerCount) {
    // Placeholder calculation - in a real app, you'd use actual engagement data
    return (Math.random() * 4 + 1).toFixed(2)
  }
}
