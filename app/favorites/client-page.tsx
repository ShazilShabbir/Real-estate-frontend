"use client"



import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Loader2, Heart, Bed, Bath, Square } from "lucide-react"
import { useProperties } from "@/hooks/use-properties"
import { PropertyMediaCarousel } from "@/components/property-media-carousel"
import { useAuthContext } from "@/lib/auth-context"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTranslation } from "@/lib/use-translation"
import { SkeletonGrid } from "@/components/skeleton-card"

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

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, loading: authLoading, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { defaultCurrency } = useSite()
  const { fetchProperties, toggleLike, loading: propsLoading } = useProperties()
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.savedProperties || user.savedProperties.length === 0) {
        setFavoriteProperties([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const allProps = await fetchProperties()
        const favorites = allProps.filter((p: any) => user.savedProperties?.includes(p._id.toString()))
        setFavoriteProperties(favorites)
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    if (!authLoading) loadFavorites()
  }, [user?.savedProperties, authLoading, fetchProperties])

  const getBeds = (p: Property) => p.bedrooms || 0
  const getBaths = (p: Property) => p.bathrooms || 0
  const getArea = (p: Property) => p.sqft || p.squareFeet || p.area || "N/A"

  const getImage = (property: Property) => {
    const raw = property.image ?? property.images?.[0]
    const image =
      typeof raw === "string" ? raw.trim() : typeof raw === "object" && raw?.url ? raw.url.trim() : ""
    return image ? image : "/placeholder.svg"
  }

  const getTitle = (p: Property) => p.title || p.name || t("favorites.fallbackTitle")

  const getLocation = (property: Property) => {
    if (property.address) {
      const { street, city, state, zipcode, country } = property.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return t("favorites.fallbackAddress")
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

  const handleLike = async (e: React.MouseEvent, propertyId: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    optimisticToggleFavorite(propertyId.toString())
    try {
      await toggleLike(propertyId)
      await refreshUser()
    } catch {
      // handled
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <SkeletonGrid count={3} />
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">{t("favorites.heading")}</h1>
            <p className="text-muted-foreground">
              {t("favorites.count", { count: favoriteProperties.length })}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border px-6">
              <Heart className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("favorites.unauthTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t("favorites.unauthDesc")}
              </p>
              <Link href="/login">
                <Button size="lg" className="px-8">
                  {t("favorites.signInNow")}
                </Button>
              </Link>
            </div>
          ) : loading ? (
            <SkeletonGrid count={3} />
          ) : favoriteProperties.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border px-6">
              <Heart className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("favorites.emptyTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t("favorites.emptyDesc")}
              </p>
              <Link href="/properties">
                <Button size="lg" className="px-8">
                  {t("favorites.discoverProperties")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <Link
                  key={property._id}
                  href={`/properties/${property._id}`}
                  className="group block"
                >
                  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden h-52">
                      <PropertyMediaCarousel
                        images={getImage(property) ? [getImage(property)] : []}
                        videos={property.videos}
                        title={getTitle(property)}
                      />
                      {property.status && (
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider z-10 ${getStatusColor(property.status)}`}
                        >
                          {property.status}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleLike(e, property._id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 transition-all z-10 shadow-md tap-target"
                      >
                        <Heart size={16} className="fill-red-500 text-red-500" />
                      </button>
                      {property.propertyType && (
                        <span className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs font-medium border border-border/50 z-10">
                          {property.propertyType}
                        </span>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-1.5 line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors">
                        {getTitle(property)}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-xs mb-3">
                        <MapPin size={12} className="mr-1 shrink-0" />
                        <span className="truncate">{getLocation(property)}</span>
                      </div>
                      <p className="text-xl font-bold text-primary mb-3">
                        {formatPrice(property.price, property.currency, defaultCurrency)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Bed size={13} className="text-foreground/40" />
                          <span>{getBeds(property)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath size={13} className="text-foreground/40" />
                          <span>{getBaths(property)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square size={13} className="text-foreground/40" />
                          <span>{getArea(property)} sqft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
