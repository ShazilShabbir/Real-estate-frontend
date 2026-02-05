'use client'

import React from "react"

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export default function UpdateAvatarForm({ user }: { user: User }) {
  const { updateAvatar, isLoading, error } = useAuth()
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select an image first')
      return
    }

    const formData = new FormData()
    formData.append('avatar', selectedFile)

    try {
      await updateAvatar(formData)
      setSuccessMsg('Avatar updated successfully!')
      setSelectedFile(null)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.log('[v0] Avatar update error:', err)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {successMsg && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative h-48 w-48 rounded-full bg-muted border-4 border-border overflow-hidden">
            {previewUrl ? (
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image selected
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-foreground">
            Choose Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="rounded-lg bg-primary px-6 py-2 text-white font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload Avatar'}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              onClick={handleRemoveImage}
              className="rounded-lg border border-border bg-transparent px-6 py-2 text-foreground font-medium hover:bg-muted"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
