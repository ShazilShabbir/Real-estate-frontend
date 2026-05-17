"use client"

import Link from "next/link"
import { MapPin, Bed, Bath, Square, X, Heart } from "lucide-react"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"

interface MapListProperty {
  _id: string | number
  title?: string
  name?: string
  price: string | number
  currency?: string
  bedrooms?: number
  bathrooms?: number
  sqft?: string | number
  squareFeet?: string | number
  area?: string | number
  image?: string
  images?: Array<string | { url?: string; public_id?: string }>
  address?: { street?: string; city?: string; state?: string }
  status?: string
}

interface MapPropertyListPanelProps {
  properties: MapListProperty[]
  defaultCurrency: string
  total: number
  onClose: () => void
  isLiked?: (id: string | number) => boolean
  onLike?: (e: React.MouseEvent, id: string | number) => void
  likedId?: string | number | null
}

const getTitle = (p: MapListProperty) => p.title || p.name || "Property"
const getImage = (p: MapListProperty) => {
  const raw = p.image ?? p.images?.[0]
  if (typeof raw === "string") return raw
  if (typeof raw === "object" && raw?.url) return raw.url
  return null
}

export function MapPropertyListPanel({ properties, defaultCurrency, total, onClose, isLiked, onLike, likedId }: MapPropertyListPanelProps) {
  if (properties.length === 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[999] md:top-3 md:left-auto md:right-3 md:bottom-auto md:w-80 max-h-[45vh] md:max-h-[calc(100%-24px)] bg-card/95 backdrop-blur-xl border-t md:border border-border rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">{total}</span> properties in view
        </p>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-border/30">
        {properties.map((p) => {
          const img = getImage(p)
          return (
            <Link
              key={p._id}
              href={`/properties/${p._id}`}
              className="flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              {img && (
                <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <img src={img} alt={getTitle(p)} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {getTitle(p)}
                </p>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {formatPrice(p.price, p.currency, defaultCurrency)}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Bed size={12} />{p.bedrooms || 0}</span>
                  <span className="flex items-center gap-1"><Bath size={12} />{p.bathrooms || 0}</span>
                  <span className="flex items-center gap-1"><Square size={12} />{p.sqft || p.squareFeet || p.area || "—"}</span>
                </div>
              </div>
              {onLike && isLiked && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(e, p._id) }}
                  className="self-start p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <Heart
                    size={15}
                    className={cn(
                      isLiked(p._id) ? "fill-red-500 text-red-500" : "text-muted-foreground",
                      likedId === p._id && "animate-heart-pop"
                    )}
                  />
                </button>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
