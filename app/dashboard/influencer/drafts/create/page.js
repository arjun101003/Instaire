"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./create-draft.module.css"

export default function CreateDraft() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("campaignId")

  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contentType: "instagram_post",
    notes: "",
    mediaFiles: [],
  })

  useEffect(() => {
    if (!campaignId) {
      setError("Campaign ID is required")
      setLoading(false)
      return
    }

    fetchCampaignDetails()
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
      } else {
        throw new Error(data.error || "Failed to load campaign")
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({
      ...formData,
      mediaFiles: files,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert("Please enter a title for your draft")
      return
    }

    if (!formData.content.trim()) {
      alert("Please enter content for your draft")
      return
    }

    try {
      setSubmitting(true)

      // Create FormData object for file upload
      const submitData = new FormData()
      submitData.append("campaignId", campaignId)
      submitData.append("title", formData.title)
      submitData.append("content", formData.content)
      submitData.append("contentType", formData.contentType)
      submitData.append("notes", formData.notes)

      // Append each file
      formData.mediaFiles.forEach((file, index) => {
        submitData.append(`media`, file)
      })

      const response = await fetch("/api/influencer/drafts", {
        method: "POST",
        credentials: "include",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit draft")
      }

      const data = await response.json()
      if (data.success) {
        alert("Draft submitted successfully!")
        router.push("/dashboard/influencer/drafts")
      } else {
        throw new Error(data.error || "Failed to submit draft")
      }
    } catch (error) {
      console.error("Error submitting draft:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading campaign details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <Link href="/dashboard/influencer/invitations" className={styles.backButton}>
          Back to Invitations
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Submit Draft Content</h1>
        <Link href="/dashboard/influencer/drafts" className={styles.backLink}>
          View All Drafts
        </Link>
      </div>

      <div className={styles.campaignInfo}>
        <h2>{campaign.title}</h2>
        <p className={styles.campaignDescription}>{campaign.description}</p>
        <div className={styles.campaignMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Brand</span>
            <span className={styles.metaValue}>{campaign.brandId.name}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Category</span>
            <span className={styles.metaValue}>{campaign.filters.categories.join(", ")}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Draft Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Give your draft a title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contentType">Content Type</label>
          <select
            id="contentType"
            name="contentType"
            value={formData.contentType}
            onChange={handleInputChange}
            required
          >
            <option value="instagram_post">Instagram Post</option>
            <option value="instagram_story">Instagram Story</option>
            <option value="instagram_reel">Instagram Reel</option>
            <option value="instagram_carousel">Instagram Carousel</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Caption/Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your post caption or content here"
            rows="5"
            required
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mediaFiles">Upload Media</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="mediaFiles"
              name="mediaFiles"
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
            />
            <div className={styles.uploadLabel}>
              <span>Drag files here or click to browse</span>
              <small>Upload images or videos for your content (max 5 files)</small>
            </div>
          </div>

          {formData.mediaFiles.length > 0 && (
            <div className={styles.filePreview}>
              <h4>Selected Files ({formData.mediaFiles.length})</h4>
              <ul>
                {formData.mediaFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Notes for Brand (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes for the brand about your content"
            rows="3"
          ></textarea>
        </div>

        <div className={styles.formActions}>
          <Link href="/dashboard/influencer/drafts" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Draft"}
          </button>
        </div>
      </form>
    </div>
  )
}
