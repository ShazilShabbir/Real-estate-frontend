"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useSite } from "@/lib/site-context"
import { useTranslation } from "@/lib/use-translation"

export function Contact() {
  const site = useSite()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post("/inquiries/contact", formData)
      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
      toast.success(t("contact.successToast"))
    } catch {
      toast.error(t("contact.errorToast"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 mb-5">
              {t("contact.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              {t("contact.heading")}
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-6">
            <Reveal delay={100}>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("contact.phone")}</h3>
                  <p className="text-muted-foreground text-sm">{site.contactPhone || "(555) 123-4567"}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t("contact.phoneHours")}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("contact.email")}</h3>
                  <p className="text-muted-foreground text-sm">{site.contactEmail || "info@estatehub.com"}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t("contact.emailResponse")}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("contact.address")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {site.contactAddress || "123 Luxury Lane, Suite 500\nNew York, NY 10001"}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={200}>
            <Card className="p-8 md:p-10 shadow-xl border-border/40 rounded-2xl bg-card/95 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">{t("contact.formName")}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200 text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t("contact.formNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">{t("contact.formEmail")}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200 text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t("contact.formEmailPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">{t("contact.formPhone")}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200 text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t("contact.formPhonePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">{t("contact.formMessage")}</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200 min-h-36 resize-none text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t("contact.formMessagePlaceholder")}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || submitted}
                  className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 h-13 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 rounded-xl text-base disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : submitted ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {submitting ? t("contact.sending") : submitted ? t("contact.sent") : t("contact.sendMessage")}
                </Button>
              </form>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
