"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Loader2, MapPin } from "lucide-react"
import { useMap } from "react-leaflet"

interface SearchResult {
  lat: string
  lon: string
  display_name: string
  type: string
}

export function MapSearch() {
  const map = useMap()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`
      )
      const data = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(e.target.value), 350)
  }

  const select = (r: SearchResult) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    map.flyTo([lat, lng], 15, { duration: 1 })
    setQuery(r.display_name.split(",")[0])
    setOpen(false)
    inputRef.current?.blur()
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="absolute top-3 left-3 z-[1000] w-[280px]">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Search address or area..."
          className="w-full pl-9 pr-9 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg backdrop-blur-md"
        />
        {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
      </div>

      {open && results.length > 0 && (
        <div className="mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[280px] overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => select(r)}
              className="flex items-start gap-2.5 w-full px-3.5 py-3 text-left text-sm hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-foreground/80 line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
