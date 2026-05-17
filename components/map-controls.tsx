"use client"

import { useState, useEffect, useCallback } from "react"
import { Maximize2, Minimize2, Sun, Moon, Crosshair } from "lucide-react"
import { useMap } from "react-leaflet"

interface MapControlsProps {
  darkTiles: boolean
  onToggleTiles: () => void
  onFitBounds?: () => void
  showFitBounds?: boolean
}

export function MapControls({ darkTiles, onToggleTiles, onFitBounds, showFitBounds = true }: MapControlsProps) {
  const map = useMap()
  const [fullscreen, setFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    const container = map.getContainer()
    if (!document.fullscreenElement) {
      container.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }, [map])

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  return (
    <div className="map-controls-overlay" style={{ top: 12, right: 12 }}>
      {showFitBounds && onFitBounds && (
        <button onClick={onFitBounds} className="map-btn" title="Fit all properties">
          <Crosshair size={16} />
        </button>
      )}
      <button onClick={onToggleTiles} className={`map-btn ${darkTiles ? "tile-toggle-active" : ""}`} title={darkTiles ? "Light tiles" : "Dark tiles"}>
        {darkTiles ? <Moon size={16} /> : <Sun size={16} />}
      </button>
      <button onClick={toggleFullscreen} className="map-btn" title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  )
}
