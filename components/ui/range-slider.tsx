"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatLabel?: (value: number) => string
  className?: string
}

export function RangeSlider({ min, max, step = 1, value, onChange, formatLabel, className = "" }: RangeSliderProps) {
  const [local, setLocal] = useState(value)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<"min" | "max" | null>(null)

  useEffect(() => { setLocal(value) }, [value])

  const getPercent = (v: number) => ((v - min) / (max - min)) * 100

  const handleMouseDown = (handle: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = handle
  }

  const handleMove = useCallback((clientX: number) => {
    if (!dragging.current || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + pct * (max - min)
    const snapped = Math.round(raw / step) * step
    const clamped = Math.min(max, Math.max(min, snapped))

    setLocal((prev) => {
      const next: [number, number] = [...prev]
      if (dragging.current === "min") {
        next[0] = Math.min(clamped, prev[1] - step)
      } else {
        next[1] = Math.max(clamped, prev[0] + step)
      }
      return next
    })
  }, [min, max, step])

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleMove(e.clientX)
    const onUp = () => {
      if (dragging.current) {
        dragging.current = null
        onChange(local)
      }
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [handleMove, onChange, local])

  const pctMin = getPercent(local[0])
  const pctMax = getPercent(local[1])

  return (
    <div className={`pt-4 pb-2 ${className}`}>
      <div
        ref={trackRef}
        className="relative h-2 bg-neutral-700 rounded-full cursor-pointer"
      >
        <div
          className="absolute h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        {/* Min handle */}
        <div
          onMouseDown={handleMouseDown("min")}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
          style={{ left: `${pctMin}%` }}
        />
        {/* Max handle */}
        <div
          onMouseDown={handleMouseDown("max")}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
          style={{ left: `${pctMax}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-neutral-400">
        <span>{formatLabel ? formatLabel(local[0]) : local[0]}</span>
        <span>{formatLabel ? formatLabel(local[1]) : local[1]}</span>
      </div>
    </div>
  )
}
