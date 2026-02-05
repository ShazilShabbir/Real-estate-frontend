'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { MapPin, Home, Loader2 } from 'lucide-react'
import { useProperties } from '@/hooks/use-properties'

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
  area?: string | number
}

export default function PropertiesPage() {
  const { fetchProperties, loading, error } = useProperties()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
      const loadProperties = async () => {
        try {
          const data = await fetchProperties({ limit: 20 })
          setProperties(data || [])
        } catch (err) {
          console.log("[v0] Failed to load featured properties:", err)
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
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Our Properties</h1>
            <p className="text-lg text-muted-foreground">
              Browse our complete portfolio of premium real estate listings
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200 p-6">
              <p className="text-red-600 font-semibold mb-2">Unable to Load Properties</p>
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-red-500 text-sm">
                Please ensure your backend server is running at http://localhost:8080
              </p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={getImage(property) || "/placeholder.svg"}
                    alt={getTitle(property)}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
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
                    <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
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
