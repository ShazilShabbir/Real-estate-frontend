"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface PropertyDetailMapProps {
  latitude: number
  longitude: number
  title: string
  height?: string
}

function LeafletDetailMap({ latitude, longitude, title, height = "300px" }: PropertyDetailMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  if (!latitude || !longitude) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 rounded-2xl border border-border/50"
        style={{ height }}
      >
        <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-muted-foreground text-xs">Location not available</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50" style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[latitude, longitude]}
          icon={L.divIcon({
            className: "",
            html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,hsl(var(--primary)),#f59e0b);border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          })}
        >
        </Marker>
      </MapContainer>
    </div>
  )
}

export default function PropertyDetailMap(props: PropertyDetailMapProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div
        style={{ height: props.height || "300px" }}
        className="bg-muted/30 rounded-2xl border border-border/50"
      />
    )
  }
  return <LeafletDetailMap {...props} />
}
