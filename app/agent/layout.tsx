"use client"

import { useAuthContext } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdminOrAgent, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Not authenticated — <Link href="/login" className="text-primary underline">Login</Link></p>
      </div>
    )
  }

  if (!isAdminOrAgent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>This area is for agents and admins only.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
