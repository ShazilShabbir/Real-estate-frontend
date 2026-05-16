"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import "leaflet/dist/leaflet.css"

interface MapProperty {
  _id: string | number
  title?: string
  name?: string
  price: string | number
  currency?: string
  image?: string
  images?: Array<string | { url?: string; public_id?: string }>
  location?: { type?: string; coordinates?: number[] }
}

interface PropertyMapProps {
  properties: MapProperty[]
  height?: string
}

const getTitle = (p: MapProperty) => p.title || p.name || "Property"
const getImage = (p: MapProperty) => {
  const raw = p.image ?? p.images?.[0]
  if (typeof raw === "string") return raw
  if (typeof raw === "object" && raw?.url) return raw.url
  return null
}

function LeafletMap({ properties, height }: PropertyMapProps) {
  const [popupInfo, setPopupInfo] = useState<MapProperty | null>(null)
  const { defaultCurrency } = useSite()

  // Fix Leaflet default icon paths (broken in bundled apps)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  const filtered = useMemo(
    () => properties.filter((p) => p.location?.coordinates?.length === 2),
    [properties]
  )

  const center = useMemo(() => {
    if (filtered.length === 0) return { lat: 39.5, lng: -98.5 }
    const lngs = filtered.map((p) => p.location!.coordinates![0])
    const lats = filtered.map((p) => p.location!.coordinates![1])
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    }
  }, [filtered])

  if (filtered.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 rounded-2xl border border-border/50"
        style={{ height }}
      >
        <div className="text-center p-8">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No location data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((property) => {
          const [lng, lat] = property.location!.coordinates!
          return (
            <Marker
              key={property._id}
              position={[lat, lng]}
              icon={L.divIcon({
                className: "",
                html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,hsl(var(--primary)),#f59e0b);border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid white;cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              })}
              eventHandlers={{
                click: () => setPopupInfo(property),
              }}
            />
          )
        })}

        {popupInfo && (() => {
          const [lng, lat] = popupInfo.location!.coordinates!
          const img = getImage(popupInfo)
          return (
            <Popup
              position={[lat, lng]}
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}
            >
              <Link
                href={`/properties/${popupInfo._id}`}
                className="flex gap-3 w-64"
              >
                {img && (
                  <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={img}
                      alt={getTitle(popupInfo)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {getTitle(popupInfo)}
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {formatPrice(popupInfo.price, popupInfo.currency, defaultCurrency)}
                  </p>
                  <p className="text-xs mt-0.5">
                    View details →
                  </p>
                </div>
              </Link>
            </Popup>
          )
        })()}
      </MapContainer>
    </div>
  )
}

export default function PropertyMap(props: PropertyMapProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div
        style={{ height: props.height || "500px" }}
        className="bg-muted/30 rounded-2xl border border-border/50"
      />
    )
  }
  return <LeafletMap {...props} />
}
