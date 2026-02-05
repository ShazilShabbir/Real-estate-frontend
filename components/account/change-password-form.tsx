'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordForm() {
  const { changePassword, isLoading, error } = useAuth()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      setSuccessMsg('Password changed successfully!')
      reset()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.log('[v0] Password change error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Password Requirements:</strong>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>At least 8 characters</li>
            <li>Contains at least one uppercase letter</li>
            <li>Contains at least one number</li>
          </ul>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Current Password
        </label>
        <input
          {...register('oldPassword')}
          type="password"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter your current password"
        />
        {errors.oldPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.oldPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          New Password
        </label>
        <input
          {...register('newPassword')}
          type="password"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter your new password"
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Confirm New Password
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Confirm your new password"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-6 py-2 text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Change Password'}
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
