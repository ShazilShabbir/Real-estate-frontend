'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { MapPin, Home, Loader2, Heart } from 'lucide-react'
import { useProperties } from '@/hooks/use-properties'
import { PropertyMediaCarousel } from '@/components/property-media-carousel'
import { useAuthContext } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

export default function FavoritesPage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser, optimisticToggleFavorite } = useAuthContext()
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
        // We can fetch all properties and filter, or if the backend supports multiple IDs
        // For now, let's fetch properties that match the IDs
        const allProps = await fetchProperties()
        const favorites = allProps.filter((p: any) => user.savedProperties?.includes(p._id.toString()))
        setFavoriteProperties(favorites)
      } catch (err) {
        console.error("Failed to load favorites", err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadFavorites()
    }
  }, [user?.savedProperties, authLoading, fetchProperties])

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

  const handleLike = async (e: React.MouseEvent, propertyId: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic Update
    optimisticToggleFavorite(propertyId.toString())

    try {
      await toggleLike(propertyId)
      await refreshUser()
    } catch (err) {
      // Error handled by hook
    }
  }

  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Your Favorites</h1>
            <p className="text-lg text-muted-foreground">
              Manage and view all your saved real estate gems
            </p>
          </div>

          {!isAuthenticated ? (
             <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border px-6">
                <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Please log in to see your favorites</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Sign in to your account to access your personalized list of saved properties.
                </p>
                <Link href="/login">
                    <Button size="lg" className="px-8">Sign In Now</Button>
                </Link>
             </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : favoriteProperties.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border px-6">
              <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Explore our property listings and click the heart icon to save your favorites here.
              </p>
              <Link href="/properties">
                <Button size="lg" className="px-8 whitespace-nowrap overflow-hidden">Discover Properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteProperties.map((property) => (
                <div
                  key={property._id}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full group">
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
                        size={18} 
                        className="transition-colors fill-red-500 text-red-500" 
                      />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{getTitle(property)}</h3>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin size={16} className="mr-2" />
                      {getLocation(property)}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-4">{formatPrice(property.price, property.currency)}</div>
                    <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Home size={16} className="mr-1" />
                        {getBeds(property)} beds
                      </div>
                      <div>•</div>
                      <div>{getBaths(property)} baths</div>
                      <div>•</div>
                      <div>{property.sqft || property.squareFeet || 'N/A'} sqft</div>
                    </div>
                    <Button variant="default" className="w-full">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
