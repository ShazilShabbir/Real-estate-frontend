"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { RangeSlider } from "@/components/ui/range-slider"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import { useTranslation } from "@/lib/use-translation"

interface Filters {
  q?: string
  minPrice?: string
  maxPrice?: string
  city?: string
  state?: string
  propertyType?: string
  bedrooms?: string
  bathrooms?: string
  sort?: string
}

interface PropertyFilterProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  total?: number
}

export function PropertyFilter({ filters, onFilterChange, total }: PropertyFilterProps) {
  const [searchText, setSearchText] = useState(filters.q || "")
  const [minPriceText, setMinPriceText] = useState(filters.minPrice || "")
  const [maxPriceText, setMaxPriceText] = useState(filters.maxPrice || "")
  const [locationText, setLocationText] = useState(
    filters.city && filters.state ? `${filters.city}, ${filters.state}` : ""
  )
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const { t } = useTranslation()

  const PROPERTY_TYPES = [
    { value: "", label: t("filter.allTypes") },
    { value: "house", label: t("filter.house") },
    { value: "apartment", label: t("filter.apartment") },
    { value: "villa", label: t("filter.villa") },
    { value: "condo", label: t("filter.condo") },
    { value: "townhouse", label: t("filter.townhouse") },
    { value: "commercial", label: t("filter.commercial") },
    { value: "land", label: t("filter.land") },
    { value: "other", label: t("filter.other") },
  ]

  const SORT_OPTIONS = [
    { value: "", label: t("filter.newestFirst") },
    { value: "oldest", label: t("filter.oldestFirst") },
    { value: "price_asc", label: t("filter.priceLowHigh") },
    { value: "price_desc", label: t("filter.priceHighLow") },
  ]

  const BEDROOM_OPTIONS = [
    { value: "", label: t("filter.any") },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
  ]

  const BATHROOM_OPTIONS = [
    { value: "", label: t("filter.any") },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ]

  useEffect(() => { setSearchText(filters.q || "") }, [filters.q])
  useEffect(() => { setMinPriceText(filters.minPrice || "") }, [filters.minPrice])
  useEffect(() => { setMaxPriceText(filters.maxPrice || "") }, [filters.maxPrice])
  useEffect(() => {
    setLocationText(
      filters.city && filters.state ? `${filters.city}, ${filters.state}` : ""
    )
  }, [filters.city, filters.state])

  const buildMergeFilters = (extra: Partial<Filters>) => ({
    q: searchText || "",
    minPrice: minPriceText || "",
    maxPrice: maxPriceText || "",
    city: filters.city || "",
    state: filters.state || "",
    propertyType: filters.propertyType || "",
    bedrooms: filters.bedrooms || "",
    bathrooms: filters.bathrooms || "",
    sort: filters.sort || "",
    ...extra,
    page: "1",
  })

  const debouncedFilter = (key: keyof Filters, value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onFilterChange(buildMergeFilters({ [key]: value }))
    }, 400)
  }

  const immediateUpdate = (key: keyof Filters, value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onFilterChange(buildMergeFilters({ [key]: value }))
  }

  const clearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSearchText("")
    setMinPriceText("")
    setMaxPriceText("")
    setLocationText("")
    onFilterChange({})
  }

  const hasFilters = Object.entries(filters).some(
    ([k, v]) => !["page", "limit"].includes(k) && v !== undefined && v !== ""
  )

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("filter.searchPlaceholder")}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            debouncedFilter("q", e.target.value)
          }}
          className="w-full pl-9 pr-3 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.location")}</label>
        <LocationAutocomplete
          value={locationText}
          onChange={(val, city, state) => {
            setLocationText(val)
            if (timerRef.current) clearTimeout(timerRef.current)
            onFilterChange(buildMergeFilters({
              city: city || "",
              state: state || "",
            }))
          }}
          placeholder={t("filter.locationPlaceholder")}
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.type")}</label>
        <CustomSelect
          value={filters.propertyType || ""}
          onChange={(val) => immediateUpdate("propertyType", val)}
          options={PROPERTY_TYPES}
          className="w-full"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.priceRange")}</label>
        <RangeSlider
          min={0}
          max={10000000}
          step={50000}
          value={[Number(filters.minPrice) || 0, Number(filters.maxPrice) || 10000000]}
          onChange={([min, max]) => {
            setMinPriceText(min > 0 ? String(min) : "")
            setMaxPriceText(max < 10000000 ? String(max) : "")
            if (timerRef.current) clearTimeout(timerRef.current)
            onFilterChange({
              q: searchText || "",
              minPrice: min > 0 ? String(min) : "",
              maxPrice: max < 10000000 ? String(max) : "",
              propertyType: filters.propertyType || "",
              bedrooms: filters.bedrooms || "",
              bathrooms: filters.bathrooms || "",
              sort: filters.sort || "",
              page: "1",
            })
          }}
          formatLabel={(v) => `${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
        />
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.beds")}</label>
        <CustomSelect
          value={filters.bedrooms || ""}
          onChange={(val) => immediateUpdate("bedrooms", val)}
          options={BEDROOM_OPTIONS}
          className="w-full"
        />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.baths")}</label>
        <CustomSelect
          value={filters.bathrooms || ""}
          onChange={(val) => immediateUpdate("bathrooms", val)}
          options={BATHROOM_OPTIONS}
          className="w-full"
        />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-foreground/70 mb-1.5 uppercase tracking-wider">{t("filter.sortBy")}</label>
        <CustomSelect
          value={filters.sort || ""}
          onChange={(val) => immediateUpdate("sort", val)}
          options={SORT_OPTIONS}
          className="w-full"
        />
      </div>

      {/* Footer */}
      <div className="space-y-3 pt-2">
        {typeof total !== "undefined" && (
          <p className="text-xs text-center text-muted-foreground">
            {t("filter.results", { count: total })}
          </p>
        )}
        {hasFilters && (
          <Button variant="outline" size="default" className="w-full rounded-xl border-foreground/20 h-11 text-sm" onClick={clearAll}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            {t("filter.clearFilters")}
          </Button>
        )}
      </div>
    </div>
  )
}
