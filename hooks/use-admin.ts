"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/axios"

export interface AdminStats {
  totalProperties: number
  totalUsers: number
  totalAgents: number
  totalInquiries: number
  totalViews: number
  newUsersThisWeek: number
  newPropertiesThisWeek: number
  pendingApprovals: number
  pendingAgentApplications: number
  statusBreakdown: Record<string, number>
  recentActivity: Array<{
    _id: string
    action: string
    targetType: string
    targetId?: string
    details?: any
    createdAt: string
    performedBy: { username: string; avatar?: string }
  }>
}

export interface UserData {
  _id: string
  username: string
  email: string
  avatar?: string
  role: string
  provider: string
  phone?: string
  agentApplication?: { status: string; appliedAt?: string }
  createdAt: string
  propertyCount: number
  savedProperties?: string[]
}

export interface PropertyData {
  _id: string
  title: string
  price: number
  status: string
  propertyType: string
  isFeatured: boolean
  approved: boolean
  views: number
  createdAt: string
  postedBy: { _id: string; username: string; email: string; avatar?: string }
  address?: { city?: string; state?: string }
}

export interface InquiryData {
  _id: string
  name: string
  email: string
  phone?: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  propertyId?: { _id: string; title: string }
  createdAt: string
}

export interface ActivityLogEntry {
  _id: string
  action: string
  targetType: string
  targetId?: string
  details?: any
  createdAt: string
  performedBy: { username: string; avatar?: string }
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersResponse extends PaginatedResponse<UserData> {
  users: UserData[]
}

export interface PropertiesResponse extends PaginatedResponse<PropertyData> {
  properties: PropertyData[]
}

export interface InquiriesResponse extends PaginatedResponse<InquiryData> {
  inquiries: InquiryData[]
}

export interface ActivityLogResponse extends PaginatedResponse<ActivityLogEntry> {
  logs: ActivityLogEntry[]
}

export interface AgentApplicationResponse extends PaginatedResponse<UserData> {
  users: UserData[]
}

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/stats")
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch stats")
      return null
    } finally { setLoading(false) }
  }, [])

  // USERS
  const getUsers = useCallback(async (params?: {
    page?: number; limit?: number; search?: string; role?: string
  }): Promise<UsersResponse | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/users", { params })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch users")
      return null
    } finally { setLoading(false) }
  }, [])

  const getUserById = useCallback(async (id: string) => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get(`/admin/users/${id}`)
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch user")
      return null
    } finally { setLoading(false) }
  }, [])

  const updateUserRole = useCallback(async (id: string, role: string) => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.patch(`/admin/users/${id}/role`, { role })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update role")
      throw err
    } finally { setLoading(false) }
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true); setError(null)
      await api.delete(`/admin/users/${id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete user")
      throw err
    } finally { setLoading(false) }
  }, [])

  // AGENT APPLICATIONS
  const getAgentApplications = useCallback(async (params?: {
    page?: number; limit?: number; status?: string
  }): Promise<AgentApplicationResponse | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/users/applications", { params })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch applications")
      return null
    } finally { setLoading(false) }
  }, [])

  const handleAgentApplication = useCallback(async (id: string, action: "approve" | "reject") => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.patch(`/admin/users/${id}/agent-application`, { action })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to handle application")
      throw err
    } finally { setLoading(false) }
  }, [])

  // PROPERTIES
  const getAllProperties = useCallback(async (params?: {
    page?: number; limit?: number; status?: string; propertyType?: string
    featured?: string; postedBy?: string; q?: string; approved?: string
    startDate?: string; endDate?: string
  }): Promise<PropertiesResponse | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/properties", { params })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch properties")
      return null
    } finally { setLoading(false) }
  }, [])

  const approveProperty = useCallback(async (id: string) => {
    const { data } = await api.patch(`/admin/properties/${id}/approve`)
    return data.data
  }, [])

  const rejectProperty = useCallback(async (id: string) => {
    const { data } = await api.patch(`/admin/properties/${id}/reject`)
    return data.data
  }, [])

  const toggleFeatureProperty = useCallback(async (id: string) => {
    const { data } = await api.patch(`/admin/properties/${id}/feature`)
    return data.data
  }, [])

  const togglePropertyStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.patch(`/admin/properties/${id}/status`, { status })
    return data.data
  }, [])

  const adminDeleteProperty = useCallback(async (id: string) => {
    await api.delete(`/admin/properties/${id}`)
  }, [])

  // BULK ACTIONS
  const bulkPropertyAction = useCallback(async (action: string, ids: string[], extra?: Record<string, string>) => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.post("/admin/properties/bulk", { action, ids, ...extra })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Bulk action failed")
      throw err
    } finally { setLoading(false) }
  }, [])

  // CSV EXPORT
  const exportCSV = useCallback(async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(endpoint, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError("Failed to export CSV")
    }
  }, [])

  // ANALYTICS
  const getAnalytics = useCallback(async (months = 12) => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/analytics", { params: { months } })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch analytics")
      return null
    } finally { setLoading(false) }
  }, [])

  // ACTIVITY LOG
  const getActivityLog = useCallback(async (params?: {
    page?: number; limit?: number; action?: string; targetType?: string
  }): Promise<ActivityLogResponse | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/activity-log", { params })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch activity log")
      return null
    } finally { setLoading(false) }
  }, [])

  // INQUIRIES
  const getInquiries = useCallback(async (params?: {
    page?: number; limit?: number; status?: string; search?: string
  }): Promise<InquiriesResponse | null> => {
    try {
      setLoading(true); setError(null)
      const { data } = await api.get("/admin/inquiries", { params })
      return data.data
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch inquiries")
      return null
    } finally { setLoading(false) }
  }, [])

  const updateInquiryStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.patch(`/admin/inquiries/${id}`, { status })
    return data.data
  }, [])

  const deleteInquiry = useCallback(async (id: string) => {
    await api.delete(`/admin/inquiries/${id}`)
  }, [])

  return {
    loading, error,
    getAdminStats,
    getUsers, getUserById, updateUserRole, deleteUser,
    getAgentApplications, handleAgentApplication,
    getAllProperties, approveProperty, rejectProperty,
    toggleFeatureProperty, togglePropertyStatus, adminDeleteProperty,
    bulkPropertyAction, exportCSV,
    getAnalytics,
    getActivityLog,
    getInquiries, updateInquiryStatus, deleteInquiry,
  }
}
