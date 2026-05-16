"use client"

import { useEffect, useState } from "react"
import { Heart, MapPin, Bed, Bath, Square, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProperties } from "@/hooks/use-properties"
import { PropertyMediaCarousel } from "@/components/property-media-carousel"
import { useAuthContext } from "@/lib/auth-context"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/use-translation"
import Link from "next/link"
import { Reveal } from "@/components/reveal"

interface Property {
  _id: string | number
  title?: string
  name?: string
  price: string | number
  currency?: string
  address?: { street?: string; city?: string; state?: string; zipcode?: string; country?: string }
  bedrooms?: number
  bathrooms?: number
  area?: string | number
  sqft?: string | number
  squareFeet?: string | number
  image?: string
  images?: Array<string | { url?: string; public_id?: string }>
  videos?: Array<string | { url?: string; public_id?: string }>
  propertyType?: string
  status?: string
}

export function Featured() {
  const { user, isAuthenticated, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { defaultCurrency } = useSite()
  const { t } = useTranslation()
  const { fetchProperties, toggleLike, loading, error } = useProperties()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties({ limit: 6, isFeatured: "true" })
        setProperties(data || [])
      } catch {
        // handled by hook
      }
    }
    loadProperties()
  }, [])

  const getBeds = (property: Property) => property.bedrooms || 0
  const getBaths = (property: Property) => property.bathrooms || 0
  const getArea = (property: Property) => property.sqft || property.squareFeet || property.area || "N/A"

  const getImage = (property: Property) => {
    const raw = property.image ?? property.images?.[0]
    const image =
      typeof raw === "string" ? raw.trim() : typeof raw === "object" && raw?.url ? raw.url.trim() : ""
    return image ? image : "/placeholder.svg"
  }

  const getTitle = (property: Property) => property.title || property.name || t("featured.fallbackTitle")

  const getLocation = (property: Property) => {
    if (property.address) {
      const { street, city, state, zipcode, country } = property.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return t("featured.fallbackAddress")
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available": return "bg-emerald-500/90 text-white"
      case "sold": return "bg-red-500/90 text-white"
      case "pending": return "bg-amber-500/90 text-white"
      case "rented": return "bg-blue-500/90 text-white"
      default: return "bg-primary/90 text-primary-foreground"
    }
  }

  const [likedId, setLikedId] = useState<string | number | null>(null)

  const handleLike = async (e: React.MouseEvent, propertyId: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      window.location.href = "/login"
      return
    }
    setLikedId(propertyId)
    setTimeout(() => setLikedId(null), 300)
    optimisticToggleFavorite(propertyId.toString())
    try {
      await toggleLike(propertyId)
      await refreshUser()
    } catch {
      // handled
    }
  }

  const isLiked = (propertyId: string | number) =>
    user?.savedProperties?.includes(propertyId.toString())

  return (
    <section id="featured" className="py-24 md:py-32 bg-gradient-to-b from-background to-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 mb-5">
              {t("featured.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              {t("featured.heading")}
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              {t("featured.subtitle")}
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/30 bg-card/50">
                <div className="h-64 bg-muted-foreground/5 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-5 w-3/4 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-7 w-1/3 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-px bg-border/30" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-muted-foreground/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("featured.errorTitle")}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">{error}</p>
            <p className="text-xs text-muted-foreground/60">
              {t("featured.errorDesc")}
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("featured.emptyTitle")}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t("featured.emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((property, i) => (
              <Link key={property._id} href={`/properties/${property._id}`} className="group block">
                <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-border/40 bg-card/95 h-full flex flex-col rounded-2xl">
                  <div className="relative overflow-hidden h-64 image-zoom">
                    <PropertyMediaCarousel
                      images={getImage(property) ? [getImage(property)] : []}
                      videos={property.videos}
                      title={getTitle(property)}
                    />
                    {property.status && (
                      <span
                        className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider z-10 shadow-lg backdrop-blur-sm ${getStatusColor(property.status)}`}
                      >
                        {property.status}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleLike(e, property._id)}
                      className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-3 transition-all duration-200 z-10 shadow-lg hover:shadow-xl group/btn tap-target"
                    >
                      <Heart
                        size={18}
                        className={cn(
                          "transition-colors",
                          isLiked(property._id)
                            ? "fill-red-500 text-red-500"
                            : "text-foreground/60 group-hover/btn:text-red-400",
                          likedId === property._id && "animate-heart-pop"
                        )}
                      />
                    </button>
                    {property.propertyType && (
                      <span className="absolute bottom-4 left-4 bg-background/70 backdrop-blur-md text-foreground px-3 py-1 rounded-full text-xs font-medium border border-border/40 z-10">
                        {property.propertyType}
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors">
                      {getTitle(property)}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin size={13} className="mr-1.5 shrink-0 text-primary/60" />
                      <span className="truncate">{getLocation(property)}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-5">
                      {formatPrice(property.price, property.currency, defaultCurrency)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Bed size={14} className="text-foreground/30" />
                        <span className="font-medium text-foreground/70">{getBeds(property)}</span>
                        <span className="text-foreground/40">{t("featured.beds")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath size={14} className="text-foreground/30" />
                        <span className="font-medium text-foreground/70">{getBaths(property)}</span>
                        <span className="text-foreground/40">{t("featured.baths")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square size={14} className="text-foreground/30" />
                        <span className="font-medium text-foreground/70">{getArea(property)}</span>
                        <span className="text-foreground/40">{t("featured.sqft")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {properties.length > 0 && (
          <div className="text-center mt-14">
            <Link href="/properties">
              <Button
                variant="outline"
                size="lg"
                className="px-10 border-foreground/20 hover:bg-foreground/5 rounded-xl h-12 text-foreground/80"
              >
                {t("featured.exploreAll")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
