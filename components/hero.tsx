"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Image src="/modern-luxury-house.png" alt="Modern luxury house" fill priority className="object-cover" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            Discover Your Dream Home
          </h1>
          <p className="text-lg text-foreground/70 mb-8 text-balance">
            Explore our curated collection of luxury properties across prime locations. Find the perfect home that
            matches your lifestyle and vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              Browse Properties
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 bg-transparent"
            >
              Schedule Tour
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
