"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { useTranslation } from "@/lib/use-translation"

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label={t("backToTop.ariaLabel")}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
