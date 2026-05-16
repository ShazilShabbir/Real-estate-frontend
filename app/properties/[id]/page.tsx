"use client"

import { useEffect, useState, use } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Home,
  Loader2,
  Heart,
  Bed,
  Bath,
  Square,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Share2,
} from "lucide-react"
import { useProperties } from "@/hooks/use-properties"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyMediaCarousel } from "@/components/property-media-carousel"
import { useAuthContext } from "@/lib/auth-context"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/use-translation"
import Link from "next/link"
import { Reveal } from "@/components/reveal"
import { SkeletonCard } from "@/components/skeleton-card"
import { ShareModal } from "@/components/share-modal"
import { MortgageCalculator } from "@/components/mortgage-calculator"

const PropertyDetailMap = dynamic(() => import("@/components/property-detail-map"), { ssr: false })

interface Property {
  _id: string | number
  title?: string
  name?: string
  description?: string
  price: string | number
  currency?: string
  propertyType?: string
  status?: string
  address?: { street?: string; city?: string; state?: string; zipcode?: string; country?: string }
  location?: { type?: string; coordinates?: number[] }
  bedrooms?: number
  bathrooms?: number
  area?: string | number
  sqft?: string | number
  squareFeet?: string | number
  amenities?: string[]
  images?: Array<string | { url?: string; public_id?: string }>
  videos?: Array<string | { url?: string; public_id?: string }>
  postedBy?: { name?: string; email?: string; phone?: string; avatar?: string }
}

const AMENITY_ICONS: Record<string, string> = {
  Wifi: "📶",
  Parking: "🅿️",
  Security: "🛡️",
  Pool: "🏊",
  Gym: "💪",
  Garden: "🌿",
  Kitchen: "🍳",
  "Air Conditioning": "❄️",
  Heating: "🔥",
  "Pet Friendly": "🐾",
  Elevator: "🛗",
  Laundry: "🧺",
  Storage: "📦",
  Balcony: "🏔️",
  Fireplace: "🔥",
  "Hardwood Floors": "🪵",
  "Stainless Appliances": "🔧",
  "Walk-in Closet": "👔",
  "Smart Home": "🏠",
  "Solar Panels": "☀️",
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const { user, isAuthenticated, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { defaultCurrency } = useSite()
  const { t } = useTranslation()
  const { getProperty, toggleLike, getNearbyProperties, loading, error } = useProperties()
  const [property, setProperty] = useState<Property | null>(null)
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([])
  const [likedId, setLikedId] = useState<string | number | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await getProperty(id)
        setProperty(data)
      } catch {
        // handled
      }
    }
    loadProperty()
  }, [id, getProperty])

  useEffect(() => {
    if (!property?.location?.coordinates) return
    const [lng, lat] = property.location.coordinates
    const loadNearby = async () => {
      try {
        const result = await getNearbyProperties(lat, lng, 20, 4)
        const filtered = Array.isArray(result)
          ? result.filter((p: any) => String(p._id) !== String(id))
          : []
        setNearbyProperties(filtered.slice(0, 4))
      } catch {
        // silent
      }
    }
    loadNearby()
  }, [property?._id])

  const getBeds = (p: Property) => p.bedrooms || 0
  const getBaths = (p: Property) => p.bathrooms || 0
  const getArea = (p: Property) => p.sqft || p.squareFeet || p.area || "N/A"
  const getTitle = (p: Property) => p.title || p.name || t("propertyDetail.fallbackTitle")

  const getLocation = (p: Property) => {
    if (p.address) {
      if (typeof p.address === "string") return p.address
      const { street, city, state, zipcode, country } = p.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return t("propertyDetail.fallbackAddress")
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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = "/login"
      return
    }
    if (!property) return
    setLikedId(property._id)
    setTimeout(() => setLikedId(null), 300)
    optimisticToggleFavorite(property._id.toString())
    try {
      await toggleLike(property._id)
      await refreshUser()
    } catch {
      // handled
    }
  }

  const isLiked = () => user?.savedProperties?.includes(id)

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-800 rounded w-1/3" />
            <div className="aspect-[21/9] bg-neutral-800 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-neutral-800 rounded w-3/4" />
                <div className="h-4 bg-neutral-800 rounded w-full" />
                <div className="h-4 bg-neutral-800 rounded w-5/6" />
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-neutral-800 rounded-xl" />
                <div className="h-10 bg-neutral-800 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !property) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <Home className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">{t("propertyDetail.notFoundTitle")}</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            {error || t("propertyDetail.notFoundDesc")}
          </p>
          <Link href="/properties">
            <Button variant="default" className="rounded-xl">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("propertyDetail.backToProperties")}
            </Button>
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const defaultAmenities =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : ["Parking", "Security", "Kitchen", "Garden", "Storage", "Laundry"]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24">
        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/properties"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            {t("propertyDetail.backToProperties")}
          </Link>
        </div>

        {/* Gallery */}
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
            <PropertyGallery images={property.images} videos={property.videos} title={getTitle(property)} />
          </div>
        </Reveal>

        {/* Title & Price Bar */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Reveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card border border-border/40 rounded-2xl p-6 md:p-8 shadow-lg shadow-primary/[0.02]">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {property.status && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(property.status)}`}
                  >
                    {property.status}
                  </span>
                )}
                {property.propertyType && (
                  <span className="bg-muted/80 text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-border/40">
                    {property.propertyType}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-2 font-heading">
                {getTitle(property)}
              </h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin size={18} className="mr-2 text-primary shrink-0" />
                <span>{getLocation(property)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
              <div className="text-4xl md:text-5xl font-bold text-gradient">{formatPrice(property.price, property.currency, defaultCurrency)}</div>
              <div className="flex gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium",
                    isLiked()
                      ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-800/30"
                      : "bg-card border-border/40 hover:border-foreground/20 text-foreground/70 hover:text-foreground"
                  )}
                >
                  <Heart
                    size={18}
                    className={cn(
                      "transition-colors",
                      isLiked() ? "fill-red-500 text-red-500" : "text-foreground/40",
                      likedId === property._id && "animate-heart-pop"
                    )}
                  />
                  {isLiked() ? t("propertyDetail.saved") : t("propertyDetail.save")}
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/40 hover:border-foreground/20 text-foreground/70 hover:text-foreground transition-all duration-200 text-sm font-medium"
                >
                  <Share2 size={18} />
                  {t("propertyDetail.share")}
                </button>
              </div>
            </div>
          </div>
          </Reveal>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Key Stats */}
              <Reveal><div className="grid grid-cols-3 gap-4 bg-card border border-border/40 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-primary/20 to-amber-500/20 p-3.5 rounded-xl mb-3">
                    <Bed className="text-primary" size={22} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getBeds(property)}</span>
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.bedrooms")}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-primary/20 to-amber-500/20 p-3.5 rounded-xl mb-3">
                    <Bath className="text-primary" size={22} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getBaths(property)}</span>
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.bathrooms")}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-primary/20 to-amber-500/20 p-3.5 rounded-xl mb-3">
                    <Square className="text-primary" size={22} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getArea(property)}</span>
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.sqft")}</span>
                </div>
              </div></Reveal>

              {/* Description */}
              <Reveal delay={100}>
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3 font-heading">
                    <span className="w-1 h-7 bg-gradient-to-b from-primary to-amber-500 rounded-full" />
                    {t("propertyDetail.description")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {property.description || t("propertyDetail.noDescription")}
                  </p>
                </section>
              </Reveal>

              {/* Amenities */}
              <Reveal delay={200}>
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3 font-heading">
                    <span className="w-1 h-7 bg-gradient-to-b from-primary to-amber-500 rounded-full" />
                    {t("propertyDetail.amenities")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {defaultAmenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-lg shrink-0">{AMENITY_ICONS[amenity] || "✓"}</div>
                        <span className="text-sm font-medium text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>

              {/* Location Map */}
              {property.location?.coordinates?.length === 2 && (
                <Reveal delay={300}>
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3 font-heading">
                      <span className="w-1 h-7 bg-gradient-to-b from-primary to-amber-500 rounded-full" />
                      {t("propertyDetail.location")}
                    </h2>
                    <PropertyDetailMap
                      latitude={property.location.coordinates[1]}
                      longitude={property.location.coordinates[0]}
                      title={getTitle(property)}
                    />
                  </section>
                </Reveal>
              )}

              {/* Nearby Properties */}
              {nearbyProperties.length > 0 && (
                <Reveal delay={400}>
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3 font-heading">
                      <span className="w-1 h-7 bg-gradient-to-b from-primary to-amber-500 rounded-full" />
                      {t("propertyDetail.nearby")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {nearbyProperties.map((np) => (
                        <Link
                          key={np._id}
                          href={`/properties/${np._id}`}
                          className="group flex gap-4 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                            {(() => {
                              const raw = np.image ?? np.images?.[0]
                              const url = typeof raw === "string" ? raw : typeof raw === "object" && raw?.url ? raw.url : null
                              return url ? (
                                <img src={url} alt={getTitle(np)} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                  <Home size={20} />
                                </div>
                              )
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {getTitle(np)}
                            </p>
                            <p className="text-sm font-bold text-primary mt-0.5">
                              {formatPrice(np.price, np.currency, defaultCurrency)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              <MapPin size={10} className="inline mr-0.5" />
                              {np.address?.city}{np.address?.state ? `, ${np.address.state}` : ""}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}
            </div>

            {/* Right: Contact Card */}
            <div className="lg:col-span-1">
              <Reveal delay={300}><div className="sticky top-24 space-y-6">
                <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-xl shadow-primary/[0.03]">
                  <h3 className="text-xl font-bold text-foreground mb-6 font-heading">{t("propertyDetail.interested")}</h3>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-primary/[0.03] to-amber-500/[0.03] rounded-xl border border-border/20">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0 shadow-lg">
                      {property.postedBy?.name?.[0] || "A"}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{property.postedBy?.name || "Authorized Agent"}</p>
                      <p className="text-sm text-muted-foreground">{t("propertyDetail.listingAgent")}</p>
                    </div>
                  </div>

                  <Button className="w-full h-13 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 rounded-xl mb-3">
                    {t("propertyDetail.requestTour")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-border/40 hover:bg-muted/30 rounded-xl"
                  >
                    {t("propertyDetail.contactAgent")}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground/60 mt-5">
                    {t("propertyDetail.disclaimer")}{" "}
                    <span className="underline underline-offset-2 cursor-pointer hover:text-foreground/80">{t("propertyDetail.terms")}</span>
                  </p>
                </div>

                {/* Mortgage Calculator */}
                <Reveal delay={400}>
                  <MortgageCalculator price={Number(property.price)} currency={defaultCurrency} />
                </Reveal>

                {/* Market Highlights */}
                <div className="bg-gradient-to-br from-primary/[0.04] to-amber-500/[0.02] rounded-2xl p-6 border border-primary/10">
                  <h4 className="font-semibold text-primary mb-4 flex items-center gap-2 font-heading">
                    {t("propertyDetail.marketInsights")}
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {[
                      t("propertyDetail.insight1"),
                      t("propertyDetail.insight2"),
                      t("propertyDetail.insight3"),
                      t("propertyDetail.insight4"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-gradient-to-r from-primary to-amber-500 rounded-full mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div></Reveal>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={getTitle(property)}
      />
    </>
  )
}
