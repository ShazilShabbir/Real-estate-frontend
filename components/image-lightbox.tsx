"use client"

import { useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ImageLightboxProps {
  images: { url: string; alt?: string }[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [handleKeyDown])

  if (!images.length) return null

  const current = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
        aria-label="Close lightbox"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all p-2"
          aria-label="Previous image"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url}
          alt={current.alt || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:scale-110 transition-all p-2"
          aria-label="Next image"
        >
          <ChevronRight size={36} />
        </button>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); const diff = i - currentIndex; if (diff > 0) for (let j = 0; j < diff; j++) onNext(); else for (let j = 0; j < -diff; j++) onPrev(); }}
              className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                i === currentIndex ? "border-white scale-105" : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
