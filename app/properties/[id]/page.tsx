'use client'

import { useEffect, useState, use } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Home, 
  Loader2, 
  Heart, 
  Bed, 
  Bath, 
  Square, 
  ChevronLeft,
  Wifi,
  Car,
  Shield,
  Zap,
  Coffee,
  Trees,
  CheckCircle2
} from 'lucide-react'
import { useProperties } from '@/hooks/use-properties'
import { PropertyGallery } from '@/components/property-gallery'
import { useAuthContext } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
  beds?: number
  bedrooms?: number
  baths?: number
  bathrooms?: number
  sqft?: string | number
  squareFeet?: string | number
  amenities?: string[]
  images?: Array<string | { url?: string; public_id?: string }>
  videos?: Array<string | { url?: string; public_id?: string }>
  postedBy?: {
    name?: string
    email?: string
    phone?: string
    avatar?: string
  }
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const { user, isAuthenticated, refreshUser, optimisticToggleFavorite } = useAuthContext()
  const { getProperty, toggleLike, loading, error } = useProperties()
  const [property, setProperty] = useState<Property | null>(null)
  const [likedId, setLikedId] = useState<string | number | null>(null)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await getProperty(id)
        setProperty(data)
      } catch (err) {
        console.error("Failed to load property details:", err)
      }
    }
    loadProperty()
  }, [id, getProperty])

  const formatPrice = (price?: string | number, currency?: string) => {
    if (!price) return "N/A"
    if (typeof price === "string") return price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(Number(price))
  }

  const getBeds = (p: Property) => p.beds || p.bedrooms || 0
  const getBaths = (p: Property) => p.baths || p.bathrooms || 0
  const getArea = (p: Property) => p.sqft || p.squareFeet || 'N/A'
  const getTitle = (p: Property) => p.title || p.name || "Property"
  
  const getLocation = (p: Property) => {
    if (p.address) {
      if (typeof p.address === 'string') return p.address
      const { street, city, state, zipcode, country } = p.address
      const parts = [street, city, state, zipcode, country].filter(Boolean)
      if (parts.length) return parts.join(", ")
    }
    return "Location unavailable"
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    if (!property) return

    setLikedId(property._id)
    setTimeout(() => setLikedId(null), 300)

    optimisticToggleFavorite(property._id.toString())

    try {
      await toggleLike(property._id)
      await refreshUser()
    } catch (err) {
      // Error handled by hook
    }
  }

  const isLiked = () => {
    return user?.savedProperties?.includes(id)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h2>
          <p className="text-muted-foreground mb-8">{error || "The property you are looking for does not exist or has been removed."}</p>
          <Link href="/properties">
            <Button variant="default">Back to Properties</Button>
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    'Wifi': <Wifi size={20} />,
    'Parking': <Car size={20} />,
    'Security': <Shield size={20} />,
    'Electricity': <Zap size={20} />,
    'Kitchen': <Coffee size={20} />,
    'Garden': <Trees size={20} />,
    'Swimming Pool': <CheckCircle2 size={20} />,
    'Gym': <CheckCircle2 size={20} />,
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-20">
        {/* Navigation & Title Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/properties" className="inline-flex items-center text-primary hover:underline mb-6 group">
            <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Properties
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {property.status || 'For Sale'}
                </span>
                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {property.propertyType || 'Residential'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
                {getTitle(property)}
              </h1>
              <div className="flex items-center text-muted-foreground text-lg">
                <MapPin size={20} className="mr-2 text-primary" />
                {getLocation(property)}
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatPrice(property.price, property.currency)}
              </div>
              <button 
                onClick={handleLike}
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-lg transition-colors border border-border"
              >
                <Heart 
                  size={18} 
                  className={cn(
                    "transition-colors",
                    isLiked() ? "fill-red-500 text-red-500" : "text-foreground",
                    likedId === property._id && "animate-heart-pop"
                  )} 
                />
                <span className="text-sm font-medium">{isLiked() ? 'Saved' : 'Save Property'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section - Media Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <PropertyGallery
            images={property.images}
            videos={property.videos}
            title={getTitle(property)}
          />
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-12">
              {/* Key Stats Card */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-xl mb-3">
                    <Bed className="text-primary" size={24} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getBeds(property)}</span>
                  <span className="text-sm text-muted-foreground">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-xl mb-3">
                    <Bath className="text-primary" size={24} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getBaths(property)}</span>
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-xl mb-3">
                    <Square className="text-primary" size={24} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{getArea(property)}</span>
                  <span className="text-sm text-muted-foreground">Square Feet</span>
                </div>
              </div>

              {/* Description */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Description</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                  {property.description || "No description provided for this property."}
                </div>
              </section>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="text-primary">
                          {amenityIcons[amenity] || <CheckCircle2 size={20} />}
                        </div>
                        <span className="font-medium text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Contact & Inquiry */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold text-foreground mb-6">Interested in this property?</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                        {property.postedBy?.name?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{property.postedBy?.name || 'Authorized Agent'}</p>
                        <p className="text-sm text-muted-foreground">Listing Agent</p>
                      </div>
                    </div>
                    
                    <Button variant="default" className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-shadow">
                      Request a Tour
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-lg">
                      Contact Agent
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-6">
                    By clicking "Request a Tour" you agree to our terms and conditions.
                  </p>
                </div>

                {/* Quick Info Card */}
                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                  <h4 className="font-semibold text-primary mb-4 flex items-center">
                    <Zap size={16} className="mr-2" />
                    Market Highlights
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                       <div className="h-1 w-1 bg-primary rounded-full" />
                       Price is 5% below market average
                    </li>
                    <li className="flex items-center gap-2">
                       <div className="h-1 w-1 bg-primary rounded-full" />
                       Located in a high-demand area
                    </li>
                    <li className="flex items-center gap-2">
                       <div className="h-1 w-1 bg-primary rounded-full" />
                       Recently renovated kitchen
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
