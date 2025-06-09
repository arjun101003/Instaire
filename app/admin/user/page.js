"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import styles from "./users.module.css"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRole, setActiveRole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      if (data.success) {
        setUsers(data.users || [])
      } else {
        throw new Error(data.error || "Failed to load users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, status) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      const data = await response.json()
      if (data.success) {
        // Update the local state to reflect the change
        setUsers(users.map((user) => (user._id === userId ? { ...user, status } : user)))
        alert(`User status updated to ${status}!`)
      } else {
        throw new Error(data.error || "Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className={`${styles.badge} ${styles.activeBadge}`}>Active</span>
      case "pending":
        return <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending</span>
      case "suspended":
        return <span className={`${styles.badge} ${styles.suspendedBadge}`}>Suspended</span>
      default:
        return <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending</span>
    }
  }

  // Filter users based on role and search term
  const filteredUsers = users.filter((user) => {
    if (activeRole !== "all" && user.role !== activeRole) {
      return false
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return user.name?.toLowerCase().includes(searchLower) || user.email?.toLowerCase().includes(searchLower)
    }

    return true
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.headerActions}>
          <Link href="/admin/users/create" className={styles.createButton}>
            Create User
          </Link>
          <Link href="/admin" className={styles.backLink}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="searchTerm">Search Users</label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeRole === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveRole("all")}
        >
          All Users ({users.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeRole === "brand" ? styles.activeTab : ""}`}
          onClick={() => setActiveRole("brand")}
        >
          Brands ({users.filter((u) => u.role === "brand").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeRole === "influencer" ? styles.activeTab : ""}`}
          onClick={() => setActiveRole("influencer")}
        >
          Influencers ({users.filter((u) => u.role === "influencer").length})
        </button>
        <button
          className={`${styles.tabButton} ${activeRole === "admin" ? styles.activeTab : ""}`}
          onClick={() => setActiveRole("admin")}
        >
          Admins ({users.filter((u) => u.role === "admin").length})
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👤</div>
          <h3>No users found</h3>
          <p>
            {searchTerm
              ? "No users match your search criteria."
              : activeRole === "all"
                ? "There are no users in the system yet."
                : `There are no ${activeRole}s in the system yet.`}
          </p>
        </div>
      ) : (
        <div className={styles.usersTable}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.role + "Badge"]}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link href={`/admin/users/${user._id}`} className={styles.viewButton}>
                        View
                      </Link>

                      <div className={styles.dropdown}>
                        <button className={styles.statusButton}>Status ▼</button>
                        <div className={styles.dropdownContent}>
                          <button
                            onClick={() => handleStatusChange(user._id, "active")}
                            className={user.status === "active" ? styles.activeOption : ""}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleStatusChange(user._id, "pending")}
                            className={user.status === "pending" ? styles.activeOption : ""}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(user._id, "suspended")}
                            className={user.status === "suspended" ? styles.activeOption : ""}
                          >
                            Suspended
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
