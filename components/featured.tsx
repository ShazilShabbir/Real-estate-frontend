"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProperties } from "@/hooks/use-properties"

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

export function Featured() {
  const { fetchProperties, loading, error } = useProperties()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties({ limit: 5 })
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
              
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden h-64">
                  <Image
                    src={getImage(property)}
                    alt={getTitle(property)}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <button className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors z-10">
                    <Heart size={20} className="text-primary" />
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

                  <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
