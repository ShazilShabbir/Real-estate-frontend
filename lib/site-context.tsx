"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "@/lib/axios"

const API_ORIGIN = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "https://real-estate-api-cyan.vercel.app"

export interface SiteData {
  direction: "ltr" | "rtl"
  language: string
  defaultCurrency: string
  siteName: string
  siteLogo: string
  siteTagline: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialFacebook: string
  socialTwitter: string
  socialInstagram: string
  socialLinkedin: string
}

const defaults: SiteData = {
  direction: "ltr",
  language: "en",
  defaultCurrency: "USD",
  siteName: "EstateHub",
  siteLogo: "",
  siteTagline: "Luxury Properties & Premium Real Estate",
  contactEmail: "info@estatehub.com",
  contactPhone: "(555) 123-4567",
  contactAddress: "123 Luxury Lane, Suite 500, New York, NY 10001",
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialLinkedin: "",
}

const SiteContext = createContext<SiteData>(defaults)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(defaults)

  useEffect(() => {
    const stored = localStorage.getItem("site-direction")
    if (stored === "rtl" || stored === "ltr") {
      document.documentElement.dir = stored
    }

    api.get("/public/settings").then(({ data: res }) => {
      if (res?.data) {
        const s = res.data
        const d: SiteData = {
          direction: s.direction === "rtl" ? "rtl" : "ltr",
          language: s.language || "en",
          defaultCurrency: s.default_currency || "USD",
          siteName: s.site_name || "EstateHub",
          siteLogo: s.site_logo?.startsWith("/") ? `${API_ORIGIN}${s.site_logo}` : (s.site_logo || ""),
          siteTagline: s.site_tagline || defaults.siteTagline,
          contactEmail: s.contact_email || defaults.contactEmail,
          contactPhone: s.contact_phone || defaults.contactPhone,
          contactAddress: s.contact_address || defaults.contactAddress,
          socialFacebook: s.social_facebook || "",
          socialTwitter: s.social_twitter || "",
          socialInstagram: s.social_instagram || "",
          socialLinkedin: s.social_linkedin || "",
        }
        setData(d)
        document.documentElement.dir = d.direction
        localStorage.setItem("site-direction", d.direction)
      }
    }).catch(() => {})
  }, [])

  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>
}

export function useSite() {
  const context = useContext(SiteContext)
  // Return defaults if context is not available (e.g., during error boundary prerendering)
  if (!context) {
    return defaults
  }
  return context
}

// Backwards-compatible alias
export { SiteContext as DirectionContext, useSite as useDirection }
