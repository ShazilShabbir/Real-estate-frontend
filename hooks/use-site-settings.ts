"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/axios"

interface SiteSettings {
  site_name: string
  site_tagline: string
  site_logo: string
  default_currency: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  language: string
  direction: string
  featured_property_limit: number
  auto_approve_properties: boolean
  [key: string]: string | number | boolean
}

const DEFAULTS: SiteSettings = {
  site_name: "EstateHub",
  site_tagline: "Luxury Properties & Premium Real Estate",
  site_logo: "",
  default_currency: "USD",
  contact_email: "info@estatehub.com",
  contact_phone: "(555) 123-4567",
  contact_address: "123 Luxury Lane, Suite 500, New York, NY 10001",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
  language: "en",
  direction: "ltr",
  featured_property_limit: 10,
  auto_approve_properties: false,
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/public/settings").then(({ data }) => {
      if (data?.data) {
        setSettings({ ...DEFAULTS, ...data.data })
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
