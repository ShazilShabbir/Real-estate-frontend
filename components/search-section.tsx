"use client"

import { useState } from "react"
import { Search, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchSection() {
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState("")

  return (
    <section className="py-8 md:py-12 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-foreground text-pretty">Find Your Perfect Property</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="inline mr-2" size={16} />
                Location
              </label>
              <input
                type="text"
                placeholder="City, neighborhood, or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Price</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-2m">$1M - $2M</option>
                <option value="2m-5m">$2M - $5M</option>
                <option value="5m+">$5M+</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 h-11">
                <Search size={18} className="mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
