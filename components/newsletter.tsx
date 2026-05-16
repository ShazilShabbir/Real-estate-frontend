"use client"

import { useState } from "react"
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    // Simulate subscription — replace with real API call
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    setSubscribed(true)
    toast.success("Subscribed! Check your inbox for updates.")
    setEmail("")
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
        <CheckCircle2 size={20} className="text-green-400" />
        <span>Thanks for subscribing!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="w-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm rounded-lg pl-10 pr-3 py-2.5 placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
      </Button>
    </form>
  )
}
