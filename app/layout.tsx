import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { BackToTop } from "@/components/back-to-top"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | EstateHub",
    default: "EstateHub | Luxury Properties & Premium Real Estate",
  },
  description:
    "Discover exceptional luxury properties worldwide. EstateHub connects you with premium real estate — from elegant city apartments to sprawling country estates.",
  keywords: ["real estate", "luxury homes", "property listings", "premium real estate"],
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          {children}
          <BackToTop />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
