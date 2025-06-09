"use client"

import { useAuth } from "./components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { FaInstagram, FaRocket, FaUsers, FaChartLine } from "react-icons/fa"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="auth-container">
        <div className="card">
          <div style={{ textAlign: "center" }}>
            <div className="gradient-text" style={{ fontSize: "24px" }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="auth-container">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "900",
                marginBottom: "24px",
                lineHeight: "1.1",
              }}
              className="gradient-text"
            >
              Instaire
            </h1>
            <p
              style={{
                fontSize: "1.5rem",
                color: "var(--text-muted)",
                marginBottom: "40px",
                lineHeight: "1.4",
              }}
            >
              The luxury platform connecting influencers with premium brands for extraordinary collaborations
            </p>

            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/signin" className="btn btn-primary" style={{ fontSize: "18px", padding: "16px 32px" }}>
                <FaRocket />
                Get Started
              </Link>
              <button className="btn btn-secondary" style={{ fontSize: "18px", padding: "16px 32px" }}>
                <FaChartLine />
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "100px 0", background: "var(--dark-surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "16px" }} className="gradient-text">
              Why Choose Instaire?
            </h2>
            <p style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
              Premium features for premium collaborations
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            <div className="card">
              <div style={{ fontSize: "3rem", marginBottom: "20px", color: "var(--primary-purple)" }}>
                <FaInstagram />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "12px" }}>Instagram Integration</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Seamlessly connect your Instagram account and automatically fetch your latest stats, engagement rates,
                and content.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "3rem", marginBottom: "20px", color: "var(--primary-pink)" }}>
                <FaUsers />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "12px" }}>Smart Matching</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Our AI-powered algorithm matches influencers with brands based on audience, engagement, and content
                style.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "3rem", marginBottom: "20px", color: "var(--accent-emerald)" }}>
                <FaChartLine />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "12px" }}>Real-time Analytics</h3>
              <p style={{ color: "var(--text-muted)" }}>
                Track campaign performance with live metrics, engagement tracking, and detailed analytics dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="card" style={{ textAlign: "center", background: "var(--gradient-primary)" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", color: "white" }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{ fontSize: "1.2rem", marginBottom: "30px", color: "rgba(255,255,255,0.9)" }}>
              Join thousands of influencers and brands already using Instaire
            </p>
            <Link
              href="/auth/signin"
              className="btn"
              style={{
                background: "white",
                color: "var(--primary-purple)",
                fontSize: "18px",
                padding: "16px 32px",
              }}
            >
              <FaRocket />
              Join Instaire Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
