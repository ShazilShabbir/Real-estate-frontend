import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ProvidersWrapper } from "@/components/providers-wrapper"

export const metadata: Metadata = {
  title: "EstateHub | Luxury Properties & Premium Real Estate",
  description:
    "Discover exceptional luxury properties worldwide. EstateHub connects you with premium real estate — from elegant city apartments to sprawling country estates.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
        <Analytics />
      </body>
    </html>
  )
}
