'use client'

import React from "react"

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProperties } from '@/hooks/use-properties'
import { Upload, X, MapPin, Home, DollarSign, FileVideo } from 'lucide-react'
import Image from 'next/image'

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

export default function CreatePropertyPage() {
  const router = useRouter()
  const { createProperty, loading, error, success } = useProperties()
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'USD',
      status: 'available',
      isFeatured: false,
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - imageFiles.length
    const filesToAdd = files.slice(0, remaining)

    filesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...filesToAdd])
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 2 - videoFiles.length
    const filesToAdd = files.slice(0, remaining)

    filesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setVideoPreviews((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setVideoFiles((prev) => [...prev, ...filesToAdd])
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index))
    setVideoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('price', String(data.price))
      formData.append('currency', data.currency)
      if (data.bedrooms) formData.append('bedrooms', String(data.bedrooms))
      if (data.bathrooms) formData.append('bathrooms', String(data.bathrooms))
      if (data.area) formData.append('area', String(data.area))
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

      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      videoFiles.forEach((file) => {
        formData.append('videos', file)
      })

      await createProperty(formData)
      reset()
      setImageFiles([])
      setImagePreviews([])
      setVideoFiles([])
      setVideoPreviews([])
      
      setTimeout(() => {
        router.push('/properties')
      }, 2000)
    } catch (err) {
      console.log('[v0] Error submitting form:', err)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">List Your Property</h1>
            <p className="text-lg text-foreground/70">
              Create a professional listing and reach thousands of potential buyers
            </p>
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
                <h2 className="text-2xl font-semibold text-foreground">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Luxury 3-Bedroom Penthouse with Ocean View"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                  <textarea
                    placeholder="Describe your property in detail. Highlight unique features, amenities, and what makes it special."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (USD) *</label>
                    <div className="flex items-center">
                      <DollarSign className="absolute ml-3 text-foreground/50" size={18} />
                      <input
                        type="number"
                        placeholder="1000000"
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        {...register('price', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type *</label>
                    <select
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register('propertyType')}
                    >
                      <option value="">Select property type</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                      <option value="others">Others</option>
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
                <h2 className="text-2xl font-semibold text-foreground">Property Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('bedrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                  <input
                    type="number"
                    placeholder="2"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('bathrooms', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Area (sqft)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('area', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Card>

            {/* Step 3: Location */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">3</div>
                <h2 className="text-2xl font-semibold text-foreground">Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register('street')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                    <input
                      type="text"
                      placeholder="New York"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register('city')}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">State</label>
                    <input
                      type="text"
                      placeholder="NY"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register('state')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                    <input
                      type="text"
                      placeholder="United States"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register('country')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Postal Code</label>
                    <input
                      type="text"
                      placeholder="10001"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                <h2 className="text-2xl font-semibold text-foreground">Media</h2>
              </div>

              <div className="space-y-6">
                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Upload className="inline mr-2" size={18} />
                    Property Images (Up to 5)
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageFiles.length >= 5}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <Upload className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-foreground/60">PNG, JPG, GIF up to 10MB each</p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${idx}`}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <FileVideo className="inline mr-2" size={18} />
                    Property Videos (Up to 2)
                  </label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={videoFiles.length >= 2}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-primary mb-2">
                        <FileVideo className="inline" size={32} />
                      </div>
                      <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-foreground/60">MP4, WebM up to 50MB each</p>
                    </label>
                  </div>

                  {videoPreviews.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {videoPreviews.map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-foreground/5 p-3 rounded-lg">
                          <span className="text-sm text-foreground">Video {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Additional Options */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Featured Listing</label>
                  <p className="text-sm text-foreground/60">Make this property stand out with premium placement</p>
                </div>
                <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 cursor-pointer" />
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? 'Publishing...' : 'Publish Property'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
