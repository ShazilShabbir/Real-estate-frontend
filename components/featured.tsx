"use client"

import { useEffect, useState } from "react"

import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProperties } from "@/hooks/use-properties"
import {PropertyMediaCarousel} from "@/components/property-media-carousel"
import { useAuthContext } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Property {
  _id: string | number
  title?: string
  name?: string
  price: string | number
  currency?: string
  location?: { type?: string; coordinates?: number[] }
  address?: { street?: string; city?: string; state?: string; zipcode?: string; country?: string }
  beds?: number
  bedrooms?: number
  baths?: number
  bathrooms?: number
  sqft?: string | number
  squareFeet?: string | number
  image?: string
  images?: Array<string | { url?: string; public_id?: string }>
  videos?: Array<string | { url?: string; public_id?: string }>
  area?: string | number
}

export function Featured() {
  const { user, isAuthenticated, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { fetchProperties, toggleLike, loading, error } = useProperties()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties({ limit: 5 })
        setProperties(data || [])
      } catch (err) {
        // Error state handled by useProperties hook
      }
    }
    loadProperties()
  }, [])

  const formatPrice = (price: string | number, currency?: string) => {
    if (typeof price === "string") return price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(Number(price))
  }

  const getBeds = (property: Property) => property.beds || property.bedrooms || 0
  const getBaths = (property: Property) => property.baths || property.bathrooms || 0
  const getImage = (property: Property) => {
    const raw = property.image ?? property.images?.[0]
    const image =
      typeof raw === "string" ? raw.trim() : typeof raw === "object" && raw?.url ? raw.url.trim() : ""
    return image ? image : "/placeholder.svg"
  }
  const getTitle = (property: Property) => property.title || property.name || "Property"
  const getLocation = (property: Property) => {
    if (property.address) {
      const { street, city, state, zipcode, country } = property.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return "Location unavailable"
  }

  const [likedId, setLikedId] = useState<string | number | null>(null)

  const handleLike = async (e: React.MouseEvent, propertyId: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setLikedId(propertyId)
    setTimeout(() => setLikedId(null), 300)
    
    // Optimistic Update
    optimisticToggleFavorite(propertyId.toString())
    
    try {
      await toggleLike(propertyId)
      // We don't necessarily need refreshUser here anymore since we updated optimistically,
      // but keeping it for ultimate consistency if the backend changed something else.
      await refreshUser()
    } catch (err) {
      // Rollback if needed, but for simplicity we rely on refreshUser or just let it stay
      // In a more robust system, we would store previous state
    }
  }

  const isLiked = (propertyId: string | number) => {
    return user?.savedProperties?.includes(propertyId.toString())
  }

  const getVideo = (property: Property) => {
  const raw = property.videos?.[0]
  if (!raw) return null

  // Cloudinary 20-second preview transformation
  if (typeof raw === "string") return raw
  if (raw.url) return raw.url.replace("/upload/", "/upload/so_20/")

  return null
}

  return (
    <section id="featured" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-pretty">Featured Properties</h2>
          <p className="text-lg text-foreground/70 text-pretty">
            Explore our most exclusive listings hand-picked for discerning buyers
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-foreground/60">Unable to load properties. Please ensure your backend is running.</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">No properties available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {properties.map((property) => (
              
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow ">
               <div
  className="relative overflow-hidden h-64 group"
>
    <PropertyMediaCarousel
                    images={getImage(property) ? [getImage(property)] : []}
                    videos={property.videos}
                    title={getTitle(property)}
                   
                  />


  {/* Like Button */}
  <button 
    onClick={(e) => handleLike(e, property._id)}
    className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors z-10"
  >
    <Heart 
      size={20} 
      className={cn(
        "transition-colors",
        isLiked(property._id) ? "fill-red-500 text-red-500" : "text-primary",
        likedId === property._id && "animate-heart-pop"
      )} 
    />
  </button>
</div>


                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2 text-pretty">{getTitle(property)}</h3>
                  <p className="text-primary font-bold text-2xl mb-2">
                    {formatPrice(property.price, property.currency)}
                  </p>
                  <p className="text-foreground/60 text-sm mb-4">{getLocation(property)}</p>

                  <div className="flex gap-4 text-foreground/70 text-sm mb-6 pb-6 border-b border-border">
                    <div>
                      <span className="font-semibold text-foreground">{getBeds(property)}</span> Beds
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{getBaths(property)}</span> Baths
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {property.sqft || property.squareFeet || property.area || "N/A"}
                      </span>
                      sqft
                    </div>
                  </div>

                  <Link href={`/properties/${property._id}`}>
  <Button variant="default" className="w-full">
    View Details
  </Button>
</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
