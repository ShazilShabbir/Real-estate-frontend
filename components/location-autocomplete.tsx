"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { api } from "@/lib/axios"

interface LocationSuggestion {
  city: string
  state: string
  count: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, city?: string, state?: string) => void
  onEnter?: () => void
  placeholder?: string
  className?: string
}

export function LocationAutocomplete({ value, onChange, onEnter, placeholder = "Search locations...", className = "" }: LocationAutocompleteProps) {
  const [input, setInput] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { setInput(value) }, [value])

  const fetchLocations = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const { data } = await api.get("/properties/locations", { params: { q } })
      const results: LocationSuggestion[] = data?.data || data || []
      setSuggestions(results)
      setOpen(results.length > 0)
      setHighlightIndex(-1)
    } catch {
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    onChange(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchLocations(val), 250)
  }

  const select = (s: LocationSuggestion) => {
    const label = `${s.city}, ${s.state}`
    setInput(label)
    onChange(label, s.city, s.state)
    setOpen(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1))
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) {
        e.preventDefault()
        select(suggestions[highlightIndex])
      } else {
        onEnter?.()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setHighlightIndex(-1)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const highlightMatch = (text: string) => {
    if (!input.trim()) return text
    const idx = text.toLowerCase().indexOf(input.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-semibold">{text.slice(idx, idx + input.length)}</span>
        {text.slice(idx + input.length)}
      </>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.city}-${s.state}`}
              onClick={() => select(s)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${
                i === highlightIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
              }`}
              role="option"
              aria-selected={i === highlightIndex}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={14} className="shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {highlightMatch(s.city)}, {highlightMatch(s.state)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2 tabular-nums">{s.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
