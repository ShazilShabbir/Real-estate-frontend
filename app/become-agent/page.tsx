"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/lib/auth-context"
import { api } from "@/lib/axios"
import { Shield, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function BecomeAgentPage() {
  const { user, isAuthenticated, isAgent } = useAuthContext()
  const router = useRouter()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    if (!isAuthenticated) { router.push("/login"); return }
    setApplying(true)
    try {
      await api.post("/auth/apply-agent")
      setApplied(true)
      toast.success("Application submitted!")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit application")
    } finally { setApplying(false) }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to Apply</h1>
            <p className="text-muted-foreground mb-6">Please sign in or create an account to apply as an agent.</p>
            <Link href="/login"><Button size="lg">Sign In</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (isAgent) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">You're Already an Agent</h1>
            <p className="text-muted-foreground mb-6">You can list properties and manage your listings.</p>
            <Link href="/create-property"><Button size="lg">List a Property</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (applied || user?.agentApplication?.status === "pending") {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Application Pending</h1>
            <p className="text-muted-foreground mb-6">Your agent application is under review. We'll notify you when it's approved.</p>
            <Link href="/"><Button variant="outline" size="lg"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Become an Agent</h1>
            <p className="text-muted-foreground mt-2">List properties, manage listings, and grow your real estate business.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">List unlimited properties for sale or rent</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Manage your listings from a dedicated dashboard</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Get featured placement opportunities</p>
            </div>
          </div>

          <Button onClick={handleApply} disabled={applying} size="lg" className="w-full">
            {applying ? "Submitting..." : "Apply to Become an Agent"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">Applications are reviewed by the admin team.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
