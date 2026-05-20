"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { useSite } from "@/lib/site-context"
import { formatPrice } from "@/lib/format-price"
import { MapControls } from "@/components/map-controls"
import { MapSearch } from "@/components/map-search"
import { MapPropertyListPanel } from "@/components/map-property-list"

interface MapProperty {
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
  propertyType?: string
  status?: string
  image?: string
  images?: Array<string | { url?: string; public_id?: string }>
  location?: { type?: string; coordinates?: number[] }
  address?: { street?: string; city?: string; state?: string }
}

interface PropertyMapProps {
  properties: MapProperty[]
  height?: string
  onBoundsChange?: (bounds: string) => void
  showPropertyList?: boolean
  onClosePropertyList?: () => void
  total?: number
  defaultCurrency?: string
  isLiked?: (id: string | number) => boolean
  onLike?: (e: React.MouseEvent, id: string | number) => void
  likedId?: string | number | null
}

const TILES: Record<string, string> = {
  Street: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  Dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  Terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
}

const ATTRS: Record<string, string> = {
  Street: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO',
  Dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO',
  Satellite: '&copy; Esri, Earthstar Geographics',
  Terrain: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
}

// Property type → marker color
const TYPE_COLORS: Record<string, string> = {
  house: "#10b981",
  apartment: "#3b82f6",
  villa: "#f59e0b",
  condo: "#8b5cf6",
  townhouse: "#f97316",
  commercial: "#06b6d4",
  land: "#84cc16",
}

const getTypeColor = (pt?: string) => TYPE_COLORS[pt || ""] || "hsl(var(--primary))"

// Fix Leaflet default icon paths once
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const getTitle = (p: MapProperty) => p.title || p.name || "Property"
const getImage = (p: MapProperty) => {
  const raw = p.image ?? p.images?.[0]
  if (typeof raw === "string") return raw
  if (typeof raw === "object" && raw?.url) return raw.url
  return null
}

function createPropertyIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:${color};border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid white;cursor:pointer;transition:transform 0.15s;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

function createPriceLabelIcon(price: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:white;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.3);transform:translateY(-28px);">${price}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

// Track map bounds and emit on change
function BoundsTracker({ onBoundsChange }: { onBoundsChange?: (bounds: string) => void }) {
  const map = useMap()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!onBoundsChange) return
    const handler = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const b = map.getBounds()
        onBoundsChange(`${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`)
      }, 500)
    }
    map.on("moveend", handler)
    handler()
    return () => { map.off("moveend", handler); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [map, onBoundsChange])

  return null
}

// Marker cluster with category-colored icons and price labels at high zoom
function ClusterGroup({
  properties,
  onSelect,
  zoom,
}: {
  properties: MapProperty[]
  onSelect: (p: MapProperty) => void
  zoom: number
}) {
  const map = useMap()
  const groupRef = useRef<L.MarkerClusterGroup | null>(null)
  const { defaultCurrency } = useSite()

  useEffect(() => {
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }

    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 15,
      iconCreateFunction: (cluster) => {
        const c = cluster.getChildCount()
        const size = c < 10 ? 40 : c < 100 ? 48 : 56
        return L.divIcon({
          html: `<div class="premium-cluster" style="width:${size}px;height:${size}px;font-size:${c < 100 ? 13 : 11}px">${c}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
      },
    })

    const showPrices = zoom >= 13

    properties.forEach((p) => {
      const [lng, lat] = p.location!.coordinates!
      const color = getTypeColor(p.propertyType)
      const formattedPrice = formatPrice(p.price, p.currency, defaultCurrency)
      const img = getImage(p)

      const marker = showPrices
        ? L.marker([lat, lng], { icon: createPriceLabelIcon(formattedPrice, color) })
        : L.marker([lat, lng], { icon: createPropertyIcon(color) })

      const popupHtml = `
        <a href="/properties/${p._id}" class="block">
          <div style="display:flex;gap:12px;padding:12px;min-width:260px;background:hsl(var(--card));">
            ${img
              ? `<div style="width:80px;height:64px;border-radius:8px;overflow:hidden;flex-shrink:0;"><img src="${img}" alt="${getTitle(p)}" style="width:100%;height:100%;object-fit:cover;" /></div>`
              : ""
            }
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;">
              <p style="font-weight:600;font-size:14px;color:hsl(var(--foreground));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;">${getTitle(p)}</p>
              <p style="font-weight:700;font-size:15px;color:${color};margin:2px 0 0;">${formattedPrice}</p>
              <div style="display:flex;gap:8px;font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px;">
                <span>🛏 ${p.bedrooms || 0}</span>
                <span>🛁 ${p.bathrooms || 0}</span>
                <span>📐 ${p.sqft || p.squareFeet || p.area || "—"}</span>
              </div>
              <p style="font-size:11px;color:hsl(var(--muted-foreground));margin:2px 0 0;text-decoration:underline;">View details →</p>
            </div>
          </div>
        </a>
      `

      marker.bindPopup(popupHtml, { closeButton: true, maxWidth: 320, className: "" })
      marker.on("click", () => onSelect(p))
      mcg.addLayer(marker)
    })

    map.addLayer(mcg)
    groupRef.current = mcg

    return () => {
      if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }
    }
  }, [properties, map, onSelect, zoom, defaultCurrency])

  return null
}

// Zoom tracker for toggling price labels
function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap()
  useEffect(() => {
    onZoom(map.getZoom())
    const handler = () => onZoom(map.getZoom())
    map.on("zoomend", handler)
    return () => { map.off("zoomend", handler) }
  }, [map, onZoom])
  return null
}

// Layer switcher component
function LayerSwitcher({ layers }: { layers: string[] }) {
  const map = useMap()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(layers[0])
  const ctrlRef = useRef<HTMLDivElement>(null)

  const switchLayer = (name: string) => {
    setCurrent(name)
    setOpen(false)
    // Trigger re-render via a custom event or state — handled by parent
    const event = new CustomEvent("maplayerswitch", { detail: name })
    window.dispatchEvent(event)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ctrlRef.current && !ctrlRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const layerIcons: Record<string, string> = {
    Street: "🗺",
    Dark: "🌙",
    Satellite: "🛰",
    Terrain: "⛰",
  }

  return (
    <div ref={ctrlRef} className="absolute bottom-6 right-3 z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className="map-btn w-9 h-9 text-xs"
        title="Switch layer"
      >
        {layerIcons[current] || "🗺"}
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 min-w-[120px]">
          {layers.map((name) => (
            <button
              key={name}
              onClick={() => switchLayer(name)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center gap-2 ${
                current === name ? "text-primary font-semibold bg-primary/5" : "text-foreground/70 hover:bg-muted/50"
              }`}
            >
              <span>{layerIcons[name] || "🗺"}</span>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Main map content that uses react-leaflet hooks
function MapContent({
  properties,
  onBoundsChange,
  showPropertyList,
  onClosePropertyList,
  total,
  defaultCurrency,
  isLiked,
  onLike,
  likedId,
}: PropertyMapProps & { defaultCurrency: string }) {
  const [zoom, setZoom] = useState(4)
  const [layerName, setLayerName] = useState("Street")
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)

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

  // Listen for layer switch events
  useEffect(() => {
    const handler = (e: CustomEvent) => setLayerName(e.detail)
    window.addEventListener("maplayerswitch", handler as any)
    return () => window.removeEventListener("maplayerswitch", handler as any)
  }, [])

  const handleFitBounds = useCallback(() => {
    if (filtered.length === 0) return
    const bounds = L.latLngBounds(
      filtered.map((p) => {
        const [lng, lat] = p.location!.coordinates!
        return [lat, lng]
      })
    )
    const mapEl = document.querySelector(".leaflet-container") as any
    if (mapEl?._leaflet_map) {
      mapEl._leaflet_map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 13, duration: 0.8 })
    }
  }, [filtered])

  return (
    <>
      <TileLayer attribution={ATTRS[layerName]} url={TILES[layerName]} />
      <BoundsTracker onBoundsChange={onBoundsChange} />
      <ZoomTracker onZoom={setZoom} />
      <ClusterGroup properties={filtered} onSelect={setSelectedProperty} zoom={zoom} />
      <MapSearch />
      <LayerSwitcher layers={Object.keys(TILES)} />
      <MapControls
        darkTiles={layerName === "Dark"}
        onToggleTiles={() => setLayerName(layerName === "Dark" ? "Street" : "Dark")}
        onFitBounds={handleFitBounds}
        showFitBounds={filtered.length > 1}
      />
      {showPropertyList && onClosePropertyList && (
        <MapPropertyListPanel
          properties={filtered}
          defaultCurrency={defaultCurrency}
          total={total || filtered.length}
          onClose={onClosePropertyList}
          isLiked={isLiked}
          onLike={onLike}
          likedId={likedId}
        />
      )}
    </>
  )
}

// Outer wrapper with SSR guard
function LeafletMap(props: PropertyMapProps & { defaultCurrency: string }) {
  const { properties, height = "500px" } = props

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
      <div className="flex items-center justify-center bg-muted/30 rounded-2xl border border-border/50" style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No location data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 relative" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <MapContent {...props} defaultCurrency={props.defaultCurrency} />
      </MapContainer>
    </div>
  )
}

export default function PropertyMap(props: PropertyMapProps) {
  const [mounted, setMounted] = useState(false)
  const { defaultCurrency } = useSite()

  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div style={{ height: props.height || "500px" }} className="bg-muted/30 rounded-2xl border border-border/50" />
  }
  return <LeafletMap {...props} defaultCurrency={defaultCurrency} />
}
