'use client'



import { useState } from 'react'
import { useAuthContext } from '@/lib/auth-context'
import UpdateProfileForm from '@/components/account/update-profile-form'
import UpdateAvatarForm from '@/components/account/update-avatar-form'
import ChangePasswordForm from '@/components/account/change-password-form'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AccountPage() {
  const { user, isAuthenticated } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'password'>('profile')

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to access your account settings.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your profile, avatar, and security settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('avatar')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'avatar'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile Picture
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-border bg-card p-8">
          {activeTab === 'profile' && <UpdateProfileForm user={user} />}
          {activeTab === 'avatar' && <UpdateAvatarForm user={user} />}
          {activeTab === 'password' && <ChangePasswordForm />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
