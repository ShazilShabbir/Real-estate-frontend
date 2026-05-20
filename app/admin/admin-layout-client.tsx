"use client"

import { useState, useCallback } from "react"
import { useAuthContext } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Loader2 } from "lucide-react"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuthContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <p>Not authenticated — <a href="/login" className="text-amber-400 underline">Login</a></p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <p>Admin access required. Your role: {user?.role || "none"}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={closeMobileSidebar} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar collapsed={false} onToggle={() => {}} onMobileClose={closeMobileSidebar} />
      </div>
      <div className="hidden lg:block">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
