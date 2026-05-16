"use client"

import { useEffect } from "react"
import { X, Link, Twitter, Facebook, Linkedin, Mail, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  url: string
  title: string
}

export function ShareModal({ open, onClose, url, title }: ShareModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: "Twitter", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, color: "hover:bg-sky-500/20 hover:text-sky-400" },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "hover:bg-blue-600/20 hover:text-blue-500" },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: "hover:bg-blue-700/20 hover:text-blue-600" },
    { label: "Email", icon: Mail, href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, color: "hover:bg-amber-500/20 hover:text-amber-400" },
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard")
    })
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Share Property</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 transition-all ${l.color}`}
              >
                <Icon size={22} />
                <span className="text-xs text-neutral-400">{l.label}</span>
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2 bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-3 py-2.5">
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-sm text-neutral-300 outline-none truncate"
          />
          <button onClick={copyLink} className="text-primary hover:text-primary/80 transition-colors flex-shrink-0">
            <Check size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
