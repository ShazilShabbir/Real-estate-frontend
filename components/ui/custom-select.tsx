"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "" }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors"
      >
        <span className={selected ? "text-white" : "text-neutral-500"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-150 ${
                opt.value === value
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
