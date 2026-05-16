"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/use-translation"
import { LocationAutocomplete } from "@/components/location-autocomplete"

export function SearchSection() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [locationCity, setLocationCity] = useState("")
  const [locationState, setLocationState] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const { t } = useTranslation()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (locationCity) params.set("city", locationCity)
    if (locationState) params.set("state", locationState)
    if (location.trim() && !locationCity) params.set("q", location.trim())
    if (priceRange) {
      if (priceRange === "500k-1m") { params.set("minPrice", "500000"); params.set("maxPrice", "1000000") }
      else if (priceRange === "1m-2m") { params.set("minPrice", "1000000"); params.set("maxPrice", "2000000") }
      else if (priceRange === "2m-5m") { params.set("minPrice", "2000000"); params.set("maxPrice", "5000000") }
      else if (priceRange === "5m+") { params.set("minPrice", "5000000") }
    }
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <section className="py-8 md:py-12 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-foreground text-pretty">{t("search.heading")}</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("search.location")}
              </label>
              <LocationAutocomplete
                value={location}
                onChange={(val, city, state) => {
                  setLocation(val)
                  setLocationCity(city || "")
                  setLocationState(state || "")
                }}
                onEnter={handleSearch}
                placeholder={t("search.locationPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <DollarSign className="inline mr-2" size={16} />
{t("search.priceRange")}
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t("search.anyPrice")}</option>
                <option value="500k-1m">{t("search.price500k_1M")}</option>
                <option value="1m-2m">{t("search.price1M_2M")}</option>
                <option value="2m-5m">{t("search.price2M_5M")}</option>
                <option value="5m+">{t("search.price5MPlus")}</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 h-11" onClick={handleSearch}>
                <Search size={18} className="mr-2" />
{t("search.search")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
