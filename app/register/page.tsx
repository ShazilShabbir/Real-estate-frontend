"use client"

import type React from "react"
import { useRef } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Lock, ArrowRight, Home, AlertCircle, User, Phone, Upload, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { z } from "zod"
import { useState } from "react"
import { useAuthContext } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useTranslation } from "@/lib/use-translation"

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      username: z.string().min(2, t("register.nameTooShort")).toLowerCase(),
      email: z.string().email(t("register.invalidEmail")).toLowerCase(),
      phone: z.string().min(10, t("register.phoneTooShort")),
      password: z.string().min(8, t("register.passwordTooShort")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("register.passwordsNoMatch"),
      path: ["confirmPassword"],
    })

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>

export default function RegisterPage() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register: registerUser, isLoading, error: authError } = useAuth()
  const { isAuthenticated, loading } = useAuthContext()
  const router = useRouter()

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Replace current history entry to prevent back button navigation
      window.history.replaceState(null, '', '/')
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render the register form
  if (isAuthenticated) {
    return null
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t)),
  })

  const password = watch("password")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData()
    formData.append("username", data.username)
    formData.append("email", data.email)
    formData.append("phone", data.phone)
    formData.append("password", data.password)
    if (avatarFile) {
      formData.append("avatar", avatarFile)
    }

    await registerUser(formData)
  }

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border border-border shadow-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="text-primary-foreground" size={24} />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{t("register.heading")}</h1>
          <p className="mt-2 text-muted-foreground">{t("register.subtitle")}</p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/50 group-hover:border-primary transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview || "/placeholder.svg"} alt={t("register.imgAlt")} className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-muted-foreground group-hover:text-primary transition-colors" size={32} />
              )}
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null)
                  setAvatarPreview(null)
                }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:scale-110 transition-transform"
            >
              <Upload size={14} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <p className="text-xs text-muted-foreground">{t("register.uploadPhoto")}</p>
        </div>

        {(authError || Object.keys(errors).length > 0) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{authError || t("register.fixErrors")}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1">
                {t("register.fullName")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("username")}
                  id="username"
                  type="text"
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.username ? "border-destructive" : "border-border"}`}
                  placeholder={t("register.fullNamePlaceholder")}
                />
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">
                {t("register.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.email ? "border-destructive" : "border-border"}`}
                  placeholder={t("register.emailPlaceholder")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium text-foreground block mb-1">
                {t("register.phone")}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.phone ? "border-destructive" : "border-border"}`}
                  placeholder={t("register.phonePlaceholder")}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground block mb-1">
                {t("register.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-11 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.password ? "border-destructive" : "border-border"}`}
                  placeholder={t("register.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block mb-1">
                {t("register.confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className={`w-full bg-background border rounded-lg py-3 pl-10 pr-11 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.confirmPassword ? "border-destructive" : "border-border"}`}
                  placeholder={t("register.confirmPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg mt-2"
            disabled={isLoading}
          >
            {isLoading ? t("register.creatingAccount") : t("register.createAccount")}
            {!isLoading && <ArrowRight className="ml-2" size={18} />}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t("register.signIn")}
          </Link>
        </p>
      </div>
    </div>
  )
}
