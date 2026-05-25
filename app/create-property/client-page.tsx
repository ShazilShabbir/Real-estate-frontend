'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProperties } from '@/hooks/use-properties'
import { useAuthContext } from '@/lib/auth-context'
import { useTranslation } from '@/lib/use-translation'
import { useCloudinaryMediaUpload } from '@/hooks/use-cloudinary-media'
import { geocodeAddress } from '@/lib/geocode-address'
import {
  DollarSign,
  FileVideo,
  Loader2,
  LogIn,
  Shield,
  Upload,
  X,
} from 'lucide-react'

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

const normalizeOptionalNumber = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const parseAmenities = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || []

export default function CreatePropertyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { createProperty, actionLoading, error, success } = useProperties()
  const { isAuthenticated, isAdminOrAgent, loading: authLoading } = useAuthContext()
  const imageUploads = useCloudinaryMediaUpload({ resourceType: 'image', maxCount: 5 })
  const videoUploads = useCloudinaryMediaUpload({ resourceType: 'video', maxCount: 2 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'USD',
      status: 'available',
      isFeatured: false,
    },
  })

  const isUploadingMedia = imageUploads.hasUploading || videoUploads.hasUploading

  const handleMediaSelect = (
    files: FileList | null,
    addFiles: (files: File[]) => string | null,
    resetInput: () => void,
  ) => {
    const selectedFiles = Array.from(files || [])
    const message = addFiles(selectedFiles)
    if (message) toast.error(message)
    resetInput()
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const address = {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      }

      toast.loading(t('createProperty.geocoding'), { id: 'property-geocode' })
      const geocoded = await geocodeAddress(address)
      if (!geocoded) {
        toast.dismiss('property-geocode')
        throw new Error(t('createProperty.geocodeFailed'))
      }
      toast.dismiss('property-geocode')
      setValue('lat', geocoded.lat)
      setValue('lng', geocoded.lng)

      const imageItems = await imageUploads.uploadPending()
      const videoItems = await videoUploads.uploadPending()
      const images = imageItems
        .map((item) => item.uploaded)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
      const videos = videoItems
        .map((item) => item.uploaded)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))

      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        bedrooms: normalizeOptionalNumber(data.bedrooms),
        bathrooms: normalizeOptionalNumber(data.bathrooms),
        area: normalizeOptionalNumber(data.area),
        propertyType: data.propertyType,
        status: data.status,
        address,
        lat: geocoded.lat,
        lng: geocoded.lng,
        amenities: parseAmenities(data.amenities),
        isFeatured: data.isFeatured,
        images,
        videos,
      }

      await createProperty(payload)
      reset()
      imageUploads.reset()
      videoUploads.reset()

      window.setTimeout(() => {
        router.push('/properties')
      }, 1500)
    } catch (submitError) {
      if (submitError instanceof Error) {
        toast.error(submitError.message)
      }
    }
  }

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.loading')}</h1>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <LogIn className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('createProperty.signInTitle')}</h1>
            <p className="text-muted-foreground mb-6">{t('createProperty.signInDesc')}</p>
            <Link href="/login"><Button size="lg">{t('createProperty.signInBtn')}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAdminOrAgent) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('createProperty.agentAccessTitle')}</h1>
            <p className="text-muted-foreground mb-6">{t('createProperty.agentAccessDesc')}</p>
            <Link href="/become-agent"><Button size="lg">{t('createProperty.applyAsAgent')}</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('createProperty.heading')}</h1>
            <p className="text-lg text-foreground/70">{t('createProperty.subtitle')}</p>
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
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">1</div>
                <h2 className="text-2xl font-semibold text-foreground">{t('createProperty.step1Title')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.propertyTitle')}</label>
                  <input
                    type="text"
                    placeholder={t('createProperty.titlePlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.description')}</label>
                  <textarea
                    placeholder={t('createProperty.descriptionPlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 text-base"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.price')}</label>
                    <div className="flex items-center">
                      <DollarSign className="absolute ml-3 text-foreground/50" size={18} />
                      <input
                        type="number"
                        placeholder={t('createProperty.pricePlaceholder')}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        {...register('price', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.propertyType')}</label>
                    <select
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      {...register('propertyType')}
                    >
                      <option value="">{t('createProperty.selectType')}</option>
                      <option value="house">{t('filter.house')}</option>
                      <option value="apartment">{t('filter.apartment')}</option>
                      <option value="condo">{t('filter.condo')}</option>
                      <option value="townhouse">{t('filter.townhouse')}</option>
                      <option value="villa">{t('filter.villa')}</option>
                      <option value="commercial">{t('filter.commercial')}</option>
                      <option value="land">{t('filter.land')}</option>
                    </select>
                    {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">2</div>
                <h2 className="text-2xl font-semibold text-foreground">{t('createProperty.step2Title')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.bedrooms')}</label>
                  <input
                    type="number"
                    placeholder={t('createProperty.bedroomsPlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    {...register('bedrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.bathrooms')}</label>
                  <input
                    type="number"
                    placeholder={t('createProperty.bathroomsPlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    {...register('bathrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.area')}</label>
                  <input
                    type="number"
                    placeholder={t('createProperty.areaPlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    {...register('area', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">3</div>
                <h2 className="text-2xl font-semibold text-foreground">{t('createProperty.step3Title')}</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground/75">
                  {t('createProperty.locationGeocodeNote')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.street')}</label>
                  <input
                    type="text"
                    placeholder={t('createProperty.streetPlaceholder')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    {...register('street')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.city')}</label>
                    <input
                      type="text"
                      placeholder={t('createProperty.cityPlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      {...register('city')}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.state')}</label>
                    <input
                      type="text"
                      placeholder={t('createProperty.statePlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      {...register('state')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.country')}</label>
                    <input
                      type="text"
                      placeholder={t('createProperty.countryPlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      {...register('country')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('createProperty.postalCode')}</label>
                    <input
                      type="text"
                      placeholder={t('createProperty.postalCodePlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      {...register('postalCode')}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">4</div>
                <h2 className="text-2xl font-semibold text-foreground">{t('createProperty.mediaTitle')}</h2>
              </div>

              <div className="space-y-8">
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground/75">
                  Uploads go directly to secure cloud storage before the property is saved. Large videos are supported and won’t hit the Vercel upload limit.
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Upload className="inline mr-2" size={18} />
                    Property Images ({t('createProperty.images')})
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event) =>
                        handleMediaSelect(
                          event.target.files,
                          imageUploads.addFiles,
                          () => {
                            event.target.value = ''
                          },
                        )
                      }
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <Upload className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Choose images to upload</p>
                      <p className="text-sm text-foreground/60">Direct Cloudinary upload with progress tracking</p>
                    </label>
                  </div>

                  {imageUploads.items.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageUploads.items.map((item) => (
                        <div key={item.id} className="relative overflow-hidden rounded-xl border border-border bg-card">
                          <Image
                            src={item.previewUrl || '/placeholder.svg'}
                            alt={item.name}
                            width={200}
                            height={160}
                            className="h-32 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => imageUploads.removeItem(item.id)}
                            className="absolute top-2 right-2 rounded-full bg-black/65 p-1 text-white"
                          >
                            <X size={14} />
                          </button>
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="truncate font-medium text-foreground">{item.name}</span>
                              <span className="capitalize text-muted-foreground">{item.status}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  item.status === 'error' ? 'bg-red-500' : 'bg-primary'
                                }`}
                                style={{ width: `${item.progress || (item.status === 'uploaded' ? 100 : 0)}%` }}
                              />
                            </div>
                            {item.error && <p className="text-xs text-red-500">{item.error}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <FileVideo className="inline mr-2" size={18} />
                    Property Videos ({t('createProperty.videos')})
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(event) =>
                        handleMediaSelect(
                          event.target.files,
                          videoUploads.addFiles,
                          () => {
                            event.target.value = ''
                          },
                        )
                      }
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <FileVideo className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Choose videos to upload</p>
                      <p className="text-sm text-foreground/60">Large walkthrough files upload directly to Cloudinary</p>
                    </label>
                  </div>

                  {videoUploads.items.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {videoUploads.items.map((item) => (
                        <div key={item.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{item.name}</p>
                              <p className="text-xs capitalize text-muted-foreground">{item.status}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => videoUploads.removeItem(item.id)}
                              className="rounded-full bg-muted p-1.5 text-foreground/70 hover:text-foreground"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                item.status === 'error' ? 'bg-red-500' : 'bg-primary'
                              }`}
                              style={{ width: `${item.progress || (item.status === 'uploaded' ? 100 : 0)}%` }}
                            />
                          </div>
                          {item.error && <p className="mt-2 text-xs text-red-500">{item.error}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">{t('createProperty.featuredLabel')}</label>
                  <p className="text-sm text-foreground/60">{t('createProperty.featuredDesc')}</p>
                </div>
                <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 cursor-pointer" />
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.back()}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || isUploadingMedia}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {actionLoading || isUploadingMedia ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Uploading media...
                  </span>
                ) : (
                  t('createProperty.submitBtn')
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
