"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-pretty">Get in Touch</h2>
            <p className="text-lg text-foreground/70 mb-8 text-pretty">
              Have questions about our properties? Our team of experienced real estate professionals is ready to help
              you find your next home.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-foreground/70">(555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-foreground/70">info@primeproperties.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Address</h3>
                <p className="text-foreground/70">
                  123 Luxury Lane, Suite 500
                  <br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32 resize-none"
                  placeholder="Tell us about your ideal property..."
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
