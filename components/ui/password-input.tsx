"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  className?: string
}

export function PasswordInput({ id, value, onChange, placeholder = "••••••••", autoComplete = "current-password", className = "" }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full bg-neutral-800/50 border border-neutral-700 text-white rounded-xl px-4 py-3 pr-11 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
