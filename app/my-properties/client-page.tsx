'use client'



import React, { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProperties } from '@/hooks/use-properties'
import { useAuthContext } from '@/lib/auth-context'
import { useSite } from '@/lib/site-context'
import { formatPrice } from '@/lib/format-price'
import { PropertyMediaCarousel } from '@/components/property-media-carousel'
import { useTranslation } from '@/lib/use-translation'
import { Edit2, Trash2, MapPin, Loader2, Plus, Home } from 'lucide-react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Property {
  _id: string
  title: string
  price: number
  currency: string
  address?: {
    street?: string
    city: string
    state?: string
    country?: string
  }
  bedrooms?: number
  bathrooms?: number
  area?: number
  images?: any[]
  videos?: any[]
  postedBy?: any
}

export default function MyPropertiesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isAdminOrAgent, loading: authLoading } = useAuthContext()
  const { defaultCurrency } = useSite()
  const { fetchProperties, deleteProperty, loading: propertiesLoading, error, success } = useProperties()
  const [myProperties, setMyProperties] = useState<Property[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)

  if (!authLoading && user && !isAdminOrAgent) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("myProperties.agentAccessTitle")}</h1>
            <p className="text-muted-foreground mb-6">{t("myProperties.agentAccessDesc")}</p>
            <Link href="/become-agent"><Button size="lg">{t("myProperties.applyAsAgent")}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const loadMyProperties = async () => {
    try {
      if (user) {
        const filtered = await fetchProperties({ postedBy: user._id })
        setMyProperties(filtered || [])
      }
    } catch (err) {
      // Error is handled by useProperties hook
    }
  }

  useEffect(() => {
    if (user) {
      loadMyProperties()
    }
  }, [user])

  const handleDelete = async () => {
    if (!propertyToDelete) return
    const id = propertyToDelete._id
    try {
      setIsDeleting(id)
      await deleteProperty(id)
      setMyProperties((prev) => prev.filter((p) => p._id !== id))
      setPropertyToDelete(null)
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsDeleting(null)
    }
  }

  if (authLoading || (propertiesLoading && myProperties.length === 0)) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t("myProperties.heading")}</h1>
              <p className="text-lg text-muted-foreground">{t("myProperties.subtitle")}</p>
            </div>
            <Link href="/create-property">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 h-12 px-6">
                <Plus size={20} />
                {t("myProperties.addNew")}
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {myProperties.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 bg-transparent">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Home size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("myProperties.emptyTitle")}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("myProperties.emptyDesc")}
              </p>
              <Link href="/create-property">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent">
                  {t("myProperties.createFirst")}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProperties.map((property) => (
                <Card key={property._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border">
                  <div className="relative h-64 overflow-hidden">
                    <PropertyMediaCarousel
                      images={property.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                      videos={property.videos}
                      title={property.title}
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {t("myProperties.statusActive")}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-foreground truncate flex-1 mr-2" title={property.title}>
                        {property.title}
                      </h3>
                      <p className="text-primary font-bold text-xl">
                        {formatPrice(property.price, property.currency, defaultCurrency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">
                        {[property.address?.city, property.address?.state].filter(Boolean).join(', ') || t("myProperties.locationNA")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-foreground/70 mb-6 pb-6 border-b border-border">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-foreground">{property.bedrooms || 0}</span> {t("myProperties.beds")}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-foreground">{property.bathrooms || 0}</span> {t("myProperties.baths")}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-foreground">{property.area || 0}</span> {t("myProperties.sqft")}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link href={`/edit-property/${property._id}`} className="w-full">
                        <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent">
                          <Edit2 size={16} />
                          {t("myProperties.edit")}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                        onClick={() => setPropertyToDelete(property)}
                        disabled={isDeleting === property._id}
                      >
                        {isDeleting === property._id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        {t("myProperties.delete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{t("myProperties.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myProperties.deleteDesc", { title: propertyToDelete?.title || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">{t("myProperties.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>{t("myProperties.confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </>
  )
}
