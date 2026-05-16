"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Home, Loader2, Heart, SlidersHorizontal, Bed, Bath, Square, X } from "lucide-react"
import { useProperties } from "@/hooks/use-properties"
import { PropertyMediaCarousel } from "@/components/property-media-carousel"
import { PropertyFilter } from "@/components/property-filter"
import { Pagination } from "@/components/pagination"
import { useAuthContext } from "@/lib/auth-context"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/use-translation"
import { SkeletonGrid } from "@/components/skeleton-card"

const PropertyMap = dynamic(() => import("@/components/property-map"), { ssr: false })

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

function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { defaultCurrency } = useSite()
  const { fetchPropertiesWithPagination, toggleLike, loading, error } = useProperties()
  const { t } = useTranslation()

  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  const q = searchParams?.get("q") || ""
  const minPrice = searchParams?.get("minPrice") || ""
  const maxPrice = searchParams?.get("maxPrice") || ""
  const city = searchParams?.get("city") || ""
  const state = searchParams?.get("state") || ""
  const propertyType = searchParams?.get("propertyType") || ""
  const bedrooms = searchParams?.get("bedrooms") || ""
  const bathrooms = searchParams?.get("bathrooms") || ""
  const sort = searchParams?.get("sort") || ""
  const currentPage = parseInt(searchParams?.get("page") || "1", 10)

  const filters = { q, minPrice, maxPrice, city, state, propertyType, bedrooms, bathrooms, sort }

  const activeFilterCount = [q, minPrice, maxPrice, city, state, propertyType, bedrooms, bathrooms, sort].filter(Boolean).length

  useEffect(() => {
    const params: Record<string, any> = { limit: 12, page: currentPage }
    if (q) params.q = q
    if (minPrice) params.minPrice = Number(minPrice)
    if (maxPrice) params.maxPrice = Number(maxPrice)
    if (city) params.city = city
    if (state) params.state = state
    if (propertyType) params.propertyType = propertyType
    if (bedrooms) params.bedrooms = Number(bedrooms)
    if (bathrooms) params.bathrooms = Number(bathrooms)
    if (sort) params.sort = sort

    const load = async () => {
      const result = await fetchPropertiesWithPagination(params)
      setProperties(result.properties as Property[])
      setTotal(result.total)
      setPage(result.page)
    }
    load()
  }, [q, minPrice, maxPrice, city, state, propertyType, bedrooms, bathrooms, sort, currentPage, fetchPropertiesWithPagination])

  const onFilterChange = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val)
    })
    if (!params.get("page")) params.set("page", "1")
    router.push(`/properties?${params.toString()}`)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.delete(key)
    params.set("page", "1")
    router.push(`/properties?${params.toString()}`)
  }

  const onPageChange = (p: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("page", String(p))
    router.push(`/properties?${params.toString()}`)
  }

  const getBeds = (property: Property) => property.bedrooms || 0
  const getBaths = (property: Property) => property.bathrooms || 0
  const getArea = (property: Property) => property.sqft || property.squareFeet || property.area || "N/A"

  const getImage = (property: Property) => {
    const raw = property.image ?? property.images?.[0]
    const image =
      typeof raw === "string" ? raw.trim() : typeof raw === "object" && raw?.url ? raw.url.trim() : ""
    return image ? image : "/placeholder.svg"
  }

  const getTitle = (property: Property) => property.title || property.name || t("properties.fallbackTitle")

  const getLocation = (property: Property) => {
    if (property.address) {
      const { street, city, state, zipcode, country } = property.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return t("properties.fallbackAddress")
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

  const isLiked = (propertyId: string | number) => {
    return user?.savedProperties?.includes(propertyId.toString())
  }

  const filterBadges: { key: string; label: string }[] = []
  if (q) filterBadges.push({ key: "q", label: `"${q}"` })
  if (city) filterBadges.push({ key: "city", label: city + (state ? `, ${state}` : "") })
  if (propertyType) filterBadges.push({ key: "propertyType", label: propertyType })
  if (bedrooms) filterBadges.push({ key: "bedrooms", label: `${bedrooms}+ beds` })
  if (bathrooms) filterBadges.push({ key: "bathrooms", label: `${bathrooms}+ baths` })
  if (minPrice || maxPrice) {
    const label = `${minPrice ? `$${(+minPrice / 1000).toFixed(0)}k` : "$0"} - ${maxPrice ? `$${(+maxPrice / 1000).toFixed(0)}k` : "∞"}`
    filterBadges.push({ key: "price", label })
  }
  if (sort) {
    const labels: Record<string, string> = { oldest: "Oldest", price_asc: "Low Price", price_desc: "High Price" }
    filterBadges.push({ key: "sort", label: labels[sort] || sort })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header with results count */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-1">{t("properties.heading")}</h1>
                <p className="text-muted-foreground">
                  {total === 1 ? t("properties.found", { total }) : t("properties.found_plural", { total })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center border border-border/60 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground bg-card"
                    }`}
                  >
                    {t("filter.grid")}
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "map"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground bg-card"
                    }`}
                  >
                    {t("filter.map")}
                  </button>
                </div>

                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t("filter.filters")}
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filter Badges */}
            {filterBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {filterBadges.map((badge) => (
                  <span
                    key={badge.key}
                    className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full border border-primary/20"
                  >
                    {badge.label}
                    <button onClick={() => removeFilter(badge.key)} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => router.push("/properties")}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 ml-1"
                >
                  {t("filter.clearAll")}
                </button>
              </div>
            )}
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <div className="mb-8">
              <PropertyMap properties={properties as any} height="500px" />
            </div>
          )}

          {viewMode === "grid" && (
          <div className="flex gap-8">
            {/* Sidebar Filter - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{t("filter.filters")}</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => router.push("/properties")}
                      className="text-xs text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      {t("filter.reset")}
                    </button>
                  )}
                </div>
                <PropertyFilter filters={filters} onFilterChange={onFilterChange} total={total} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {showMobileFilter && (
              <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                <div className="absolute right-0 top-0 h-full w-[calc(100vw-2rem)] max-w-sm bg-card p-6 overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-lg">{t("filter.filters")}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileFilter(false)}>
                      <X className="h-4 w-4 mr-1" /> {t("filter.close")}
                    </Button>
                  </div>
                  <PropertyFilter filters={filters} onFilterChange={onFilterChange} total={total} />
                </div>
              </div>
            )}

            {/* Results */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <SkeletonGrid count={6} />
              ) : error ? (
                <div className="text-center py-16 bg-destructive/5 rounded-2xl border border-destructive/10 p-8">
                  <p className="text-destructive font-semibold mb-2">{t("properties.errorTitle")}</p>
                  <p className="text-muted-foreground text-sm mb-4">{error}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("properties.errorDesc")}
                  </p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                  <Home className="mx-auto h-14 w-14 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{t("properties.emptyTitle")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t("properties.emptyDesc")}
                  </p>
                  <Button variant="outline" onClick={() => router.push("/properties")}>
                    {t("properties.clearAllFilters")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
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
                              <Heart
                                size={16}
                                className={cn(
                                  "transition-colors",
                                  isLiked(property._id) ? "fill-red-500 text-red-500" : "text-foreground/60",
                                  likedId === property._id && "animate-heart-pop"
                                )}
                              />
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
                                <span>{getArea(property)} {t("featured.sqft")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Pagination page={page} total={total} limit={12} onPageChange={onPageChange} />
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={<SkeletonGrid count={6} />}
    >
      <PropertiesContent />
    </Suspense>
  )
}
