"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building, Home, Trees, Store, Building2, Package, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProperties } from "@/hooks/use-properties"
import { useTranslation } from "@/lib/use-translation"
import { Reveal } from "@/components/reveal"

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; bg: string; iconColor: string }> = {
  house: {
    icon: <Home className="h-7 w-7" />,
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  apartment: {
    icon: <Building className="h-7 w-7" />,
    bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  villa: {
    icon: <Building2 className="h-7 w-7" />,
    bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  condo: {
    icon: <Building className="h-7 w-7" />,
    bg: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15 hover:border-purple-500/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  land: {
    icon: <Trees className="h-7 w-7" />,
    bg: "bg-green-500/10 border-green-500/20 hover:bg-green-500/15 hover:border-green-500/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  townhouse: {
    icon: <Home className="h-7 w-7" />,
    bg: "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15 hover:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  commercial: {
    icon: <Store className="h-7 w-7" />,
    bg: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15 hover:border-orange-500/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  other: {
    icon: <Package className="h-7 w-7" />,
    bg: "bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/15 hover:border-slate-500/30",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
}

export function CategoriesSection() {
  const { t } = useTranslation()
  const { fetchCategoryCounts } = useProperties()
  const [categories, setCategories] = useState<{ propertyType: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchCategoryCounts()
        if (result.categories.length === 0) {
          setError(t("categories.errorDesc"))
        } else {
          setCategories(result.categories)
        }
      } catch {
        setError(t("categories.failedLoad"))
      }
      setLoading(false)
    }
    load()
  }, [fetchCategoryCounts])

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30 relative border-y border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-6 w-32 bg-primary/20 rounded-full mx-auto mb-5 animate-pulse" />
            <div className="h-12 w-80 bg-muted-foreground/10 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-64 bg-muted-foreground/10 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 bg-muted-foreground/5 rounded-2xl animate-pulse border border-border/20" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30 relative border-y border-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 mb-5">
              {t("categories.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              {t("categories.heading")}
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              {t("categories.subtitle")}
            </p>
          </div>
        </Reveal>

        {error ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("categories.errorTitle")}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">{error}</p>
            <Link href="/properties">
              <Button variant="default" size="sm" className="rounded-xl">
                {t("categories.browseAll")}
              </Button>
            </Link>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("categories.emptyTitle")}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              {t("categories.emptyDesc")}
            </p>
            <Link href="/properties">
              <Button variant="default" size="sm" className="rounded-xl">
                  {t("categories.browseAll")}
                </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => {
              const style = CATEGORY_STYLES[cat.propertyType] || CATEGORY_STYLES.other
              return (
                <Link
                  key={cat.propertyType}
                  href={`/properties?propertyType=${cat.propertyType}`}
                className={`group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border ${style.bg} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-400`}
                style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`${style.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {style.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground text-lg">{t(`categories.${cat.propertyType}`)}</p>
                    <p className="text-sm text-muted-foreground">{t("categories.count", { count: cat.count })}</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0">
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
