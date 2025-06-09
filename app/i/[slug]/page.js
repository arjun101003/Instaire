"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  FaInstagram,
  FaUsers,
  FaHeart,
  FaComment,
  FaChartLine,
  FaMapMarkerAlt,
  FaEnvelope,
  FaStar,
} from "react-icons/fa"

export default function PublicMediaKit() {
  const params = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.slug) {
      fetchProfile()
    }
  }, [params.slug])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/media-kit/${params.slug}`)
      const data = await response.json()
      console.log("Media kit data:", data)

      if (data.success) {
        setProfile(data.profile)
      } else {
        setError(data.error || "Profile not found")
      }
    } catch (err) {
      console.error("Media kit fetch error:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (!num || num === 0) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "24px", color: "#667eea" }}>Loading Media Kit...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
          <h2 style={{ color: "#e74c3c", marginBottom: "20px" }}>Media Kit Not Found</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
          <Link href="/" style={{ color: "#667eea", textDecoration: "none", fontWeight: "bold" }}>
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
          <h2 style={{ color: "#e74c3c", marginBottom: "20px" }}>Profile Not Available</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>This media kit is not available.</p>
          <Link href="/" style={{ color: "#667eea", textDecoration: "none", fontWeight: "bold" }}>
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "20px 0" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: "24px", fontWeight: "bold" }}>
            InfluenceConnect
          </Link>
          <Link
            href="/auth/signin"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "25px",
              textDecoration: "none",
            }}
          >
            Start Collaboration
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Profile Header */}
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            marginBottom: "30px",
            textAlign: "center",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "48px",
              color: "white",
            }}
          >
            <FaInstagram />
          </div>

          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "10px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            @{profile.instagramUsername}
          </h1>

          <h2 style={{ color: "#666", marginBottom: "20px", fontSize: "1.5rem" }}>{profile.user?.name}</h2>

          {profile.bio && (
            <p style={{ color: "#666", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 20px" }}>{profile.bio}</p>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {profile.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                <FaMapMarkerAlt />
                {profile.location}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
              <FaStar />
              {profile.category?.charAt(0).toUpperCase() + profile.category?.slice(1)} Creator
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <FaUsers style={{ fontSize: "2rem", color: "#667eea", marginBottom: "10px" }} />
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>{formatNumber(profile.followers)}</div>
            <div style={{ color: "#666" }}>Followers</div>
          </div>

          <div
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <FaHeart style={{ fontSize: "2rem", color: "#e91e63", marginBottom: "10px" }} />
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>{formatNumber(profile.avgLikes)}</div>
            <div style={{ color: "#666" }}>Avg Likes</div>
          </div>

          <div
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <FaComment style={{ fontSize: "2rem", color: "#2196f3", marginBottom: "10px" }} />
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
              {formatNumber(profile.avgComments)}
            </div>
            <div style={{ color: "#666" }}>Avg Comments</div>
          </div>

          <div
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <FaChartLine style={{ fontSize: "2rem", color: "#4caf50", marginBottom: "10px" }} />
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>{profile.engagementRate || 0}%</div>
            <div style={{ color: "#666" }}>Engagement</div>
          </div>
        </div>

        {/* About & Collaborations */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaStar style={{ color: "#667eea" }} />
              About
            </h3>
            <div style={{ color: "#666", lineHeight: "1.6" }}>
              <p>
                <strong>Category:</strong> {profile.category?.charAt(0).toUpperCase() + profile.category?.slice(1)}
              </p>
              {profile.monetizationMethod && (
                <p>
                  <strong>Specializes in:</strong>{" "}
                  {profile.monetizationMethod.replace("-", " ").charAt(0).toUpperCase() +
                    profile.monetizationMethod.replace("-", " ").slice(1)}
                </p>
              )}
              <p>
                <strong>Engagement Rate:</strong> {profile.engagementRate || 0}%
              </p>
            </div>
          </div>

          {profile.pastCollaborations && (
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                padding: "30px",
                borderRadius: "15px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaUsers style={{ color: "#667eea" }} />
                Past Collaborations
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>{profile.pastCollaborations}</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div
          style={{
            textAlign: "center",
            background: "rgba(255,255,255,0.95)",
            padding: "40px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Ready to Collaborate?</h3>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Let's create amazing content together and reach {formatNumber(profile.followers)} engaged followers!
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link
              href="/auth/signin?type=brand"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                padding: "12px 30px",
                borderRadius: "25px",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaEnvelope />
              Start Collaboration
            </Link>
            <a
              href={`https://instagram.com/${profile.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "transparent",
                color: "#667eea",
                border: "2px solid #667eea",
                padding: "12px 30px",
                borderRadius: "25px",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaInstagram />
              View Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
