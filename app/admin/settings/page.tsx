"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Loader2, Save, Upload, X } from "lucide-react"
import Image from "next/image"

const API_ORIGIN = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "https://real-estate-api-cyan.vercel.app"

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
]

interface SettingsMap {
  [key: string]: string | number | boolean
}

const FIELDS: Record<string, Array<{ key: string; label: string; type: string; options?: Array<{ value: string; label: string }> }>> = {
  general: [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "site_tagline", label: "Tagline", type: "text" },
    { key: "site_logo", label: "Logo URL", type: "text" },
    { key: "default_currency", label: "Default Currency", type: "text" },
  ],
  contact: [
    { key: "contact_email", label: "Contact Email", type: "email" },
    { key: "contact_phone", label: "Contact Phone", type: "text" },
    { key: "contact_address", label: "Address", type: "text" },
  ],
  social: [
    { key: "social_facebook", label: "Facebook URL", type: "text" },
    { key: "social_twitter", label: "X (Twitter) URL", type: "text" },
    { key: "social_instagram", label: "Instagram URL", type: "text" },
    { key: "social_linkedin", label: "LinkedIn URL", type: "text" },
  ],
  localization: [
    {
      key: "language", label: "Language", type: "select",
      options: LANGUAGES.map(l => ({ value: l.code, label: l.label })),
    },
    {
      key: "direction", label: "Text Direction", type: "select",
      options: [
        { value: "ltr", label: "Left-to-Right (LTR)" },
        { value: "rtl", label: "Right-to-Left (RTL)" },
      ],
    },
  ],
  features: [
    { key: "featured_property_limit", label: "Max Featured Properties", type: "number" },
    {
      key: "auto_approve_properties", label: "Auto-Approve Properties", type: "select",
      options: [
        { value: "true", label: "Enabled" },
        { value: "false", label: "Disabled" },
      ],
    },
  ],
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      if (data?.data) setSettings(data.data)
    }).catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  const update = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch("/admin/settings", settings)
      // Apply direction immediately
      if (settings.direction === "rtl" || settings.direction === "ltr") {
        document.documentElement.dir = settings.direction
        localStorage.setItem("site-direction", settings.direction)
      }
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("logo", file)
      const { data } = await api.post("/admin/settings/upload-logo", formData)
      if (data?.data?.url) {
        setSettings((prev) => ({ ...prev, site_logo: data.data.url }))
        toast.success("Logo uploaded")
      }
    } catch {
      toast.error("Failed to upload logo")
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Platform configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
          <TabsTrigger value="general" className="text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="contact" className="text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Contact</TabsTrigger>
          <TabsTrigger value="social" className="text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Social</TabsTrigger>
          <TabsTrigger value="localization" className="text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Localization</TabsTrigger>
          <TabsTrigger value="features" className="text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Features</TabsTrigger>
        </TabsList>

        {Object.entries(FIELDS).map(([group, fields]) => (
          <TabsContent key={group} value={group}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                  {field.key === "site_logo" ? (
                    <div className="space-y-3">
                      {settings.site_logo ? (
                        <div className="relative inline-block">
                          <Image
                            src={String(settings.site_logo).startsWith("/") ? `${API_ORIGIN}${settings.site_logo}` : String(settings.site_logo)}
                            alt="Site logo"
                            width={0}
                            height={0}
                            sizes="200px"
                            unoptimized
                            className="h-14 w-auto rounded-lg border border-neutral-700 bg-neutral-800 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, site_logo: "" }))}
                            className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 w-40 rounded-lg border border-dashed border-neutral-600 bg-neutral-800/50 text-neutral-500 text-sm">
                          No logo
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingLogo}
                          onClick={() => logoInputRef.current?.click()}
                          className="border-neutral-600 text-neutral-300 hover:text-white"
                        >
                          {uploadingLogo ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          ) : (
                            <Upload className="h-4 w-4 mr-1.5" />
                          )}
                          {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        </Button>
                      </div>
                    </div>
                  ) : field.type === "select" ? (
                    <select
                      value={String(settings[field.key] ?? "")}
                      onChange={(e) => {
                        const val = e.target.value
                        update(field.key, field.key === "featured_property_limit" ? Number(val) : val)
                        if (field.key === "language") {
                          const lang = LANGUAGES.find(l => l.code === val)
                          if (lang) update("direction", lang.dir)
                        }
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      value={String(settings[field.key] ?? "")}
                      onChange={(e) => update(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                  )}
                  {field.key === "direction" && (
                    <p className="text-xs text-neutral-500 mt-1.5">
                      Changes the entire website text direction. HTML <code className="text-amber-400">dir</code> attribute updates on save.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
