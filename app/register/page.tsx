"use client"

import type React from "react"
import { useRef } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Lock, ArrowRight, Home, AlertCircle, User, Phone, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { z } from "zod"
import { useState } from "react"

const registerSchema = z
  .object({
    username: z.string().min(2, "Name must be at least 2 characters").toLowerCase(),
    email: z.string().email("Invalid email address").toLowerCase(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { register: registerUser, isLoading, error: authError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
          <h1 className="text-3xl font-bold text-foreground">Create account</h1>
          <p className="mt-2 text-muted-foreground">Join our community of real estate professionals</p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/50 group-hover:border-primary transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
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
          <p className="text-xs text-muted-foreground">Upload profile picture (optional)</p>
        </div>

        {(authError || Object.keys(errors).length > 0) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{authError || "Please fix the errors below"}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("username")}
                  id="username"
                  type="text"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.username ? "border-destructive" : "border-border"}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.email ? "border-destructive" : "border-border"}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium text-foreground block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.phone ? "border-destructive" : "border-border"}`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.password ? "border-destructive" : "border-border"}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  className={`w-full bg-background border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.confirmPassword ? "border-destructive" : "border-border"}`}
                  placeholder="••••••••"
                />
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
            {isLoading ? "Creating account..." : "Create Account"}
            {!isLoading && <ArrowRight className="ml-2" size={18} />}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {"Already have an account? "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
