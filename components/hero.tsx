"use client"

import { useEffect, useRef } from "react"
import { useTranslation } from "@/lib/use-translation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Building2 } from "lucide-react"

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const children = el.querySelectorAll(".animate-on-scroll")
    children.forEach((child, i) => {
      setTimeout(() => {
        child.classList.add("animate-fade-up")
        child.classList.remove("opacity-0", "translate-y-8")
      }, i * 120)
    })
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/american-house.jpg"
          alt={t("hero.imgAlt")}
          fill
          priority
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-noise" />
      </div>

      {/* Premium Decorative Elements */}
      <div className="absolute top-20 right-[15%] w-64 h-64 bg-gradient-to-br from-primary/15 to-amber-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 bg-gradient-to-br from-amber-500/8 to-primary/5 rounded-full blur-3xl" />

      {/* Floating Orbs */}
      <div
        className="absolute top-1/4 right-[12%] hidden lg:block"
        style={{ animation: "float 6s ease-in-out infinite" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
      </div>
      <div
        className="absolute bottom-1/3 right-[22%] hidden lg:block"
        style={{ animation: "float 7s ease-in-out infinite 1s" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
          <Shield className="w-6 h-6 text-amber-400" />
        </div>
      </div>
      <div
        className="absolute top-1/2 right-[5%] hidden lg:block"
        style={{ animation: "float 8s ease-in-out infinite 2s" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
          <Users className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <div className="opacity-0 translate-y-8 animate-on-scroll mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="opacity-0 translate-y-8 animate-on-scroll text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
            {t("hero.title")}
            <br />
            <span className="text-gradient">{t("hero.titleAccent")}</span>
          </h1>

          <p className="opacity-0 translate-y-8 animate-on-scroll text-lg md:text-xl text-foreground/65 mb-10 max-w-xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="opacity-0 translate-y-8 animate-on-scroll flex flex-col sm:flex-row gap-4">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground text-lg px-8 h-13 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 rounded-xl"
              >
                {t("hero.browseProperties")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/properties">
              <Button
                size="lg"
                variant="outline"
                className="border-foreground/20 text-foreground hover:bg-foreground/[0.04] text-lg px-8 h-13 bg-background/40 backdrop-blur-sm rounded-xl"
              >
                {t("hero.viewListings")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="opacity-0 translate-y-8 animate-on-scroll mt-16 grid grid-cols-3 gap-8 md:gap-12 border-t border-foreground/10 pt-8">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">100+</p>
              <p className="text-sm text-foreground/50 mt-1 font-medium tracking-wide uppercase">{t("hero.statProperties")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">50+</p>
              <p className="text-sm text-foreground/50 mt-1 font-medium tracking-wide uppercase">{t("hero.statClients")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gradient">20+</p>
              <p className="text-sm text-foreground/50 mt-1 font-medium tracking-wide uppercase">{t("hero.statLocations")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60V0C240 40 480 60 720 60C960 60 1200 40 1440 0V60H0Z" fill="var(--background)" />
        </svg>
      </div>
    </section>
  )
}
