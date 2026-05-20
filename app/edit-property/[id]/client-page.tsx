'use client'



import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProperties } from '@/hooks/use-properties'
import { Upload, X, MapPin, Home, DollarSign, FileVideo, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/lib/use-translation'

// Zod validation schema matching backend requirements
const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description must not exceed 5000 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  currency: z.string().default('USD'),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative').optional(),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative').optional(),
  area: z.number().min(1, 'Area must be greater than 0').optional(),
  propertyType: z.string().min(1, 'Property type is required'),
  status: z.string().default('available'),
  street: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  amenities: z.string().optional(),
  isFeatured: z.boolean().default(false),
})

type PropertyFormData = z.infer<typeof propertySchema>

export default function EditPropertyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const { getProperty, updateProperty, loading, error, success } = useProperties()
  const [fetching, setFetching] = useState(true)
  
  // States for unified media management
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([]) // For display only

  const [existingVideos, setExistingVideos] = useState<any[]>([])
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]) // For display only

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'USD',
      status: 'available',
      isFeatured: false,
    },
  })

  // Fetch property data on load - using a flag to ensure it only runs once per component mount/ID change
  useEffect(() => {
    let isMounted = true;
    const loadProperty = async () => {
      try {
        const data = await getProperty(propertyId)
        if (data && isMounted) {
          reset({
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            currency: data.currency || 'USD',
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            area: data.area || 0,
            propertyType: data.propertyType || 'house',
            status: data.status || 'available',
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            country: data.address?.country || '',
            postalCode: data.address?.postalCode || data.address?.zipcode || '',
            lat: data.location?.coordinates?.[1],
            lng: data.location?.coordinates?.[0],
            amenities: Array.isArray(data.amenities) ? data.amenities.join(', ') : '',
            isFeatured: data.isFeatured || false,
          })

          if (data.images && Array.isArray(data.images)) {
            setExistingImages(data.images)
          }
          if (data.videos && Array.isArray(data.videos)) {
            setExistingVideos(data.videos)
          }
        }
      } catch {
        toast.error(t("editProperty.loadingError"))
      } finally {
        if (isMounted) setFetching(false)
      }
    }
    loadProperty()
    return () => { isMounted = false };
  }, [propertyId, getProperty, reset])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalCurrentCount = existingImages.length + newImageFiles.length
    const remaining = 5 - totalCurrentCount
    if (remaining <= 0) {
      alert("Maximum 5 images allowed")
      return
    }
    const filesToAdd = files.slice(0, remaining)
    setNewImageFiles((prev) => [...prev, ...filesToAdd])
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalCurrentCount = existingVideos.length + newVideoFiles.length
    const remaining = 2 - totalCurrentCount
    if (remaining <= 0) {
      alert("Maximum 2 videos allowed")
      return
    }
    const filesToAdd = files.slice(0, remaining)
    setNewVideoFiles((prev) => [...prev, ...filesToAdd])
  }

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx))
  }

  const removeNewImage = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const removeExistingVideo = (idx: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== idx))
  }

  const removeNewVideo = (idx: number) => {
    setNewVideoFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('price', String(data.price))
      formData.append('currency', data.currency)
      if (data.bedrooms !== undefined) formData.append('bedrooms', String(data.bedrooms))
      if (data.bathrooms !== undefined) formData.append('bathrooms', String(data.bathrooms))
      if (data.area !== undefined) formData.append('area', String(data.area))
      formData.append('propertyType', data.propertyType)
      formData.append('status', data.status)
      formData.append('isFeatured', String(data.isFeatured))

      const address = {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      }
      formData.append('address', JSON.stringify(address))

      if (data.lat) formData.append('lat', String(data.lat))
      if (data.lng) formData.append('lng', String(data.lng))
      if (data.amenities) formData.append('amenities', data.amenities)

      // Image Synchronization
      formData.append('existingImages', JSON.stringify(existingImages))
      if (newImageFiles.length > 0) {
        newImageFiles.forEach((file) => formData.append('images', file))
      }
      formData.append('replaceImages', 'true')

      // Video Synchronization
      formData.append('existingVideos', JSON.stringify(existingVideos))
      if (newVideoFiles.length > 0) {
        newVideoFiles.forEach((file) => formData.append('videos', file))
      }
      formData.append('replaceVideos', 'true')

      const response = await updateProperty(propertyId, formData)
      // console.log("[EditProperty] Update successful:", response)
      
      setTimeout(() => {
        router.push('/my-properties')
      }, 2000)
    } catch (err) {
      // console.error('[EditProperty] Error updating property:', err)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/my-properties">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft size={24} />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t("editProperty.heading")}</h1>
              <p className="text-lg text-foreground/70">{t("editProperty.subtitle")}</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">1</div>
                <h2 className="text-2xl font-semibold text-foreground">{t("createProperty.step1Title")}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.propertyTitle")}</label>
                  <input
                    type="text"
                    placeholder={t("createProperty.titlePlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.description")}</label>
                  <textarea
                    placeholder={t("createProperty.descriptionPlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 bg-background text-foreground"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.price")}</label>
                    <div className="relative flex items-center">
                      <DollarSign className="absolute ml-3 text-foreground/50" size={18} />
                      <input
                        type="number"
                        placeholder={t("createProperty.pricePlaceholder")}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        {...register('price', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.propertyType")}</label>
                    <select
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      {...register('propertyType')}
                    >
                      <option value="">{t("createProperty.selectType")}</option>
                      <option value="house">{t("filter.house")}</option>
                      <option value="apartment">{t("filter.apartment")}</option>
                      <option value="condo">{t("filter.condo")}</option>
                      <option value="townhouse">{t("filter.townhouse")}</option>
                      <option value="villa">{t("filter.villa")}</option>
                      <option value="commercial">{t("filter.commercial")}</option>
                      <option value="land">{t("filter.land")}</option>
                    </select>
                    {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2: Property Details */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">2</div>
                <h2 className="text-2xl font-semibold text-foreground">{t("createProperty.step2Title")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.bedrooms")}</label>
                  <input
                    type="number"
                    placeholder={t("createProperty.bedroomsPlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    {...register('bedrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.bathrooms")}</label>
                  <input
                    type="number"
                    placeholder={t("createProperty.bathroomsPlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    {...register('bathrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.area")}</label>
                  <input
                    type="number"
                    placeholder={t("createProperty.areaPlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    {...register('area', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Card>

            {/* Step 3: Location */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">3</div>
                <h2 className="text-2xl font-semibold text-foreground">{t("createProperty.step3Title")}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.street")}</label>
                  <input
                    type="text"
                    placeholder={t("createProperty.streetPlaceholder")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    {...register('street')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.city")}</label>
                    <input
                      type="text"
                      placeholder={t("createProperty.cityPlaceholder")}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      {...register('city')}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.state")}</label>
                    <input
                      type="text"
                      placeholder={t("createProperty.statePlaceholder")}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      {...register('state')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.country")}</label>
                    <input
                      type="text"
                      placeholder={t("createProperty.countryPlaceholder")}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      {...register('country')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("createProperty.postalCode")}</label>
                    <input
                      type="text"
                      placeholder={t("createProperty.postalCodePlaceholder")}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      {...register('postalCode')}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 4: Media Upload */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">4</div>
                <h2 className="text-2xl font-semibold text-foreground">{t("createProperty.mediaTitle")}</h2>
              </div>

              <div className="space-y-6">
                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Upload className="inline mr-2" size={18} />
                    Property Images (Updates will replace existing)
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <Upload className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Click to upload new images</p>
                      <p className="text-sm text-foreground/60 text-center">
                        Note: Uploading new ones currently replaces all existing images for this property.
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {(existingImages.length > 0 || newImageFiles.length > 0) && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group overflow-hidden rounded-xl border border-border bg-muted/30 aspect-square shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                          <Image
                            src={img.url || img || "/placeholder.svg"}
                            alt={`Existing ${idx}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                              title="Remove Image"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/20">
                            Existing
                          </div>
                        </div>
                      ))}
                      
                      {/* New Images */}
                      {newImageFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 aspect-square shadow-sm transition-all hover:shadow-md hover:border-primary/60">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`New ${idx}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                              title="Remove Image"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-primary backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <FileVideo className="inline mr-2" size={18} />
                    Property Videos
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <FileVideo className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Click to upload new videos</p>
                      <p className="text-sm text-foreground/60 text-center">
                        Note: Uploading new ones replaces all existing videos for this property.
                      </p>
                    </label>
                  </div>

                  {/* Video Previews */}
                  {(existingVideos.length > 0 || newVideoFiles.length > 0) && (
                    <div className="mt-6 space-y-3">
                      {existingVideos.map((vid, idx) => (
                        <div key={`existing-vid-${idx}`} className="flex items-center justify-between bg-muted/40 backdrop-blur-sm p-4 rounded-xl border border-border group hover:border-primary/20 transition-all hover:bg-muted/60">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-lg text-foreground/50 group-hover:text-foreground/70 transition-colors">
                              <FileVideo size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground">Existing Video {idx + 1}</span>
                              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Cloudinary Storage</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeExistingVideo(idx)} 
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove Video"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                      {newVideoFiles.map((file, idx) => (
                        <div key={`new-vid-${idx}`} className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20 group hover:border-primary/40 transition-all hover:bg-primary/10">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <FileVideo size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-primary truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                              <span className="text-xs text-primary/70 font-bold uppercase tracking-wider">Ready for Upload</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeNewVideo(idx)} 
                            className="p-2 text-primary/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove Video"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Featured Option */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">{t("createProperty.featuredLabel")}</label>
                  <p className="text-sm text-foreground/60">{t("createProperty.featuredDesc")}</p>
                </div>
                <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 cursor-pointer accent-primary" />
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent border-primary text-primary hover:bg-primary/10"
                onClick={() => router.back()}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold "
              >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        {t("editProperty.submittingBtn")}
                      </div>
                    ) : (
                      t("editProperty.submitBtn")
                    )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
