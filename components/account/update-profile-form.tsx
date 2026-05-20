'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  phone: z.string().optional(),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  phone?: string
}

export default function UpdateProfileForm({ user }: { user: User }) {
  const { updateProfile, isLoading, error, message } = useAuth()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: user.email,
      username: user.username,
      phone: user.phone || '',
    },
  })

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      await updateProfile({
        email: data.email,
        username: data.username,
        phone: data.phone || '',
      })
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      // Error is handled by useAuth hook
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Username
        </label>
        <input
          {...register('username')}
          type="text"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Your username"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number (Optional)
        </label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-border bg-transparent px-6 py-2 text-foreground font-medium hover:bg-muted"
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
