"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/use-translation"
import { Home, TrendingUp, ShieldCheck, Search } from "lucide-react"

const icons = [Search, Home, TrendingUp, ShieldCheck, Home, TrendingUp]

export default function ServicesPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("services.heading")}</h1>
            <p className="text-lg text-muted-foreground">{t("services.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {["propertySearch", "homeBuying", "investmentAdvisory", "propertyManagement", "homeStaging", "marketAnalysis"].map((key, i) => {
              const Icon = icons[i]
              return (
                <div key={key} className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
                  <Icon className="text-primary mb-4" size={32} />
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t(`services.items.${key}`)}</h3>
                  <p className="text-muted-foreground">{t(`services.items.${key}Desc`)}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-transparent border border-border rounded-lg p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("services.whyTitle")}</h2>
            <div className="space-y-4 text-muted-foreground">
              {[0,1,2,3,4].map((i) => (
                <p key={i}>✓ {t(`services.reason${i}`)}</p>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
