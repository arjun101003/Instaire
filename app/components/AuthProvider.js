"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("=== AUTH PROVIDER: Checking authentication ===")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      console.log("AuthProvider auth response status:", response.status)
      console.log("AuthProvider auth response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("AuthProvider auth response data:", data)

        if (data.authenticated) {
          console.log("AuthProvider: User is authenticated:", data.user)
          setUser(data.user)
        } else {
          console.log("AuthProvider: User is not authenticated")
          setUser(null)
        }
      } else {
        console.log("AuthProvider: Auth response not OK")
        setUser(null)
      }
    } catch (error) {
      console.error("AuthProvider: Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log("=== AUTH PROVIDER: Brand login attempt ===")
      const response = await fetch("/api/auth/brand/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      console.log("AuthProvider brand login response:", data)

      if (response.ok && data.success) {
        console.log("AuthProvider: Brand login successful, setting user:", data.user)
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        console.log("AuthProvider: Brand login failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("AuthProvider: Brand login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const adminLogin = async (credentials) => {
    try {
      console.log("=== AUTH PROVIDER: Admin login attempt ===")
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      console.log("AuthProvider admin login response:", data)

      if (response.ok && data.success) {
        console.log("AuthProvider: Admin login successful, setting user:", data.user)
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        console.log("AuthProvider: Admin login failed:", data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("AuthProvider: Admin login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      console.log("=== AUTH PROVIDER: Logout attempt ===")
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      console.log("AuthProvider: Logout successful")
    } catch (error) {
      console.error("AuthProvider: Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    adminLogin,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
