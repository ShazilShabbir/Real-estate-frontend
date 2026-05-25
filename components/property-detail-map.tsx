"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapControls } from "@/components/map-controls"
import { MapSearch } from "@/components/map-search"

interface PropertyDetailMapProps {
  latitude: number
  longitude: number
  title: string
  propertyType?: string
  price?: string | number
  height?: string
}

const TILES: Record<string, string> = {
  Street: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  Dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
}

const ATTRS: Record<string, string> = {
  Street: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO',
  Dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO',
  Satellite: '&copy; Esri, Earthstar Geographics',
}

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

// Fix Leaflet icon paths once
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function FlyToOnMount({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    map.flyTo([lat, lng], 15, { duration: 1.5, easeLinearity: 0.25 })
  }, [map, lat, lng])
  return null
}

interface POI {
  lat: number
  lng: number
  type: string
  name: string
}

const POI_EMOJIS: Record<string, string> = {
  cafe: "☕", restaurant: "🍽", school: "🎓", hospital: "🏥",
  pharmacy: "💊", supermarket: "🛒", park: "🌳", bus_stop: "🚌",
  train_station: "🚄", bank: "🏦",
}

function NearbyPOILayer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const [pois, setPois] = useState<POI[]>([])
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    let cancelled = false
    const query = `[out:json];node(around:500,${lat},${lng})["amenity"~"cafe|restaurant|school|hospital|pharmacy|supermarket|bank|park"];out center 10;`
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const mapped: POI[] = (data.elements || []).slice(0, 20).map((e: {
          lat?: number;
          lon?: number;
          center?: { lat?: number; lon?: number };
          tags?: { amenity?: string; name?: string };
        }) => ({
          lat: e.lat || (e.center?.lat ?? 0),
          lng: e.lon || (e.center?.lon ?? 0),
          type: e.tags?.amenity || "cafe",
          name: e.tags?.name || "",
        }))
        setPois(mapped)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [lat, lng])

  useEffect(() => {
    if (layerRef.current) { map.removeLayer(layerRef.current) }
    if (pois.length === 0) return
    const group = L.layerGroup()
    pois.forEach((poi) => {
      group.addLayer(
        L.marker([poi.lat, poi.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="poi-marker" style="width:26px;height:26px;font-size:12px;">${POI_EMOJIS[poi.type] || "📍"}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        }).bindTooltip(poi.name || poi.type, { direction: "top", offset: L.point(0, -14), className: "poi-tooltip" })
      )
    })
    map.addLayer(group)
    layerRef.current = group
    return () => { if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null } }
  }, [pois, map])

  return null
}

function DetailMapContent({ latitude, longitude, title, propertyType }: {
  latitude: number; longitude: number; title: string; propertyType?: string
}) {
  const [layerName, setLayerName] = useState("Street")
  const color = getTypeColor(propertyType)

  return (
    <>
      <TileLayer attribution={ATTRS[layerName]} url={TILES[layerName]} />
      <FlyToOnMount lat={latitude} lng={longitude} />
      <NearbyPOILayer lat={latitude} lng={longitude} />
      <MapSearch />

      <Marker
        position={[latitude, longitude]}
        icon={L.divIcon({
          className: "",
          html: `<div style="position:relative;">
            <div class="pulse-marker-inner" style="width:44px;height:44px;background:${color};border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.35);border:3px solid white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 44],
        })}
      />

      <div className="absolute bottom-6 left-3 z-[1000] bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 shadow-lg max-w-[260px]">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
      </div>

      <MapControls
        darkTiles={layerName === "Dark"}
        onToggleTiles={() => setLayerName(layerName === "Dark" ? "Street" : "Dark")}
        showFitBounds={false}
      />

      {/* Layer switcher */}
      <div className="absolute bottom-6 right-3 z-[1000] flex flex-col gap-1">
        {Object.keys(TILES).map((name) => (
          <button
            key={name}
            onClick={() => setLayerName(name)}
            className={`map-btn w-8 h-8 text-xs ${layerName === name ? "tile-toggle-active" : ""}`}
            title={name}
          >
            {name === "Street" ? "🗺" : name === "Dark" ? "🌙" : "🛰"}
          </button>
        ))}
      </div>
    </>
  )
}

function LeafletDetailMap({ latitude, longitude, title, propertyType, height = "300px" }: PropertyDetailMapProps) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return (
      <div className="flex items-center justify-center bg-muted/30 rounded-2xl border border-border/50" style={{ height }}>
        <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-muted-foreground text-xs">Location not available</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 relative" style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <DetailMapContent latitude={latitude} longitude={longitude} title={title} propertyType={propertyType} />
      </MapContainer>
    </div>
  )
}

export default function PropertyDetailMap(props: PropertyDetailMapProps) {
  return <LeafletDetailMap {...props} />
}
