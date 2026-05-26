"use client"

import Link from "next/link"
import { useSite } from "@/lib/site-context"
import { useTranslation } from "@/lib/use-translation"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Newsletter } from "@/components/newsletter"


function normalizeAssetUrl(url?: string | null) {
  if (!url) return url
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`
  }
  return url
}

export function Footer() {
 
    const { siteLogo, siteName, siteTagline, socialFacebook, socialTwitter, socialInstagram, socialLinkedin, contactEmail, contactPhone, contactAddress } = useSite()
      const normalizedSiteLogo = normalizeAssetUrl(siteLogo)
  const { t } = useTranslation()
  const socials: { key: string; icon: typeof Facebook; label: string; href: string }[] = [
    { key: "facebook", icon: Facebook, label: t("footer.facebook"), href: socialFacebook },
    { key: "twitter", icon: Twitter, label: t("footer.twitter"), href: socialTwitter },
    { key: "instagram", icon: Instagram, label: t("footer.instagram"), href: socialInstagram },
    { key: "linkedin", icon: Linkedin, label: t("footer.linkedin"), href: socialLinkedin },
  ].filter((s) => s.href)

  return (
    <footer className="bg-gradient-to-br from-foreground to-[#0a0a0a] text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-[0.008]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative">
        <div className="grid md:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              {normalizedSiteLogo ? (
            <div className="relative h-15 flex items-center">
              <img src={normalizedSiteLogo} alt={siteName} className="h-full w-auto max-w-[300px] object-contain" />
            </div>
          ) : (
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {siteName}
          </span>
          )}
            </Link>
            <p className="text-primary-foreground/50 text-sm leading-relaxed max-w-xs">
              {siteTagline || t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5 text-primary-foreground/80 font-heading tracking-wide">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/50">
              <li>
                <Link href="/properties" className="hover:text-primary-foreground/80 transition-colors duration-200">
                  {t("footer.browseProperties")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-foreground/80 transition-colors duration-200">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary-foreground/80 transition-colors duration-200">
                  {t("footer.ourServices")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-5 text-primary-foreground/80 font-heading tracking-wide">{t("footer.services")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/50">
              <li>
                <span className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">
                  {t("footer.buying")}
                </span>
              </li>
              <li>
                <span className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">
                  {t("footer.selling")}
                </span>
              </li>
              <li>
                <span className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">
                  {t("footer.consulting")}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 text-primary-foreground/80 font-heading tracking-wide">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/50">
              <li className="flex items-start gap-2">
                <span>{contactEmail || "info@estatehub.com"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>{contactPhone || "(555) 123-4567"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>{contactAddress || "123 Luxury Lane, New York, NY 10001"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/10 pt-10 pb-12 mb-4">
          <div className="max-w-lg mx-auto text-center">
            <h4 className="text-primary-foreground font-semibold font-heading mb-1">Stay Updated</h4>
            <p className="text-sm text-primary-foreground/40 mb-5">Get the latest properties and market insights delivered to your inbox.</p>
            <Newsletter />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/30">
            {t("footer.copyright", { year: new Date().getFullYear(), siteName: siteName || "EstateHub" })}
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/30">
            {socials.map((s) => {
              const Icon = s.icon
              return (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full p-1.5 -m-1.5" title={s.label}>
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
            <span className="hover:text-primary-foreground/50 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded px-1">{t("footer.privacy")}</span>
            <span className="hover:text-primary-foreground/50 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded px-1">{t("footer.terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
